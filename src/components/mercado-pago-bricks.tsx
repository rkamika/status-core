"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

interface MercadoPagoBricksProps {
    preferenceId: string;
    diagnosisId: string;
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
    const [isSdkLoaded, setIsSdkLoaded] = useState(false);
    const [initError, setInitError] = useState<string | null>(null);

    const initBricks = async () => {
        if (!window.MercadoPago) {
            setInitError("SDK not found on window object");
            return;
        }

        const publicKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY;
        if (!publicKey) {
            setInitError("Public Key missing (NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY)");
            console.error("NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY is not defined");
            return;
        }

        if (!preferenceId) {
            setInitError("Preference ID missing");
            return;
        }

        try {
            // Initialize MP instance if not already done
            if (!mpInstance.current) {
                mpInstance.current = new window.MercadoPago(publicKey, { locale: "pt-BR" });
                console.log("MP Instance initialized");
            }

            const bricksBuilder = mpInstance.current.bricks();

            // Clear container
            if (containerRef.current) {
                containerRef.current.innerHTML = "";
            }

            console.log("Rendering Payment Brick for:", preferenceId);

            await bricksBuilder.create("payment", "paymentBrick_container", {
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
                        console.log("Brick Ready");
                        setInitError(null);
                    },
                    onSubmit: ({ selectedPaymentMethod, formData }: any) => {
                        console.log("Payment submitted via Bricks:", selectedPaymentMethod);
                        return new Promise((resolve, reject) => {
                            fetch("/api/process_payment", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    ...formData,
                                    external_reference: diagnosisId
                                }),
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
                        console.error("Brick Error Callback:", error);
                        onError(error);
                    },
                },
            });
        } catch (err: any) {
            console.error("Fatal Brick Init Error:", err);
            setInitError(err.message || "Failed to initialize payment form");
        }
    };

    useEffect(() => {
        // Polling for the script just in case onLoad is problematic
        const interval = setInterval(() => {
            if (window.MercadoPago) {
                setIsSdkLoaded(true);
                clearInterval(interval);
            }
        }, 500);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (isSdkLoaded && preferenceId) {
            initBricks();
        }
    }, [isSdkLoaded, preferenceId]);

    return (
        <div className="w-full space-y-4">
            <Script
                src="https://sdk.mercadopago.com/js/v2"
                onLoad={() => setIsSdkLoaded(true)}
                strategy="afterInteractive"
            />

            <div id="paymentBrick_container" ref={containerRef} className="min-h-[400px] w-full bg-card/50 rounded-2xl p-4 flex flex-col items-center justify-center border border-border/40">
                {!isSdkLoaded && !initError && (
                    <div className="flex flex-col items-center gap-2">
                        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                        <p className="text-xs text-muted-foreground animate-pulse">Carregando processador de pagamento...</p>
                    </div>
                )}

                {initError && (
                    <div className="text-center space-y-2 p-4">
                        <p className="text-sm text-rose-500 font-bold">⚠️ Erro ao carregar checkout</p>
                        <p className="text-[10px] text-muted-foreground opacity-60 uppercase">{initError}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="text-[10px] text-primary underline"
                        >
                            Tentar recarregar página
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
