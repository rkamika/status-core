import { NextResponse } from 'next/server';
import { headers, cookies } from 'next/headers';
import { sendMetaCapiEvent } from '@/lib/meta-capi';

export async function POST(req: Request) {
    try {
        const { eventName, params, eventID, url } = await req.json();

        const headersList = await headers();
        const ip = headersList.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
        const userAgent = headersList.get('user-agent') || '';

        const cookieStore = await cookies();
        const fbp = cookieStore.get('_fbp')?.value;
        const fbc = cookieStore.get('_fbc')?.value;

        // Extract diagnosisId from params or eventID if possible
        const externalId = params?.content_ids?.[0] || params?.externalId || (eventID?.includes('_') ? eventID.split('_')[1] : undefined);

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
