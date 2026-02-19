import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { unlockDiagnosis, getDiagnosisById } from '@/lib/storage';
import { sendMetaCapiEvent } from '@/lib/meta-capi';
import { sendGA4PurchaseEvent } from '@/lib/ga4-server';

// Initialize clients at top level, but safely to prevent build-time crashes if keys are missing
const mpConfig = process.env.MERCADOPAGO_ACCESS_TOKEN
    ? new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN })
    : null;

export async function POST(req: Request) {
    const { searchParams } = new URL(req.url);
    const resourceId = searchParams.get('data.id') || searchParams.get('id');
    const type = searchParams.get('type');

    try {
        if (!mpConfig) {
            console.error('MercadoPago configuration missing');
            return NextResponse.json({ error: 'Not configured' }, { status: 503 });
        }

        if (type === 'payment' && resourceId) {
            const payment = new Payment(mpConfig);
            const data = await payment.get({ id: resourceId });

            if (data.status === 'approved') {
                const diagnosisId = data.external_reference;
                if (diagnosisId) {
                    console.log(`Unlocking diagnosis ${diagnosisId} via MercadoPago...`);
                    await unlockDiagnosis(diagnosisId);

                    // Send Tracking Events (Server-Side)
                    const diagnosis = await getDiagnosisById(diagnosisId);
                    if (diagnosis) {
                        const amount = data.transaction_amount || 0;
                        const eventId = `pur_${diagnosisId}`;

                        // 1. Meta CAPI
                        await sendMetaCapiEvent({
                            eventName: 'Purchase',
                            eventSourceUrl: `${process.env.NEXT_PUBLIC_APP_URL}/${diagnosis.lang}/report/${diagnosisId}`,
                            userData: {
                                email: data.payer?.email,
                                externalId: diagnosisId,
                            },
                            customData: {
                                value: amount,
                                currency: 'BRL',
                                content_name: 'Platinum Report',
                                content_ids: [diagnosisId],
                                content_type: 'product'
                            },
                            eventId: eventId
                        });

                        // 2. GA4 Measurement Protocol
                        await sendGA4PurchaseEvent({
                            client_id: diagnosisId, // Using diagnosis ID as a stable client reference for server events
                            transaction_id: resourceId.toString(),
                            value: amount,
                            currency: 'BRL',
                            item_name: 'Platinum Report'
                        });
                    }
                }
            }
        }

        return NextResponse.json({ received: true });
    } catch (error: any) {
        console.error('MercadoPago Webhook Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
