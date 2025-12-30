"use client";

import { usePathname, useRouter } from "next/navigation";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";

const locales = [
    { code: "pt", name: "Português", flag: "🇧🇷" },
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "es", name: "Español", flag: "🇪🇸" },
];

export function LanguageSelector({ currentLang }: { currentLang: string }) {
    const pathname = usePathname();
    const router = useRouter();

    const handleLanguageChange = (newLocale: string) => {
        const segments = pathname.split("/");
        segments[1] = newLocale;
        router.push(segments.join("/"));
    };

    const currentLocale = locales.find((l) => l.code === currentLang) || locales[1];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 h-9 px-3 border border-border/40 bg-background/50 backdrop-blur hover:bg-muted transition-colors">
                    <Languages className="h-4 w-4 text-primary" />
                    <span className="text-xs font-bold uppercase tracking-wider">{currentLocale.code}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 bg-background/95 backdrop-blur border-border/40">
                {locales.map((locale) => (
                    <DropdownMenuItem
                        key={locale.code}
                        onClick={() => handleLanguageChange(locale.code)}
                        className="flex items-center justify-between cursor-pointer"
                    >
                        <span className="text-sm font-medium">{locale.name}</span>
                        <span className="text-lg">{locale.flag}</span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
