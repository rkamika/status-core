"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    Calendar,
    ChevronLeft,
    Download,
    Info,
    Share2,
    Target,
    AlertTriangle,
    Zap,
    ArrowRight,
    Search,
    MessageSquare,
    Brain,
    Sparkles,
    Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LanguageSelector } from "@/components/language-selector";
import { ThemeToggle } from "@/components/theme-toggle";
import { calculateDiagnosis, Locale } from "@/lib/diagnostic";
import { getDictionary } from "@/lib/get-dictionary";
import { RadarChart } from "@/components/ui/radar-chart";
import { getDiagnosisById } from "@/lib/storage";
import { SavedDiagnosis } from "@/lib/types";

export default function ReportPage({ params }: { params: Promise<{ id: string, lang: Locale }> }) {
    const { lang, id } = use(params);
    const dict = use(getDictionary(lang));
    const router = useRouter();

    const isDemo = id === "demo";
    const [savedDiagnosis, setSavedDiagnosis] = useState<SavedDiagnosis | null>(null);
    const [isLoading, setIsLoading] = useState(!isDemo);

    // Load diagnosis from storage if not demo
    useEffect(() => {
        if (!isDemo) {
            const diagnosis = getDiagnosisById(id);
            if (!diagnosis) {
                router.push(`/${lang}/assessment`);
                return;
            }
            setSavedDiagnosis(diagnosis);
            setIsLoading(false);
        }
    }, [id, isDemo, lang, router]);

    // Demo data
    const demoContext = lang === "pt"
        ? "Estou em flow. As coisas estão acontecendo de forma quase orgânica - não forço, apenas executo. É como se eu tivesse encontrado o ritmo certo entre esforço e resultado."
        : "I'm in flow. Things are happening almost organically - I don't force, I just execute. It's like I've found the right rhythm between effort and outcome.";

    const demoAnswers = {
        1: 2, 2: 4, 3: 1, 4: 2, 5: 1, 6: 4, 7: 2, 8: 1,
        9: 2, 10: 2, 11: 4, 12: 1, 13: 2, 14: 4, 15: 1, 16: 3
    };

    // Use either demo or saved diagnosis
    const diagnosis = isDemo ? calculateDiagnosis(demoAnswers, lang) : (savedDiagnosis ? {
        ...calculateDiagnosis(savedDiagnosis.answers, lang),
        state: savedDiagnosis.state,
        confidence: savedDiagnosis.confidence,
        label: savedDiagnosis.label,
        color: savedDiagnosis.color,
        one_liner: savedDiagnosis.oneLiner
    } : null);

    const qualitativeContext = isDemo ? demoContext : savedDiagnosis?.qualitativeContext || "";
    const dimensions = isDemo
        ? [
            { label: "Foco", value: 80, color: "#3b82f6" },
            { label: "Clareza", value: 75, color: "#a855f7" },
            { label: "Energia", value: 85, color: "#f59e0b" },
            { label: "Emoção", value: 70, color: "#f43f5e" }
        ]
        : savedDiagnosis?.dimensions || [];

    const isUnlocked = isDemo || savedDiagnosis?.isUnlocked || false;

    // Loading state
    if (isLoading || !diagnosis) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                    <p className="text-muted-foreground">Carregando relatório...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Premium Deep Background - Ultra Subtle Glow */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div
                    className="absolute top-[-10%] right-[-5%] w-[1000px] h-[1000px] rounded-full blur-[220px] opacity-[0.12] dark:opacity-[0.25]"
                    style={{ backgroundColor: diagnosis.color }}
                />
                <div
                    className="absolute bottom-[-10%] left-[-5%] w-[800px] h-[800px] rounded-full blur-[220px] opacity-[0.06] dark:opacity-[0.12]"
                    style={{ backgroundColor: diagnosis.color }}
                />
            </div>

            <header className="px-4 lg:px-6 h-14 flex items-center border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
                <div className="container mx-auto flex items-center justify-between">
                    <Link className="flex items-center justify-center gap-2" href={`/${lang}/dashboard`}>
                        <ChevronLeft className="h-4 w-4" />
                        <span className="font-medium">{dict.common.back}</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <LanguageSelector currentLang={lang} />
                        <Button variant="ghost" size="icon" className="h-9 w-9">
                            <Share2 className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="hidden sm:flex gap-2">
                            <Download className="h-3.5 w-3.5" /> PDF
                        </Button>
                    </div>
                </div>
            </header>

            <main className="flex-1 p-4 md:p-6 relative z-10">
                <div className="container mx-auto max-w-5xl space-y-8">

                    {/* Hero Grid: Title + Radar Analysis */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center pt-8">
                        <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
                            <div className="space-y-4">
                                <Badge variant="outline" className="px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] border-primary/20 text-primary bg-primary/5">
                                    {dict.report.title} • Neural Edition
                                </Badge>
                                <div className="space-y-1">
                                    <span className="text-xs uppercase tracking-[0.4em] text-muted-foreground font-bold opacity-40 italic">{dict.report.analysis}</span>
                                    <h1 className="text-6xl md:text-8xl font-black font-heading tracking-tighter text-foreground leading-[0.85] pb-2">
                                        {diagnosis.label}
                                    </h1>
                                </div>
                            </div>

                            {/* Neural Insight Bridge - Adaptive Glassmorphic */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="p-6 rounded-2xl bg-card/70 dark:bg-zinc-900/60 border border-border dark:border-white/5 backdrop-blur-xl max-w-xl mx-auto lg:mx-0 relative overflow-hidden group shadow-2xl"
                            >
                                <div className="absolute top-0 left-0 w-1 h-full bg-primary/50 shadow-[0_0_15px_rgba(var(--primary),0.5)] opacity-50 dark:opacity-100" />
                                <div className="flex gap-4 items-start">
                                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                        <Sparkles className="h-5 w-5" />
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-sm md:text-base text-foreground/90 dark:text-white/90 leading-relaxed font-medium">
                                            <span className="text-primary font-black italic mr-1">NEURAL INSIGHT:</span>
                                            {diagnosis.one_liner}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>

                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-5 text-[10px] font-black tracking-[0.2em] text-muted-foreground/40 uppercase">
                                <span className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5" /> 28 DEZ 2025</span>
                                <span className="w-1 h-1 rounded-full bg-white/10" />
                                <span className="flex items-center gap-2"><Search className="h-3.5 w-3.5" /> ID: #8829-X-PREMIUM</span>
                            </div>
                        </div>
                        <div className="lg:col-span-5 flex justify-center">
                            <div className="relative group">
                                <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full opacity-0 group-hover:opacity-40 transition-opacity duration-1000" />
                                <RadarChart data={dimensions} size={340} />
                            </div>
                        </div>
                    </div>

                    {/* Locked Content Warning */}
                    {!isUnlocked && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="relative p-12 rounded-[3rem] bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 backdrop-blur-xl overflow-hidden shadow-2xl"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <Lock className="h-32 w-32" />
                            </div>
                            <div className="relative z-10 text-center space-y-6">
                                <div className="space-y-2">
                                    <h3 className="text-3xl md:text-4xl font-black font-heading tracking-tight">Análise Completa Bloqueada</h3>
                                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                                        Desbloqueie o relatório completo para acessar insights profundos, planos táticos e sabedoria estoica personalizada.
                                    </p>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                                    <Link href={`/${lang}/checkout/${id}`}>
                                        <Button size="lg" className="gap-2 shadow-xl shadow-primary/20">
                                            <Lock className="h-4 w-4" />
                                            Desbloquear Relatório
                                            <ArrowRight className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                    <Link href={`/${lang}/dashboard`}>
                                        <Button size="lg" variant="outline" className="gap-2">
                                            Voltar ao Dashboard
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Deep Analysis Layer - Only show if unlocked */}
                    {isUnlocked && (
                        <>
                            {/* Deep Analysis Layer */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    className="md:col-span-2 p-10 rounded-[2.5rem] bg-card/40 dark:bg-zinc-900/40 border border-border dark:border-white/5 backdrop-blur-2xl relative overflow-hidden flex flex-col justify-center min-h-[320px] shadow-2xl"
                                >
                                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 rounded-full blur-[80px] pointer-events-none opacity-30 dark:opacity-100" />

                                    <div className="relative z-10 space-y-8">
                                        <div className="flex items-center gap-3">
                                            <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 border border-white/10">
                                                <Brain className="h-7 w-7 text-primary-foreground" />
                                            </div>
                                            <div className="space-y-0.5">
                                                <h3 className="text-2xl font-black font-heading tracking-tight italic uppercase leading-none">Deep Analysis</h3>
                                                <p className="text-[10px] font-black tracking-[0.3em] text-primary uppercase">Neural Engine V1.0</p>
                                            </div>
                                        </div>

                                        <blockquote className="text-2xl md:text-3xl font-medium leading-[1.15] text-foreground/95 dark:text-white/95 italic border-l-4 border-primary/40 pl-8 py-1">
                                            "Você descreveu estar 'em flow'. Isso reflete perfeitamente sua <strong className="text-primary not-italic">Energia (85%)</strong> alinhada com alta <strong className="text-primary not-italic">Clareza (75%)</strong>. Você não está correndo - está deslizando."
                                        </blockquote>

                                        <div className="grid grid-cols-2 gap-8 pt-4">
                                            <div className="space-y-2">
                                                <h4 className="text-[10px] uppercase font-black tracking-[0.2em] text-primary">Estado Atual</h4>
                                                <p className="text-sm font-bold text-muted-foreground leading-snug">Sincronia perfeita entre intenção, ação e resultado. Energia proporcional ao output.</p>
                                            </div>
                                            <div className="space-y-2">
                                                <h4 className="text-[10px] uppercase font-black tracking-[0.2em] text-primary">Foco de Manutenção</h4>
                                                <p className="text-sm font-bold text-muted-foreground leading-snug">Proteger rituais que sustentam esse ritmo e compartilhar aprendizados com outros.</p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Qualitative Recall Card */}
                                <div className="flex flex-col gap-6">
                                    <Card className="bg-card/40 dark:bg-zinc-900/30 border-border dark:border-white/5 backdrop-blur-sm h-full flex flex-col rounded-[2rem] shadow-xl">
                                        <CardHeader className="pb-4 pt-8 px-8">
                                            <div className="flex items-center gap-2 text-primary/60">
                                                <MessageSquare className="h-4 w-4" />
                                                <CardTitle className="text-[10px] uppercase font-black tracking-[0.3em]">{dict.report.qualitative_analysis}</CardTitle>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="flex-1 flex flex-col justify-between italic text-muted-foreground leading-relaxed px-8 pb-8">
                                            <p className="text-lg font-medium opacity-80 leading-snug">
                                                "{qualitativeContext || "Nenhum contexto adicional fornecido para análise profunda."}"
                                            </p>
                                            <div className="pt-10">
                                                <div className="h-[1px] w-20 bg-primary/30 mb-4" />
                                                <p className="text-[9px] uppercase font-black tracking-[0.2em] opacity-30">Status: Analisado pelo Motor de Contexto</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>

                            {/* Tactical Action Plan - Elite UI overhaul */}
                            <Card className="bg-card/40 dark:bg-zinc-900/30 border-border dark:border-white/5 backdrop-blur-sm overflow-hidden group hover:border-primary/20 transition-all duration-700 shadow-3xl rounded-[2.5rem]">
                                <CardHeader className="border-b border-border bg-muted/20 dark:bg-white/[0.01] flex flex-row items-center justify-between p-8">
                                    <div className="space-y-1">
                                        <CardTitle className="text-3xl font-black font-heading tracking-tight uppercase italic">{dict.report.tactical_exit_plan}</CardTitle>
                                        <p className="text-[10px] text-primary uppercase tracking-[0.4em] font-black">Restaurando Alinhamento Operacional</p>
                                    </div>
                                    <div className="bg-primary/10 p-4 rounded-2xl border border-primary/20">
                                        <Zap className="h-8 w-8 text-primary" />
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
                                        {[
                                            { icon: Zap, label: dict.report.immediate_win, value: diagnosis.report?.immediate_win, color: "text-blue-500 dark:text-blue-400" },
                                            { icon: AlertTriangle, label: dict.report.no_to_say, value: diagnosis.report?.the_no_to_say, color: "text-rose-500 dark:text-rose-400" },
                                            { icon: Target, label: dict.report.mindset_shift, value: diagnosis.report?.mindset_shift, color: "text-amber-500 dark:text-amber-400" },
                                        ].map((item, i) => (
                                            <div key={i} className="p-10 group/item hover:bg-muted/30 dark:hover:bg-white/[0.02] transition-colors flex flex-col gap-6">
                                                <div className={`p-4 w-fit rounded-2xl bg-muted dark:bg-white/5 border border-border dark:border-white/5 ${item.color} group-hover/item:scale-110 transition-transform duration-500`}>
                                                    <item.icon className="h-7 w-7" />
                                                </div>
                                                <div className="space-y-3">
                                                    <h4 className="text-[10px] uppercase font-black tracking-[0.3em] opacity-40 italic">{item.label}</h4>
                                                    <p className="text-xl font-bold text-foreground/90 dark:text-white/90 leading-tight tracking-tight">
                                                        "{item.value}"
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Metadata Specs & Characteristics */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-10 border-t border-white/5 border-dashed">
                                {[
                                    { label: dict.report.characteristics, value: diagnosis.report?.characteristics.join(", "), color: "text-blue-400" },
                                    { label: dict.report.risk, value: diagnosis.label, color: "text-rose-400" },
                                    { label: dict.report.focus, value: diagnosis.report?.recommended_focus.join(", "), color: "text-amber-400" },
                                    { label: dict.report.next_step, value: diagnosis.report?.next_step, color: "text-emerald-400" },
                                ].map((item, i) => (
                                    <div key={i} className="space-y-3">
                                        <h5 className="text-[10px] uppercase font-black tracking-[0.3em] opacity-30">{item.label}</h5>
                                        <p className="text-xs font-black text-foreground/70 leading-relaxed tracking-wider uppercase">
                                            {item.value}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Stoic Wisdom Section */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                className="relative p-12 rounded-[3rem] bg-card/60 dark:bg-zinc-900/20 border border-border dark:border-white/5 backdrop-blur-3xl overflow-hidden shadow-2xl"
                            >
                                {/* Decorative Pillar-like background elements */}
                                <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-black/[0.02] dark:from-white/[0.02] to-transparent" />
                                <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-black/[0.02] dark:from-white/[0.02] to-transparent" />

                                <div className="relative z-10 flex flex-col items-center text-center space-y-8">
                                    <div className="space-y-2">
                                        <Badge variant="outline" className="px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.4em] border-primary/40 text-primary bg-primary/10 rounded-full shadow-lg shadow-primary/10">
                                            {dict.report.stoic_wisdom}
                                        </Badge>
                                        <h3 className="text-4xl md:text-5xl font-black font-heading tracking-tight italic uppercase">{dict.report.stoic_lesson}</h3>
                                    </div>

                                    <div className="max-w-3xl relative p-8">
                                        <div className="absolute top-0 left-0 text-6xl text-primary/10 font-serif leading-none">“</div>
                                        <p className="text-2xl md:text-4xl font-serif font-light leading-snug text-foreground/90 dark:text-white/90 italic pt-4">
                                            {diagnosis.report?.stoic_lesson}
                                        </p>
                                        <div className="absolute bottom-0 right-0 text-6xl text-primary/10 font-serif leading-none">”</div>
                                    </div>

                                    {/* Divider */}
                                    <div className="flex items-center gap-4 opacity-30 w-full max-w-md">
                                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border dark:via-white/20 to-transparent" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Princípios Práticos</span>
                                        <div className="h-px flex-1 bg-gradient-to-l from-transparent via-border dark:via-white/20 to-transparent" />
                                    </div>

                                    {/* Complementary Principles */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl pt-4">
                                        {diagnosis.report?.stoic_principles.map((principle, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, y: 20 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ delay: i * 0.1 }}
                                                className="p-6 rounded-2xl bg-muted/40 dark:bg-white/[0.02] border border-border dark:border-white/5 hover:border-primary/20 transition-all duration-500 group shadow-sm hover:shadow-md"
                                            >
                                                <div className="flex items-start gap-4 text-left">
                                                    <div className="mt-1 h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                                                        <span className="text-xs font-black text-primary">{i + 1}</span>
                                                    </div>
                                                    <p className="text-sm md:text-base font-medium text-foreground/80 dark:text-white/80 leading-relaxed">
                                                        {principle}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>

                                    {/* Footer */}
                                    <div className="flex items-center gap-4 opacity-40 pt-4">
                                        <div className="h-px w-12 bg-border dark:bg-white/20" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Status Core X Stoicism</span>
                                        <div className="h-px w-12 bg-border dark:bg-white/20" />
                                    </div>
                                </div>
                            </motion.div>

                            {/* Footer Signature */}
                            <div className="pt-24 pb-16 flex flex-col items-center gap-8 text-center opacity-30 group hover:opacity-100 transition-opacity duration-1000">
                                <div className="h-px w-32 bg-gradient-to-r from-transparent via-primary to-transparent" />
                                <div className="space-y-2">
                                    <p className="text-[10px] uppercase font-black tracking-[0.5em] text-foreground dark:text-white">
                                        Status Core Neural Engine
                                    </p>
                                    <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-muted-foreground">
                                        All intellectual property reserved • Powered by High-Resolution Data
                                    </p>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
