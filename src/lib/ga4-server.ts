/**
 * GA4 Measurement Protocol Utility (Server-Side)
 * Used to track events (like Pix purchases) from webhooks and server-side processes.
 */

const MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || 'G-G24FHEC06W';
const API_SECRET = process.env.GA4_API_SECRET;

interface GA4PurchaseParams {
    client_id: string; // Required for GA4
    transaction_id: string;
    value: number;
    currency: string;
    item_name: string;
    coupon?: string;
    email?: string; // For hash matching if supported
}

export async function sendGA4PurchaseEvent(params: GA4PurchaseParams) {
    if (!API_SECRET) {
        console.warn('[GA4 Server] Skipping event: GA4_API_SECRET is not configured.');
        return;
    }

    const url = `https://www.google-analytics.com/mp/collect?measurement_id=${MEASUREMENT_ID}&api_secret=${API_SECRET}`;

    const payload = {
        client_id: params.client_id, // We use the diagnosis ID or a persistent user ID as client_id fallback
        events: [{
            name: 'purchase',
            params: {
                transaction_id: params.transaction_id,
                value: params.value,
                currency: params.currency,
                coupon: params.coupon,
                items: [{
                    item_name: params.item_name,
                    item_id: params.item_name.toLowerCase().replace(/\s+/g, '_'),
                    price: params.value,
                    quantity: 1
                }]
            }
        }]
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`GA4 API error: ${response.status} - ${errorText}`);
        }

        console.log(`[GA4 Server] Purchase event sent for ${params.transaction_id}`);
    } catch (error) {
        console.error('[GA4 Server] Error sending event:', error);
    }
}
