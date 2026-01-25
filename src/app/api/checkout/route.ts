import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { getDiagnosisById } from '@/lib/storage';
import { getSystemSetting } from '@/lib/admin';

// Initialize clients at top level, but safely to prevent build-time crashes if keys are missing
const stripe = process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-01-27.acacia' as any })
    : null;

const mpConfig = process.env.MERCADOPAGO_ACCESS_TOKEN
    ? new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN })
    : null;

export async function POST(req: Request) {
    try {
        if (!stripe || !mpConfig) {
            console.error('Missing payment provider configuration');
            return NextResponse.json({ error: 'Payment system not configured' }, { status: 503 });
        }

        const { diagnosisId, lang } = await req.json();
        const headersList = await headers();
        const country = headersList.get('x-vercel-ip-country') || 'US';

        // Verify diagnosis exists
        const diagnosis = await getDiagnosisById(diagnosisId);
        if (!diagnosis) {
            return NextResponse.json({ error: 'Diagnosis not found' }, { status: 404 });
        }

        // Get current price from system settings
        const settingsPrice = await getSystemSetting('report_price');
        const basePrice = settingsPrice ? parseFloat(settingsPrice) : 97.00;

        // Brazil Market -> MercadoPago (Language-based identification for testing)
        if (lang === 'pt') {
            const preference = new Preference(mpConfig);
            const result = await preference.create({
                body: {
                    items: [
                        {
                            id: diagnosisId,
                            title: `Status Core - Relatório Platinum (${diagnosis.label})`,
                            quantity: 1,
                            unit_price: basePrice,
                            currency_id: 'BRL',
                        }
                    ],
                    back_urls: {
                        success: `${process.env.NEXT_PUBLIC_APP_URL}/${lang}/report/${diagnosisId}?unlocked=true`,
                        failure: `${process.env.NEXT_PUBLIC_APP_URL}/${lang}/checkout/${diagnosisId}`,
                        pending: `${process.env.NEXT_PUBLIC_APP_URL}/${lang}/checkout/${diagnosisId}`,
                    },
                    auto_return: 'approved',
                    external_reference: diagnosisId,
                    notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mercadopago`,
                }
            });

            return NextResponse.json({
                provider: 'mercadopago',
                checkoutUrl: result.init_point, // For Checkout Pro (Redirect)
                preferenceId: result.id,       // For Checkout Bricks (Embedded)
            });
        }

        // Global Market -> Stripe
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `Status Core - Platinum Report (${diagnosis.label})`,
                            description: 'AI-Powered Systemic Performance Diagnosis',
                        },
                        unit_amount: Math.round(basePrice * 100), // Stripe expects cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/${lang}/report/${diagnosisId}?unlocked=true`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/${lang}/checkout/${diagnosisId}`,
            client_reference_id: diagnosisId,
            metadata: {
                diagnosisId,
            },
        });

        return NextResponse.json({
            provider: 'stripe',
            checkoutUrl: session.url, // For Stripe Checkout (Redirect)
            clientSecret: session.client_secret, // For Stripe Elements (Embedded)
        });

    } catch (error: any) {
        console.error('Checkout Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
