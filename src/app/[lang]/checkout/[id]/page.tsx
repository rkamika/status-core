"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, CreditCard, Lock, Sparkles, ArrowRight, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDictionary } from "@/lib/get-dictionary";
import { getDiagnosisById, unlockDiagnosis } from "@/lib/storage";
import { Locale } from "@/lib/types";

export default function CheckoutPage({ params }: { params: Promise<{ lang: Locale; id: string }> }) {
    const { lang, id } = use(params);
    const dict = use(getDictionary(lang));
    const router = useRouter();


    const [diagnosis, setDiagnosis] = useState<ReturnType<typeof getDiagnosisById>>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        const savedDiagnosis = getDiagnosisById(id);
        if (!savedDiagnosis) {
            router.push(`/${lang}/assessment`);
        } else {
            setDiagnosis(savedDiagnosis);
        }
    }, [id, lang, router]);

    const handleMockPayment = () => {
        setIsProcessing(true);

        // Simulate payment processing
        setTimeout(() => {
            unlockDiagnosis(id);
            setIsProcessing(false);
            setIsComplete(true);

            // Redirect to report after 2 seconds
            setTimeout(() => {
                router.push(`/${lang}/report/${id}`);
            }, 2000);
        }, 2000);
    };

    if (!diagnosis) {
        return null;
    }

    if (isComplete) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-6"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                        className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center"
                    >
                        <CheckCircle2 className="h-10 w-10 text-primary" />
                    </motion.div>
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold">Pagamento Confirmado!</h2>
                        <p className="text-muted-foreground">Redirecionando para seu relatório completo...</p>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            {/* Background glow */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div
                    className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] rounded-full blur-[200px] opacity-[0.08] dark:opacity-[0.15]"
                    style={{ backgroundColor: diagnosis.color }}
                />
            </div>

            <div className="relative z-10 min-h-screen flex flex-col">
                <header className="px-4 lg:px-6 h-14 flex items-center border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
                    <div className="container mx-auto flex items-center justify-between">
                        <Link className="flex items-center gap-2" href={`/${lang}`}>
                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                                <div className="w-3 h-3 bg-background rounded-full" />
                            </div>
                            <span className="font-heading font-bold text-xl tracking-tight">STATUS CORE</span>
                        </Link>
                        <Badge variant="outline" className="border-primary/20 text-primary">
                            <Shield className="h-3 w-3 mr-1" /> Checkout Seguro
                        </Badge>
                    </div>
                </header>

                <main className="flex-1 flex items-center justify-center p-4 py-12">
                    <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8">
                        {/* Left: Order Summary */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-6"
                        >
                            <div className="space-y-2">
                                <h1 className="text-4xl font-bold font-heading tracking-tight">Desbloquear Relatório</h1>
                                <p className="text-muted-foreground font-medium">Complete seu diagnóstico com análise profunda e estratégias personalizadas.</p>
                            </div>

                            <Card className="border-border dark:border-white/5 bg-card/70 dark:bg-zinc-900/30 backdrop-blur-xl shadow-xl">
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Sparkles className="h-5 w-5 text-primary" />
                                        Seu Diagnóstico
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="text-2xl font-bold" style={{ color: diagnosis.color }}>
                                                {diagnosis.label}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                Confiança: {diagnosis.confidence}%
                                            </div>
                                        </div>
                                        <Badge variant="outline" className="border-primary/20 text-primary">
                                            Premium
                                        </Badge>
                                    </div>

                                    <div className="pt-4 border-t border-border dark:border-white/5 space-y-2 text-sm">
                                        <div className="flex items-center gap-2 text-foreground/70 font-medium">
                                            <CheckCircle2 className="h-4 w-4 text-primary" />
                                            Análise completa do seu estado
                                        </div>
                                        <div className="flex items-center gap-2 text-foreground/70 font-medium">
                                            <CheckCircle2 className="h-4 w-4 text-primary" />
                                            Plano de ação tático personalizado
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <CheckCircle2 className="h-4 w-4 text-primary" />
                                            Sabedoria estoica aplicada
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <CheckCircle2 className="h-4 w-4 text-primary" />
                                            Insights de contexto profundo
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-border dark:border-white/5 bg-muted/30 dark:bg-zinc-900/20 backdrop-blur-sm">
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-bold">Total</span>
                                        <span className="text-3xl font-black text-primary">GRÁTIS</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-2 font-medium">* Demo MVP - Pagamento simulado</p>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Right: Mock Payment */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="space-y-6"
                        >
                            <Card className="border-border dark:border-white/5 bg-card/70 dark:bg-zinc-900/30 backdrop-blur-xl shadow-xl">
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <CreditCard className="h-5 w-5" />
                                        Simulação de Pagamento
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="p-6 rounded-xl bg-muted/30 dark:bg-white/[0.02] border border-border dark:border-white/5 space-y-4">
                                        <p className="text-sm text-foreground/70 font-medium leading-relaxed">
                                            Esta é uma <strong className="text-primary font-black">demonstração MVP</strong>. O pagamento real será integrado em produção.
                                        </p>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-sm">
                                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                Stripe / Mercado Pago (futuro)
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                Criptografia SSL
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                Dados protegidos
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        size="lg"
                                        className="w-full h-14 text-lg font-bold shadow-xl shadow-primary/20"
                                        onClick={handleMockPayment}
                                        disabled={isProcessing}
                                    >
                                        {isProcessing ? (
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                            >
                                                <Lock className="h-5 w-5" />
                                            </motion.div>
                                        ) : (
                                            <>
                                                Simular Pagamento & Desbloquear
                                                <ArrowRight className="ml-2 h-5 w-5" />
                                            </>
                                        )}
                                    </Button>

                                    <div className="text-center">
                                        <Link href={`/${lang}/report/demo`} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                            Ver relatório de demonstração primeiro
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                                <Shield className="h-4 w-4" />
                                <span>Seus dados estão seguros e protegidos</span>
                            </div>
                        </motion.div>
                    </div>
                </main>
            </div>
        </div>
    );
}
