import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { getDiagnosisById } from '@/lib/storage';
import { sendMetaCapiEvent } from '@/lib/meta-capi';
import { sendGA4PurchaseEvent } from '@/lib/ga4-server';

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
            
            // Use admin client to bypass RLS on server
            const { supabaseAdmin } = await import('@/lib/supabase-admin');
            const { error: unlockError } = await supabaseAdmin
                .from('diagnoses')
                .update({
                    is_unlocked: true,
                    unlocked_at: new Date().toISOString()
                })
                .eq('id', diagnosisId);

            if (unlockError) {
                console.error('[Stripe Webhook] Admin Unlock Error:', unlockError);
            } else {
                console.log('[Stripe Webhook] Diagnosis unlocked successfully');

                // Send Meta CAPI Purchase Event & GA4
                const diagnosis = await getDiagnosisById(diagnosisId);
                if (diagnosis) {
                    const amount = session.amount_total ? session.amount_total / 100 : 0;
                    const currency = session.currency?.toUpperCase() || 'USD';

                    await sendMetaCapiEvent({
                        eventName: 'Purchase',
                        eventSourceUrl: `${process.env.NEXT_PUBLIC_APP_URL}/${diagnosis.lang}/report/${diagnosisId}`,
                        userData: {
                            email: session.customer_details?.email || undefined,
                            externalId: diagnosisId,
                        },
                        customData: {
                            value: amount, // Stripe uses cents
                            currency: currency,
                            content_name: 'Platinum Report',
                            content_ids: [diagnosisId],
                            content_type: 'product'
                        },
                        eventId: `pur_${diagnosisId}` // Consistent deduplication ID
                    });

                    // GA4 Measurement Protocol
                    await sendGA4PurchaseEvent({
                        client_id: diagnosisId, // Using diagnosis ID as a stable client reference for server events
                        transaction_id: session.id,
                        value: amount,
                        currency: currency,
                        item_name: 'Platinum Report'
                    });
                }
            }
        }
    }

    return NextResponse.json({ received: true });
}
