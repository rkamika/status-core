import Link from "next/link";
import { use } from "react";
import { Zap, PlayCircle, Shield, LucideIcon, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSelector } from "@/components/language-selector";
import { ThemeToggle } from "@/components/theme-toggle";
import { Locale } from "@/lib/diagnostic";
import { getDictionary } from "@/lib/get-dictionary";

export default function LandingPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = use(params);
  const dict = use(getDictionary(lang));

  return (
    <div className="flex flex-col min-h-screen bg-background selection:bg-primary/30">
      <header className="px-4 lg:px-6 h-14 flex items-center border-b border-border/40 bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between">
          <Link className="flex items-center justify-center gap-2 group" href={`/${lang}`}>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center transition-transform group-hover:scale-110">
              <div className="w-3 h-3 bg-background rounded-full" />
            </div>
            <span className="font-heading font-bold text-xl tracking-tight">STATUS CORE</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link className="text-sm font-medium hover:text-primary transition-colors" href="#">{dict.header.methodology}</Link>
            <Link className="text-sm font-medium hover:text-primary transition-colors" href="#">{dict.header.for_companies}</Link>
            <Link className="text-sm font-medium hover:text-primary transition-colors" href="#">{dict.header.pricing}</Link>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageSelector currentLang={lang} />
            <Link href={`/${lang}/login`} className="text-sm font-medium hidden sm:block hover:text-primary">{dict.header.login}</Link>
            <Link href={`/${lang}/assessment`}>
              <Button variant="default" size="sm" className="font-semibold px-4">
                {dict.landing.cta_button}
              </Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="relative w-full py-16 md:py-24 lg:py-28 overflow-hidden">
          {/* Hero Background Elements */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
            <div className="absolute top-[10%] left-[5%] w-64 h-64 bg-primary/10 rounded-full blur-[100px] animate-pulse" />
            <div className="absolute bottom-[10%] right-[5%] w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
          </div>

          <div className="container mx-auto relative px-4 md:px-6">
            <div className="flex flex-col items-center space-y-6 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider border border-primary/20">
                <Zap className="h-3 w-3" /> {dict.landing.hero_badge}
              </div>
              <div className="space-y-3 max-w-3xl">
                <h1 className="text-4xl font-heading font-bold tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl leading-none">
                  {dict.landing.hero_title}
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-2xl/relaxed font-medium">
                  {dict.landing.hero_subtitle}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Link href={`/${lang}/assessment`}>
                  <Button size="lg" className="h-14 px-10 text-lg font-bold w-full sm:w-auto shadow-xl shadow-primary/20">
                    {dict.landing.cta_button}
                  </Button>
                </Link>
                <Link href={`/${lang}/preview`}>
                  <Button variant="outline" size="lg" className="h-14 px-10 text-lg font-bold w-full sm:w-auto border-border/40 bg-background/50 backdrop-blur group">
                    <PlayCircle className="mr-2 h-5 w-5 group-hover:text-primary transition-colors" /> {dict.landing.demo_link}
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-3 pt-4 text-sm text-muted-foreground">
                <Shield className="h-4 w-4 text-primary/60" />
                {dict.landing.hero_anonymous}
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-20 border-t border-border/40 bg-muted/30">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500 cursor-default">
              {["TECHCRUNCH", "WIRED", "FORBES", "FAST COMPANY"].map((brand) => (
                <div key={brand} className="flex items-center justify-center font-heading font-black text-xl tracking-tighter">
                  {brand}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="w-full py-24 md:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center space-y-12">
              <div className="text-center space-y-4 max-w-2xl">
                <h2 className="text-3xl font-heading font-bold sm:text-4xl">{dict.landing.how_it_works_title}</h2>
                <p className="text-muted-foreground text-lg">{dict.landing.how_it_works_subtitle}</p>
              </div>
              <div className="grid md:grid-cols-3 gap-8 w-full">
                <FeatureCard
                  icon={Search}
                  title={dict.landing.step1_title}
                  description={dict.landing.step1_desc}
                />
                <FeatureCard
                  icon={Zap}
                  title={dict.landing.step2_title}
                  description={dict.landing.step2_desc}
                />
                <FeatureCard
                  icon={Shield}
                  title={dict.landing.step3_title}
                  description={dict.landing.step3_desc}
                  primary
                />
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full py-12 border-t border-border/40 bg-background/95 backdrop-blur items-center justify-center flex">
        <div className="container px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
              <div className="w-2 h-2 bg-background rounded-full" />
            </div>
            <span className="font-heading font-bold tracking-tight text-sm">STATUS CORE © 2025</span>
          </div>
          <p className="text-xs text-muted-foreground">{dict.footer.terms} • {dict.footer.privacy} • {dict.footer.contact}</p>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full border border-border/40 flex items-center justify-center hover:bg-muted transition-colors cursor-pointer">
              𝕏
            </div>
            <div className="w-8 h-8 rounded-full border border-border/40 flex items-center justify-center hover:bg-muted transition-colors cursor-pointer">
              in
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description, primary = false }: { icon: LucideIcon, title: string, description: string, primary?: boolean }) {
  return (
    <div className={`p-8 rounded-3xl border transition-all duration-300 ${primary ? 'bg-primary border-primary text-primary-foreground shadow-2xl shadow-primary/20 scale-105' : 'bg-card border-border/40 hover:border-primary/50'}`}>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${primary ? 'bg-background/20' : 'bg-primary/10 text-primary'}`}>
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-xl font-bold font-heading mb-2">{title}</h3>
      <p className={primary ? "text-primary-foreground/80 leading-relaxed" : "text-muted-foreground leading-relaxed"}>{description}</p>
    </div>
  );
}
