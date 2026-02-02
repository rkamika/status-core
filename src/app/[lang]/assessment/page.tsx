"use client";

import Link from "next/link";
import { useState, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { LanguageSelector } from "@/components/language-selector";
import { ThemeToggle } from "@/components/theme-toggle";
import { QUESTION_METADATA, Locale } from "@/lib/diagnostic";
import { getDictionary } from "@/lib/get-dictionary";
import { Logo } from "@/components/logo";
import { trackFBEvent } from "@/components/meta-pixel";
import { trackSignUp } from "@/lib/gtm";
import { useEffect } from "react";

export default function AssessmentPage({ params }: { params: Promise<{ lang: Locale }> }) {
    const { lang } = use(params);
    const dict = use(getDictionary(lang));

    const questions = QUESTION_METADATA;
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [qualitative, setQualitative] = useState("");

    useEffect(() => {
        trackFBEvent('ViewContent', {
            content_name: 'Emotional Diagnostic Assessment',
            content_category: 'Diagnostic'
        }, 'view_assessment');
    }, []);

    const isQualitativeStep = currentStep === questions.length;

    const handleAnswer = (value: number) => {
        setAnswers({ ...answers, [questions[currentStep].id]: value });
        if (currentStep < questions.length) {
            setTimeout(() => setCurrentStep(currentStep + 1), 200);
        }
    };

    const progress = (currentStep / (questions.length + 1)) * 100;
    const isLastStep = currentStep === questions.length;
    const hasAnsweredCurrent = isQualitativeStep ? qualitative.length > 5 : answers[questions[currentStep].id] !== undefined;

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <header className="px-4 lg:px-6 h-16 flex items-center border-b border-border/40 bg-background/95 backdrop-blur sticky top-0 z-50">
                <div className="container mx-auto flex items-center justify-between">
                    <Logo lang={lang} />
                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <LanguageSelector currentLang={lang} />
                        <div className="text-sm font-medium text-muted-foreground">
                            {dict.assessment.progress}: {Math.round(progress)}%
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-2xl space-y-6">
                    <div className="px-4">
                        <Progress value={progress} className="h-1.5 transition-all duration-700 ease-in-out" />
                    </div>

                    <div className="relative min-h-[300px] flex items-center">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStep}
                                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                                className="w-full space-y-6"
                            >
                                {isQualitativeStep ? (
                                    <div className="space-y-6 text-center w-full">
                                        <div className="space-y-2">
                                            <h2 className="text-xl md:text-3xl font-bold font-heading leading-tight tracking-tight">
                                                {dict.assessment.qualitative_title}
                                            </h2>
                                            <p className="text-muted-foreground text-sm max-w-lg mx-auto">
                                                {dict.assessment.qualitative_desc}
                                            </p>
                                        </div>
                                        <textarea
                                            value={qualitative}
                                            onChange={(e) => setQualitative(e.target.value)}
                                            placeholder={dict.assessment.qualitative_placeholder}
                                            className="w-full min-h-[120px] p-4 rounded-xl bg-muted/40 dark:bg-card/40 backdrop-blur-sm border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none font-medium"
                                        />
                                    </div>
                                ) : (
                                    <>
                                        <div className="space-y-4 text-center">
                                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest border border-primary/20">
                                                <Zap className="h-3 w-3" />
                                                {dict.assessment.question} {currentStep + 1} / {questions.length}
                                            </div>
                                            <h2 className="text-xl md:text-3xl font-bold font-heading leading-tight tracking-tight text-balance">
                                                {/* @ts-ignore - dynamic dictionary access */}
                                                {dict.assessment.questions_data?.[(currentStep + 1).toString()]?.text || questions[currentStep].text}
                                            </h2>
                                        </div>

                                        <div className="grid grid-cols-1 gap-2">
                                            {(() => {
                                                /* @ts-ignore */
                                                const customOptions = dict.assessment.questions_data?.[(currentStep + 1).toString()]?.options;
                                                const optionsList = customOptions ?
                                                    customOptions.map((label: string, i: number) => ({ val: i + 1, label })) :
                                                    [
                                                        { val: 1, label: dict.assessment.never },
                                                        { val: 2, label: dict.assessment.rarely },
                                                        { val: 3, label: dict.assessment.sometimes },
                                                        { val: 4, label: dict.assessment.often },
                                                        { val: 5, label: dict.assessment.always },
                                                    ];

                                                return optionsList.map(({ val, label }: { val: number, label: string }) => (
                                                    <button
                                                        key={val}
                                                        onClick={() => handleAnswer(val)}
                                                        className={`
                                                            group relative p-3 text-left rounded-xl border transition-all duration-300
                                                            active:scale-[0.99] hover:scale-[1.005]
                                                            ${answers[questions[currentStep].id] === val
                                                                ? 'bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20'
                                                                : 'bg-muted/40 dark:bg-card/40 backdrop-blur-sm border-border hover:border-primary/50 hover:bg-muted/60 dark:hover:bg-card/60 text-foreground'
                                                            }
                                                        `}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm font-bold font-heading">
                                                                {label}
                                                            </span>
                                                            <div className={`
                                                                w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors
                                                                ${answers[questions[currentStep].id] === val
                                                                    ? 'border-primary-foreground bg-primary-foreground text-primary'
                                                                    : 'border-muted-foreground/30 group-hover:border-primary/50'
                                                                }
                                                            `}>
                                                                {answers[questions[currentStep].id] === val && <div className="w-2 h-2 rounded-full bg-current" />}
                                                            </div>
                                                        </div>
                                                    </button>
                                                ));
                                            })()}
                                        </div>
                                    </>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <Button
                            variant="ghost"
                            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                            disabled={currentStep === 0}
                            className="gap-2 text-muted-foreground hover:text-foreground h-12 px-6"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            {dict.common.back}
                        </Button>

                        {isLastStep ? (
                            <Link
                                href={`/${lang}/preview?answers=${encodeURIComponent(JSON.stringify(answers))}&q=${encodeURIComponent(qualitative)}`}
                                className="w-full sm:w-auto"
                                onClick={() => trackSignUp()}
                            >
                                <Button size="lg" disabled={!hasAnsweredCurrent} className="w-full sm:w-auto gap-2 px-4 sm:px-10 h-12 font-bold shadow-xl shadow-primary/20 text-sm">
                                    {dict.common.finish}
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </Link>
                        ) : (
                            <Button
                                size="lg"
                                onClick={() => setCurrentStep(currentStep + 1)}
                                disabled={!hasAnsweredCurrent}
                                className="w-full sm:w-auto gap-2 px-4 sm:px-10 h-12 font-bold text-sm"
                            >
                                {dict.common.next}
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
