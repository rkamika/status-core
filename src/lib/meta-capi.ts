import crypto from 'crypto';

const FB_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const FB_ACCESS_TOKEN = process.env.FB_ACCESS_TOKEN;
const FB_TEST_EVENT_CODE = process.env.FB_TEST_EVENT_CODE;

/**
 * Hash data using SHA256 as required by Meta CAPI
 */
function hashData(data: string | undefined): string | undefined {
    if (!data) return undefined;
    return crypto.createHash('sha256').update(data.trim().toLowerCase()).digest('hex');
}

interface MetaCapiUser {
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    ip?: string;
    userAgent?: string;
    externalId?: string;
}

interface MetaCapiEvent {
    eventName: string;
    eventTime?: number;
    eventSourceUrl: string;
    userData: MetaCapiUser;
    customData?: Record<string, any>;
    eventId?: string;
}

/**
 * Send event to Meta Conversions API (CAPI)
 */
export async function sendMetaCapiEvent(event: MetaCapiEvent) {
    if (!FB_PIXEL_ID || !FB_ACCESS_TOKEN) {
        console.warn('Meta CAPI: Missing FB_PIXEL_ID or FB_ACCESS_TOKEN');
        return null;
    }

    const payload = {
        data: [
            {
                event_name: event.eventName,
                event_time: event.eventTime || Math.floor(Date.now() / 1000),
                event_source_url: event.eventSourceUrl,
                action_source: 'website',
                event_id: event.eventId, // Used for deduplication with Pixel
                user_data: {
                    em: hashData(event.userData.email),
                    ph: hashData(event.userData.phone),
                    fn: hashData(event.userData.firstName),
                    ln: hashData(event.userData.lastName),
                    client_ip_address: event.userData.ip,
                    client_user_agent: event.userData.userAgent,
                    external_id: hashData(event.userData.externalId),
                },
                custom_data: event.customData,
            },
        ],
        test_event_code: FB_TEST_EVENT_CODE,
    };

    try {
        const response = await fetch(
            `https://graph.facebook.com/v19.0/${FB_PIXEL_ID}/events?access_token=${FB_ACCESS_TOKEN}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            }
        );

        const result = await response.json();

        if (!response.ok) {
            console.error('Meta CAPI Error Response:', result);
        }

        return result;
    } catch (error) {
        console.error('Meta CAPI Request Failed:', error);
        return null;
    }
}
