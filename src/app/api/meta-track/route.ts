import { NextResponse } from 'next/server';
import { headers, cookies } from 'next/headers';
import { sendMetaCapiEvent } from '@/lib/meta-capi';

export async function POST(req: Request) {
    try {
        const { eventName, params, eventID, url, externalId: providedExternalId } = await req.json();

        console.log(`[Meta Track Proxy] Received ${eventName}`, { eventID, providedExternalId });

        const headersList = await headers();
        const ip = headersList.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
        const userAgent = headersList.get('user-agent') || '';

        const cookieStore = await cookies();
        const fbp = cookieStore.get('_fbp')?.value;
        const fbc = cookieStore.get('_fbc')?.value;

        // Use provided externalId or fallback to content_ids, but NEVER a random timestamp from eventID
        const externalId = providedExternalId || params?.content_ids?.[0] || params?.externalId;

        await sendMetaCapiEvent({
            eventName,
            eventSourceUrl: url || process.env.NEXT_PUBLIC_APP_URL || '',
            userData: {
                ip,
                userAgent,
                fbp,
                fbc,
                externalId,
                email: params?.email
            },
            customData: params,
            eventId: eventID
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[Meta Track API] Error:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
