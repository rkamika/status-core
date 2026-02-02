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
                                // Only use officially documented variables
                                baseColor: theme === "dark" ? "#ffffff" : "#000000",
                                textPrimaryColor: theme === "dark" ? "#ffffff" : "#000000",
                                textSecondaryColor: theme === "dark" ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)",
                                inputBackgroundColor: theme === "dark" ? "#1a1a1a" : "#ffffff",
                                borderRadiusSmall: "8px",
                                borderRadiusMedium: "12px",
                                borderRadiusLarge: "16px",
                            }
                        },
                    },
                },
                callbacks: {
                    onReady: () => {
                        console.log("SUCCESS: Payment Brick rendered");
                        setInitError(null);
                    },
                    onSubmit: async ({ selectedPaymentMethod, formData }: any) => {
                        try {
                            console.log("[BRICK] onSubmit called with:", { selectedPaymentMethod, formData });
                            const response = await fetch("/api/process_payment", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    ...formData,
                                    external_reference: diagnosisId
                                }),
                            });

                            const data = await response.json();
                            console.log("[BRICK] Payment API response:", data);
                            console.log("[BRICK] Payment status:", data.status);
                            console.log("[BRICK] Has QR code?:", !!data.point_of_interaction?.transaction_data?.qr_code);

                            // Only trigger parent success/redirect if payment is actually approved (Credit Card)
                            // For Pix/Boleto (pending), the Brick will handle showing the QR Code/Instructions
                            if (data.status === "approved") {
                                console.log("[BRICK] Payment approved, calling onSuccess");
                                onSuccess(data.id);
                            } else {
                                console.log("[BRICK] Payment pending, Brick should show instructions");
                            }

                            // Return the full response so the Brick can render the appropriate UI
                            console.log("[BRICK] Returning data to Brick for rendering");
                            return data;
                        } catch (error) {
                            console.error("[BRICK] onSubmit error:", error);
                            onError(error);
                            throw error;
                        }
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

            {/* Local CSS fix for Mercado Pago Bricks inputs contrast */}
            <style jsx global>{`
                #paymentBrick_container input,
                #paymentBrick_container select,
                #paymentBrick_container .mp-brick-payment-form__input,
                #paymentBrick_container .svelte-input-container input,
                #paymentBrick_container [class*="payment-form__input"],
                #paymentBrick_container [class*="input-container"] input {
                    color: ${theme === 'dark' ? '#ffffff' : '#000000'} !important;
                    background-color: ${theme === 'dark' ? '#1a1a1a' : '#ffffff'} !important;
                    border: 1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} !important;
                }
                
                /* Specific fix for Pix email field when it's white-on-white */
                #paymentBrick_container .mp-brick-ticket-payment-method input,
                #paymentBrick_container .mp-brick-ticket-payment-method__input {
                    color: ${theme === 'dark' ? '#ffffff' : '#000000'} !important;
                    background-color: ${theme === 'dark' ? '#1a1a1a' : '#ffffff'} !important;
                }

                /* Critical: Override Chrome/Safari autocomplete styling */
                #paymentBrick_container input:-webkit-autofill,
                #paymentBrick_container input:-webkit-autofill:hover,
                #paymentBrick_container input:-webkit-autofill:focus,
                #paymentBrick_container input:-webkit-autofill:active {
                    -webkit-text-fill-color: ${theme === 'dark' ? '#ffffff' : '#000000'} !important;
                    -webkit-box-shadow: 0 0 0 1000px ${theme === 'dark' ? '#1a1a1a' : '#ffffff'} inset !important;
                    box-shadow: 0 0 0 1000px ${theme === 'dark' ? '#1a1a1a' : '#ffffff'} inset !important;
                    transition: background-color 5000s ease-in-out 0s;
                }
            `}</style>

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
