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
    Layers,
    Briefcase,
    Users,
    Wallet,
    Fingerprint,
    Palmtree,
    Compass,
    Heart,
    BookOpen,
    Link as LinkIcon
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
import { SavedDiagnosis, V3Insights } from "@/lib/types";
import { Logo } from "@/components/logo";
import { trackFBEvent } from "@/components/meta-pixel";

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
        const loadDiagnosis = async () => {
            if (!isDemo) {
                const diagnosis = await getDiagnosisById(id);
                if (!diagnosis) {
                    router.push(`/${lang}/assessment`);
                    return;
                }
                setSavedDiagnosis(diagnosis);
                setIsLoading(false);
            }
        };
        loadDiagnosis();
    }, [id, isDemo, lang, router]);

    // Track Purchase on browser if unlocked via URL parameter (to deduplicate with CAPI)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('unlocked') === 'true' && savedDiagnosis && !isDemo) {
                trackFBEvent('Purchase', {
                    value: 97.00, // Idealmente pegar do sistema, mas 97 é o padrão
                    currency: 'BRL',
                    content_name: 'Platinum Report',
                    content_ids: [id],
                    content_type: 'product'
                }, `pur_${id}`, id);
                // Remove parameter to avoid multiple triggers
                const newRelativePathQuery = window.location.pathname;
                history.replaceState(null, '', newRelativePathQuery);
            }
        }
    }, [savedDiagnosis, isDemo, id]);

    const demoAnswers = {
        // Saúde: 2, 1, 2
        1: 2, 2: 1, 3: 2,
        // Trabalho: 5, 4, 5
        4: 5, 5: 4, 6: 5,
        // Relações: 2, 3, 2
        7: 2, 8: 3, 9: 2,
        // Finanças: 5, 5, 4
        10: 5, 11: 5, 12: 4,
        // Espiritualidade: 3, 3, 2
        13: 3, 14: 3, 15: 2,
        // Lazer: 1, 2, 1
        16: 1, 17: 2, 18: 1,
        // Identidade: 4, 3, 4
        19: 4, 20: 3, 21: 4
    };

    const demoContext = lang === "pt"
        ? "Tenho orgulho do que construí financeiramente e no meu trabalho, mas sinto que estou pagando um preço alto. Quase nunca consigo desligar, o lazer é inexistente e sinto que minhas relações estão em segundo plano. Acordo já cansado e funciono na base do café e da adrenalina."
        : lang === "es"
            ? "Estoy orgulloso de lo que he construido financieramente y en mi trabajo, pero siento que estoy pagando un precio alto. Casi nunca puedo desconectar, el ocio es inexistente y siento que mis relaciones están en segundo plano. Me despierto ya cansado y funciono a base de café y adrenalina."
            : "I'm proud of what I've built financially and in my work, but I feel I'm paying a high price. I can almost never disconnect, leisure is non-existent, and I feel my relationships are in the background. I wake up already tired and operate on coffee and adrenaline.";

    const demoAiAnalysis: NonNullable<NonNullable<V3Insights['aiAnalysis']>> = {
        executiveSummary: lang === "pt"
            ? "O seu perfil revela a clássica 'Armadilha do Sucesso Solitário'. Enquanto os pilares de Trabalho e Finanças operam em níveis de maestria, sua Saúde e Lazer estão em colapso iminente. Você está operando em um modo de alta performance insustentável, onde a adrenalina mascara a exaustão biológica. A sua Identidade é forte o suficiente para te manter no caminho, mas o custo sistêmico está sendo debitado das suas Relações e da sua Vitalidade."
            : lang === "es"
                ? "Su perfil revela la clásica 'Trampa del Éxito Solitario'. Mientras que los pilares de Trabajo y Finanzas operan con maestría, su Salud y Ocio están en colapso inminente. Está operando en un modo de alto rendimiento insostenible, donde la adrenalina enmascara el agotamiento biológico. Su Identidad es lo suficientemente fuerte como para mantenerle en el camino, pero el coste sistémico se está cargando a sus Relaciones y Vitalidad."
                : "Your profile reveals the classic 'Lonely Success Trap'. While your Work and Finance pillars operate at mastery levels, your Health and Leisure are in imminent collapse. You are operating in an unsustainable high-performance mode, where adrenaline masks biological exhaustion. Your Identity is strong enough to keep you on track, but the systemic cost is being debited from your Relationships and Vitality.",
        sevenDayPlan: [
            { day: lang === "pt" ? "Dia 1" : lang === "es" ? "Día 1" : "Day 1", action: lang === "pt" ? "Corte de cafeína após as 14h e 8h de sono obrigatórias." : lang === "es" ? "Corte de cafeína tras las 14h y 8h de sueño obligatorias." : "Cut caffeine after 2 PM and 8h mandatory sleep.", pilar: dict.pillars.health },
            { day: lang === "pt" ? "Dia 2" : lang === "es" ? "Día 2" : "Day 2", action: lang === "pt" ? "Bloqueio de agenda: 2h de lazer sem telas." : lang === "es" ? "Bloqueo de agenda: 2h de ocio sin pantallas." : "Calendar block: 2h screen-free leisure.", pilar: dict.pillars.leisure },
            { day: lang === "pt" ? "Dia 3" : lang === "es" ? "Día 3" : "Day 3", action: lang === "pt" ? "Delegar 2 tarefas operacionais no trabalho." : lang === "es" ? "Delegar 2 tareas operativas en el trabajo." : "Delegate 2 operational tasks at work.", pilar: dict.pillars.work },
            { day: lang === "pt" ? "Dia 4" : lang === "es" ? "Día 4" : "Day 4", action: lang === "pt" ? "Noite sem celular com pessoas próximas." : lang === "es" ? "Noche sin celular con personas cercanas." : "Phone-free night with loved ones.", pilar: dict.pillars.relationships },
            { day: lang === "pt" ? "Dia 5" : lang === "es" ? "Día 5" : "Day 5", action: lang === "pt" ? "30min de caminhada leve ao ar livre." : lang === "es" ? "30min de caminata ligera al aire libre." : "30min light walk outdoors.", pilar: dict.pillars.health },
            { day: lang === "pt" ? "Dia 6" : lang === "es" ? "Día 6" : "Day 6", action: lang === "pt" ? "Auditoria de lazer: Liste 3 hobbies esquecidos." : lang === "es" ? "Auditoría de ocio: Liste 3 pasatiempos olvidados." : "Leisure audit: List 3 forgotten hobbies.", pilar: dict.pillars.leisure },
            { day: lang === "pt" ? "Dia 7" : lang === "es" ? "Día 7" : "Day 7", action: lang === "pt" ? "Meditação estoica sobre o que é essencial." : lang === "es" ? "Meditación estoica sobre lo que es esencial." : "Stoic meditation on what is essential.", pilar: dict.pillars.spirituality }
        ],
        stoicRefinement: lang === "pt"
            ? "Epicteto nos lembra: 'Nenhum homem é livre se não é mestre de si mesmo'. Você conquistou bens externos, mas tornou-se escravo da própria ambição. A verdadeira maestria reside na capacidade de parar sem sentir culpa."
            : lang === "es"
                ? "Epicteto nos recuerda: 'Ningún hombre es libre si no es dueño de sí mismo'. Has conquistado bienes externos, pero te has vuelto esclavo de tu propia ambición. La verdadera maestría reside en la capacidad de parar sin sentir culpa."
                : "Epictetus reminds us: 'No man is free who is not master of himself'. You've conquered external goods, but have become a slave to your own ambition. True mastery lies in the ability to stop without feeling guilt.",
        deepDiveAnalysis: lang === "pt"
            ? "Sua realidade atual é um paradoxo: você nunca esteve tão bem 'por fora' e tão esgotado 'por dentro'. A análise dos seus 7 pilares revela que você transformou o Trabalho e as Finanças em um escudo para evitar enfrentar o vazio nos pilares de Lazer e Relações. O seu pilar de Saúde atingiu um nível crítico; a sua máquina biológica está funcionando no limite do cheque especial.\n\nA lógica oculta aqui é a 'Desvalorização do Capital Humano': você está investindo todo o seu capital de tempo em ativos externos que geram dinheiro, enquanto o seu ativo mais valioso — sua saúde mental e física — está sofrendo uma depreciação acelerada. No longo prazo, sem o pilar da Saúde, as Finanças se tornam apenas um fundo de reserva para gastos médicos e falta de qualidade de vida.\n\nO gargalo sistêmico identificado é a 'Inexistência de Antifragilidade no Descanso'. Você é frágil porque o seu sistema depende de esforço contínuo. Se você parar, sente que tudo desmorona. A verdadeira antifragilidade viria de um sistema onde o seu bem-estar é independente da sua produtividade diária. \n\nO risco de manter esse caminho não é apenas o burnout, mas a erosão total da sua Identidade, transformando quem você é em apenas 'o que você entrega'. É imperativo que você reintegre o Lazer não como um descanso passivo (Netflix/Redes Sociais), mas como Lazer Ativo que alimente sua alma e reconecte você com as pessoas que importam.\n\nSua maestria financeira é louvável, mas agora ela deve ser usada para comprar a sua liberdade de volta. Delegar e dizer 'não' são as únicas ferramentas capazes de restaurar o equilíbrio antes que o corpo force uma parada obrigatória. O estoicismo te convida a olhar para o que você realmente controla: e o tempo é a única coisa que, uma vez perdida, nunca se recupera."
            : lang === "es"
                ? "Su realidad actual es una paradoja: nunca ha estado tan bien 'por fuera' y tan agotado 'por dentro'. El análisis de sus 7 pilares revela que ha convertido el Trabajo y las Finanzas en un escudo para evitar afrontar el vacío en los pilares de Ocio y Relaciones. Su pilar de Salud ha alcanzado un nivel crítico; su máquina biológica está funcionando al límite del descubierto.\n\nLa lógica oculta aquí es la 'Desvalorización del Capital Humano': está invirtiendo todo su capital de tiempo en activos externos que generan dinero, mientras que su activo más valioso —su salud mental y física— está sufriendo una depreciación acelerada. A largo plazo, sin el pilar de la Salud, las Finanzas se convierten solo en un fondo de reserva para gastos médicos y falta de calidad de vida.\n\nEl cuello de botella sistémico identificado es la 'Inexistencia de Antifragilidad en el Descanso'. Usted es frágil porque su sistema depende del esfuerzo continuo. Si se detiene, siente que todo se derrumba. La verdadera antifragilidad vendría de un sistema donde su bienestar sea independiente de su productividad diaria.\n\nEl riesgo de mantener este camino no es solo el burnout, sino la erosión total de su Identidad, transformando quién es usted en solo 'lo que entrega'. Es imperativo que reintegre el Ocio no como un descanso pasivo (Netflix/Redes Sociales), sino como Ocio Activo que alimente su alma y le reconecte con las personas que importan.\n\nSu maestría financiera es encomiable, pero ahora debe usarse para comprar su libertad de vuelta. Delegar y decir 'no' son las únicas herramientas capaces de restaurar el equilibrio antes de que el cuerpo fuerce una parada obligatoria. El estoicismo le invita a mirar lo que realmente controla: y el tiempo es lo único que, una vez perdido, nunca se recupera."
                : "Your current reality is a paradox: you've never been so well 'on the outside' and so exhausted 'on the inside'. The analysis of your 7 pillars reveals that you have turned Work and Finance into a shield to avoid facing the void in the Leisure and Relationships pillars. Your Health pillar has reached a critical level; your biological machine is running on its overdraft limit.\n\nThe hidden logic here is the 'Devaluation of Human Capital': you are investing all your time capital into external assets that generate money, while your most valuable asset — your mental and physical health — is suffering accelerated depreciation. In the long run, without the Health pillar, Finances become just a reserve fund for medical expenses and lack of quality of life.\n\nThe identified systemic bottleneck is the 'Non-existence of Antifragility in Rest'. You are fragile because your system depends on continuous effort. If you stop, you feel everything falls apart. True antifragility would come from a system where your well-being is independent of your daily productivity.\n\nThe risk of keeping this path is not just burnout, but the total erosion of your Identity, transforming who you are into just 'what you deliver'. It is imperative that you reintegrate Leisure not as passive rest (Netflix/Social Media), but as Active Leisure that feeds your soul and reconnects you with the people who matter.\n\nYour financial mastery is commendable, but now it must be used to buy your freedom back. Delegating and saying 'no' are the only tools capable of restoring balance before the body forces a mandatory stop. Stoicism invites you to look at what you truly control: and time is the only thing that, once lost, is never recovered."
    };

    const rawDiagnosis = isDemo ? calculateDiagnosis(demoAnswers) : (savedDiagnosis ? calculateDiagnosis(savedDiagnosis.answers) : null);

    const diagnosis = rawDiagnosis ? {
        ...rawDiagnosis,
        label: dict.states[rawDiagnosis.state].label,
        one_liner: dict.states[rawDiagnosis.state].one_liner,
        report: dict.states[rawDiagnosis.state].report,
        pillarScores: rawDiagnosis.pillarScores.map(p => ({
            ...p,
            label: dict.pillars[p.pillarKey],
            insight: dict.pillar_insights[p.pillarKey][p.tier],
            icon: [Activity, Briefcase, Users, Wallet, Fingerprint, Palmtree, Compass][rawDiagnosis.pillarScores.indexOf(p)] || Activity
        })),
        v3Insights: {
            ...rawDiagnosis.v3Insights,
            archetype: dict.archetypes[rawDiagnosis.v3Insights.archetypeKey],
            bottleneckLabel: dict.pillars[rawDiagnosis.v3Insights.bottleneckPillarKey],
            correlations: rawDiagnosis.v3Insights.correlationKeys.map(k => dict.correlations[k]),
            aiAnalysis: isDemo ? demoAiAnalysis : (savedDiagnosis?.v3Insights?.aiAnalysis || (rawDiagnosis.v3Insights as any).aiAnalysis)
        }
    } : null;

    const qualitativeContext = isDemo ? demoContext : savedDiagnosis?.qualitativeContext || "";
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
                    <p className="text-muted-foreground font-medium">{dict.report.syncing_pillars}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* PDF GOLD STANDARD COVER (Print Only) */}
            <div className="hidden print:flex flex-col items-center justify-center min-h-screen text-center space-y-12 p-20">
                <Logo lang={lang} size={96} showText={false} className="mb-4" />
                <div className="space-y-4">
                    <h1 className="text-6xl font-black tracking-tighter uppercase">{dict.common.title}</h1>
                    <p className="text-xl tracking-[0.5em] text-muted-foreground uppercase">{dict.report.report_v4}</p>
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
                    <div className="flex items-center gap-6">
                        <button
                            className="flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors outline-none pb-0.5"
                            onClick={() => router.back()}
                        >
                            <ChevronLeft className="h-4 w-4" />
                            <span className="font-medium text-sm">{dict.common.back}</span>
                        </button>
                        <div className="h-4 w-px bg-border hidden sm:block" />
                        <Logo lang={lang} size={28} />
                    </div>
                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <LanguageSelector currentLang={lang} />
                        <Button onClick={handlePrint} variant="outline" size="sm" className="hidden sm:flex gap-2 border-primary/40 text-primary font-bold hover:bg-primary/5">
                            <Download className="h-3.5 w-3.5" /> {dict.report.download_report}
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
                                    <h1 className="text-4xl sm:text-6xl md:text-8xl font-black font-heading tracking-tighter text-foreground leading-[0.85] pb-2">
                                        {diagnosis.label}
                                    </h1>
                                </div>
                            </div>

                            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="p-6 rounded-2xl bg-card/70 dark:bg-zinc-900/60 border border-border dark:border-white/5 backdrop-blur-xl max-w-xl mx-auto lg:mx-0 relative overflow-hidden group shadow-2xl print:bg-white print:border-black/20">
                                <div className="absolute top-0 left-0 w-1 h-full bg-primary/50 shadow-[0_0_15px_rgba(var(--primary),0.5)] opacity-50 dark:opacity-100 print:bg-black/40" />
                                <div className="flex gap-4 items-start text-left">
                                    <Sparkles className="h-5 w-5 text-primary shrink-0 mt-1 print:text-black/60" />
                                    <p className="text-sm md:text-base text-foreground/90 dark:text-white/90 leading-relaxed font-medium print:text-black">
                                        <span className="text-primary font-black italic mr-1 print:text-black">NEURAL INSIGHT:</span>
                                        {diagnosis.one_liner}
                                    </p>
                                </div>
                            </motion.div>
                        </div>

                        <div className="lg:col-span-5 flex justify-center">
                            <div className="relative group">
                                <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full opacity-0 group-hover:opacity-40 transition-opacity duration-1000" />
                                <div className="scale-75 sm:scale-100 origin-center">
                                    <RadarChart data={diagnosis.pillarScores} size={380} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 1.5. STRATEGIC POSITIONING (Archetype + Antifragility) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* ANTIFRAGILITY GAUGE */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] bg-card/40 border border-border/40 relative overflow-hidden group shadow-2xl"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-5 print:hidden">
                                <Zap className="h-32 w-32" />
                            </div>

                            <div className="flex flex-col items-center text-center space-y-6">
                                <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-1 rounded-full font-black tracking-widest italic uppercase">
                                    {dict.report.antifragility_index}
                                </Badge>

                                <div className="relative h-48 w-48 flex items-center justify-center">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle
                                            cx="96"
                                            cy="96"
                                            r="80"
                                            fill="transparent"
                                            stroke="currentColor"
                                            strokeWidth="12"
                                            className="text-muted/10"
                                        />
                                        <motion.circle
                                            cx="96"
                                            cy="96"
                                            r="80"
                                            fill="transparent"
                                            stroke="currentColor"
                                            strokeWidth="12"
                                            strokeDasharray={2 * Math.PI * 80}
                                            initial={{ strokeDashoffset: 2 * Math.PI * 80 }}
                                            whileInView={{ strokeDashoffset: 2 * Math.PI * 80 * (1 - (diagnosis.v3Insights?.antifragilityScore || 50) / 100) }}
                                            transition={{ duration: 2, ease: "easeOut" }}
                                            strokeLinecap="round"
                                            className="text-primary drop-shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-5xl font-black italic">{diagnosis.v3Insights?.antifragilityScore || '--'}%</span>
                                        <span className="text-[10px] uppercase font-black tracking-widest opacity-40">
                                            {dict.report.neural_resilience}
                                        </span>
                                    </div>
                                </div>

                                <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                                    {dict.report.resilience_desc}
                                </p>
                            </div>
                        </motion.div>

                        {/* NEURAL ARCHETYPE */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] bg-gradient-to-br from-primary/5 via-card/40 to-card/20 border border-primary/20 relative overflow-hidden group shadow-2xl"
                        >
                            <div className="absolute bottom-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity print:hidden">
                                <Sparkles className="h-48 w-48 text-primary" />
                            </div>

                            <div className="relative z-10 space-y-8">
                                <div className="space-y-2">
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary opacity-60 italic">
                                        {dict.report.state_identity}
                                    </span>
                                    <h3 className="text-2xl sm:text-4xl font-black uppercase tracking-tighter leading-tight italic">
                                        {diagnosis.v3Insights?.archetype}
                                    </h3>
                                </div>

                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 rounded-2xl bg-background/50 border border-border/10 space-y-1">
                                            <span className="text-[9px] font-black uppercase tracking-widest opacity-40">{dict.report.tendency}</span>
                                            <p className="text-xs font-bold">{dict.report.tendency_adaptive}</p>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-background/50 border border-border/10 space-y-1">
                                            <span className="text-[9px] font-black uppercase tracking-widest opacity-40">{dict.report.risk_label}</span>
                                            <p className="text-xs font-bold text-rose-500">{dict.report.risk_latent_burnout}</p>
                                        </div>
                                    </div>

                                    <p className="text-muted-foreground text-sm leading-relaxed italic">
                                        {dict.report.archetype_desc}
                                    </p>

                                    <div className="pt-4 flex items-center justify-between">
                                        <div className="flex -space-x-2">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="h-8 w-8 rounded-full border-2 border-background bg-muted flex items-center justify-center overflow-hidden">
                                                    <div className="h-full w-full bg-gradient-to-br from-primary/40 to-primary/10" />
                                                </div>
                                            ))}
                                        </div>
                                        <span className="text-[10px] font-bold opacity-30">
                                            {dict.report.profile_shared_by}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {!isUnlocked && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative p-12 rounded-[3.5rem] bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 backdrop-blur-xl overflow-hidden shadow-2xl text-center space-y-6">
                            <Lock className="h-12 w-12 mx-auto text-primary/40" />
                            <h3 className="text-3xl font-black font-heading tracking-tight">{dict.report.unlock_title}</h3>
                            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{dict.report.unlock_desc}</p>
                            <Link href={`/${lang}/checkout/${id}`} className="inline-block">
                                <Button size="lg" className="gap-2 shadow-xl shadow-primary/20 font-bold h-14 px-8">{dict.report.unlock_button} <ArrowRight className="h-4 w-4" /></Button>
                            </Link>
                        </motion.div>
                    )}

                    {isUnlocked && (() => {
                        const icons = [Activity, Briefcase, Users, Wallet, Fingerprint, Palmtree, Compass];
                        const dimensions = diagnosis.pillarScores.map((p, i) => ({
                            ...p,
                            icon: icons[i] || Activity
                        }));

                        return (
                            <>
                                {/* 2. INTELLIGENCE BLOCK (AI + SYSTEMIC) */}
                                <div className="space-y-8">
                                    <div className="flex items-center gap-4">
                                        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-primary/20" />
                                        <Badge className="bg-primary text-primary-foreground font-black px-4 py-1 rounded-full shadow-lg shadow-primary/20">{dict.report.systemic_intelligence}</Badge>
                                        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-primary/20" />
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                        <div className="lg:col-span-8 flex flex-col gap-8">
                                            <Card className="bg-primary/5 border-primary/20 rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 space-y-6 shadow-2xl relative overflow-hidden group flex-1 print:bg-white print:border-black/20">
                                                {isAiLoading ? (
                                                    <div className="animate-pulse space-y-4 print:hidden">
                                                        <div className="h-8 w-1/3 bg-primary/10 rounded" />
                                                        <div className="h-32 bg-primary/5 rounded" />
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform print:hidden"><Brain className="h-24 w-24 text-primary" /></div>
                                                        <div className="space-y-4 relative z-10">
                                                            <h3 className="text-2xl font-black font-heading tracking-tight italic uppercase print:text-black">{dict.report.executive_summary}</h3>
                                                            <p className="text-base sm:text-lg md:text-xl text-foreground font-medium leading-relaxed italic whitespace-pre-wrap print:text-black print:not-italic">
                                                                {diagnosis.v3Insights?.aiAnalysis?.executiveSummary || (lang === 'pt' ? "Processando padrões neurais..." : lang === 'es' ? "Procesando patrones neurales..." : "Processing neural patterns...")}
                                                            </p>
                                                        </div>
                                                    </>
                                                )}
                                            </Card>

                                            <Card className="bg-card/40 dark:bg-zinc-900/30 border-border dark:border-white/5 backdrop-blur-sm p-8 rounded-[2rem] shadow-xl italic text-muted-foreground flex items-center gap-6">
                                                <MessageSquare className="h-8 w-8 text-primary/40 shrink-0" />
                                                <p className="text-base font-medium leading-relaxed">"{qualitativeContext || (lang === 'pt' ? "Análise baseada estritamente nas respostas quantitativas." : lang === 'es' ? "Análisis basado estrictamente en respuestas cuantitativas." : "Analysis based strictly on quantitative responses.")}"</p>
                                            </Card>
                                        </div>

                                        <div className="lg:col-span-4 space-y-8">
                                            <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 backdrop-blur-xl flex flex-col items-center text-center space-y-4">
                                                <ShieldCheck className="h-8 w-8 text-primary" />
                                                <div className="space-y-1">
                                                    <h4 className="text-[10px] uppercase font-black tracking-[0.3em] text-primary">{dict.report.antifragility_index}</h4>
                                                    <div className="text-5xl font-black">{diagnosis.v3Insights?.antifragilityScore}%</div>
                                                </div>
                                                <p className="text-xs text-muted-foreground leading-relaxed">{dict.report.antifragility_desc}</p>
                                            </div>

                                            <div className="p-8 rounded-[2.5rem] bg-card/40 dark:bg-zinc-900/30 border border-border dark:border-white/5 backdrop-blur-md space-y-6">
                                                <div className="flex items-center gap-3"><InfinityIcon className="h-5 w-5 text-primary" /><h4 className="text-sm font-black uppercase tracking-widest italic">{dict.report.ripple_effect}</h4></div>
                                                <div className="space-y-3">
                                                    {diagnosis.v3Insights?.correlations.slice(0, 3).map((correlation, i) => (
                                                        <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border/10 text-xs font-medium"><Activity className="h-4 w-4 text-primary shrink-0" />{correlation}</div>
                                                    ))}
                                                </div>
                                                <div className="pt-4 border-t border-border/10 flex justify-between items-center">
                                                    <div className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">{dict.report.archetype}</div>
                                                    <div className="text-xs font-black text-primary uppercase">{diagnosis.v3Insights?.archetype}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 3. STRATEGIC ACTION BLOCK */}
                                <div className="space-y-10 pt-16">
                                    <h2 className="text-3xl font-black font-heading tracking-tight italic uppercase text-center lg:text-left">{dict.report.strategic_plan}</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
                                        {(diagnosis.v3Insights?.aiAnalysis?.sevenDayPlan ||
                                            demoAiAnalysis.sevenDayPlan
                                        ).map((plan: { day: string; action: string; pilar: string }, i: number) => (
                                            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="flex flex-col p-5 rounded-2xl bg-muted/40 dark:bg-zinc-900/60 border border-border/40 hover:border-primary/40 transition-all group min-h-[160px]">
                                                <div className="text-[10px] font-black text-primary mb-3 flex justify-between"><span>{plan.day}</span><Badge variant="outline" className="text-[8px] px-1 py-0">{plan.pilar}</Badge></div>
                                                <div className="text-xs font-bold leading-tight group-hover:text-primary transition-colors flex-1">{plan.action}</div>
                                            </motion.div>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                        {[
                                            { icon: Zap, label: dict.report.immediate_win || "Immediate Win", value: diagnosis.report?.immediate_win, color: "text-blue-500" },
                                            { icon: AlertTriangle, label: dict.report.no_to_say || "The NO to Say", value: diagnosis.report?.the_no_to_say, color: "text-rose-500" },
                                            { icon: Target, label: dict.report.mindset_shift || "Mindset Shift", value: diagnosis.report?.mindset_shift, color: "text-amber-500" },
                                        ].map((item: { icon: any; label: string; value: string | undefined; color: string }, i: number) => (
                                            <div key={i} className="p-8 rounded-[2rem] bg-card/40 dark:bg-zinc-900/40 border border-border/40 flex flex-col gap-4">
                                                <item.icon className={`h-6 w-6 ${item.color}`} />
                                                <div className="space-y-1"><h4 className="text-[10px] uppercase font-black tracking-widest opacity-40">{item.label}</h4><p className="text-lg font-bold leading-tight">"{item.value}"</p></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-10 pt-16">
                                    <div className="space-y-4 text-center lg:text-left">
                                        <h3 className="text-3xl font-black font-heading tracking-tight italic uppercase text-primary/80">{dict.report.results_by_pillar}</h3>
                                        <p className="text-muted-foreground text-sm font-medium max-w-2xl">{lang === 'pt' ? 'Uma análise profunda de cada área fundamental da sua existência, priorizando o seu maior gargalo atual.' : lang === 'es' ? 'Un análisis profundo de cada área fundamental de tu existencia, priorizando tu mayor cuello de botella actual.' : 'A deep analysis of each fundamental area of your existence, prioritizing your biggest current bottleneck.'}</p>
                                    </div>

                                    {/* PILLAR HIERARCHY: Featured (Bottleneck) + Grid (Others) */}
                                    <div className="space-y-8">
                                        {/* 1. Featured Alpha Pillar (The Bottleneck) */}
                                        {(() => {
                                            const bottleneckLabel = diagnosis?.v3Insights?.bottleneckLabel;
                                            const bottleneck = dimensions.find(p => p.label === bottleneckLabel) ||
                                                dimensions.reduce((lowest, current) => current.value < lowest.value ? current : lowest, dimensions[0]);
                                            const Icon = (bottleneck as any).icon || Activity;

                                            return (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 20 }}
                                                    whileInView={{ opacity: 1, y: 0 }}
                                                    className="relative p-6 sm:p-10 md:p-14 rounded-[2.5rem] sm:rounded-[3.5rem] bg-gradient-to-br from-rose-500/10 via-card/40 to-card/20 border border-rose-500/20 shadow-2xl overflow-hidden group"
                                                >
                                                    <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity print:hidden">
                                                        <Icon className="h-48 w-48 text-rose-500" />
                                                    </div>

                                                    <div className="relative z-10 grid md:grid-cols-12 gap-10 items-center">
                                                        <div className="md:col-span-4 space-y-6">
                                                            <Badge className="bg-rose-500 text-white border-none px-4 py-1.5 rounded-full font-black tracking-widest italic animate-pulse">
                                                                {dict.report.alpha_priority}
                                                            </Badge>
                                                            <div className="space-y-2">
                                                                <h4 className="text-2xl sm:text-4xl font-black uppercase tracking-tighter italic">{bottleneck.label}</h4>
                                                                <div className="text-4xl sm:text-6xl font-black text-rose-500">{bottleneck.value}%</div>
                                                            </div>
                                                        </div>

                                                        <div className="md:col-span-8 space-y-8">
                                                            <p className="text-xl md:text-2xl text-foreground font-medium leading-relaxed italic">
                                                                "{bottleneck.insight}"
                                                            </p>
                                                            <div className="space-y-4">
                                                                <div className="h-3 w-full bg-muted/30 rounded-full overflow-hidden border border-border/10">
                                                                    <motion.div
                                                                        initial={{ width: 0 }}
                                                                        whileInView={{ width: `${bottleneck.value}%` }}
                                                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                                                        className="h-full bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.4)]"
                                                                    />
                                                                </div>
                                                                <p className="text-xs uppercase tracking-[0.2em] font-black text-muted-foreground opacity-60">
                                                                    {dict.report.bottleneck_neural}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })()}

                                        {/* 2. Secondary Pillars Grid (The remaining 6) */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {(() => {
                                                const bottleneckLabel = diagnosis?.v3Insights?.bottleneckLabel;
                                                const bottleneck = dimensions.find(p => p.label === bottleneckLabel) ||
                                                    dimensions.reduce((lowest, current) => current.value < lowest.value ? current : lowest, dimensions[0]);

                                                return dimensions.filter(p => p.label !== bottleneck.label).map((pilar: any, i: number) => {
                                                    const Icon = pilar.icon || Activity;
                                                    return (
                                                        <motion.div
                                                            key={i}
                                                            initial={{ opacity: 0, y: 20 }}
                                                            whileInView={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: i * 0.05 }}
                                                            className="group relative p-8 rounded-[2.5rem] bg-card/30 dark:bg-zinc-900/40 border border-border/40 hover:border-primary/30 transition-all shadow-xl flex flex-col gap-6 overflow-hidden"
                                                        >
                                                            <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity print:hidden">
                                                                <Icon className="h-20 w-20" style={{ color: pilar.color }} />
                                                            </div>

                                                            <div className="flex items-center justify-between relative z-10">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="p-2 rounded-xl bg-background/50 border border-border/10">
                                                                        <Icon className="h-5 w-5" style={{ color: pilar.color }} />
                                                                    </div>
                                                                    <h4 className="text-sm font-black uppercase tracking-tight italic">{pilar.label}</h4>
                                                                </div>
                                                                <div className="text-lg font-black italic" style={{ color: pilar.color }}>{pilar.value}%</div>
                                                            </div>

                                                            <div className="space-y-4 relative z-10">
                                                                <p className="text-xs text-muted-foreground leading-relaxed font-medium line-clamp-3 group-hover:line-clamp-none transition-all duration-500">
                                                                    {pilar.insight}
                                                                </p>

                                                                <div className="h-1.5 w-full bg-muted/30 rounded-full overflow-hidden border border-border/5">
                                                                    <motion.div
                                                                        initial={{ width: 0 }}
                                                                        whileInView={{ width: `${pilar.value}%` }}
                                                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                                                        className="h-full shadow-[0_0_10px_rgba(var(--primary),0.2)]"
                                                                        style={{ backgroundColor: pilar.color }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    );
                                                });
                                            })()}
                                        </div>
                                    </div>
                                </div>

                                {/* 4.6. FUTURE STATE PROJECTION (90-Day Forecast) */}
                                <div className="space-y-10 pt-24">
                                    <div className="space-y-4 text-center">
                                        <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-1 rounded-full font-black tracking-widest italic uppercase">
                                            {dict.report.predictive_projection}
                                        </Badge>
                                        <h3 className="text-3xl font-black font-heading tracking-tight italic uppercase text-foreground/80">
                                            {dict.report.future_90_days}
                                        </h3>
                                        <p className="text-muted-foreground text-sm font-medium max-w-2xl mx-auto">
                                            {dict.report.projection_desc}
                                        </p>
                                    </div>

                                    <div className="p-10 rounded-[3rem] bg-card/40 border border-border/40 shadow-2xl relative overflow-hidden">
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                                            <div className="space-y-8">
                                                {[
                                                    {
                                                        label: dict.report.evolution_trajectory,
                                                        desc: dict.report.trajectory_desc,
                                                        target: 85,
                                                        color: 'text-primary',
                                                        bg: 'bg-primary'
                                                    },
                                                    {
                                                        label: dict.report.price_of_inertia,
                                                        desc: dict.report.inertia_desc,
                                                        target: 42,
                                                        color: 'text-rose-500',
                                                        bg: 'bg-rose-500'
                                                    }
                                                ].map((path, i) => (
                                                    <div key={i} className="space-y-4">
                                                        <div className="flex justify-between items-end">
                                                            <div className="space-y-1">
                                                                <span className={`text-xs font-black uppercase tracking-widest ${path.color}`}>{path.label}</span>
                                                                <p className="text-[10px] text-muted-foreground font-medium italic">{path.desc}</p>
                                                            </div>
                                                            <span className={`text-lg font-black italic ${path.color}`}>{path.target}%</span>
                                                        </div>
                                                        <div className="h-2 w-full bg-muted/20 rounded-full overflow-hidden">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                whileInView={{ width: `${path.target}%` }}
                                                                transition={{ duration: 2, delay: i * 0.3 }}
                                                                className={`h-full ${path.bg} shadow-[0_0_15px_rgba(var(--primary),0.3)]`}
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="p-8 rounded-2xl bg-muted/20 border border-border/40 space-y-4 flex flex-col justify-center text-center italic">
                                                <Sparkles className="h-6 w-6 text-primary mx-auto opacity-40 print:hidden" />
                                                <p className="text-sm text-foreground/80 leading-relaxed font-medium">
                                                    {dict.report.forecast_quote}
                                                </p>
                                                <span className="text-[9px] font-black uppercase tracking-[0.4em] opacity-40">
                                                    {dict.report.forecast_calc_label}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 4.7. STOIC NEURO-PROTOCOL (The Command) */}
                                <div className="space-y-10 pt-24">
                                    <div className="p-8 sm:p-12 md:p-16 rounded-[2.5rem] sm:rounded-[4rem] bg-gradient-to-br from-zinc-900 to-black border border-primary/30 relative overflow-hidden group shadow-[0_0_50px_rgba(var(--primary),0.1)]">
                                        <div className="absolute top-0 right-0 p-12 opacity-[0.05] group-hover:rotate-45 transition-transform duration-1000 print:hidden">
                                            <InfinityIcon className="h-64 w-64 text-primary" />
                                        </div>

                                        <div className="relative z-10 grid lg:grid-cols-12 gap-12 items-center">
                                            <div className="lg:col-span-4 space-y-6">
                                                <Badge className="bg-primary text-primary-foreground border-none px-4 py-1.5 rounded-full font-black tracking-widest italic">
                                                    {dict.report.practical_protocol}
                                                </Badge>
                                                <div className="space-y-2">
                                                    <h3 className="text-5xl font-black uppercase tracking-tighter leading-[0.9] italic text-white">
                                                        Stoic<br />Neuro<br />Protocol
                                                    </h3>
                                                    <p className="text-xs text-primary font-black uppercase tracking-widest opacity-80">
                                                        {dict.report.immediate_command}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="lg:col-span-8 space-y-8">
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                    {[
                                                        {
                                                            step: "01",
                                                            label: dict.report.shift_label,
                                                            text: dict.report.shift_desc
                                                        },
                                                        {
                                                            step: "02",
                                                            label: dict.report.focus_label,
                                                            text: dict.report.focus_desc
                                                        },
                                                        {
                                                            step: "03",
                                                            label: dict.report.act_label,
                                                            text: dict.report.act_desc
                                                        },
                                                    ].map((item, i) => (
                                                        <div key={i} className="space-y-3">
                                                            <span className="text-3xl font-black italic text-primary/40">{item.step}</span>
                                                            <div className="h-px w-8 bg-primary/20" />
                                                            <h4 className="text-xs font-black uppercase tracking-widest text-white">{item.label}</h4>
                                                            <p className="text-[11px] text-zinc-400 font-medium italic">{item.text}</p>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                                                    <p className="text-sm md:text-base text-zinc-300 font-serif leading-relaxed italic">
                                                        {dict.report.protocol_quote}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 4.8. STRATEGIC LEVERAGE & RISKS */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-20">
                                    {/* IMPACT LEVERAGE: The 1% Action */}
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        className="p-10 rounded-[3rem] bg-gradient-to-br from-primary/20 via-primary/5 to-transparent border border-primary/30 relative overflow-hidden group shadow-2xl"
                                    >
                                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform print:hidden">
                                            <Zap className="h-24 w-24 text-primary" />
                                        </div>

                                        <div className="relative z-10 space-y-6">
                                            <Badge className="bg-primary text-primary-foreground border-none px-4 py-1 rounded-full font-black tracking-widest italic animate-bounce">
                                                {dict.report.impact_leverage}
                                            </Badge>

                                            <div className="space-y-2">
                                                <h3 className="text-3xl font-black uppercase tracking-tighter leading-tight italic">
                                                    {dict.report.golden_action}
                                                </h3>
                                                <p className="text-sm text-muted-foreground font-medium italic">
                                                    {dict.report.golden_action_desc}
                                                </p>
                                            </div>

                                            <div className="p-6 rounded-2xl bg-background/60 border border-primary/20 shadow-inner">
                                                <p className="text-lg font-black italic text-foreground leading-relaxed">
                                                    "{(() => {
                                                        const bKey = rawDiagnosis?.v3Insights?.bottleneckPillarKey || 'SAUDE';
                                                        return dict.leverages[bKey] || dict.leverages['SAUDE'];
                                                    })()}"
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>

                                    {/* NEURAL RISK WARNINGS: Loss Aversion */}
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        className="p-10 rounded-[3rem] bg-card/40 border border-rose-500/20 relative overflow-hidden group shadow-2xl"
                                    >
                                        <div className="absolute bottom-0 right-0 p-8 opacity-[0.03] group-hover:rotate-12 transition-transform print:hidden">
                                            <AlertTriangle className="h-32 w-32 text-rose-500" />
                                        </div>

                                        <div className="relative z-10 space-y-6">
                                            <Badge variant="outline" className="border-rose-500/40 text-rose-500 px-4 py-1 rounded-full font-black tracking-widest italic uppercase">
                                                {dict.report.risk_warnings}
                                            </Badge>

                                            <div className="space-y-4">
                                                {dict.report.risk_warnings_data.map((warning: any, i: number) => (
                                                    <div key={i} className="flex gap-4 items-start p-4 rounded-2xl bg-rose-500/5 border border-rose-500/10 hover:bg-rose-500/10 transition-colors group/item">
                                                        <div className="h-2 w-2 rounded-full bg-rose-500 mt-2 group-hover/item:animate-ping" />
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs font-black uppercase italic">{warning.label}</span>
                                                                <Badge className="text-[8px] bg-rose-500/10 text-rose-500 border-none px-1.5 py-0">Risk: {warning.risk}</Badge>
                                                            </div>
                                                            <p className="text-[11px] text-muted-foreground font-medium italic leading-relaxed">{warning.desc}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <p className="text-[10px] text-muted-foreground opacity-40 italic font-medium">
                                                * {dict.report.risk_calculation_note}
                                            </p>
                                        </div>
                                    </motion.div>
                                </div>

                                {/* 5. DEEP DIVE ANALYSIS */}
                                <div className="space-y-10 pt-20">
                                    <div className="flex items-center gap-4">
                                        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-primary/40" />
                                        <h2 className="text-4xl font-black font-heading tracking-tight italic uppercase text-center">{dict.report.deep_dive_title}</h2>
                                        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-primary/40" />
                                    </div>
                                    <Card className="bg-muted/30 dark:bg-zinc-900/40 border-border/40 rounded-[3rem] p-12 md:p-16 shadow-inner relative overflow-hidden">
                                        {isAiLoading ? (
                                            <div className="space-y-6 print:hidden">
                                                <div className="h-4 bg-primary/10 rounded w-full animate-pulse" />
                                                <div className="h-4 bg-primary/10 rounded w-5/6 animate-pulse" />
                                                <div className="h-4 bg-primary/10 rounded w-4/6 animate-pulse" />
                                            </div>
                                        ) : (
                                            <div className="prose prose-invert prose-lg max-w-none text-foreground/80 dark:text-white/70 leading-[1.8] font-medium space-y-8 print:text-black">
                                                {(((diagnosis.v3Insights?.aiAnalysis as any)?.deepDiveAnalysis || (demoAiAnalysis as any).deepDiveAnalysis) as string).split('\n\n').map((paragraph: string, idx: number) => (
                                                    <p key={idx} className="first-letter:text-4xl first-letter:font-black first-letter:text-primary first-letter:float-left first-letter:mr-3 first-letter:mt-1 print:first-letter:text-black print:not-italic">
                                                        {paragraph}
                                                    </p>
                                                ))}
                                            </div>
                                        )}
                                        <div className="absolute bottom-0 right-0 p-12 opacity-[0.02] pointer-events-none print:hidden">
                                            <Search className="h-64 w-64 text-primary" />
                                        </div>
                                    </Card>
                                </div>

                                {/* 5.5. NEURAL LIBRARY (Curated Readings) */}
                                <div className="space-y-10 pt-24">
                                    <div className="space-y-4 text-center">
                                        <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-1 rounded-full font-black tracking-widest italic uppercase">
                                            {dict.report.neural_library}
                                        </Badge>
                                        <h3 className="text-3xl font-black font-heading tracking-tight italic uppercase text-foreground/80">
                                            {dict.report.strategic_readings}
                                        </h3>
                                        <p className="text-muted-foreground text-sm font-medium max-w-2xl mx-auto">
                                            {dict.report.library_desc}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                        {(() => {
                                            const bottleneckLabel = diagnosis?.v3Insights?.bottleneckLabel;

                                            // Tri-lingual book map
                                            const bookMap: Record<string, Record<Locale, { title: string, author: string, desc: string }[]>> = {
                                                'Clareza Cognitiva': {
                                                    pt: [
                                                        { title: 'Foco', author: 'Daniel Goleman', desc: 'A atenção como o motor oculto da excelência.' },
                                                        { title: 'The Organized Mind', author: 'Daniel Levitin', desc: 'Como lidar com o excesso de informação.' },
                                                        { title: 'Pense de novo', author: 'Adam Grant', desc: 'O poder de saber o que você não sabe.' }
                                                    ],
                                                    en: [
                                                        { title: 'Focus', author: 'Daniel Goleman', desc: 'The hidden driver of excellence.' },
                                                        { title: 'The Organized Mind', author: 'Daniel Levitin', desc: 'Organizing your life in the age of information overload.' },
                                                        { title: 'Think Again', author: 'Adam Grant', desc: 'The power of knowing what you don\'t know.' }
                                                    ],
                                                    es: [
                                                        { title: 'Enfoque', author: 'Daniel Goleman', desc: 'El motor oculto de la excelencia.' },
                                                        { title: 'La Mente Organizada', author: 'Daniel Levitin', desc: 'Cómo manejar el exceso de información.' },
                                                        { title: 'Piénsalo de nuevo', author: 'Adam Grant', desc: 'El poder de saber lo que no sabes.' }
                                                    ]
                                                },
                                                'Energia Vital': {
                                                    pt: [
                                                        { title: 'Por que nós dormimos', author: 'Matthew Walker', desc: 'A ciência do sono e do sonho.' },
                                                        { title: 'Why Zebras Don\'t Get Ulcers', author: 'Robert Sapolsky', desc: 'O guia definitivo sobre o estresse.' },
                                                        { title: 'Breath', author: 'James Nestor', desc: 'A nova ciência de uma arte perdida.' }
                                                    ],
                                                    en: [
                                                        { title: 'Why We Sleep', author: 'Matthew Walker', desc: 'Unlocking the power of sleep and dreams.' },
                                                        { title: 'Why Zebras Don\'t Get Ulcers', author: 'Robert Sapolsky', desc: 'The acclaimed guide to stress and coping.' },
                                                        { title: 'Breath', author: 'James Nestor', desc: 'The new science of a lost art.' }
                                                    ],
                                                    es: [
                                                        { title: 'Por qué dormimos', author: 'Matthew Walker', desc: 'La nueva ciencia del sueño y los sueños.' },
                                                        { title: '¿Por qué as cebras no tienen úlcera?', author: 'Robert Sapolsky', desc: 'La guía definitiva sobre el estrés.' },
                                                        { title: 'Respira', author: 'James Nestor', desc: 'La nueva ciencia de um arte perdido.' }
                                                    ]
                                                },
                                                'Arquitetura de Hábitos': {
                                                    pt: [
                                                        { title: 'Hábitos Atômicos', author: 'James Clear', desc: 'Um método fácil para criar bons hábitos.' },
                                                        { title: 'O Poder do Hábito', author: 'Charles Duhigg', desc: 'Por que fazemos o que fazemos.' },
                                                        { title: 'Tiny Habits', author: 'BJ Fogg', desc: 'Pequenas mudanças que mudam tudo.' }
                                                    ],
                                                    en: [
                                                        { title: 'Atomic Habits', author: 'James Clear', desc: 'An easy and proven way to build good habits.' },
                                                        { title: 'The Power of Habit', author: 'Charles Duhigg', desc: 'Why we do what we do in life and business.' },
                                                        { title: 'Tiny Habits', author: 'BJ Fogg', desc: 'The small changes that change everything.' }
                                                    ],
                                                    es: [
                                                        { title: 'Hábitos Atómicos', author: 'James Clear', desc: 'Un método sencillo para crear buenos hábitos.' },
                                                        { title: 'El Poder de los Hábitos', author: 'Charles Duhigg', desc: 'Por qué hacemos lo que hacemos.' },
                                                        { title: 'Pequeños Hábitos', author: 'BJ Fogg', desc: 'Los pequeños cambios que lo cambian todo.' }
                                                    ]
                                                },
                                                'Estabilidade Emocional': {
                                                    pt: [
                                                        { title: 'O Obstáculo é o Caminho', author: 'Ryan Holiday', desc: 'A arte milenar de transformar desafios em vitórias.' },
                                                        { title: 'Mindset', author: 'Carol Dweck', desc: 'A nova psicologia do sucesso.' },
                                                        { title: 'Inteligência Emocional', author: 'Daniel Goleman', desc: 'Por que a QE importa mais que o QI.' }
                                                    ],
                                                    en: [
                                                        { title: 'The Obstacle Is the Way', author: 'Ryan Holiday', desc: 'The timeless art of turning trials into triumph.' },
                                                        { title: 'Mindset', author: 'Carol Dweck', desc: 'The new psychology of success.' },
                                                        { title: 'Emotional Intelligence', author: 'Daniel Goleman', desc: 'Why it can matter more than IQ.' }
                                                    ],
                                                    es: [
                                                        { title: 'El Obstáculo es el Camino', author: 'Ryan Holiday', desc: 'El arte de convertir las pruebas en triunfo.' },
                                                        { title: 'Mentalidad', author: 'Carol Dweck', desc: 'La nueva psicología del éxito.' },
                                                        { title: 'Inteligencia Emocional', author: 'Daniel Goleman', desc: 'Por qué es más importante que el CI.' }
                                                    ]
                                                },
                                                'Poder Executivo': {
                                                    pt: [
                                                        { title: 'Trabalho Focado (Deep Work)', author: 'Cal Newport', desc: 'Como ter sucesso em um mundo distraído.' },
                                                        { title: 'Execução', author: 'Larry Bossidy', desc: 'A disciplina para atingir resultados.' },
                                                        { title: 'Primeiro o Mais Importante', author: 'Stephen Covey', desc: 'Vivendo com senso de prioridade.' }
                                                    ],
                                                    en: [
                                                        { title: 'Deep Work', author: 'Cal Newport', desc: 'Rules for focused success in a distracted world.' },
                                                        { title: 'Execution', author: 'Larry Bossidy', desc: 'The discipline of getting things done.' },
                                                        { title: 'First Things First', author: 'Stephen Covey', desc: 'To live, to love, to learn, to leave a legacy.' }
                                                    ],
                                                    es: [
                                                        { title: 'Enfócate (Deep Work)', author: 'Cal Newport', desc: 'Reglas para el éxito en un mundo distraído.' },
                                                        { title: 'Ejecución', author: 'Larry Bossidy', desc: 'La disciplina de obtener resultados.' },
                                                        { title: 'Primero lo Primero', author: 'Stephen Covey', desc: 'Viviendo con sentido de prioridad.' }
                                                    ]
                                                },
                                                'Resiliência Antifrágil': {
                                                    pt: [
                                                        { title: 'Antifrágil', author: 'Nassim Taleb', desc: 'Coisas que se beneficiam com o caos.' },
                                                        { title: 'A Única Coisa', author: 'Gary Keller', desc: 'O foco extraordinário para resultados.' },
                                                        { title: 'O Ego é o Inimigo', author: 'Ryan Holiday', desc: 'A batalha interna pela clareza.' }
                                                    ],
                                                    en: [
                                                        { title: 'Antifragile', author: 'Nassim Taleb', desc: 'Things that gain from disorder.' },
                                                        { title: 'The ONE Thing', author: 'Gary Keller', desc: 'The surprisingly simple truth behind extraordinary results.' },
                                                        { title: 'Ego Is the Enemy', author: 'Ryan Holiday', desc: 'The battle to master our greatest opponent.' }
                                                    ],
                                                    es: [
                                                        { title: 'Antifrágil', author: 'Nassim Taleb', desc: 'Cosas que se benefician del desorden.' },
                                                        { title: 'Solo una cosa', author: 'Gary Keller', desc: 'La verdad sobre los resultados extraordinarios.' },
                                                        { title: 'El Ego es el Enemigo', author: 'Ryan Holiday', desc: 'La batalla interna por la claridad.' }
                                                    ]
                                                },
                                                'Conexão Social': {
                                                    pt: [
                                                        { title: 'Como Fazer Amigos', author: 'Dale Carnegie', desc: 'O guia clássico para influenciar pessoas.' },
                                                        { title: 'As Armas da Persuasão', author: 'Robert Cialdini', desc: 'Como influenciar e não se deixar influenciar.' },
                                                        { title: 'A Coragem de ser Imperfeito', author: 'Brené Brown', desc: 'A coragem de ser vulnerável.' }
                                                    ],
                                                    en: [
                                                        { title: 'How to Win Friends', author: 'Dale Carnegie', desc: 'The only book you need to lead you to success.' },
                                                        { title: 'Influence', author: 'Robert Cialdini', desc: 'The psychology of persuasion.' },
                                                        { title: 'Daring Greatly', author: 'Brené Brown', desc: 'How the courage to be vulnerable transforms everything.' }
                                                    ],
                                                    es: [
                                                        { title: 'Cómo Ganar Amigos', author: 'Dale Carnegie', desc: 'El camino real hacia el éxito.' },
                                                        { title: 'Influencia', author: 'Robert Cialdini', desc: 'La psicología de la persuasión.' },
                                                        { title: 'El poder de ser vulnerable', author: 'Brené Brown', desc: 'La valentía de ser imperfecto.' }
                                                    ]
                                                }
                                            };

                                            const pillarBooks = bookMap[bottleneckLabel || ''] || bookMap['Poder Executivo'];
                                            const recommendations = pillarBooks[lang] || pillarBooks['en'];

                                            return recommendations.map((book, i) => (
                                                <motion.div
                                                    key={i}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    whileInView={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: i * 0.1 }}
                                                    className="group relative p-8 rounded-[2rem] bg-card/40 border border-border/40 hover:border-primary/20 transition-all shadow-xl overflow-hidden flex flex-col gap-6"
                                                >
                                                    <div className="absolute -right-2 -top-2 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity print:hidden">
                                                        <BookOpen className="h-24 w-24" />
                                                    </div>

                                                    <div className="space-y-2 relative z-10">
                                                        <div className="h-12 w-1 bg-primary/20 absolute -left-8 top-0 group-hover:bg-primary transition-colors" />
                                                        <h4 className="text-xl font-black italic tracking-tight leading-tight">{book.title}</h4>
                                                        <p className="text-[10px] uppercase font-black text-primary tracking-widest">{book.author}</p>
                                                    </div>

                                                    <p className="text-xs text-muted-foreground leading-relaxed italic flex-1">
                                                        "{book.desc}"
                                                    </p>

                                                    <Button variant="ghost" size="sm" className="w-fit p-0 h-auto text-[9px] font-black uppercase tracking-widest text-primary/60 hover:text-primary group-hover:translate-x-1 transition-all">
                                                        {dict.report.explore_knowledge} →
                                                    </Button>
                                                </motion.div>
                                            ));
                                        })()}
                                    </div>
                                </div>
                                <div className="pt-24 pb-12">
                                    <Card className="bg-gradient-to-br from-zinc-900 to-black border-primary/20 p-12 rounded-[4rem] text-center space-y-10 relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <InfinityIcon className="h-12 w-12 mx-auto text-primary/40 animate-pulse print:hidden" />
                                        <div className="space-y-4 relative z-10">
                                            <h3 className="text-3xl font-black font-heading tracking-tight italic uppercase print:text-black">{dict.report.stoic_refinement}</h3>
                                            <p className="text-xl md:text-2xl text-foreground font-serif leading-relaxed italic max-w-4xl mx-auto print:text-black">
                                                "{diagnosis.v3Insights?.aiAnalysis?.stoicRefinement || demoAiAnalysis.stoicRefinement}"
                                            </p>
                                        </div>
                                        <div className="pt-8 flex justify-center gap-4 relative z-10 no-print">
                                            <Button className="rounded-full px-8 shadow-lg shadow-primary/20 uppercase font-black tracking-widest text-[10px]" onClick={handlePrint}>{dict.report.download_report}</Button>
                                        </div>
                                    </Card>
                                </div>

                                <footer className="pt-20 pb-12 flex flex-col items-center gap-6 text-center opacity-30 no-print">
                                    <div className="h-px w-32 bg-primary/20" />
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-[0.5em]">{dict.common.title} v4 Platinum Edition</p>
                                        <p className="text-[8px] uppercase font-bold tracking-[0.3em]">
                                            {dict.common.subtitle_report}
                                        </p>
                                    </div>
                                </footer>
                            </>
                        );
                    })()}
                </div >
            </main >
        </div >
    );
}
