"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, CreditCard, Lock, Sparkles, ArrowRight, Shield, Ticket, DollarSign, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { getDictionary } from "@/lib/get-dictionary";
import { getDiagnosisById, unlockDiagnosis } from "@/lib/storage";
import { getSystemSetting, validatePromoCode, PromoCode } from "@/lib/admin";
import { Locale } from "@/lib/types";
import { Logo } from "@/components/logo";

export default function CheckoutPage({ params }: { params: Promise<{ lang: Locale; id: string }> }) {
    const { lang, id } = use(params);
    const dict = use(getDictionary(lang));
    const router = useRouter();


    const [diagnosis, setDiagnosis] = useState<any>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isComplete, setIsComplete] = useState(false);

    // Pricing & Promo State
    const [basePrice, setBasePrice] = useState(97.00);
    const [promoCode, setPromoCode] = useState("");
    const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
    const [promoError, setPromoError] = useState(false);
    const [isApplyingPromo, setIsApplyingPromo] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            const [savedDiagnosis, settingsPrice] = await Promise.all([
                getDiagnosisById(id),
                getSystemSetting('report_price')
            ]);

            if (!savedDiagnosis) {
                router.push(`/${lang}/assessment`);
            } else {
                setDiagnosis(savedDiagnosis);
            }

            if (settingsPrice) {
                setBasePrice(parseFloat(settingsPrice));
            }
        };
        loadData();
    }, [id, lang, router]);

    const handleApplyPromo = async () => {
        if (!promoCode) return;
        setIsApplyingPromo(true);
        setPromoError(false);
        try {
            const promo = await validatePromoCode(promoCode);
            if (promo) {
                setAppliedPromo(promo);
            } else {
                setPromoError(true);
            }
        } catch (err) {
            setPromoError(true);
        } finally {
            setIsApplyingPromo(false);
        }
    };

    const discountAmount = appliedPromo ? (basePrice * appliedPromo.discount_percent) / 100 : 0;
    const finalPrice = basePrice - discountAmount;
    const isFree = finalPrice <= 0;

    const handleUnlock = async () => {
        setIsProcessing(true);

        // Simulate payment processing if not free
        if (!isFree) {
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        await unlockDiagnosis(id);
        setIsProcessing(false);
        setIsComplete(true);

        // Redirect to report after 2 seconds
        setTimeout(() => {
            router.push(`/${lang}/report/${id}`);
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
                        <h2 className="text-3xl font-bold">
                            {lang === 'pt' ? 'Acesso Liberado!' : lang === 'es' ? '¡Acceso Liberado!' : 'Access Granted!'}
                        </h2>
                        <p className="text-muted-foreground">
                            {lang === 'pt' ? 'Redirecionando para seu relatório completo...' : lang === 'es' ? 'Redirigiendo a su informe completo...' : 'Redirecting to your full report...'}
                        </p>
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
                        <Logo lang={lang} />
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
                                <h1 className="text-4xl font-bold font-heading tracking-tight italic uppercase">
                                    {lang === 'pt' ? 'Desbloquear Inteligência' : lang === 'es' ? 'Desbloquear Inteligencia' : 'Unlock Intelligence'}
                                </h1>
                                <p className="text-muted-foreground font-medium italic">
                                    {lang === 'pt' ? 'Receba agora seu diagnóstico v4 com plano de 7 dias e análise AI.' : lang === 'es' ? 'Reciba ahora su diagnóstico v4 con plan de 7 días y análisis AI.' : 'Get your v4 diagnosis now with 7-day plan and AI analysis.'}
                                </p>
                            </div>

                            <Card className="border-border dark:border-white/5 bg-card/70 dark:bg-zinc-900/30 backdrop-blur-xl shadow-xl p-6">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="text-2xl font-black italic uppercase" style={{ color: diagnosis.color }}>
                                                {diagnosis.label}
                                            </div>
                                            <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
                                                ID: {diagnosis.id.substring(0, 8)}
                                            </div>
                                        </div>
                                        <Badge className="bg-primary text-primary-foreground italic animate-pulse">PLATINUM v4</Badge>
                                    </div>

                                    <div className="pt-4 border-t border-border dark:border-white/5 space-y-3">
                                        {[
                                            { pt: 'Relatório Completo (45+ páginas)', en: 'Full Report (45+ pages)', es: 'Informe completo (45+ páginas)' },
                                            { pt: 'Estratégia Anti-Gargalo AI', en: 'AI Anti-Bottleneck Strategy', es: 'Estrategia Anti-Cuello de Botella AI' },
                                            { pt: 'Plano de Ação Tático 7 Dias', en: '7-Day Tactical Action Plan', es: 'Plan de acción táctico de 7 días' },
                                            { pt: 'Curadoria de Biblioteca Neural', en: 'Neural Library Curation', es: 'Curaduría de la Biblioteca Neural' }
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center gap-2 text-xs font-bold italic opacity-80">
                                                <Sparkles className="h-3 w-3 text-primary" />
                                                {item[lang] || item['en']}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Card>

                            {/* PRICE SUMMARY */}
                            <Card className="border-border dark:border-white/5 bg-muted/30 dark:bg-zinc-900/20 backdrop-blur-sm p-6 overflow-hidden relative">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-black uppercase tracking-widest opacity-40 italic">Subtotal</span>
                                        <span className="font-bold">R$ {basePrice.toFixed(2)}</span>
                                    </div>

                                    {appliedPromo && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="flex justify-between items-center text-emerald-500"
                                        >
                                            <span className="text-xs font-black uppercase tracking-widest italic flex items-center gap-1">
                                                <Ticket className="h-3 w-3" /> Discount ({appliedPromo.code})
                                            </span>
                                            <span className="font-bold">- R$ {discountAmount.toFixed(2)}</span>
                                        </motion.div>
                                    )}

                                    <div className="pt-4 border-t border-border dark:border-white/5 flex justify-between items-center">
                                        <span className="text-lg font-black uppercase tracking-widest italic">Total</span>
                                        <span className={`text-4xl font-black italic ${isFree ? 'text-primary' : 'text-foreground'}`}>
                                            {isFree ? 'FREE' : `R$ ${finalPrice.toFixed(2)}`}
                                        </span>
                                    </div>
                                </div>
                                <div className="absolute top-0 right-0 p-8 opacity-5">
                                    <DollarSign className="h-24 w-24" />
                                </div>
                            </Card>
                        </motion.div>

                        {/* Right: Payment & Promo */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="space-y-6"
                        >
                            {/* PROMO CODE BOX */}
                            <Card className="border-border dark:border-white/5 bg-card/70 dark:bg-zinc-900/30 backdrop-blur-xl shadow-xl p-6">
                                <div className="space-y-4">
                                    <h3 className="text-xs font-black uppercase tracking-widest italic flex items-center gap-2">
                                        <Ticket className="h-4 w-4 text-primary" />
                                        {lang === 'pt' ? 'Possui um código?' : lang === 'es' ? '¿Tienes un código?' : 'Have a code?'}
                                    </h3>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="PROMOCODE"
                                            value={promoCode}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPromoCode(e.target.value)}
                                            className="bg-background/50 border-border uppercase font-bold tracking-widest"
                                        />
                                        <Button
                                            variant="outline"
                                            onClick={handleApplyPromo}
                                            disabled={isApplyingPromo || !promoCode}
                                            className="font-black uppercase tracking-widest text-[10px]"
                                        >
                                            {isApplyingPromo ? <RefreshCcw className="h-4 w-4 animate-spin" /> : 'Apply'}
                                        </Button>
                                    </div>
                                    {promoError && <p className="text-[10px] text-rose-500 font-black uppercase italic">Invalid or expired code</p>}
                                    {appliedPromo && <p className="text-[10px] text-emerald-500 font-black uppercase italic">Code applied: {appliedPromo.discount_percent}% OFF</p>}
                                </div>
                            </Card>

                            {/* MAIN CTA */}
                            <Card className="border-border dark:border-white/5 bg-card/70 dark:bg-zinc-900/30 backdrop-blur-xl shadow-xl p-6">
                                <div className="space-y-6">
                                    <div className="p-4 rounded-xl bg-muted/30 dark:bg-white/[0.02] border border-border dark:border-white/5 space-y-4">
                                        <div className="flex items-center gap-2 text-xs font-bold text-foreground/70">
                                            <Shield className="h-4 w-4 text-primary" />
                                            {lang === 'pt' ? 'Processamento Criptografado SSL' : 'SSL Encrypted Processing'}
                                        </div>
                                    </div>

                                    <Button
                                        size="lg"
                                        className="w-full h-16 text-lg font-black italic uppercase shadow-xl shadow-primary/20 group"
                                        onClick={handleUnlock}
                                        disabled={isProcessing}
                                    >
                                        {isProcessing ? (
                                            <RefreshCcw className="h-5 w-5 animate-spin" />
                                        ) : (
                                            <>
                                                {isFree
                                                    ? (lang === 'pt' ? 'Desbloquear Grátis agora' : 'Unlock for Free now')
                                                    : (lang === 'pt' ? 'Finalizar Pagamento' : 'Complete Payment')}
                                                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </Button>

                                    <div className="text-center">
                                        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest opacity-40">
                                            {lang === 'pt' ? '* Acesso vitalício ao seu relatório gerado.' : '* Lifetime access to your generated report.'}
                                        </span>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    </div>
                </main>
            </div>
        </div>
    );
}
