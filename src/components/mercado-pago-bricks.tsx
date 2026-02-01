"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { useTheme } from "./theme-provider";

interface MercadoPagoBricksProps {
    preferenceId: string;
    diagnosisId: string;
    amount: number;
    onSuccess: (id: string) => void;
    onError: (error: any) => void;
}

declare global {
    interface Window {
        MercadoPago: any;
    }
}

export function MercadoPagoBricks({ preferenceId, diagnosisId, amount, onSuccess, onError }: MercadoPagoBricksProps) {
    const { theme } = useTheme();
    const containerRef = useRef<HTMLDivElement>(null);
    const mpInstance = useRef<any>(null);
    const [isSdkLoaded, setIsSdkLoaded] = useState(false);
    const [initError, setInitError] = useState<string | null>(null);

    const initBricks = async () => {
        if (!window.MercadoPago || !containerRef.current || !preferenceId) return;

        const publicKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY;

        if (!publicKey) {
            setInitError("Public Key missing");
            return;
        }

        // Diagnostic: Print partial key to verify match with MP dashboard
        const partialKey = `${publicKey.substring(0, 8)}...${publicKey.substring(publicKey.length - 4)}`;
        console.log("DEBUG: Using Public Key:", partialKey);
        console.log("DEBUG: Using PreferenceID:", preferenceId);

        try {
            if (!mpInstance.current) {
                mpInstance.current = new window.MercadoPago(publicKey, { locale: "pt-BR" });
            }

            const bricksBuilder = mpInstance.current.bricks();

            if (containerRef.current) {
                containerRef.current.innerHTML = "";
            }

            await bricksBuilder.create("payment", "paymentBrick_container", {
                initialization: {
                    amount: amount,
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
                            theme: theme === "dark" ? "dark" : "default",
                            customVariables: {
                                background: theme === "dark" ? "#000000" : "#ffffff",
                                baseColor: theme === "dark" ? "#ffffff" : "#000000",
                                secondaryColor: theme === "dark" ? "#ffffff" : "#000000",
                                elementsColor: theme === "dark" ? "#ffffff" : "#000000",
                            }
                        },
                    },
                },
                callbacks: {
                    onReady: () => {
                        console.log("SUCCESS: Payment Brick rendered");
                        setInitError(null);
                    },
                    onSubmit: ({ selectedPaymentMethod, formData }: any) => {
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
                        console.error("MP BRICK ERROR:", error);
                        setInitError(`Bricks error: ${error.cause || 'Unknown'}`);
                        onError(error);
                    },
                },
            });
        } catch (err: any) {
            console.error("FATAL MP INIT ERROR:", err);
            setInitError(err.message || "Failed to load payment form");
        }
    };

    useEffect(() => {
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
    }, [isSdkLoaded, preferenceId, theme]);

    return (
        <div className="w-full">
            <Script
                src="https://sdk.mercadopago.com/js/v2"
                onLoad={() => setIsSdkLoaded(true)}
                strategy="afterInteractive"
            />

            <div id="paymentBrick_container" ref={containerRef} className="min-h-[400px] w-full rounded-2xl flex items-center justify-center">
                {!isSdkLoaded && !initError && (
                    <div className="flex flex-col items-center gap-2">
                        <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
                        <p className="text-[10px] uppercase font-black tracking-widest opacity-40">Iniciando Checkout...</p>
                    </div>
                )}

                {initError && (
                    <div className="text-center p-6">
                        <p className="text-xs text-rose-500 font-bold uppercase mb-2">Erro de Configuração</p>
                        <p className="text-[10px] text-muted-foreground mb-4 uppercase">{initError}</p>
                        <button onClick={() => window.location.reload()} className="text-[10px] text-primary underline font-bold uppercase">Tentar Novamente</button>
                    </div>
                )}
            </div>
        </div>
    );
}
