import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { unlockDiagnosis, getDiagnosisById } from '@/lib/storage';
import { sendMetaCapiEvent } from '@/lib/meta-capi';

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

                    // Send Meta CAPI Purchase Event
                    const diagnosis = await getDiagnosisById(diagnosisId);
                    if (diagnosis) {
                        await sendMetaCapiEvent({
                            eventName: 'Purchase',
                            eventSourceUrl: `${process.env.NEXT_PUBLIC_APP_URL}/${diagnosis.lang}/report/${diagnosisId}`,
                            userData: {
                                email: data.payer?.email,
                                externalId: diagnosisId,
                            },
                            customData: {
                                value: data.transaction_amount,
                                currency: 'BRL',
                                content_name: 'Platinum Report',
                                content_ids: [diagnosisId],
                                content_type: 'product'
                            },
                            eventId: `mp_${resourceId}` // For deduplication
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
