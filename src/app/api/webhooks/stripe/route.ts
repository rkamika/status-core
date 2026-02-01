import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { unlockDiagnosis, getDiagnosisById } from '@/lib/storage';
import { sendMetaCapiEvent } from '@/lib/meta-capi';

// Initialize clients at top level, but safely to prevent build-time crashes if keys are missing
const stripe = process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-01-27.acacia' as any })
    : null;

export async function POST(req: Request) {
    const body = await req.text();
    const headersList = await headers();
    const sig = headersList.get('stripe-signature');

    let event: Stripe.Event;

    try {
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

        if (!stripe || !webhookSecret) {
            console.error('Stripe configuration missing');
            return NextResponse.json({ error: 'Not configured' }, { status: 503 });
        }

        if (!sig) throw new Error('No signature');
        event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err: any) {
        console.error(`Webhook Error: ${err.message}`);
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    // Handle the event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const diagnosisId = session.metadata?.diagnosisId;

        if (diagnosisId) {
            console.log(`Unlocking diagnosis ${diagnosisId} via Stripe...`);
            await unlockDiagnosis(diagnosisId);

            // Send Meta CAPI Purchase Event
            const diagnosis = await getDiagnosisById(diagnosisId);
            if (diagnosis) {
                await sendMetaCapiEvent({
                    eventName: 'Purchase',
                    eventSourceUrl: `${process.env.NEXT_PUBLIC_APP_URL}/${diagnosis.lang}/report/${diagnosisId}`,
                    userData: {
                        email: session.customer_details?.email || undefined,
                        externalId: diagnosisId,
                    },
                    customData: {
                        value: session.amount_total ? session.amount_total / 100 : 0, // Stripe uses cents
                        currency: session.currency?.toUpperCase() || 'USD',
                        content_name: 'Platinum Report',
                        content_ids: [diagnosisId],
                        content_type: 'product'
                    },
                    eventId: `pur_${diagnosisId}` // Consistent deduplication ID
                });
            }
        }
    }

    return NextResponse.json({ received: true });
}
