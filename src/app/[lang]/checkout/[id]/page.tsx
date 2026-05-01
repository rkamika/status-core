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
import { supabase } from "@/lib/supabase";
import { trackFBEvent } from "@/components/meta-pixel";
import { trackPurchase, trackBeginCheckout } from "@/lib/gtm";
import { Logo } from "@/components/logo";
import { SocialProof } from "@/components/social-proof";
import { Locale, SavedDiagnosis } from "@/lib/types";

export default function CheckoutPage({ params }: { params: Promise<{ lang: Locale; id: string }> }) {
    const { lang, id } = use(params);
    const dict = use(getDictionary(lang));
    const router = useRouter();


    const [diagnosis, setDiagnosis] = useState<any>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [sessionEmail, setSessionEmail] = useState<string | undefined>();

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            if (data.user?.email) setSessionEmail(data.user.email);
        });
    }, []);

    // Default Pricing Table (Updated per Priority [7])
    const PRICING = {
        pt: { base: 27, anchor: 97, symbol: 'R$', currency: 'BRL' },
        en: { base: 27, anchor: 97, symbol: '$', currency: 'USD' },
        es: { base: 27, anchor: 97, symbol: '$', currency: 'USD' },
    };

    const currentPricing = PRICING[lang] || PRICING.en;

    // Pricing & Promo State
    const [basePrice, setBasePrice] = useState(currentPricing.base);
    const [anchorPrice, setAnchorPrice] = useState<number | null>(currentPricing.anchor);
    const [promoCode, setPromoCode] = useState("");
    const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
    const [promoError, setPromoError] = useState(false);
    const [isApplyingPromo, setIsApplyingPromo] = useState(false);
    const [showPromoField, setShowPromoField] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            const [savedDiagnosis, settingsPrice, settingsAnchor] = await Promise.all([
                getDiagnosisById(id),
                getSystemSetting(`price_${lang}`),
                getSystemSetting(`anchor_${lang}`)
            ]);

            // Fallback for PT legacy keys
            let finalSettingsPrice = settingsPrice;
            let finalSettingsAnchor = settingsAnchor;
            
            if (lang === 'pt') {
                if (!finalSettingsPrice) finalSettingsPrice = await getSystemSetting('report_price');
                if (!finalSettingsAnchor) finalSettingsAnchor = await getSystemSetting('original_price');
            }

            if (!savedDiagnosis) {
                router.push(`/${lang}/assessment`);
            } else if (savedDiagnosis.isUnlocked) {
                router.push(`/${lang}/report/${id}`);
            } else {
                setDiagnosis(savedDiagnosis);

                // Track Initiate Checkout
                trackFBEvent('InitiateCheckout', {
                    content_name: 'Platinum Report',
                    content_category: 'Diagnostic',
                    value: finalSettingsPrice ? parseFloat(finalSettingsPrice) : currentPricing.base,
                    currency: currentPricing.currency
                }, `ic_${id}`, id, { email: sessionEmail });
            }

            if (finalSettingsPrice) {
                setBasePrice(parseFloat(finalSettingsPrice));
            }
            if (finalSettingsAnchor) {
                setAnchorPrice(parseFloat(finalSettingsAnchor));
            }

            // Track Begin Checkout (GTM)
            trackBeginCheckout({
                value: finalSettingsPrice ? parseFloat(finalSettingsPrice) : currentPricing.base,
                currency: currentPricing.currency,
                item_name: 'Platinum Report'
            });
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

        // Track Checkout Reached (Pixel Priority [6])
        trackFBEvent('CheckoutReached', {
            content_name: 'Platinum Report',
            content_category: 'Diagnostic',
            value: finalPrice,
            currency: currentPricing.currency
        }, `cr_${id}`, id, { email: sessionEmail });

        // Also track standard Pixel AddPaymentInfo
        trackFBEvent('AddPaymentInfo', {
            content_name: 'Platinum Report',
            content_category: 'Diagnostic',
            value: finalPrice,
            currency: currentPricing.currency
        }, `pi_${id}`, id, { email: sessionEmail });

        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ diagnosisId: id, lang })
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error);

            if (data.checkoutUrl) {
                // For Stripe or other redirect-based providers
                window.location.href = data.checkoutUrl;
                return;
            }

            // Fallback just in case
            if (isFree) {
                await unlockDiagnosis(id);
                setIsComplete(true);
                setTimeout(() => {
                    router.push(`/${lang}/report/${id}`);
                }, 2000);
            }
        } catch (err: any) {
            console.error('Detailed Payment Initiation Error:', {
                message: err.message,
                stack: err.stack,
                diagnosisId: id,
                lang
            });
            alert(lang === 'pt' ? 'Falha ao iniciar pagamento. Verifique o console para detalhes.' : 'Payment initiation failed. Check console for details.');
        } finally {
            setIsProcessing(false);
        }
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
                            {(dict as any).checkout?.access_granted || 'Acesso Liberado!'}
                        </h2>
                        <p className="text-muted-foreground">
                            {(dict as any).checkout?.redirecting || 'Redirecionando...'}
                        </p>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            <SocialProof lang={lang} type="purchase" />
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
                            <Shield className="h-3 w-3 mr-1" /> {(dict as any).checkout?.secure_checkout || 'Checkout Seguro'}
                        </Badge>
                    </div>
                </header>

                <main className="flex-1 flex items-center justify-center p-4 py-8 md:py-12 pb-24 md:pb-12">
                    <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8">
                        {/* Left: Order Summary */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-6"
                        >
                            <div className="space-y-2">
                                <h1 className="text-3xl md:text-4xl font-black font-heading tracking-tight italic uppercase leading-none">
                                    {lang === 'pt' ? 'Desbloquear Relatório de ' : lang === 'es' ? 'Desbloquear Informe de ' : 'Unlock Your '}
                                    <span style={{ color: diagnosis.color }}>{diagnosis.label}</span>
                                </h1>
                                <p className="text-muted-foreground font-medium italic">
                                    {(dict as any).checkout?.subtitle || 'Receba agora seu diagnóstico v4.'}
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

                            {/* PRICE SUMMARY - HIGH IMPACT REDESIGN */}
                            <Card className="border-primary/20 bg-muted/30 dark:bg-zinc-900/40 backdrop-blur-md overflow-hidden relative group">
                                <div className="p-6 space-y-5 relative z-10">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-[10px] font-black uppercase italic tracking-tighter mb-2">
                                                <Sparkles className="h-3 w-3 mr-1" /> {(dict as any).checkout?.exclusive_offer || 'Oferta Exclusiva'}
                                            </Badge>
                                            <h3 className="text-sm font-black uppercase tracking-widest italic opacity-60">{(dict as any).checkout?.order_summary || 'Resumo do Pedido'}</h3>
                                        </div>
                                        <div className="text-right">
                                            {anchorPrice && anchorPrice > finalPrice && (
                                                <div className="flex flex-col items-end">
                                                    <span className="text-xs font-bold text-muted-foreground/50 line-through">
                                                        {currentPricing.symbol} {anchorPrice.toFixed(2)}
                                                    </span>
                                                    <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[9px] font-bold mt-1">
                                                        -{Math.round(((anchorPrice - finalPrice) / anchorPrice) * 100)}% OFF
                                                    </Badge>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center text-xs font-bold opacity-60 italic">
                                            <span>{(dict as any).checkout?.subtotal || 'Subtotal'}</span>
                                            <span>{currentPricing.symbol} {basePrice.toFixed(2)}</span>
                                        </div>

                                        {appliedPromo && (
                                            <motion.div
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className="flex justify-between items-center text-emerald-500 text-xs font-bold italic"
                                            >
                                                <span className="flex items-center gap-1">
                                                    <Ticket className="h-3 w-3" /> {(dict as any).checkout?.coupon || 'Cupom'}: {appliedPromo.code}
                                                </span>
                                                <span>- {currentPricing.symbol} {discountAmount.toFixed(2)}</span>
                                            </motion.div>
                                        )}

                                        {anchorPrice && anchorPrice > finalPrice && (
                                            <div className="p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-between text-emerald-500">
                                                <span className="text-[10px] font-black uppercase tracking-tighter italic mr-2">{(dict as any).checkout?.total_savings || 'Sua Economia Total'}:</span>
                                                <span className="text-sm font-black italic">{currentPricing.symbol} {(anchorPrice - finalPrice).toFixed(2)}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-4 border-t border-border/50 flex justify-between items-end">
                                        <div className="space-y-1">
                                            <span className="text-base font-black uppercase tracking-widest italic">{(dict as any).checkout?.total || 'Total'}</span>
                                            <div className="text-[10px] font-black text-primary italic max-w-[150px] leading-tight uppercase tracking-tighter opacity-80">
                                                {(dict as any).checkout?.taxes_included}
                                            </div>
                                        </div>
                                        <div className="relative group">
                                            {/* Glow effect */}
                                            <div className={`absolute inset-0 blur-2xl opacity-20 ${isFree ? 'bg-primary' : 'bg-primary'}`} />
                                            <span className={`text-4xl md:text-5xl font-black italic relative z-10 tracking-tighter ${isFree ? 'text-primary' : 'text-foreground'}`}>
                                                {isFree ? 'FREE' : (
                                                    <span className="flex items-baseline">
                                                        <span className="text-xl mr-1">{currentPricing.symbol}</span>
                                                        {finalPrice.toFixed(2)}
                                                    </span>
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Background decoration */}
                                <div className="absolute -bottom-4 -right-4 opacity-[0.03] rotate-12 group-hover:rotate-0 transition-transform duration-700">
                                    <DollarSign className="h-32 w-32" />
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
                                    {!showPromoField ? (
                                        <button 
                                            onClick={() => setShowPromoField(true)}
                                            className="text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 uppercase tracking-widest italic"
                                        >
                                            <Ticket className="h-3 w-3" />
                                            {(dict as any).checkout?.have_promo || 'Have a promo code? Click here'}
                                        </button>
                                    ) : (
                                        <motion.div 
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="space-y-4"
                                        >
                                            <h3 className="text-xs font-black uppercase tracking-widest italic flex items-center gap-2">
                                                <Ticket className="h-4 w-4 text-primary" />
                                                {(dict as any).checkout?.have_code || 'Possui um código?'}
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
                                                    {isApplyingPromo ? <RefreshCcw className="h-4 w-4 animate-spin" /> : ((dict as any).checkout?.apply || 'Apply')}
                                                </Button>
                                            </div>
                                            {promoError && <p className="text-[10px] text-rose-500 font-black uppercase italic">{(dict as any).checkout?.invalid_code || 'Invalid code'}</p>}
                                            {appliedPromo && <p className="text-[10px] text-emerald-500 font-black uppercase italic">{(dict as any).checkout?.code_applied || 'Applied'}: {appliedPromo.discount_percent}% OFF</p>}
                                        </motion.div>
                                    )}
                                </div>
                            </Card>

                            {/* MAIN CTA / BRICKS */}
                            <Card className="border-border dark:border-white/5 bg-card/70 dark:bg-zinc-900/30 backdrop-blur-xl shadow-xl p-6">
                                <div className="space-y-6">
                                        <>
                                            <div className="p-4 rounded-xl bg-muted/30 dark:bg-white/[0.02] border border-border dark:border-white/5 space-y-4">
                                                <div className="flex flex-col gap-3">
                                                    <div className="flex items-center gap-2 text-xs font-bold text-foreground/70">
                                                        <Shield className="h-4 w-4 text-primary" />
                                                        {(dict as any).checkout?.secure_processing || 'SSL Encrypted Processing'}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-500/80 bg-emerald-500/5 p-2 rounded-lg border border-emerald-500/10">
                                                        <Shield className="h-4 w-4" />
                                                        {(dict as any).checkout?.guarantee || '7-day money-back guarantee'}
                                                    </div>
                                                </div>
                                            </div>

                                            <Button
                                                size="lg"
                                                className="w-full h-14 sm:h-16 text-sm sm:text-lg font-black italic uppercase shadow-xl shadow-primary/20 group px-2 sm:px-4"
                                                onClick={handleUnlock}
                                                disabled={isProcessing}
                                            >
                                                {isProcessing ? (
                                                    <RefreshCcw className="h-5 w-5 animate-spin" />
                                                ) : (
                                                    <>
                                                        {isFree
                                                            ? ((dict as any).checkout?.unlock_free || 'Unlock for Free now')
                                                            : ((dict as any).checkout?.complete_payment || 'Complete Payment')}
                                                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                                    </>
                                                )}
                                            </Button>

                                            <div className="flex flex-col items-center gap-4">
                                                <div className="flex items-center gap-4 opacity-30 grayscale hover:grayscale-0 transition-all duration-500">
                                                    {/* Using stylized text for card brands to ensure reliability without external assets */}
                                                    <div className="flex items-center gap-1 text-[10px] font-black italic tracking-tighter">
                                                        <CreditCard className="h-4 w-4" /> VISA
                                                    </div>
                                                    <div className="w-px h-3 bg-muted-foreground/30" />
                                                    <div className="flex items-center gap-1 text-[10px] font-black italic tracking-tighter">
                                                        <div className="flex -space-x-1">
                                                            <div className="w-3 h-3 rounded-full bg-red-500/50" />
                                                            <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                                                        </div>
                                                        MASTERCARD
                                                    </div>
                                                    <div className="w-px h-3 bg-muted-foreground/30" />
                                                    <div className="text-[8px] font-bold uppercase tracking-widest">Stripe Secure</div>
                                                </div>
                                                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-40">
                                                    {(dict as any).checkout?.lifetime_access}
                                                </span>
                                            </div>
                                        </>
                                </div>
                            </Card>
                        </motion.div>
                    </div>
                </main>
            </div>
        </div>
    );
}
