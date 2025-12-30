"use client";

import Link from "next/link";
import { use } from "react";
import { motion } from "framer-motion";
import { Zap, PlayCircle, Shield, LucideIcon, Search, Sparkles, Infinity as InfinityIcon, Layers, Activity, ArrowRight } from "lucide-react";
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
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center transition-transform group-hover:scale-110 shadow-[0_0_15px_rgba(var(--primary),0.5)]">
              <div className="w-3 h-3 bg-background rounded-full" />
            </div>
            <span className="font-heading font-bold text-xl tracking-tighter">STATUS CORE</span>
          </Link>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageSelector currentLang={lang} />
            <Link href={`/${lang}/login`} className="text-sm font-black hidden sm:block hover:text-primary uppercase tracking-widest opacity-40 hover:opacity-100 transition-all ml-4">{dict.header.login}</Link>
            <Link href={`/${lang}/assessment`}>
              <Button variant="default" size="sm" className="font-bold px-6 shadow-lg shadow-primary/20">
                {dict.landing.cta_button}
              </Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="relative w-full py-20 md:py-32 lg:py-40 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.3, 0.5, 0.3],
                x: [0, 100, 0],
                y: [0, -50, 0]
              }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-primary/40 rounded-full blur-[120px] mix-blend-screen dark:mix-blend-plus-lighter"
            />
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.4, 0.2],
                x: [0, -80, 0],
                y: [0, 80, 0]
              }}
              transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              className="absolute bottom-[-20%] right-[-10%] w-[700px] h-[700px] bg-primary/30 rounded-full blur-[150px] mix-blend-screen dark:mix-blend-plus-lighter"
            />
            <motion.div
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.1, 0.2, 0.1],
              }}
              transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[180px]"
            />
          </div>

          <div className="container mx-auto relative px-4 md:px-6">
            <div className="flex flex-col items-center space-y-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.3em] border border-primary/20 backdrop-blur-sm"
              >
                <Sparkles className="h-3 w-3" /> {dict.landing.hero_badge}
              </motion.div>

              <div className="space-y-4 max-w-4xl">
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="text-5xl font-heading font-black tracking-tighter sm:text-7xl md:text-8xl lg:text-9xl leading-[0.85] text-foreground"
                >
                  {dict.landing.hero_title}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="mx-auto max-w-[800px] text-muted-foreground md:text-xl/relaxed lg:text-2xl/relaxed font-medium tracking-tight"
                >
                  {dict.landing.hero_subtitle}
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto"
              >
                <Link href={`/${lang}/assessment`}>
                  <Button size="lg" className="h-16 px-12 text-xl font-black w-full sm:w-auto shadow-[0_20px_40px_rgba(var(--primary),0.3)] hover:scale-105 transition-transform">
                    {dict.landing.cta_button}
                  </Button>
                </Link>
                <Link href={`/${lang}/report/demo`}>
                  <Button variant="outline" size="lg" className="h-16 px-12 text-xl font-black w-full sm:w-auto border-white/5 bg-white/[0.02] backdrop-blur-xl group hover:bg-white/[0.05]">
                    <PlayCircle className="mr-3 h-6 w-6 group-hover:text-primary transition-colors" /> {dict.landing.demo_link}
                  </Button>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 1 }}
                className="flex items-center gap-3 pt-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40"
              >
                <Shield className="h-4 w-4 text-primary/60" />
                {dict.landing.hero_anonymous}
              </motion.div>
            </div>
          </div>
        </section>

        <section className="w-full py-20 bg-zinc-950/50 relative overflow-hidden">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center gap-12">
              <div className="text-center space-y-2 opacity-30 select-none">
                <p className="text-[10px] font-black tracking-[0.5em] uppercase">Trusted by forward-thinking leaders at</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-24 items-center justify-items-center opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
                {["TECHCRUNCH", "WIRED", "FORBES", "FAST COMPANY"].map((brand) => (
                  <div key={brand} className="font-heading font-black text-2xl md:text-3xl tracking-tighter hover:text-primary transition-colors">
                    {brand}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-24 md:py-32 lg:py-40">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center space-y-16">
              <div className="text-center space-y-4 max-w-3xl">
                <h2 className="text-4xl font-heading font-black sm:text-6xl tracking-tighter transition-all">{dict.landing.how_it_works_title}</h2>
                <p className="text-muted-foreground text-lg md:text-xl font-medium tracking-tight">{dict.landing.how_it_works_subtitle}</p>
              </div>
              <div className="grid md:grid-cols-3 gap-8 w-full">
                <FeatureCard
                  icon={Search}
                  title={dict.landing.step1_title}
                  description={dict.landing.step1_desc}
                  index={0}
                />
                <FeatureCard
                  icon={Zap}
                  title={dict.landing.step2_title}
                  description={dict.landing.step2_desc}
                  index={1}
                />
                <FeatureCard
                  icon={Shield}
                  title={dict.landing.step3_title}
                  description={dict.landing.step3_desc}
                  primary
                  index={2}
                />
              </div>
            </div>
          </div>
        </section>

        {/* New Methodology & Science Section */}
        <section className="w-full py-24 md:py-32 bg-primary/5 border-y border-primary/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-20 opacity-[0.03] rotate-12">
            <InfinityIcon className="w-[500px] h-[500px]" />
          </div>
          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
                  <Layers className="h-3 w-3" /> Methodology
                </div>
                <h2 className="text-4xl md:text-6xl font-heading font-black tracking-tighter leading-none">
                  {dict.landing.methodology_title}
                </h2>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  {dict.landing.methodology_desc}
                </p>
                <div className="grid grid-cols-2 gap-6 pt-4">
                  {["Sistêmica", "Cognitiva", "Neurológica", "Estoica"].map((tag) => (
                    <div key={tag} className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span className="text-sm font-bold uppercase tracking-widest opacity-60">{tag}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-background/40 backdrop-blur-3xl p-10 rounded-[3rem] border border-white/5 shadow-3xl">
                <div className="space-y-6">
                  <div className="h-2 w-20 bg-primary/40 rounded-full" />
                  <p className="text-2xl font-serif italic text-foreground opacity-80 leading-snug">
                    "A performance de elite não é sobre trabalhar mais, mas sobre alinhar as tensões internas entre as 7 áreas fundamentais da vida."
                  </p>
                  <div className="flex items-center gap-4 pt-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/20 flex items-center justify-center font-black italic">SC</div>
                    <div>
                      <p className="text-sm font-black uppercase tracking-widest">Equipe Status Core</p>
                      <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Cognitive Strategy Group</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* New Enterprise / Elite Teams Section */}
        <section className="w-full py-24 md:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto text-center space-y-12">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border/40 text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em]">
                  <Activity className="h-3 w-3 text-primary" /> Enterprise
                </div>
                <h2 className="text-4xl md:text-6xl font-heading font-black tracking-tighter">
                  {dict.landing.enterprise_title}
                </h2>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  {dict.landing.enterprise_desc}
                </p>
              </div>
              <Link href={`/${lang}/assessment`} className="inline-block pt-4">
                <Button variant="outline" size="lg" className="h-16 px-12 text-xl font-black border-primary/40 text-primary hover:bg-primary/5 transition-all">
                  Contact Sales <ArrowRight className="ml-3 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full py-20 border-t border-border/10 bg-zinc-950 items-center justify-center flex">
        <div className="container px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="flex flex-col items-center md:items-start gap-4">
            <Link className="flex items-center gap-2 group" href={`/${lang}`}>
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <div className="w-3 h-3 bg-background rounded-full" />
              </div>
              <span className="font-heading font-bold tracking-tighter text-2xl">STATUS CORE</span>
            </Link>
            <p className="text-xs text-muted-foreground font-medium tracking-tight text-center md:text-left">
              Advanced Personal Intelligence for High Performance.<br />
              © 2025 Status Core Systems.
            </p>
          </div>
          <div className="flex flex-col items-center md:items-end gap-6 text-center md:text-right">
            <div className="flex gap-8 text-[10px] font-black uppercase tracking-[0.3em] opacity-40">
              <Link href="#" className="hover:text-primary hover:opacity-100 transition-all">{dict.footer.terms}</Link>
              <Link href="#" className="hover:text-primary hover:opacity-100 transition-all">{dict.footer.privacy}</Link>
              <Link href="#" className="hover:text-primary hover:opacity-100 transition-all">{dict.footer.contact}</Link>
            </div>
            <div className="flex gap-4">
              {["𝕏", "in", "ig"].map((sm) => (
                <div key={sm} className="w-10 h-10 rounded-full border border-white/5 bg-white/[0.02] flex items-center justify-center hover:bg-white/[0.05] hover:border-primary/20 transition-all cursor-pointer font-bold text-xs">
                  {sm}
                </div>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description, primary = false, index = 0 }: { icon: LucideIcon, title: string, description: string, primary?: boolean, index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`p-10 rounded-[3rem] border transition-all duration-500 overflow-hidden relative group ${primary ? 'bg-primary border-primary text-primary-foreground shadow-[0_30px_60px_rgba(var(--primary),0.3)] scale-105 z-10' : 'bg-card border-border/40 hover:border-primary/30'}`}
    >
      {!primary && (
        <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 transition-opacity">
          <Icon className="w-32 h-32" />
        </div>
      )}
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 shadow-inner ${primary ? 'bg-background/20' : 'bg-primary/10 text-primary'}`}>
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="text-2xl font-black font-heading mb-3 tracking-tighter">{title}</h3>
      <p className={`text-lg leading-relaxed tracking-tight ${primary ? "text-primary-foreground/90 font-medium" : "text-muted-foreground font-medium"}`}>{description}</p>
    </motion.div>
  );
}
