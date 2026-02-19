"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, ChevronRight, LayoutDashboard, Lock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { LanguageSelector } from "@/components/language-selector";
import { ThemeToggle } from "@/components/theme-toggle";
import { RadarChart } from "@/components/ui/radar-chart";
import { trackFBEvent } from "@/components/meta-pixel";
import { calculateDiagnosis, Locale } from "@/lib/diagnostic";
import { getDictionary } from "@/lib/get-dictionary";
import { saveDiagnosis, generateId } from "@/lib/storage";
import { SavedDiagnosis } from "@/lib/types";
import { Logo } from "@/components/logo";
import { SocialProof } from "@/components/social-proof";

export default function PreviewPage({ params }: { params: Promise<{ lang: Locale }> }) {
    const { lang } = use(params);
    const dict = use(getDictionary(lang));
    const searchParams = useSearchParams();

    const [diagnosisId, setDiagnosisId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Parse answers from URL
    const answersParam = searchParams.get('answers');
    const qualitativeContext = searchParams.get('q') || '';

    let answers: Record<number, number> = {};
    try {
        answers = answersParam ? JSON.parse(decodeURIComponent(answersParam)) : {};
    } catch (e) {
        console.error('Error parsing answers:', e);
    }

    const diagnosis = calculateDiagnosis(answers);
    const { color: statusColor, confidence } = diagnosis;
    const statusLabel = dict.states[diagnosis.state].label;
    const one_liner = dict.states[diagnosis.state].one_liner;

    const localizedPillarScores = diagnosis.pillarScores.map(p => ({
        ...p,
        label: dict.pillars[p.pillarKey],
        insight: dict.pillar_insights[p.pillarKey][p.tier]
    }));

    const localizedV3Insights = diagnosis.v3Insights ? {
        ...diagnosis.v3Insights,
        bottleneckLabel: dict.pillars[diagnosis.v3Insights.bottleneckPillarKey],
        correlations: diagnosis.v3Insights.correlationKeys.map(k => dict.correlations[k]),
        archetype: dict.archetypes[diagnosis.v3Insights.archetypeKey]
    } : undefined;

    // Save diagnosis to storage on mount
    useEffect(() => {
        const handleSave = async () => {
            if (Object.keys(answers).length === 0) {
                setIsLoading(false);
                return;
            }

            const newId = generateId();
            const savedData: SavedDiagnosis = {
                id: newId,
                timestamp: Date.now(),
                lang,
                answers,
                qualitativeContext,
                state: diagnosis.state,
                confidence,
                label: statusLabel,
                color: statusColor,
                oneLiner: one_liner,
                dimensions: localizedPillarScores as any, // Cast to any to satisfy Dimension vs PillarScore difference if any
                isUnlocked: false,
                v3Insights: localizedV3Insights as any
            };

            try {
                await saveDiagnosis(savedData);
                setDiagnosisId(newId);

                // Track Completion
                trackFBEvent('CompleteRegistration', {
                    content_name: 'Emotional Diagnostic Result',
                    status: diagnosis.state
                }, `reg_${newId}`, newId);
            } catch (e) {
                console.error('Error saving diagnosis:', e);
            }
            setIsLoading(false);
        };

        handleSave();
    }, [lang, answersParam, qualitativeContext]);

    if (Object.keys(answers).length === 0) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <Card className="max-w-md">
                    <CardContent className="p-8 text-center space-y-4">
                        <h2 className="text-2xl font-bold">{dict.preview.empty_title}</h2>
                        <p className="text-muted-foreground">{dict.preview.empty_desc}</p>
                        <Link href={`/${lang}/assessment`}>
                            <Button>{dict.preview.empty_button}</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
            <SocialProof lang={lang} type="purchase" />
            {/* Dynamic Glassmorphic Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px]"
                    style={{ backgroundColor: statusColor }}
                />
            </div>

            <header className="px-4 lg:px-6 h-14 flex items-center border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
                <div className="container mx-auto flex items-center justify-between">
                    <Logo lang={lang} />
                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <LanguageSelector currentLang={lang} />
                    </div>
                </div>
            </header>

            <main className="flex-1 relative z-10 flex flex-col items-center p-4 lg:p-8 pb-24 md:pb-8">
                <div className="w-full max-w-6xl space-y-12">
                    {/* Header Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center space-y-6"
                    >
                        <Badge variant="outline" className="px-4 py-1 text-xs uppercase tracking-widest border-primary/20 text-primary bg-background/50 backdrop-blur-sm">
                            {dict.preview.diagnosed}
                        </Badge>
                        <div className="space-y-1">
                            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-medium">{dict.preview.title}</span>
                            <h1 className="text-5xl md:text-8xl font-bold font-heading tracking-tighter text-foreground decoration-primary/30 decoration-8 underline-offset-8">
                                {statusLabel}
                            </h1>
                        </div>
                        <div className="flex items-center justify-center gap-6 text-sm">
                            <div className="flex items-center gap-2 text-primary font-bold">
                                <CheckCircle2 className="h-4 w-4" />
                                <span>{dict.preview.confidence}: {confidence}%</span>
                            </div>
                            <div className="w-px h-4 bg-border" />
                            <div className="text-muted-foreground font-medium">
                                {dict.preview.pillars_tagline}
                            </div>
                        </div>
                    </motion.div>

                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Radar Chart Section */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="flex justify-center w-full px-4 sm:px-0"
                        >
                            <div className="relative group p-4 rounded-full max-w-full">
                                <div className="absolute inset-0 bg-primary/10 rounded-full blur-[100px] opacity-0 group-hover:opacity-40 transition-opacity duration-1000" />
                                <div className="w-full max-w-[min(420px,calc(100vw-4rem))] mx-auto">
                                    <RadarChart data={localizedPillarScores.length > 0 ? localizedPillarScores : []} size={420} />
                                </div>
                            </div>
                        </motion.div>

                        {/* Summary & Pillars Section */}
                        <div className="space-y-8">
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                                className="p-8 rounded-3xl bg-card/70 dark:bg-card/40 backdrop-blur-xl border border-border shadow-2xl space-y-4"
                            >
                                <p className="text-2xl md:text-3xl font-medium leading-relaxed italic text-foreground tracking-tight">
                                    "{one_liner}"
                                </p>
                                <div className="h-px w-20 bg-primary/50" />
                                <p className="text-muted-foreground text-sm uppercase tracking-widest font-bold">
                                    {dict.preview.pillars_overview}
                                </p>
                            </motion.div>

                            {/* Dimension Progress Mini-Bars */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                                {localizedPillarScores.map((dim: any, i: number) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 + i * 0.05 }}
                                        className="space-y-1.5"
                                    >
                                        <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                                            <span>{dim.label}</span>
                                            <span style={{ color: dim.color }}>{dim.value}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-muted/50 rounded-full overflow-hidden border border-border/10">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${dim.value}%` }}
                                                transition={{ delay: 0.6 + i * 0.1, duration: 1.2, ease: "circOut" }}
                                                className="h-full rounded-full"
                                                style={{ backgroundColor: dim.color }}
                                            />
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Bottom CTA Section */}
                    <div className="grid md:grid-cols-2 gap-6 pt-12 max-w-5xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                        >
                            <Card className="bg-background/40 backdrop-blur-md border-border/40 hover:border-border transition-colors group h-full">
                                <CardContent className="p-6 md:p-8 space-y-6">
                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Star className="h-6 w-6 text-primary" />
                                    </div>
                                    <h3 className="text-xl font-bold font-heading">{dict.preview.what_is_next}</h3>
                                    <ul className="space-y-3 text-sm text-muted-foreground">
                                        <li className="flex items-center gap-3">
                                            <div className="w-1 h-1 rounded-full bg-primary/40" />
                                            <span>{dict.preview.pilar_neural_insight}</span>
                                        </li>
                                        <li className="flex items-center gap-3">
                                            <div className="w-1 h-1 rounded-full bg-primary/40" />
                                            <span>{dict.preview.pilar_strategic_plan}</span>
                                        </li>
                                        <li className="flex items-center gap-3">
                                            <div className="w-1 h-1 rounded-full bg-primary/40" />
                                            <span>{dict.preview.pilar_antifragility}</span>
                                        </li>
                                        <li className="flex items-center gap-3">
                                            <div className="w-1 h-1 rounded-full bg-primary/40" />
                                            <span>{dict.preview.pilar_alpha_priority}</span>
                                        </li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                        >
                            <Card className="bg-card/40 dark:bg-zinc-900/40 border-primary/20 text-card-foreground shadow-2xl shadow-primary/10 h-full overflow-hidden relative group backdrop-blur-xl">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                                    <Lock className="h-24 w-24 text-primary" />
                                </div>
                                <CardContent className="p-6 md:p-8 space-y-8 flex flex-col justify-between h-full relative z-10">
                                    <div className="space-y-4">
                                        <Badge className="bg-primary/20 text-primary border-primary/30 text-xs font-black px-3 py-0.5">{dict.preview.platinum_v4}</Badge>
                                        <h3 className="text-2xl font-bold font-heading">{dict.report.title}</h3>
                                        <p className="text-muted-foreground leading-relaxed font-medium">
                                            {dict.preview.premium_desc}
                                        </p>
                                    </div>
                                    <div className="space-y-4">
                                        {diagnosisId && (
                                            <Link href={`/${lang}/checkout/${diagnosisId}`} className="block">
                                                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-black h-14 text-lg shadow-xl" size="lg">
                                                    {dict.preview.unlock_button}
                                                    <ChevronRight className="ml-2 h-5 w-5" />
                                                </Button>
                                            </Link>
                                        )}
                                        <Link href={`/${lang}/report/demo`} className="block">
                                            <Button variant="ghost" className="w-full text-foreground/70 hover:bg-primary/10 hover:text-primary border border-border h-14 font-bold">
                                                <LayoutDashboard className="mr-2 h-5 w-5" />
                                                {dict.preview.view_demo_v4}
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </main>
        </div>
    );
}
