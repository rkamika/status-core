import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { unlockDiagnosis } from '@/lib/storage';

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
        }
    }

    return NextResponse.json({ received: true });
}
