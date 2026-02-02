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
    const [pixPaymentData, setPixPaymentData] = useState<any>(null);
    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

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

            // Properly clear container and wait for DOM to update
            if (containerRef.current) {
                try {
                    containerRef.current.innerHTML = "";
                    // Wait for DOM to fully clear before creating new Brick
                    await new Promise(resolve => setTimeout(resolve, 100));
                } catch (err) {
                    console.warn("[BRICK] Error clearing container:", err);
                }
            }

            await bricksBuilder.create("payment", "paymentBrick_container", {
                initialization: {
                    amount: amount,
                    preferenceId: preferenceId,
                },
                customization: {
                    paymentMethods: {
                        bankTransfer: "all",
                        creditCard: "all",
                        debitCard: "all",
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
                            // For Pix/Boleto (pending), store the data to show QR Code
                            if (data.status === "approved") {
                                console.log("[BRICK] Payment approved, calling onSuccess");
                                onSuccess(data.id);
                            } else if (data.status === "pending" && data.payment_method_id === "pix") {
                                console.log("[BRICK] Pix payment pending, showing QR Code screen");
                                setPixPaymentData(data);
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

    // Poll payment status when Pix QR Code is displayed
    useEffect(() => {
        if (!pixPaymentData) {
            // Clear polling if no Pix payment
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
                pollingIntervalRef.current = null;
            }
            return;
        }

        console.log("[POLLING] Starting payment status polling for:", pixPaymentData.id);

        // Check immediately
        checkPaymentStatus();

        // Then check every 3 seconds
        pollingIntervalRef.current = setInterval(checkPaymentStatus, 3000);

        async function checkPaymentStatus() {
            try {
                const response = await fetch(`/api/check_payment_status?paymentId=${pixPaymentData.id}`);
                const data = await response.json();

                console.log("[POLLING] Payment status:", data.status);

                if (data.status === "approved") {
                    console.log("[POLLING] Payment approved! Calling onSuccess");
                    if (pollingIntervalRef.current) {
                        clearInterval(pollingIntervalRef.current);
                        pollingIntervalRef.current = null;
                    }
                    onSuccess(data.id);
                }
            } catch (error) {
                console.error("[POLLING] Error checking payment status:", error);
            }
        }

        // Cleanup on unmount
        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
                pollingIntervalRef.current = null;
            }
        };
    }, [pixPaymentData, onSuccess]);

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

            {/* Custom Pix QR Code Display */}
            {pixPaymentData && (
                <div className="space-y-6 p-6 bg-card rounded-2xl border border-border">
                    <div className="text-center space-y-2">
                        <h3 className="text-xl font-black uppercase tracking-wider">Pague com Pix</h3>
                        <p className="text-sm text-muted-foreground">Escaneie o QR Code ou copie o código abaixo</p>
                    </div>

                    {pixPaymentData.point_of_interaction?.transaction_data?.qr_code_base64 && (
                        <div className="flex justify-center p-4 bg-white rounded-xl">
                            <img
                                src={`data:image/png;base64,${pixPaymentData.point_of_interaction.transaction_data.qr_code_base64}`}
                                alt="QR Code Pix"
                                className="w-64 h-64"
                            />
                        </div>
                    )}

                    {pixPaymentData.point_of_interaction?.transaction_data?.qr_code && (
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider">Código Pix (Copia e Cola)</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={pixPaymentData.point_of_interaction.transaction_data.qr_code}
                                    readOnly
                                    className="flex-1 px-3 py-2 text-xs bg-muted border border-border rounded-lg font-mono"
                                />
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(pixPaymentData.point_of_interaction.transaction_data.qr_code);
                                        alert("Código copiado!");
                                    }}
                                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-bold uppercase hover:opacity-90"
                                >
                                    Copiar
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="text-center text-xs text-muted-foreground space-y-1">
                        <p>⏱️ Após o pagamento, seu acesso será liberado automaticamente</p>
                        <p className="text-[10px]">ID do Pagamento: {pixPaymentData.id}</p>
                    </div>
                </div>
            )}

            <div id="paymentBrick_container" ref={containerRef} className={`min-h-[400px] w-full rounded-2xl flex items-center justify-center ${pixPaymentData ? 'hidden' : ''}`}>
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
