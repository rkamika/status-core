'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';

const sanitizeUrl = (url: string) => {
    try {
        const u = new URL(url);
        u.searchParams.delete('unlocked');
        return u.toString();
    } catch {
        return url;
    }
};

export const trackFBEvent = (
    eventName: string,
    params?: Record<string, any>,
    eventID?: string,
    externalId?: string,
    userData?: { email?: string; firstName?: string; lastName?: string; phone?: string }
) => {
    // 1. Ensure we have a unique eventID for deduplication
    const finalEventId = eventID || `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    console.log(`[Meta Tracking] Triggering ${eventName}`, { finalEventId, externalId, hasEmail: !!userData?.email });

    // 2. Browser Tracking (Pixel)
    const testCode = typeof window !== 'undefined' ? (process.env.NEXT_PUBLIC_FB_TEST_EVENT_CODE || (window as any)._fb_test_code) : undefined;
    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
    const cleanUrl = sanitizeUrl(currentUrl);

    // Capture fbclid for cookie consistency if needed (CAPI helper)
    if (typeof window !== 'undefined' && currentUrl.includes('fbclid=')) {
        try {
            const url = new URL(currentUrl);
            const fbclid = url.searchParams.get('fbclid');
            if (fbclid) {
                // Set cookie for 90 days as per Meta best practices
                document.cookie = `_fbc=fb.1.${Date.now()}.${fbclid}; path=/; max-age=${90 * 24 * 60 * 60}; sameSite=Lax`;
            }
        } catch (e) {
            console.error('[Meta Tracking] Error capturing fbclid:', e);
        }
    }

    const finalParams = {
        ...(params || {}),
        external_id: externalId,
        event_source_url: cleanUrl,
        ...(testCode ? { test_event_code: testCode } : {})
    };

    if (typeof window !== 'undefined' && (window as any).fbq) {
        // Set Advanced Matching data if available
        if (externalId || userData) {
            const fbUserData: Record<string, any> = {};
            if (externalId) fbUserData.external_id = externalId;
            if (userData?.email) fbUserData.em = userData.email.trim().toLowerCase();
            if (userData?.firstName) fbUserData.fn = userData.firstName.trim().toLowerCase();
            if (userData?.lastName) fbUserData.ln = userData.lastName.trim().toLowerCase();
            if (userData?.phone) fbUserData.ph = userData.phone.trim().replace(/\D/g, '');

            (window as any).fbq('set', 'user_data', fbUserData);
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
                params: finalParams,
                eventID: finalEventId,
                externalId,
                userData, // Send raw PII to proxy, which will hash it using crypto-server-side
                url: cleanUrl
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
