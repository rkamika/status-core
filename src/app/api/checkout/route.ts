import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { getDiagnosisById } from '@/lib/storage';
import { getSystemSetting } from '@/lib/admin';
import { sendMetaCapiEvent } from '@/lib/meta-capi';

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
        const ip = headersList.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
        const userAgent = headersList.get('user-agent') || '';

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

        // Default Payment Provider -> MercadoPago (for all markets)
        const preference = new Preference(mpConfig);
        const result = await preference.create({
            body: {
                items: [
                    {
                        id: diagnosisId,
                        title: lang === 'pt'
                            ? `Status Core - Relatório Platinum (${diagnosis.label})`
                            : `Status Core - Platinum Report (${diagnosis.label})`,
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

        console.log('Mercado Pago preference created for:', { diagnosisId, lang });

        // Send CAPI AddPaymentInfo
        await sendMetaCapiEvent({
            eventName: 'AddPaymentInfo',
            eventSourceUrl: `${baseUrl}/${lang}/checkout/${diagnosisId}`,
            userData: { ip, userAgent, externalId: diagnosisId },
            customData: {
                value: basePrice,
                currency: 'BRL',
                content_name: 'Platinum Report',
                content_ids: [diagnosisId],
                content_type: 'product'
            },
            eventId: `api_pi_${diagnosisId}_${Date.now()}`
        });

        return NextResponse.json({
            provider: 'mercadopago',
            checkoutUrl: result.init_point,
            preferenceId: result.id,
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
