"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    BarChart3,
    History,
    Lock as Padlock,
    ArrowRight,
    Clock,
    CheckCircle2,
    AlertTriangle,
    FileText,
    User,
    LogOut,
    Sparkles,
    Inbox
} from "lucide-react";
import { getAllDiagnoses, getCurrentDiagnosisId } from "@/lib/storage";
import { SavedDiagnosis } from "@/lib/types";
import { getDictionary } from "@/lib/get-dictionary";
import { calculateDiagnosis, Locale } from "@/lib/diagnostic";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSelector } from "@/components/language-selector";
import { Logo } from "@/components/logo";

export default function DashboardPage({ params }: { params: Promise<{ lang: Locale }> }) {
    const { lang } = use(params);
    const dict = use(getDictionary(lang));

    const [diagnoses, setDiagnoses] = useState<SavedDiagnosis[]>([]);
    const [currentId, setCurrentId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            const [allDiagnoses, currentDiagnosisId] = await Promise.all([
                getAllDiagnoses(),
                getCurrentDiagnosisId()
            ]);

            // Re-localize all diagnoses based on the current URL 'lang'
            const localizedDiagnoses = allDiagnoses.map(d => {
                const localized = calculateDiagnosis(d.answers, lang);
                return {
                    ...d,
                    label: localized.label,
                    oneLiner: localized.one_liner,
                    dimensions: localized.pillarScores,
                    v3Insights: d.v3Insights ? {
                        ...d.v3Insights,
                        archetype: localized.v3Insights?.archetype || d.v3Insights.archetype,
                        antifragilityScore: localized.v3Insights?.antifragilityScore || d.v3Insights.antifragilityScore,
                        correlations: localized.v3Insights?.correlations || d.v3Insights.correlations,
                    } : undefined
                };
            });

            setDiagnoses(localizedDiagnoses);
            setCurrentId(currentDiagnosisId);
            setIsLoading(false);
        };
        loadData();
    }, [lang]);

    const currentDiagnosis = diagnoses.find(d => d.id === currentId) || diagnoses[0];
    const history = diagnoses.slice(1, 11); // Show up to 10 recent diagnoses

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    // Empty state - no diagnoses
    if (!currentDiagnosis) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-6 max-w-md"
                >
                    <Inbox className="h-20 w-20 mx-auto text-muted-foreground opacity-50" />
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold font-heading">{dict.dashboard.empty_title}</h2>
                        <p className="text-muted-foreground">{dict.dashboard.empty_desc}</p>
                    </div>
                    <Link href={`/${lang}/assessment`}>
                        <Button size="lg" className="gap-2 font-bold px-8 shadow-xl shadow-primary/20">
                            {dict.dashboard.start_assessment}
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </motion.div>
            </div>
        );
    }

    // Format date from timestamp
    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString(lang === 'pt' ? 'pt-BR' : lang === 'es' ? 'es-ES' : 'en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Premium Deep Background - Ultra Subtle Glow */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div
                    className="absolute top-[-10%] right-[-5%] w-[1000px] h-[1000px] rounded-full blur-[220px] opacity-[0.1] dark:opacity-[0.15]"
                    style={{ backgroundColor: currentDiagnosis.color }}
                />
                <div
                    className="absolute bottom-[-10%] left-[-5%] w-[800px] h-[800px] rounded-full blur-[220px] opacity-[0.05] dark:opacity-[0.08]"
                    style={{ backgroundColor: currentDiagnosis.color }}
                />
            </div>

            <header className="px-4 lg:px-6 h-14 flex items-center border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
                <div className="container mx-auto flex items-center justify-between">
                    <Logo lang={lang} />
                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <LanguageSelector currentLang={lang} />
                        <Button variant="ghost" size="icon" className="h-9 w-9">
                            <User className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </header>

            <main className="flex-1 p-4 md:p-8 relative z-10">
                <div className="container mx-auto max-w-6xl space-y-12">
                    {/* Current Status Hero */}
                    <section className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <h2 className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-black">{dict.dashboard.current_diagnosis}</h2>
                                <p className="text-2xl font-bold font-heading">{dict.dashboard.overview_v2}</p>
                            </div>
                            <Link href={`/${lang}/assessment`}>
                                <Button variant="outline" size="sm" className="rounded-full border-primary/20 hover:border-primary transition-colors font-bold px-6">
                                    {dict.dashboard.new_diagnosis}
                                </Button>
                            </Link>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="relative"
                        >
                            <Card className="border-border bg-card/70 dark:bg-zinc-900/40 backdrop-blur-xl shadow-2xl overflow-hidden group hover:border-primary/10 transition-all duration-700 rounded-[2.5rem]">
                                <CardHeader className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0 pb-10 border-b border-border/40 p-10">
                                    <div className="space-y-3">
                                        <Badge variant="secondary" className="bg-primary/10 border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest px-3 py-1">{dict.dashboard.active_v2}</Badge>
                                        <CardTitle className="text-6xl md:text-8xl font-heading font-black tracking-tighter text-foreground leading-[0.8] py-2">
                                            {currentDiagnosis.label}
                                        </CardTitle>
                                        <CardDescription className="flex items-center gap-2 text-muted-foreground font-medium text-sm">
                                            <Clock className="h-4 w-4" /> {dict.dashboard.performed_at} {formatDate(currentDiagnosis.timestamp)}
                                        </CardDescription>
                                    </div>
                                    <div className="flex flex-row md:flex-col gap-8 md:gap-4 items-center md:items-end">
                                        <div className="flex items-center md:items-end flex-col gap-1">
                                            <div className="text-5xl md:text-6xl font-black text-primary leading-none">{currentDiagnosis.confidence}%</div>
                                            <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-black opacity-40 italic whitespace-nowrap">{dict.dashboard.neural_confidence}</div>
                                        </div>
                                        {currentDiagnosis.isUnlocked && currentDiagnosis.v3Insights && (
                                            <div className="flex items-center md:items-end flex-col gap-1">
                                                <div className="text-3xl md:text-4xl font-black text-foreground leading-none">{currentDiagnosis.v3Insights.antifragilityScore}%</div>
                                                <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-black opacity-40 italic whitespace-nowrap">{dict.dashboard.antifragility}</div>
                                            </div>
                                        )}
                                    </div>
                                </CardHeader>

                                <CardContent className="p-10 space-y-12">
                                    <blockquote className="text-2xl md:text-4xl font-medium leading-tight italic text-foreground/90 border-l-4 border-primary/40 pl-8 py-2">
                                        "{currentDiagnosis.oneLiner}"
                                    </blockquote>

                                    {/* Dimension Scores v2 (7 Pillars) */}
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <div className="h-px flex-1 bg-border/40" />
                                            <h3 className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-black whitespace-nowrap">{dict.dashboard.pillar_analysis}</h3>
                                            <div className="h-px flex-1 bg-border/40" />
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                            {currentDiagnosis.dimensions.map((dim, i) => (
                                                <motion.div
                                                    key={i}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: i * 0.05 }}
                                                    className="space-y-3 p-6 rounded-2xl bg-muted/20 border border-border/40"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs font-black uppercase tracking-tighter">{dim.label}</span>
                                                        <span className="text-sm font-black" style={{ color: dim.color }}>{dim.value}%</span>
                                                    </div>
                                                    <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${dim.value}%` }}
                                                            transition={{ duration: 1.2, delay: i * 0.1, ease: "circOut" }}
                                                            className="h-full rounded-full shadow-[0_0_8px_rgba(var(--primary),0.3)]"
                                                            style={{ backgroundColor: dim.color }}
                                                        />
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>

                                <CardFooter className="bg-primary/5 p-10 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-6">
                                    <div className="flex items-center gap-4 text-muted-foreground font-medium">
                                        {currentDiagnosis.isUnlocked ? (
                                            <div className="flex items-center gap-2 text-primary">
                                                <CheckCircle2 className="h-5 w-5" />
                                                <span>{dict.dashboard.premium_unlocked}</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <Padlock className="h-5 w-5" />
                                                <span>{dict.dashboard.premium_locked}</span>
                                            </div>
                                        )}
                                    </div>
                                    <Button size="lg" className="rounded-full shadow-xl shadow-primary/20 w-full sm:w-auto font-black h-14 px-10 text-lg group" asChild>
                                        <Link href={currentDiagnosis.isUnlocked ? `/${lang}/report/${currentDiagnosis.id}` : `/${lang}/checkout/${currentDiagnosis.id}`}>
                                            {currentDiagnosis.isUnlocked ? dict.dashboard.view_report : dict.dashboard.unlock_plan}
                                            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    </section>

                    {/* History Snippet */}
                    {history.length > 0 && (
                        <section className="space-y-6">
                            <h2 className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-black">{dict.dashboard.history_title}</h2>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {history.map((item, i) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.05 }}
                                    >
                                        <Link href={`/${lang}/report/${item.id}`}>
                                            <Card className="border-border bg-card/40 hover:bg-card/80 dark:bg-zinc-900/10 dark:hover:bg-zinc-900/30 transition-all duration-500 cursor-pointer group shadow-sm hover:shadow-md rounded-3xl overflow-hidden">
                                                <CardContent className="p-8 flex items-center justify-between">
                                                    <div className="space-y-2">
                                                        <div className="text-2xl font-black font-heading tracking-tighter flex items-center gap-2">
                                                            {item.label}
                                                            {item.isUnlocked && (
                                                                <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                                                            )}
                                                        </div>
                                                        <div className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-black opacity-60 underline underline-offset-4 decoration-primary/30">{formatDate(item.timestamp)}</div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        {item.isUnlocked && (
                                                            <Badge variant="outline" className="text-[10px] font-black border-primary/30 text-primary bg-primary/5 px-2 py-0.5">{dict.dashboard.premium_badge}</Badge>
                                                        )}
                                                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                                            <ArrowRight className="h-4 w-4" />
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </main>
        </div>
    );
}
