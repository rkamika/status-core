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
            console.error('Payment system not configured correctly:', {
                stripe: !!stripe,
                mercadopago: !!mpConfig
            });
            return NextResponse.json({ error: 'Payment system not configured' }, { status: 503 });
        }

        const { diagnosisId, lang } = await req.json();
        console.log('Processing checkout request:', { diagnosisId, lang });

        const headersList = await headers();
        const country = headersList.get('x-vercel-ip-country') || 'US';

        // Verify diagnosis exists
        const diagnosis = await getDiagnosisById(diagnosisId);
        if (!diagnosis) {
            console.warn('Diagnosis not found in storage:', diagnosisId);
            return NextResponse.json({ error: 'Diagnosis not found' }, { status: 404 });
        }

        // Get current price from system settings
        const settingsPrice = await getSystemSetting('report_price');
        const basePrice = settingsPrice ? parseFloat(settingsPrice) : 97.00;

        // Construct base URL for redirects
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
        console.log('Using base URL for redirects:', baseUrl);

        // Brazil Market -> MercadoPago
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
                        success: `${baseUrl}/${lang}/report/${diagnosisId}?unlocked=true`,
                        failure: `${baseUrl}/${lang}/checkout/${diagnosisId}`,
                        pending: `${baseUrl}/${lang}/checkout/${diagnosisId}`,
                    },
                    auto_return: 'approved',
                    external_reference: diagnosisId,
                    notification_url: `${baseUrl}/api/webhooks/mercadopago`,
                }
            });

            console.log('Mercado Pago preference created:', result.id);

            return NextResponse.json({
                provider: 'mercadopago',
                checkoutUrl: result.init_point,
                preferenceId: result.id,
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
            success_url: `${baseUrl}/${lang}/report/${diagnosisId}?unlocked=true`,
            cancel_url: `${baseUrl}/${lang}/checkout/${diagnosisId}`,
            client_reference_id: diagnosisId,
            metadata: {
                diagnosisId,
            },
        });

        console.log('Stripe session created:', session.id);

        return NextResponse.json({
            provider: 'stripe',
            checkoutUrl: session.url,
            clientSecret: session.client_secret,
        });

    } catch (error: any) {
        console.error('Detailed Checkout API Error:', {
            message: error.message,
            stack: error.stack,
            mpError: error.cause || error.response?.data
        });
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
