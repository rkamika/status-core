"use client";
import { trackFBEvent } from "@/components/meta-pixel";


type GTMEventParams = Record<string, any>;

/**
 * Standard track function for GTM dataLayer
 */
export const trackEvent = (eventName: string, params?: GTMEventParams) => {
    if (typeof window === "undefined") return;

    // Initialize dataLayer if it doesn't exist
    window.dataLayer = window.dataLayer || [];

    window.dataLayer.push({
        event: eventName,
        ...params,
    });
};

/**
 * Specialized: User Sign Up / Lead Generation
 */
export const trackSignUp = (method: string = "email") => {
    trackEvent("sign_up", { method });
    trackEvent("generate_lead", {
        method,
        lead_type: "Emotional Assessment"
    });
    trackFBEvent('Lead', {
        content_name: 'Emotional Assessment Completion',
        content_category: 'Assessment'
    });
};

/**
 * Specialized: Viewing the Product/Report Diagnostic
 */
export const trackViewItem = (name: string = "Platinum Report", price: number = 97.0) => {
    trackEvent("view_item", {
        ecommerce: {
            currency: "BRL",
            value: price,
            items: [{
                item_name: name,
                item_id: name.toLowerCase().replace(/\s+/g, '_'),
                price: price,
                quantity: 1
            }]
        }
    });
};

/**
 * Specialized: Starting the payment flow
 */
export const trackBeginCheckout = (params: { value: number; currency: string; item_name: string }) => {
    trackEvent("begin_checkout", {
        ecommerce: {
            currency: params.currency,
            value: params.value,
            items: [{
                item_name: params.item_name,
                item_id: params.item_name.toLowerCase().replace(/\s+/g, '_'),
                price: params.value,
                quantity: 1
            }]
        }
    });
};

/**
 * Specialized: E-commerce Purchase (Standard GA4)
 */
export const trackPurchase = (params: {
    transaction_id: string;
    value: number;
    currency: string;
    item_name: string;
    coupon?: string;
    payment_method?: string;
}) => {
    trackEvent("purchase", {
        ecommerce: {
            transaction_id: params.transaction_id,
            value: params.value,
            currency: params.currency,
            coupon: params.coupon,
            payment_method: params.payment_method,
            items: [{
                item_name: params.item_name,
                item_id: params.item_name.toLowerCase().replace(/\s+/g, '_'),
                price: params.value,
                quantity: 1
            }]
        }
    });
};

// Global types for window.dataLayer
declare global {
    interface Window {
        dataLayer: any[];
    }
}
