import Link from "next/link";
import Image from "next/image";

interface LogoProps {
    lang: string;
    className?: string;
    size?: number;
    showText?: boolean;
}

export function Logo({ lang, className = "", size = 32, showText = true }: LogoProps) {
    return (
        <Link className={`flex items-center gap-2 group ${className}`} href={`/${lang}`}>
            <div
                className="flex items-center justify-center transition-transform group-hover:scale-105"
                style={{ width: size, height: size }}
            >
                <Image
                    src="/images/brand-core.png"
                    alt="STATUS CORE Logo"
                    width={size * 2}
                    height={size * 2}
                    className="w-full h-full object-contain"
                />
            </div>
            {showText && (
                <span className="font-heading font-black text-xl tracking-tighter whitespace-nowrap">
                    STATUS CORE
                </span>
            )}
        </Link>
    );
}
