import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { unlockDiagnosis } from '@/lib/storage';

const mpConfig = process.env.MERCADOPAGO_ACCESS_TOKEN
    ? new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN })
    : null;

export async function POST(req: Request) {
    try {
        if (!mpConfig) {
            return NextResponse.json({ error: 'Mercado Pago not configured' }, { status: 503 });
        }

        const body = await req.json();
        const payment = new Payment(mpConfig);

        const result = await payment.create({
            body: {
                transaction_amount: body.transaction_amount,
                token: body.token,
                description: body.description,
                installments: body.installments,
                payment_method_id: body.payment_method_id,
                issuer_id: body.issuer_id,
                payer: {
                    email: body.payer.email,
                    identification: body.payer.identification,
                },
                external_reference: body.external_reference, // This should be the diagnosisId
            }
        });

        if (result.status === 'approved') {
            // Unlock diagnosis if payment is approved immediately (like PIX or Credit Card)
            if (result.external_reference) {
                await unlockDiagnosis(result.external_reference);
            }
            return NextResponse.json({
                status: result.status,
                id: result.id
            });
        } else {
            return NextResponse.json({
                status: result.status,
                status_detail: result.status_detail,
                id: result.id
            });
        }

    } catch (error: any) {
        console.error('Payment Processing Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
