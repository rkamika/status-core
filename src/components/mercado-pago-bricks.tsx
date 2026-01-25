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
        if (!window.MercadoPago || !containerRef.current || !preferenceId) return;

        // Initialize MP instance if not already done
        if (!mpInstance.current) {
            mpInstance.current = new window.MercadoPago(
                process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY,
                { locale: "pt-BR" }
            );
        }

        const bricksBuilder = mpInstance.current.bricks();

        const renderPaymentBrick = async (bricksBuilder: any) => {
            const settings = {
                initialization: {
                    amount: 97, // This is just a placeholder as it follows preference item price
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
                            theme: "dark", // We want it dark for Status Core
                        },
                    },
                },
                callbacks: {
                    onReady: () => {
                        console.log("Bricks ready");
                    },
                    onSubmit: ({ selectedPaymentMethod, formData }: any) => {
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
                                        onSuccess(data.id);
                                        resolve(data);
                                    } else {
                                        reject();
                                    }
                                })
                                .catch((error) => {
                                    onError(error);
                                    reject();
                                });
                        });
                    },
                    onError: (error: any) => {
                        console.error("Bricks Error:", error);
                        onError(error);
                    },
                },
            };

            // Clear previous container content before rendering
            if (containerRef.current) {
                containerRef.current.innerHTML = "";
            }

            await bricksBuilder.create("payment", "paymentBrick_container", settings);
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
                onLoad={() => initBricks()}
                strategy="lazyOnload"
            />
            <div id="paymentBrick_container" ref={containerRef} className="min-h-[600px] w-full bg-background/50 rounded-2xl p-4">
                {/* Mercado Pago Brick will be rendered here */}
            </div>
        </div>
    );
}
