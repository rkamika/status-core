"use client";

import { useState, use } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MoveLeft, Mail, Loader2, Link as LinkIcon } from "lucide-react";
import { Logo } from "@/components/logo";
import { supabase } from "@/lib/supabase";
import { getDictionary } from "@/lib/get-dictionary";
import { Locale } from "@/lib/diagnostic";

export default function LoginPage({ params }: { params: Promise<{ lang: Locale }> }) {
    const { lang } = use(params);
    const dict = use(getDictionary(lang));

    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setIsLoading(true);
        setError("");

        try {
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: `${window.location.origin}/${lang}/dashboard`,
                },
            });

            if (error) throw error;
            setIsSent(true);
        } catch (err: any) {
            console.error("Auth Error:", err);
            const errorMessage = lang === 'pt'
                ? "Ocorreu um erro ao enviar o link."
                : lang === 'es'
                    ? "Ocurrió un error al enviar el enlace."
                    : "An error occurred while sending the link.";
            setError(err.message || errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    // Helper to render localized agreement with links
    const renderAgreement = () => {
        const text = dict.login.agreement;
        const parts = text.split(/({terms}|{privacy})/);

        return parts.map((part: string, i: number) => {
            if (part === "{terms}") {
                return <Link key={i} href="#" className="underline hover:text-primary">{dict.footer.terms}</Link>;
            }
            if (part === "{privacy}") {
                return <Link key={i} href="#" className="underline hover:text-primary">{dict.footer.privacy}</Link>;
            }
            return part;
        });
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <Link href={`/${lang}`} className="absolute top-8 left-8 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <MoveLeft className="h-4 w-4" /> {dict.login.back_to_home}
            </Link>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <div className="flex flex-col items-center mb-8">
                    <Logo lang={lang} size={64} showText={true} className="flex-col animate-pulse" />
                </div>

                <Card className="border-border/40 shadow-xl bg-card/50 backdrop-blur">
                    <CardHeader className="space-y-1 text-center">
                        <CardTitle className="text-2xl font-heading">
                            {isSent ? dict.login.success_title : dict.login.title}
                        </CardTitle>
                        <CardDescription>
                            {isSent
                                ? dict.login.success_description
                                : dict.login.description}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        {!isSent ? (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-xs uppercase tracking-widest text-muted-foreground">{dict.login.email_label}</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            placeholder={dict.login.email_placeholder}
                                            type="email"
                                            autoCapitalize="none"
                                            autoComplete="email"
                                            autoCorrect="off"
                                            disabled={isLoading}
                                            required
                                            className="pl-10 h-10 rounded-lg bg-background/50 border-border/40 focus:border-primary/50"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>
                                {error && (
                                    <p className="text-xs text-rose-500 font-medium text-center">{error}</p>
                                )}
                                <Button className="w-full h-10 rounded-lg" type="submit" disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {dict.login.sending}
                                        </>
                                    ) : (
                                        dict.login.submit_button
                                    )}
                                </Button>
                                <div className="pt-2">
                                    <Button variant="outline" className="w-full h-10 rounded-lg border-dashed text-muted-foreground hover:text-primary transition-colors" asChild>
                                        <Link href={`/${lang}/dashboard`}>
                                            {dict.login.demo_link}
                                        </Link>
                                    </Button>
                                </div>
                            </form>
                        ) : (
                            <div className="flex flex-col items-center gap-6 py-4">
                                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                                    <LinkIcon className="h-8 w-8 text-primary" />
                                </div>
                                <div className="text-center space-y-2">
                                    <p className="text-sm text-muted-foreground">
                                        {dict.login.not_received}
                                    </p>
                                    <Button variant="link" className="text-xs" onClick={() => setIsSent(false)}>
                                        {dict.login.try_another_email}
                                    </Button>
                                </div>
                                <Button variant="outline" className="w-full" asChild>
                                    <Link href={`/${lang}/dashboard`}>
                                        {dict.login.demo_link_success}
                                    </Link>
                                </Button>
                            </div>
                        )}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-border/40" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">{dict.login.no_passwords}</span>
                            </div>
                        </div>
                        <p className="px-8 text-center text-xs text-muted-foreground">
                            {renderAgreement()}
                        </p>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
