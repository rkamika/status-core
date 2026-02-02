import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';

const mpConfig = process.env.MERCADOPAGO_ACCESS_TOKEN
    ? new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN })
    : null;

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const paymentId = searchParams.get('paymentId');

    try {
        if (!mpConfig) {
            return NextResponse.json({ error: 'Not configured' }, { status: 503 });
        }

        if (!paymentId) {
            return NextResponse.json({ error: 'Payment ID required' }, { status: 400 });
        }

        const payment = new Payment(mpConfig);
        const data = await payment.get({ id: paymentId });

        return NextResponse.json({
            status: data.status,
            status_detail: data.status_detail,
            id: data.id,
            external_reference: data.external_reference
        });
    } catch (error: any) {
        console.error('Payment Status Check Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
