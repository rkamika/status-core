"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";

interface MercadoPagoBricksProps {
    preferenceId: string;
    onSuccess: (id: string) => void;
    onError: (error: any) => void;
}

declare global {
    interface Window {
        MercadoPago: any;
    }
}

export function MercadoPagoBricks({ preferenceId, onSuccess, onError }: MercadoPagoBricksProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const mpInstance = useRef<any>(null);

    const initBricks = () => {
        if (!window.MercadoPago) {
            console.error("MercadoPago SDK not found in window object");
            return;
        }
        if (!containerRef.current) {
            console.error("Container ref not ready for Bricks");
            return;
        }
        if (!preferenceId) {
            console.error("preferenceId is missing for Bricks initialization");
            return;
        }

        const publicKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY;
        if (!publicKey) {
            console.error("NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY is not defined in environment");
        }

        console.log("Initializing Bricks for preferenceId:", preferenceId);

        // Initialize MP instance if not already done
        if (!mpInstance.current) {
            try {
                mpInstance.current = new window.MercadoPago(publicKey, { locale: "pt-BR" });
                console.log("MercadoPago instance created successfully");
            } catch (err) {
                console.error("Failed to create MercadoPago instance:", err);
                return;
            }
        }

        const bricksBuilder = mpInstance.current.bricks();

        const renderPaymentBrick = async (bricksBuilder: any) => {
            const settings = {
                initialization: {
                    amount: 97,
                    preferenceId: preferenceId,
                },
                customization: {
                    paymentMethods: {
                        ticket: "all",
                        bankTransfer: "all",
                        creditCard: "all",
                        debitCard: "all",
                        mercadoPago: "all",
                    },
                    visual: {
                        style: {
                            theme: "dark",
                        },
                    },
                },
                callbacks: {
                    onReady: () => {
                        console.log("Bricks UI is ready and rendered");
                    },
                    onSubmit: ({ selectedPaymentMethod, formData }: any) => {
                        console.log("Payment submitted via Bricks:", selectedPaymentMethod);
                        return new Promise((resolve, reject) => {
                            fetch("/api/process_payment", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify(formData),
                            })
                                .then((response) => response.json())
                                .then((data) => {
                                    if (data.status === "approved") {
                                        console.log("Payment approved:", data.id);
                                        onSuccess(data.id);
                                        resolve(data);
                                    } else {
                                        console.warn("Payment status not approved:", data.status);
                                        reject();
                                    }
                                })
                                .catch((error) => {
                                    console.error("Error processing payment API:", error);
                                    onError(error);
                                    reject();
                                });
                        });
                    },
                    onError: (error: any) => {
                        console.error("Bricks Callback Error:", error);
                        onError(error);
                    },
                },
            };

            // Clear previous container content before rendering
            if (containerRef.current) {
                containerRef.current.innerHTML = "";
            }

            try {
                console.log("Attempting to create payment brick...");
                await bricksBuilder.create("payment", "paymentBrick_container", settings);
                console.log("Payment brick creation call completed");
            } catch (err) {
                console.error("Detailed error in bricksBuilder.create:", err);
            }
        };

        renderPaymentBrick(bricksBuilder);
    };

    useEffect(() => {
        // If script is already loaded
        if (window.MercadoPago) {
            initBricks();
        }
    }, [preferenceId]);

    return (
        <div className="w-full">
            <Script
                src="https://sdk.mercadopago.com/js/v2"
                onLoad={() => {
                    console.log("MercadoPago script loaded via next/script");
                    initBricks();
                }}
                strategy="afterInteractive"
            />
            <div id="paymentBrick_container" ref={containerRef} className="min-h-[600px] w-full bg-background/50 rounded-2xl p-4">
                {/* Mercado Pago Brick will be rendered here */}
            </div>
        </div>
    );
}
