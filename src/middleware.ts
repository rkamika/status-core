import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { match as matchLocale } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";

const locales = ["pt", "en", "es"];
const defaultLocale = "pt";

function getLocale(request: NextRequest): string | undefined {
    const negotiatorHeaders: Record<string, string> = {};
    request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));

    const languages = new Negotiator({ headers: negotiatorHeaders }).languages();

    // For the Brazilian market, we prioritize PT if it's anywhere in the accepted list
    // or as a hard fallback.
    const preferredLanguages = languages.includes('pt') || languages.some(l => l.startsWith('pt-'))
        ? ["pt", ...languages.filter(l => !l.startsWith('pt'))]
        : languages;

    try {
        return matchLocale(preferredLanguages, locales, defaultLocale);
    } catch (e) {
        return defaultLocale;
    }
}

export function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    // // Skip if it's an internal Next.js path or asset
    if (
        pathname.startsWith("/_next") ||
        pathname.includes("/api/") ||
        pathname.includes(".") // images, favicon, etc
    ) {
        return;
    }

    const pathnameIsMissingLocale = locales.every(
        (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
    );

    if (pathnameIsMissingLocale) {
        const locale = getLocale(request);
        return NextResponse.redirect(
            new URL(`/${locale}${pathname}`, request.url)
        );
    }
}

export const config = {
    matcher: [
        // Skip all internal paths (_next)
        "/((?!_next|api|.*\\..*).*)",
    ],
};
