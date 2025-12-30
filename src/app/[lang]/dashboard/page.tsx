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
    Settings,
    LogOut,
    Sparkles,
    Inbox
} from "lucide-react";
import { getAllDiagnoses, getCurrentDiagnosisId } from "@/lib/storage";
import { SavedDiagnosis } from "@/lib/types";
import { getDictionary } from "@/lib/get-dictionary";
import { Locale } from "@/lib/diagnostic";

export default function DashboardPage({ params }: { params: Promise<{ lang: Locale }> }) {
    const { lang } = use(params);
    const dict = use(getDictionary(lang));

    const [diagnoses, setDiagnoses] = useState<SavedDiagnosis[]>([]);
    const [currentId, setCurrentId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const allDiagnoses = getAllDiagnoses();
        setDiagnoses(allDiagnoses);
        setCurrentId(getCurrentDiagnosisId());
        setIsLoading(false);
    }, []);

    const currentDiagnosis = diagnoses.find(d => d.id === currentId) || diagnoses[0];
    const history = diagnoses.slice(1, 11); // Show up to 10 recent diagnoses

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex">
                <aside className="w-64 border-r border-border hidden md:flex flex-col p-6 sticky top-0 h-screen bg-card/50 backdrop-blur-xl z-40">
                    <Skeleton className="h-8 w-40 mb-12" />
                    <div className="space-y-2">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </aside>
                <main className="flex-1 flex flex-col min-w-0 relative z-10">
                    <header className="h-14 border-b border-border flex items-center justify-between px-6 lg:px-8 bg-background/95 backdrop-blur sticky top-0 z-40">
                        <Skeleton className="h-6 w-32" />
                    </header>
                    <div className="flex-1 p-6 lg:px-8 space-y-8 max-w-5xl mx-auto w-full">
                        <Skeleton className="h-96 w-full" />
                    </div>
                </main>
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
                        <h2 className="text-3xl font-bold">Nenhum Diagnóstico</h2>
                        <p className="text-muted-foreground">Você ainda não fez nenhum assessment. Comece agora para descobrir seu estado atual.</p>
                    </div>
                    <Link href={`/${lang}/assessment`}>
                        <Button size="lg" className="gap-2">
                            Iniciar Assessment
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
        <div className="min-h-screen bg-background flex">
            {/* Premium Deep Background - Ultra Subtle Glow */}
            <div className="fixed inset-0 z-0 pointer-events-none">
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
            </div>

            {/* Sidebar (Desktop) */}
            <aside className="w-64 border-r border-border hidden md:flex flex-col p-6 sticky top-0 h-screen bg-card/60 dark:bg-card/40 backdrop-blur-xl z-40">
                <Link className="flex items-center gap-2 mb-12" href={`/${lang}`}>
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                        <div className="w-2 h-2 bg-primary-foreground rounded-full" />
                    </div>
                    <span className="font-heading font-bold text-lg tracking-tight">STATUS CORE</span>
                </Link>
                <nav className="flex-1 space-y-2">
                    <Link href={`/${lang}/dashboard`} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary font-medium border border-primary/20 shadow-sm">
                        <BarChart3 className="h-4 w-4" /> Dashboard
                    </Link>
                    <Link href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-all duration-300">
                        <History className="h-4 w-4" /> Histórico
                    </Link>
                    <Link href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-all duration-300">
                        <User className="h-4 w-4" /> Perfil
                    </Link>
                </nav>
                <div className="border-t border-border pt-4 mt-auto">
                    <Link href="/login" className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-all duration-300">
                        <LogOut className="h-4 w-4" /> Sair
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 relative z-10">
                <header className="h-14 border-b border-border flex items-center justify-between px-6 lg:px-8 bg-background/95 backdrop-blur sticky top-0 z-40">
                    <h1 className="font-heading font-bold text-xl">Dashboard</h1>
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="sm" asChild className="rounded-full hidden sm:flex border-border bg-background hover:bg-accent transition-colors">
                            <Link href={`/${lang}/assessment`}>Novo Diagnóstico</Link>
                        </Button>
                        <div className="h-8 w-8 rounded-full bg-muted border border-border flex items-center justify-center">
                            <User className="h-4 w-4 text-muted-foreground" />
                        </div>
                    </div>
                </header>

                <div className="flex-1 p-6 lg:p-8 space-y-8 max-w-5xl mx-auto w-full">
                    {/* Current Status Hero */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-black">Diagnóstico Atual</h2>
                            <Badge variant="secondary" className="bg-primary/10 border-primary/20 text-primary text-[10px] font-black uppercase tracking-wider">Ativo</Badge>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="relative"
                        >
                            <Card className="border-border bg-card/70 dark:bg-zinc-900/30 backdrop-blur-xl shadow-2xl overflow-hidden group hover:border-primary/20 transition-all duration-700">
                                {/* Subtle inner glow */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] opacity-0 group-hover:opacity-30 transition-opacity duration-1000" />

                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6 border-b border-border relative z-10">
                                    <div className="space-y-2">
                                        <CardTitle className="text-5xl font-heading font-black tracking-tighter text-primary leading-none">
                                            {currentDiagnosis.state}
                                        </CardTitle>
                                        <CardDescription className="flex items-center gap-2 text-muted-foreground font-medium">
                                            <Clock className="h-3 w-3" /> Realizado em {formatDate(currentDiagnosis.timestamp)}
                                        </CardDescription>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-4xl font-black text-primary">{currentDiagnosis.confidence}%</div>
                                        <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-black">Confiança</div>
                                    </div>
                                </CardHeader>

                                <CardContent className="pt-8 space-y-8 relative z-10">
                                    <blockquote className="text-2xl md:text-3xl font-medium leading-snug italic text-foreground/90 border-l-4 border-primary/40 pl-6">
                                        "{currentDiagnosis.oneLiner}"
                                    </blockquote>

                                    {/* Dimension Scores */}
                                    <div className="space-y-3 pt-4">
                                        <h3 className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-black">Análise Dimensional</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {currentDiagnosis.dimensions.map((dim, i) => (
                                                <motion.div
                                                    key={i}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: i * 0.1 }}
                                                    className="space-y-2"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs font-bold">{dim.label}</span>
                                                        <span className="text-xs font-black" style={{ color: dim.color }}>{dim.value}%</span>
                                                    </div>
                                                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${dim.value}%` }}
                                                            transition={{ duration: 1, delay: i * 0.1 + 0.3, ease: "easeOut" }}
                                                            className="h-full rounded-full"
                                                            style={{
                                                                backgroundColor: dim.color,
                                                                boxShadow: `0 0 12px ${dim.color}20`
                                                            }}
                                                        />
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Locked Content Preview - Only show if NOT unlocked */}
                                    {!currentDiagnosis.isUnlocked && (
                                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 pt-4">
                                            {[
                                                { label: "Significado", icon: FileText },
                                                { label: "Características", icon: CheckCircle2 },
                                                { label: "Risco Primário", icon: AlertTriangle },
                                                { label: "Recomendações", icon: Sparkles },
                                            ].map((item, i) => (
                                                <div key={i} className="flex flex-col items-center p-6 rounded-2xl bg-muted/30 dark:bg-white/[0.02] border border-border dark:border-white/5 text-center space-y-3 opacity-60 hover:opacity-100 transition-all">
                                                    <item.icon className="h-6 w-6 text-muted-foreground" />
                                                    <span className="text-xs font-bold uppercase tracking-wider">{item.label}</span>
                                                    <Padlock className="h-4 w-4 text-muted-foreground/30" />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>

                                <CardFooter className="bg-primary/5 p-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
                                    <p className="text-sm text-muted-foreground max-w-sm font-medium">
                                        {currentDiagnosis.isUnlocked
                                            ? "Sua análise completa está disponível com insights profundos e estratégias."
                                            : "Desbloqueie o relatório completo para acessar análises profundas, planos de ação e sabedoria estoica."}
                                    </p>
                                    <Button size="lg" className="rounded-full shadow-lg shadow-primary/20 w-full sm:w-auto font-bold" asChild>
                                        <Link href={currentDiagnosis.isUnlocked ? `/${lang}/report/${currentDiagnosis.id}` : `/${lang}/checkout/${currentDiagnosis.id}`}>
                                            {currentDiagnosis.isUnlocked ? "Ver Relatório" : "Desbloquear Agora"}
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    </section>

                    {/* History Snippet */}
                    <section className="space-y-4">
                        <h2 className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-black">Histórico Recente</h2>
                        <div className="grid gap-4 sm:grid-cols-2">
                            {history.map((item, i) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    <Link href={`/${lang}/report/${item.id}`}>
                                        <Card className="border-border bg-card/40 dark:bg-zinc-900/20 backdrop-blur-sm hover:bg-card/80 dark:hover:bg-zinc-900/30 hover:border-primary/20 transition-all duration-500 cursor-pointer group shadow-sm hover:shadow-md">
                                            <CardContent className="p-6 flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <div className="text-lg font-black font-heading tracking-tight flex items-center gap-2">
                                                        {item.label}
                                                        {item.isUnlocked && (
                                                            <Sparkles className="h-3 w-3 text-primary animate-pulse" />
                                                        )}
                                                    </div>
                                                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">{formatDate(item.timestamp)}</div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {item.isUnlocked ? (
                                                        <Badge variant="outline" className="text-[10px] font-black border-primary/30 text-primary bg-primary/5">PREMIUM</Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="text-[10px] font-black border-border opacity-70">{item.confidence}%</Badge>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
