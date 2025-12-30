"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    Calendar,
    ChevronLeft,
    Download,
    Share2,
    Target,
    AlertTriangle,
    Zap,
    ArrowRight,
    MessageSquare,
    Brain,
    Sparkles,
    Lock,
    Search,
    ShieldCheck,
    Infinity as InfinityIcon,
    Activity,
    Layers
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LanguageSelector } from "@/components/language-selector";
import { ThemeToggle } from "@/components/theme-toggle";
import { calculateDiagnosis, Locale } from "@/lib/diagnostic";
import { getDictionary } from "@/lib/get-dictionary";
import { RadarChart } from "@/components/ui/radar-chart";
import { getDiagnosisById, updateDiagnosis } from "@/lib/storage";
import { SavedDiagnosis } from "@/lib/types";

export default function ReportPage({ params }: { params: Promise<{ id: string, lang: Locale }> }) {
    const { lang, id } = use(params);
    const dict = use(getDictionary(lang));
    const router = useRouter();

    const isDemo = id === "demo";
    const [savedDiagnosis, setSavedDiagnosis] = useState<SavedDiagnosis | null>(null);
    const [isLoading, setIsLoading] = useState(!isDemo);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);

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

    const demoAnswers = {
        1: 5, 2: 5, 3: 5, 4: 5, 5: 5, 6: 5, 7: 5, 8: 5, 9: 5, 10: 5, 11: 5, 12: 5, 13: 5, 14: 5, 15: 5, 16: 5, 17: 5, 18: 5, 19: 5, 20: 5, 21: 5
    };

    const demoContext = lang === "pt"
        ? "Estou em pleno alinhamento. Todos os 7 pilares da minha vida parecem estar em harmonia hoje. Sinto uma clareza profunda sobre quem sou e o que estou fazendo no mundo."
        : "I am in full alignment. All 7 pillars of my life seem to be in harmony today. I feel a deep clarity about who I am and what I am doing in the world.";

    const demoAiAnalysis = {
        executiveSummary: lang === "pt"
            ? "Seus 7 pilares operam em uma sinfonia de alta performance. O alinhamento entre Trabalho e Identidade sugere que você transcendeu a mera execução para um estado de Maestria Existencial. O impacto cascata é visível: sua clareza mental está alimentando sua vitalidade física e vice-versa."
            : "Your 7 pillars operate in a high-performance symphony. The alignment between Work and Identity suggests you've transcended mere execution to a state of Existential Mastery. The ripple effect is clear: your mental clarity is fueling physical vitality and vice-versa.",
        sevenDayPlan: [
            { day: "Dia 1", action: lang === "pt" ? "Proteja seu foco matinal: 2h de Deep Work absoluto." : "Protect morning focus: 2h of absolute Deep Work.", pilar: lang === "pt" ? "Trabalho" : "Work" },
            { day: "Dia 2", action: lang === "pt" ? "Pratique o desapego: Delegue uma decisão crítica." : "Practice detachment: Delegate a critical decision.", pilar: lang === "pt" ? "Liderança" : "Leadership" },
            { day: "Dia 3", action: lang === "pt" ? "Regeneração Radical: 20min de silêncio absoluto." : "Radical Regeneration: 20min of absolute silence.", pilar: lang === "pt" ? "Sentido" : "Meaning" },
            { day: "Dia 4", action: lang === "pt" ? "Reconexão Social: Um jantar sem celular com alguém importante." : "Social Reconnection: A phone-free dinner with someone important.", pilar: lang === "pt" ? "Relações" : "Relationships" },
            { day: "Dia 5", action: lang === "pt" ? "Auditoria Financeira: 30min para revisar fluxos de caixa." : "Financial Audit: 30min to review cash flows.", pilar: lang === "pt" ? "Financeiro" : "Financial" },
            { day: "Dia 6", action: lang === "pt" ? "Lazer Ativo: Uma atividade física que você realmente ame." : "Active Leisure: A physical activity you truly love.", pilar: lang === "pt" ? "Lazer" : "Leisure" },
            { day: "Dia 7", action: lang === "pt" ? "Revisão Semanal: Planeje a próxima oitava com intenção." : "Weekly Review: Plan the next octave with intention.", pilar: lang === "pt" ? "Espiritualidade" : "Spirituality" }
        ],
        stoicRefinement: lang === "pt"
            ? "Como Marco Aurélio escreveu: 'A felicidade da sua vida depende da qualidade dos seus pensamentos'. Você conquistou a cidadela interior; agora seu dever é não apenas habitá-la, mas fortalecê-la contra a inevitável impermanência."
            : "As Marcus Aurelius wrote: 'The happiness of your life depends upon the quality of your thoughts'. You have conquered the inner citadel; now your duty is not just to inhabit it, but to fortify it against inevitable impermanence."
    };

    const diagnosis = isDemo ? calculateDiagnosis(demoAnswers, lang) : (savedDiagnosis ? {
        ...calculateDiagnosis(savedDiagnosis.answers, lang),
        state: savedDiagnosis.state,
        confidence: savedDiagnosis.confidence,
        label: savedDiagnosis.label,
        color: savedDiagnosis.color,
        one_liner: savedDiagnosis.oneLiner,
        pillarScores: savedDiagnosis.dimensions,
        v3Insights: savedDiagnosis.v3Insights || calculateDiagnosis(savedDiagnosis.answers, lang).v3Insights
    } : null);

    if (isDemo && diagnosis?.v3Insights) {
        diagnosis.v3Insights.aiAnalysis = demoAiAnalysis;
    }

    const qualitativeContext = isDemo ? demoContext : savedDiagnosis?.qualitativeContext || "";
    const dimensions = (isDemo ? diagnosis?.pillarScores : savedDiagnosis?.dimensions) || [];
    const isUnlocked = isDemo || savedDiagnosis?.isUnlocked || false;

    useEffect(() => {
        const generateAIInsights = async () => {
            if (!isUnlocked || isDemo || !savedDiagnosis || !diagnosis || diagnosis?.v3Insights?.aiAnalysis || isAiLoading) return;

            setIsAiLoading(true);
            try {
                const response = await fetch('/api/analyze', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        pillarScores: diagnosis.pillarScores,
                        qualitativeContext,
                        lang
                    })
                });

                const analysis = await response.json();
                if (analysis.error) throw new Error(analysis.error);

                const updatedV3 = { ...diagnosis.v3Insights, aiAnalysis: analysis };
                updateDiagnosis(id, { v3Insights: updatedV3 as any });
                setSavedDiagnosis(prev => prev ? { ...prev, v3Insights: updatedV3 as any } : null);
            } catch (err: any) {
                console.error("AI Error:", err);
                setAiError(err.message);
            } finally {
                setIsAiLoading(false);
            }
        };

        generateAIInsights();
    }, [isUnlocked, isDemo, savedDiagnosis, id, lang, qualitativeContext, diagnosis, isAiLoading]);

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString(lang === 'pt' ? 'pt-BR' : lang === 'es' ? 'es-ES' : 'en-US', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    const handlePrint = () => window.print();

    if (isLoading || !diagnosis) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                    <p className="text-muted-foreground font-medium">Sincronizando Pilares...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* PDF GOLD STANDARD COVER (Print Only) */}
            <div className="hidden print:flex flex-col items-center justify-center min-h-screen text-center space-y-12 p-20">
                <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center">
                    <div className="w-8 h-8 bg-background rounded-full" />
                </div>
                <div className="space-y-4">
                    <h1 className="text-6xl font-black tracking-tighter uppercase">Status Core</h1>
                    <p className="text-xl tracking-[0.5em] text-muted-foreground uppercase">Relatório de Inteligência v4</p>
                </div>
                <div className="h-px w-40 bg-primary/20" />
                <div className="space-y-2">
                    <h2 className="text-4xl font-bold">{diagnosis.label}</h2>
                    <p className="text-muted-foreground">{formatDate(isDemo ? Date.now() : savedDiagnosis?.timestamp || Date.now())}</p>
                </div>
            </div>

            <div className="fixed inset-0 z-0 pointer-events-none print:hidden">
                <div className="absolute top-[-10%] right-[-5%] w-[1000px] h-[1000px] rounded-full blur-[220px] opacity-[0.12] dark:opacity-[0.25]" style={{ backgroundColor: diagnosis.color }} />
                <div className="absolute bottom-[-10%] left-[-5%] w-[800px] h-[800px] rounded-full blur-[220px] opacity-[0.06] dark:opacity-[0.12]" style={{ backgroundColor: diagnosis.color }} />
            </div>

            <header className="px-4 lg:px-6 h-14 flex items-center border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50 no-print">
                <div className="container mx-auto flex items-center justify-between">
                    <Link className="flex items-center justify-center gap-2" href={`/${lang}/dashboard`}>
                        <ChevronLeft className="h-4 w-4" />
                        <span className="font-medium text-sm">{dict.common.back}</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <LanguageSelector currentLang={lang} />
                        <Button onClick={handlePrint} variant="outline" size="sm" className="hidden sm:flex gap-2 border-primary/40 text-primary font-bold hover:bg-primary/5">
                            <Download className="h-3.5 w-3.5" /> {lang === 'pt' ? 'Baixar Relatório' : 'Download Report'}
                        </Button>
                    </div>
                </div>
            </header>

            <main className="flex-1 p-4 md:p-6 relative z-10">
                <div className="container mx-auto max-w-6xl space-y-16">
                    {/* 1. HERO SECTION */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center pt-8">
                        <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
                            <div className="space-y-4">
                                <Badge variant="outline" className="px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] border-primary/20 text-primary bg-primary/5">
                                    {dict.report.title} • v4 Platinum
                                </Badge>
                                <div className="space-y-1">
                                    <span className="text-xs uppercase tracking-[0.4em] text-muted-foreground font-bold opacity-40 italic">{dict.report.analysis}</span>
                                    <h1 className="text-6xl md:text-8xl font-black font-heading tracking-tighter text-foreground leading-[0.85] pb-2">
                                        {diagnosis.label}
                                    </h1>
                                </div>
                            </div>

                            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="p-6 rounded-2xl bg-card/70 dark:bg-zinc-900/60 border border-border dark:border-white/5 backdrop-blur-xl max-w-xl mx-auto lg:mx-0 relative overflow-hidden group shadow-2xl">
                                <div className="absolute top-0 left-0 w-1 h-full bg-primary/50 shadow-[0_0_15px_rgba(var(--primary),0.5)] opacity-50 dark:opacity-100" />
                                <div className="flex gap-4 items-start text-left">
                                    <Sparkles className="h-5 w-5 text-primary shrink-0 mt-1" />
                                    <p className="text-sm md:text-base text-foreground/90 dark:text-white/90 leading-relaxed font-medium">
                                        <span className="text-primary font-black italic mr-1">NEURAL INSIGHT:</span>
                                        {diagnosis.one_liner}
                                    </p>
                                </div>
                            </motion.div>
                        </div>

                        <div className="lg:col-span-5 flex justify-center">
                            <div className="relative group">
                                <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full opacity-0 group-hover:opacity-40 transition-opacity duration-1000" />
                                <RadarChart data={dimensions} size={380} />
                            </div>
                        </div>
                    </div>

                    {!isUnlocked && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative p-12 rounded-[3.5rem] bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 backdrop-blur-xl overflow-hidden shadow-2xl text-center space-y-6">
                            <Lock className="h-12 w-12 mx-auto text-primary/40" />
                            <h3 className="text-3xl font-black font-heading tracking-tight">Desbloqueie sua Inteligência Sistêmica</h3>
                            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Receba análise AI personalizada, plano de 7 dias e métricas de antifragilidade.</p>
                            <Link href={`/${lang}/checkout/${id}`} className="inline-block">
                                <Button size="lg" className="gap-2 shadow-xl shadow-primary/20 font-bold h-14 px-8">Desbloquear Agora <ArrowRight className="h-4 w-4" /></Button>
                            </Link>
                        </motion.div>
                    )}

                    {isUnlocked && (
                        <>
                            {/* 2. INTELLIGENCE BLOCK (AI + SYSTEMIC) */}
                            <div className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="h-px flex-1 bg-gradient-to-r from-transparent to-primary/20" />
                                    <Badge className="bg-primary text-primary-foreground font-black px-4 py-1 rounded-full shadow-lg shadow-primary/20">INTELIGÊNCIA SISTÊMICA v4</Badge>
                                    <div className="h-px flex-1 bg-gradient-to-l from-transparent to-primary/20" />
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                    {/* AI Executive Summary - Large Card */}
                                    <div className="lg:col-span-8 flex flex-col gap-8">
                                        <Card className="bg-primary/5 border-primary/20 rounded-[3rem] p-10 space-y-6 shadow-2xl relative overflow-hidden group flex-1">
                                            {isAiLoading ? (
                                                <div className="animate-pulse space-y-4">
                                                    <div className="h-8 w-1/3 bg-primary/10 rounded" />
                                                    <div className="h-32 bg-primary/5 rounded" />
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform"><Brain className="h-24 w-24 text-primary" /></div>
                                                    <div className="space-y-4 relative z-10">
                                                        <h3 className="text-2xl font-black font-heading tracking-tight italic uppercase">Summary Executivo</h3>
                                                        <p className="text-lg md:text-xl text-foreground font-medium leading-relaxed italic whitespace-pre-wrap">
                                                            {diagnosis.v3Insights?.aiAnalysis?.executiveSummary || "Processando padrões neurais..."}
                                                        </p>
                                                    </div>
                                                </>
                                            )}
                                        </Card>

                                        {/* User Qualitative Context Reflection */}
                                        <Card className="bg-card/40 dark:bg-zinc-900/30 border-border dark:border-white/5 backdrop-blur-sm p-8 rounded-[2rem] shadow-xl italic text-muted-foreground flex items-center gap-6">
                                            <MessageSquare className="h-8 w-8 text-primary/40 shrink-0" />
                                            <p className="text-base font-medium leading-relaxed">"{qualitativeContext || "Análise baseada estritamente nas respostas quantitativas."}"</p>
                                        </Card>
                                    </div>

                                    {/* Systemic Metrics - Side Column */}
                                    <div className="lg:col-span-4 space-y-8">
                                        <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 backdrop-blur-xl flex flex-col items-center text-center space-y-4">
                                            <ShieldCheck className="h-8 w-8 text-primary" />
                                            <div className="space-y-1">
                                                <h4 className="text-[10px] uppercase font-black tracking-[0.3em] text-primary">Índice de Antifragilidade</h4>
                                                <div className="text-5xl font-black">{diagnosis.v3Insights?.antifragilityScore}%</div>
                                            </div>
                                            <p className="text-xs text-muted-foreground leading-relaxed">Resiliência sistêmica baseada em Identidade, Saúde e Sentido.</p>
                                        </div>

                                        <div className="p-8 rounded-[2.5rem] bg-card/40 dark:bg-zinc-900/30 border border-border dark:border-white/5 backdrop-blur-md space-y-6">
                                            <div className="flex items-center gap-3"><InfinityIcon className="h-5 w-5 text-primary" /><h4 className="text-sm font-black uppercase tracking-widest italic">Efeito Cascata</h4></div>
                                            <div className="space-y-3">
                                                {diagnosis.v3Insights?.correlations.slice(0, 3).map((correlation, i) => (
                                                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border/10 text-xs font-medium"><Activity className="h-4 w-4 text-primary shrink-0" />{correlation}</div>
                                                ))}
                                            </div>
                                            <div className="pt-4 border-t border-border/10 flex justify-between items-center">
                                                <div className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">Arquétipo</div>
                                                <div className="text-xs font-black text-primary uppercase">{diagnosis.v3Insights?.archetype}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 3. ACTION BLOCK (7-DAY PLAN & TACTICAL) */}
                            <div className="space-y-8 pt-8">
                                <h2 className="text-3xl font-black font-heading tracking-tight italic uppercase text-center lg:text-left">Plano Estratégico de 7 Dias</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
                                    {(diagnosis.v3Insights?.aiAnalysis?.sevenDayPlan || demoAiAnalysis.sevenDayPlan).map((plan, i) => (
                                        <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="flex flex-col p-5 rounded-2xl bg-muted/40 dark:bg-zinc-900/60 border border-border/40 hover:border-primary/40 transition-all group min-h-[160px]">
                                            <div className="text-[10px] font-black text-primary mb-3 flex justify-between"><span>{plan.day}</span><Badge variant="outline" className="text-[8px] px-1 py-0">{plan.pilar}</Badge></div>
                                            <div className="text-xs font-bold leading-tight group-hover:text-primary transition-colors flex-1">{plan.action}</div>
                                        </motion.div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    {[
                                        { icon: Zap, label: "Immediate Win", value: diagnosis.report?.immediate_win, color: "text-blue-500" },
                                        { icon: AlertTriangle, label: "The NO to Say", value: diagnosis.report?.the_no_to_say, color: "text-rose-500" },
                                        { icon: Target, label: "Mindset Shift", value: diagnosis.report?.mindset_shift, color: "text-amber-500" },
                                    ].map((item, i) => (
                                        <div key={i} className="p-8 rounded-[2rem] bg-card/40 dark:bg-zinc-900/40 border border-border/40 flex flex-col gap-4">
                                            <item.icon className={`h-6 w-6 ${item.color}`} />
                                            <div className="space-y-1"><h4 className="text-[10px] uppercase font-black tracking-widest opacity-40">{item.label}</h4><p className="text-lg font-bold leading-tight">"{item.value}"</p></div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 4. DATA BLOCK (PILLAR BARS) */}
                            <div className="space-y-8 pt-8">
                                <h3 className="text-xl font-black font-heading tracking-tight italic uppercase opacity-60">Resultados por Pilar</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {dimensions.map((dim, i) => (
                                        <Card key={i} className="bg-card/20 border-border/40 backdrop-blur-sm p-6 space-y-3">
                                            <div className="flex justify-between items-center"><span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{dim.label}</span><span className="text-sm font-black" style={{ color: dim.color }}>{dim.value}%</span></div>
                                            <div className="h-1.5 w-full bg-muted/30 rounded-full overflow-hidden">
                                                <motion.div initial={{ width: 0 }} whileInView={{ width: `${dim.value}%` }} transition={{ duration: 1 }} className="h-full" style={{ backgroundColor: dim.color }} />
                                            </div>
                                            {diagnosis.v3Insights?.bottleneckLabel === dim.label && <Badge className="text-[7px] bg-primary/20 text-primary border-none">ALPHA PRIORITY</Badge>}
                                        </Card>
                                    ))}
                                </div>
                            </div>

                            {/* 5. REFLECTION BLOCK (STOIC) */}
                            <motion.div initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} className="relative p-12 rounded-[3.5rem] bg-card/60 dark:bg-zinc-900/20 border border-border dark:border-white/5 backdrop-blur-3xl overflow-hidden shadow-2xl text-center space-y-10">
                                <Badge variant="outline" className="px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.4em] border-primary/40 text-primary bg-primary/10 rounded-full">SABEDORIA ESTOICA</Badge>
                                <div className="max-w-4xl mx-auto"><p className="text-2xl md:text-4xl font-serif font-light leading-snug italic">"{diagnosis.v3Insights?.aiAnalysis?.stoicRefinement || diagnosis.report?.stoic_lesson}"</p></div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mx-auto">
                                    {(diagnosis.report?.stoic_principles || []).map((principle, i) => (
                                        <div key={i} className="p-6 rounded-2xl bg-muted/40 border border-border/10 text-left space-y-3"><div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-black text-sm">{i + 1}</div><p className="text-sm font-medium leading-relaxed">{principle}</p></div>
                                    ))}
                                </div>
                            </motion.div>

                            <footer className="pt-20 pb-12 flex flex-col items-center gap-6 text-center opacity-30 no-print">
                                <div className="h-px w-32 bg-primary/20" />
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-[0.5em]">Status Core v4 Platinum Edition</p>
                                    <p className="text-[8px] uppercase font-bold tracking-[0.3em]">7 Pillars • AI Neural Intelligence • Stoic Resilience</p>
                                </div>
                            </footer>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
