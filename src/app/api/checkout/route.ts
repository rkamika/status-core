import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { getDiagnosisById } from '@/lib/storage';
import { getSystemSetting } from '@/lib/admin';
import { sendMetaCapiEvent } from '@/lib/meta-capi';
import { cookies } from 'next/headers';

// Initialize clients at top level, but safely to prevent build-time crashes if keys are missing
const stripe = process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-01-27.acacia' as any })
    : null;

export async function POST(req: Request) {
    try {
        if (!stripe) {
            console.error('Stripe system not configured correctly');
            return NextResponse.json({ error: 'Payment system not configured' }, { status: 503 });
        }

        const { diagnosisId, lang } = await req.json();
        console.log('Processing checkout request:', { diagnosisId, lang });

        const headersList = await headers();
        const ip = headersList.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
        const userAgent = headersList.get('user-agent') || '';

        const cookieStore = await cookies();
        const fbp = cookieStore.get('_fbp')?.value;
        const fbc = cookieStore.get('_fbc')?.value;

        // Verify diagnosis exists
        const diagnosis = await getDiagnosisById(diagnosisId);
        if (!diagnosis) {
            console.warn('Diagnosis not found in storage:', diagnosisId);
            return NextResponse.json({ error: 'Diagnosis not found' }, { status: 404 });
        }

        // Determine price and currency based on language
        let unitAmount = 0;
        let currency = 'usd';
        let stripeLocale: Stripe.Checkout.SessionCreateParams.Locale = 'en';
        
        // Fetch specific price from DB if exists
        const dbPrice = await getSystemSetting(`price_${lang}`);
        let basePrice = dbPrice ? parseFloat(dbPrice) : null;

        // Legacy/Default Fallbacks (Updated per Priority [7])
        if (lang === 'pt') {
            if (!basePrice) {
                const settingsPrice = await getSystemSetting('report_price');
                basePrice = settingsPrice ? parseFloat(settingsPrice) : 27.00; // Updated default
            }
            unitAmount = Math.round(basePrice * 100);
            currency = 'brl';
            stripeLocale = 'pt-BR';
        } else if (lang === 'en') {
            unitAmount = Math.round((basePrice || 27.00) * 100); // Updated default
            currency = 'usd';
            stripeLocale = 'en';
        } else if (lang === 'es') {
            unitAmount = Math.round((basePrice || 27.00) * 100); // Updated default
            currency = 'usd'; // Updated per Priority [7]
            stripeLocale = 'es';
        } else {
            // Fallback
            unitAmount = Math.round((basePrice || 27.00) * 100);
            currency = 'usd';
            stripeLocale = 'en';
        }

        // Construct base URL for redirects
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
        
        // Send 'InitiateCheckout' event to Meta
        await sendMetaCapiEvent({
            eventName: 'InitiateCheckout',
            eventSourceUrl: `${baseUrl}/${lang}/checkout/${diagnosisId}`,
            userData: { ip, userAgent, fbp, fbc, externalId: diagnosisId },
            customData: {
                currency: currency.toUpperCase(),
                value: unitAmount / 100,
                content_ids: [diagnosisId],
                content_name: 'Platinum Report',
                content_category: 'Report'
            },
            eventId: `init_checkout_${diagnosisId}_${Date.now()}`
        });

        // Personalize product name based on state and lang (Priority [1])
        const stateLabel = diagnosis.label; // diagnosis.label is already the translated label from the diagnosis engine
        let productName = "";
        let productDescription = "";

        if (lang === 'pt') {
            productName = `Desbloqueie seu Relatório ${stateLabel}`;
            productDescription = "Acesso vitalício ao seu diagnóstico completo com plano de 7 dias e análise AI.";
        } else if (lang === 'es') {
            productName = `Desbloquea tu Informe ${stateLabel}`;
            productDescription = "Acceso de por vida a su diagnóstico completo con plan de 7 días y análisis AI.";
        } else {
            productName = `Unlock Your ${stateLabel} Report`;
            productDescription = "Lifetime access to your full diagnosis with 7-day plan and AI analysis.";
        }

        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            locale: stripeLocale,
            line_items: [
                {
                    price_data: {
                        currency: currency,
                        product_data: {
                            name: productName,
                            description: productDescription,
                        },
                        unit_amount: unitAmount,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${baseUrl}/${lang}/report/${diagnosisId}?unlocked=true`,
            cancel_url: `${baseUrl}/${lang}/checkout/${diagnosisId}`,
            metadata: {
                diagnosisId: diagnosisId,
                lang: lang
            },
        });

        console.log('Stripe checkout session created for:', { diagnosisId, lang });

        return NextResponse.json({
            provider: 'stripe',
            checkoutUrl: session.url,
            sessionId: session.id,
        });

    } catch (error: any) {
        console.error('Detailed Checkout API Error:', {
            message: error.message,
            stack: error.stack
        });
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
