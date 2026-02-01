'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';

export const trackFBEvent = (eventName: string, params?: Record<string, any>, eventID?: string, externalId?: string) => {
    // 1. Ensure we have a unique eventID for deduplication
    const finalEventId = eventID || `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    console.log(`[Meta Tracking] Triggering ${eventName}`, { finalEventId, externalId });

    // 2. Browser Tracking (Pixel)
    const testCode = typeof window !== 'undefined' ? (process.env.NEXT_PUBLIC_FB_TEST_EVENT_CODE || (window as any)._fb_test_code) : undefined;

    const finalParams = {
        ...(params || {}),
        external_id: externalId,
        ...(testCode ? { test_event_code: testCode } : {})
    };

    if (typeof window !== 'undefined' && (window as any).fbq) {
        if (externalId) {
            (window as any).fbq('set', 'user_data', { external_id: externalId });
        }
        (window as any).fbq('track', eventName, finalParams, { eventID: finalEventId });
    }

    // 3. Server Tracking Backup (CAPI via Proxy)
    if (typeof window !== 'undefined') {
        fetch('/api/meta-track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                eventName,
                params: finalParams, // Use standardized params with test_event_code and external_id
                eventID: finalEventId,
                externalId,
                url: window.location.href
            }),
        }).catch(err => console.warn('Meta CAPI Proxy Error:', err));
    }
};

export default function MetaPixel() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;

    useEffect(() => {
        if (!pixelId) return;
        // Standardized ID for PageView based on path to ensure Navigator and Server Match
        const pageId = `page_${pathname.replace(/\//g, '_')}`;
        trackFBEvent('PageView', {}, pageId);
    }, [pathname, searchParams, pixelId]);

    if (!pixelId) return null;

    return (
        <>
            <Script
                id="fb-pixel"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('set', 'autoConfig', false, '${pixelId}');
            fbq('init', '${pixelId}');
          `,
                }}
            />
            <noscript>
                <img
                    height="1"
                    width="1"
                    style={{ display: 'none' }}
                    src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
                />
            </noscript>
        </>
    );
}
