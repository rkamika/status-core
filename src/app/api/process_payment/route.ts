import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { unlockDiagnosis, getDiagnosisById } from '@/lib/storage';
import { sendMetaCapiEvent } from '@/lib/meta-capi';
import { headers, cookies } from 'next/headers';
import { getSystemSetting } from '@/lib/admin';

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

        const headersList = await headers();
        const ip = headersList.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
        const userAgent = headersList.get('user-agent') || '';
        const cookieStore = await cookies();
        const fbp = cookieStore.get('_fbp')?.value;
        const fbc = cookieStore.get('_fbc')?.value;

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

                    // Send Meta CAPI Purchase Event
                    const diagnosis = await getDiagnosisById(result.external_reference);
                    if (diagnosis) {
                        const settingsPrice = await getSystemSetting('report_price');
                        const basePrice = settingsPrice ? parseFloat(settingsPrice) : 97.00;
                        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://status-core.vercel.app';

                        await sendMetaCapiEvent({
                            eventName: 'Purchase',
                            eventSourceUrl: `${baseUrl}/${diagnosis.lang}/report/${diagnosis.id}`,
                            userData: { ip, userAgent, externalId: diagnosis.id, email: body.payer?.email, fbp, fbc },
                            customData: {
                                value: basePrice,
                                currency: 'BRL',
                                content_name: 'Platinum Report',
                                content_ids: [diagnosis.id],
                                content_type: 'product'
                            },
                            eventId: `pur_${diagnosis.id}`
                        });
                    }
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
