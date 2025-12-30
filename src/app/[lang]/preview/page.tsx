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
import { calculateDiagnosis, Locale, STATE_CONFIGS } from "@/lib/diagnostic";
import { getDictionary } from "@/lib/get-dictionary";
import { saveDiagnosis, generateId } from "@/lib/storage";
import { SavedDiagnosis, Dimension } from "@/lib/types";

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

    const diagnosis = calculateDiagnosis(answers, lang);
    const { label: statusLabel, color: statusColor, confidence, one_liner } = diagnosis;

    // Generate dimension scores based on answers
    const generateDimensions = (): Dimension[] => {
        // Calculate scores for each dimension based on related questions
        const focusScore = Math.round((
            (answers[2] || 0) +
            (answers[14] || 0)
        ) / 2 * 20);

        const clarityScore = Math.round((
            (5 - (answers[3] || 0)) +
            (5 - (answers[4] || 0))
        ) / 2 * 20);

        const energyScore = Math.round((
            (5 - (answers[1] || 0)) +
            (5 - (answers[15] || 0))
        ) / 2 * 20);

        const emotionScore = Math.round((
            (5 - (answers[5] || 0)) +
            (5 - (answers[8] || 0))
        ) / 2 * 20);

        return [
            { label: "Foco", value: Math.min(100, Math.max(0, focusScore)), color: "#3b82f6" },
            { label: "Clareza", value: Math.min(100, Math.max(0, clarityScore)), color: "#a855f7" },
            { label: "Energia", value: Math.min(100, Math.max(0, energyScore)), color: "#f59e0b" },
            { label: "Emoção", value: Math.min(100, Math.max(0, emotionScore)), color: "#f43f5e" }
        ];
    };

    const dimensions = generateDimensions();

    // Save diagnosis to localStorage on mount
    useEffect(() => {
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
            dimensions,
            isUnlocked: false
        };

        saveDiagnosis(savedData);
        setDiagnosisId(newId);
        setIsLoading(false);
    }, []);

    if (Object.keys(answers).length === 0) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <Card className="max-w-md">
                    <CardContent className="p-8 text-center space-y-4">
                        <h2 className="text-2xl font-bold">Nenhum diagnóstico encontrado</h2>
                        <p className="text-muted-foreground">Complete o assessment para ver seu resultado.</p>
                        <Link href={`/${lang}/assessment`}>
                            <Button>Iniciar Assessment</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
            {/* Dynamic Glassmorphic Background */}
            <div className="fixed inset-0 z-0">
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
                    <Link className="flex items-center justify-center gap-2" href={`/${lang}`}>
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                            <div className="w-3 h-3 bg-background rounded-full" />
                        </div>
                        <span className="font-heading font-bold text-xl tracking-tight">STATUS CORE</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <LanguageSelector currentLang={lang} />
                    </div>
                </div>
            </header>

            <main className="flex-1 relative z-10 flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-4xl space-y-8 text-center py-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <Badge variant="outline" className="px-4 py-1 text-xs uppercase tracking-widest border-primary/20 text-primary bg-background/50 backdrop-blur-sm">
                            {dict.preview.diagnosed}
                        </Badge>
                        <div className="space-y-1">
                            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-medium">{dict.preview.title}</span>
                            <h1 className="text-5xl md:text-7xl font-bold font-heading tracking-tighter text-primary">
                                {statusLabel}
                            </h1>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-muted-foreground">
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                            <span>{dict.preview.confidence}: <strong>{confidence}%</strong></span>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-8"
                    >
                        <div className="p-8 rounded-3xl bg-card/70 dark:bg-card/30 backdrop-blur-md border border-border dark:border-white/10 shadow-2xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <p className="text-xl md:text-2xl font-medium leading-relaxed max-w-2xl mx-auto italic text-foreground/90 dark:text-foreground">
                                "{one_liner}"
                            </p>
                        </div>

                        {/* Dimension Bars */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
                            {dimensions.map((dim, i) => (
                                <div key={i} className="space-y-2 text-left">
                                    <div className="flex justify-between text-[10px] uppercase font-bold tracking-tighter text-muted-foreground mr-1">
                                        <span>{dim.label}</span>
                                        <span>{dim.value}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${dim.value}%` }}
                                            transition={{ delay: 0.5 + i * 0.1, duration: 1, ease: "easeOut" }}
                                            className="h-full rounded-full"
                                            style={{ backgroundColor: dim.color }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-6 pt-8">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="flex justify-center"
                        >
                            <Card className="bg-background/40 backdrop-blur border-border/40 text-center h-full max-w-sm w-full">
                                <CardContent className="p-8 space-y-4 flex flex-col items-center">
                                    <h3 className="text-lg font-bold font-heading flex items-center gap-2">
                                        <Star className="h-5 w-5 text-primary" />
                                        {dict.preview.what_is_next}
                                    </h3>
                                    <ul className="space-y-3 text-sm text-muted-foreground text-left mx-auto">
                                        <li className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary" /> {dict.report.meaning}
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary" /> {dict.report.characteristics}
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary" /> {dict.report.risk}
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary" /> {dict.report.next_step}
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary" /> {dict.report.stoic_wisdom}
                                        </li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                            className="flex justify-center"
                        >
                            <Card className="bg-primary border-transparent text-primary-foreground text-center h-full max-w-sm w-full overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-4 opacity-20">
                                    <Lock className="h-12 w-12" />
                                </div>
                                <CardContent className="p-8 space-y-6 flex flex-col items-center justify-between h-full relative z-10">
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-bold font-heading">{dict.report.title}</h3>
                                        <p className="text-sm opacity-90 leading-relaxed">
                                            Desbloqueie a análise completa do seu estado com estratégias personalizadas e sabedoria estoica.
                                        </p>
                                    </div>
                                    <div className="space-y-3 w-full">
                                        {diagnosisId && (
                                            <Link href={`/${lang}/checkout/${diagnosisId}`} className="block w-full">
                                                <Button className="w-full bg-background text-primary hover:bg-background/90 font-bold group" size="lg">
                                                    {dict.preview.unlock_button}
                                                    <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                                </Button>
                                            </Link>
                                        )}
                                        <Link href={`/${lang}/report/demo`} className="block w-full">
                                            <Button variant="ghost" className="w-full text-primary-foreground hover:bg-white/10 hover:text-primary-foreground border border-white/20 gap-2">
                                                <LayoutDashboard className="h-4 w-4" />
                                                {dict.preview.demo_button}
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
