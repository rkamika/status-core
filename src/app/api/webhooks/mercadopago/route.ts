import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { unlockDiagnosis } from '@/lib/storage';

const mpClient = new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

export async function POST(req: Request) {
    const { searchParams } = new URL(req.url);
    const resourceId = searchParams.get('data.id') || searchParams.get('id');
    const type = searchParams.get('type');

    try {
        if (type === 'payment' && resourceId) {
            const payment = new Payment(mpClient);
            const data = await payment.get({ id: resourceId });

            if (data.status === 'approved') {
                const diagnosisId = data.external_reference;
                if (diagnosisId) {
                    console.log(`Unlocking diagnosis ${diagnosisId} via MercadoPago...`);
                    await unlockDiagnosis(diagnosisId);
                }
            }
        }

        return NextResponse.json({ received: true });
    } catch (error: any) {
        console.error('MercadoPago Webhook Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
