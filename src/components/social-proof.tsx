"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, ShoppingBag, Activity as ActivityIcon } from "lucide-react";
import { Locale } from "@/lib/diagnostic";

interface SocialProofProps {
    lang: Locale;
    type: "activity" | "purchase";
}

const DATA_BY_LANG = {
    pt: {
        names: ["Lucas", "Ana", "Mariana", "Gabriel", "Bruno", "Camila", "Rodrigo", "Juliana", "Felipe", "Beatriz", "Pedro", "Larissa", "Thiago", "Amanda", "Rafael"],
        cities: ["São Paulo", "Rio de Janeiro", "Belo Horizonte", "Curitiba", "Salvador", "Porto Alegre", "Brasília", "Fortaleza", "Recife", "Manaus", "Florianópolis", "Goiânia"],
        activity: "pessoas completaram o diagnóstico nas últimas 2 horas",
        purchase: "acabou de desbloquear o Relatório Platinum em",
    },
    es: {
        names: ["Diego", "Sofia", "Alejandro", "Valentina", "Mateo", "Isabella", "Javier", "Lucia", "Andrés", "Camila", "Sebastian", "Elena", "Manuel", "Martina", "Nicolas"],
        cities: ["Madrid", "Barcelona", "México DF", "Buenos Aires", "Bogotá", "Santiago", "Lima", "Valencia", "Sevilla", "Medellín", "Guadalajara", "Quito"],
        activity: "personas completaron el diagnóstico en las últimas 2 horas",
        purchase: "acaba de desbloquear el Informe Platinum en",
    },
    en: {
        names: ["James", "Emma", "Oliver", "Sophia", "William", "Isabella", "Henry", "Mia", "Alexander", "Charlotte", "Michael", "Amelia", "Daniel", "Evelyn", "Matthew"],
        cities: ["New York", "London", "Los Angeles", "Chicago", "Toronto", "Sydney", "Miami", "Austin", "Boston", "San Francisco", "Austin", "Denver"],
        activity: "people completed the diagnostic in the last 2 hours",
        purchase: "just unlocked the Platinum Report in",
    }
};

export function SocialProof({ lang, type }: SocialProofProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [currentData, setCurrentData] = useState({ name: "", city: "", count: 0 });
    const isEnabled = process.env.NEXT_PUBLIC_ENABLE_SOCIAL_PROOF !== "false";

    const getNewData = () => {
        const langData = DATA_BY_LANG[lang] || DATA_BY_LANG.en;
        const name = langData.names[Math.floor(Math.random() * langData.names.length)];
        const city = langData.cities[Math.floor(Math.random() * langData.cities.length)];
        const count = Math.floor(Math.random() * (45 - 12 + 1)) + 12; // Random count between 12 and 45
        return { name, city, count };
    };

    useEffect(() => {
        if (!isEnabled) return;

        // Initial delay before first show
        const initialDelay = setTimeout(() => {
            setCurrentData(getNewData());
            setIsVisible(true);
        }, 5000);

        // Loop interval
        const interval = setInterval(() => {
            setIsVisible(false);

            // Small pause before switching data and showing again
            setTimeout(() => {
                setCurrentData(getNewData());
                // Random chance to show (to make it feel less robotic)
                if (Math.random() > 0.3) {
                    setIsVisible(true);
                }
            }, 1000);

        }, 15000); // Wait 15s between notifications

        return () => {
            clearTimeout(initialDelay);
            clearInterval(interval);
        };
    }, [lang, isEnabled]);

    if (!isEnabled) return null;

    const langData = DATA_BY_LANG[lang] || DATA_BY_LANG.en;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, x: -20, y: 0 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="fixed bottom-24 left-4 md:bottom-8 md:left-8 z-[100] max-w-[280px] md:max-w-sm pointer-events-none"
                >
                    <div className="bg-card/80 dark:bg-zinc-900/40 backdrop-blur-xl border border-white/10 p-3 md:p-4 rounded-2xl shadow-2xl flex items-center gap-3 md:gap-4 ring-1 ring-black/5">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                            {type === "activity" ? (
                                <ActivityIcon className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                            ) : (
                                <ShoppingBag className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                            )}
                        </div>

                        <div className="flex flex-col">
                            {type === "activity" ? (
                                <p className="text-[11px] md:text-sm font-medium leading-tight">
                                    <span className="font-black text-primary">{currentData.count}</span> {langData.activity}
                                </p>
                            ) : (
                                <div className="space-y-0.5">
                                    <p className="text-[11px] md:text-sm font-bold leading-tight">
                                        {currentData.name} de {currentData.city}
                                    </p>
                                    <p className="text-[10px] md:text-xs text-muted-foreground opacity-80 leading-tight">
                                        {langData.purchase} {currentData.city}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Progress bar line to indicate it will disappear */}
                    <motion.div
                        initial={{ width: "100%" }}
                        animate={{ width: "0%" }}
                        transition={{ duration: 7, ease: "linear" }}
                        onAnimationComplete={() => setIsVisible(false)}
                        className="absolute bottom-0 left-0 h-0.5 bg-primary/30 rounded-full"
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
