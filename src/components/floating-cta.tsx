"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import Link from "next/link";

export function FloatingCTA({ lang, label }: { lang: string, label: string }) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            // Show button after scrolling 400px
            setIsVisible(window.scrollY > 400);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] md:hidden w-[calc(100%-3rem)] max-w-sm"
                >
                    <Link href={`/${lang}/assessment`} className="w-full flex justify-center">
                        <Button size="lg" className="w-full max-w-[280px] h-12 rounded-full shadow-[0_15px_30px_rgba(var(--primary),0.4)] font-black text-sm gap-2 border-2 border-primary/20 bg-background/80 backdrop-blur-xl text-primary hover:bg-primary hover:text-primary-foreground group transition-all px-4">
                            <Zap className="h-4 w-4 fill-primary group-hover:fill-primary-foreground transition-colors shrink-0" />
                            <span className="truncate">
                                <span className="hidden min-[380px]:inline">{label}</span>
                                <span className="min-[380px]:hidden">Iniciar Diagnóstico</span>
                            </span>
                        </Button>
                    </Link>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
