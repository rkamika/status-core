import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { unlockDiagnosis } from '@/lib/storage';

const mpConfig = process.env.MERCADOPAGO_ACCESS_TOKEN
    ? new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN })
    : null;

export async function POST(req: Request) {
    try {
        if (!mpConfig) {
            console.error('[Payment API] Mercado Pago not configured');
            return NextResponse.json({ error: 'Mercado Pago not configured' }, { status: 503 });
        }

        const body = await req.json();
        console.log('[Payment API] Incoming Body:', JSON.stringify(body, null, 2));

        const payment = new Payment(mpConfig);

        // Ensure we have a transaction_amount (sometimes the brick might have internal logic)
        // Usually the brick sends exactly what's needed for payment.create

        const paymentData = {
            body: {
                transaction_amount: body.transaction_amount,
                token: body.token,
                description: body.description || 'Status Core - Relatório Platinum',
                installments: body.installments,
                payment_method_id: body.payment_method_id,
                issuer_id: body.issuer_id,
                payer: {
                    email: body.payer?.email,
                    identification: body.payer?.identification,
                    first_name: body.payer?.first_name,
                    last_name: body.payer?.last_name,
                },
                external_reference: body.external_reference,
                // Add metadata for easier tracking
                metadata: {
                    diagnosis_id: body.external_reference
                }
            }
        };

        console.log('[Payment API] Sending to Mercado Pago:', JSON.stringify(paymentData, null, 2));

        const result = await payment.create(paymentData);

        console.log('[Payment API] Mercado Pago Response:', JSON.stringify(result, null, 2));

        if (result.status === 'approved') {
            if (result.external_reference) {
                console.log('[Payment API] Unlocking diagnosis via Admin:', result.external_reference);

                // Use admin client to bypass RLS on server
                const { supabaseAdmin } = await import('@/lib/supabase-admin');
                const { error: unlockError } = await supabaseAdmin
                    .from('diagnoses')
                    .update({
                        is_unlocked: true,
                        unlocked_at: new Date().toISOString()
                    })
                    .eq('id', result.external_reference);

                if (unlockError) {
                    console.error('[Payment API] Admin Unlock Error:', unlockError);
                } else {
                    console.log('[Payment API] Diagnosis unlocked successfully');
                }
            }
            return NextResponse.json({
                status: result.status,
                id: result.id
            });
        } else {
            console.warn('[Payment API] Payment not approved:', result.status, result.status_detail);
            return NextResponse.json({
                status: result.status,
                status_detail: result.status_detail,
                id: result.id
            });
        }

    } catch (error: any) {
        console.error('[Payment API] Detailed Error:', {
            message: error.message,
            stack: error.stack,
            cause: error.cause,
            mpResponse: error.response?.data
        });

        return NextResponse.json({
            error: error.message || 'Internal Server Error',
            details: error.response?.data
        }, { status: 500 });
    }
}
