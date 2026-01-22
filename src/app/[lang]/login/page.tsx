"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MoveLeft, Mail, Loader2, Link as LinkIcon } from "lucide-react";
import { Logo } from "@/components/logo";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
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
                    emailRedirectTo: `${window.location.origin}/dashboard`,
                },
            });

            if (error) throw error;
            setIsSent(true);
        } catch (err: any) {
            console.error("Auth Error:", err);
            setError(err.message || "Ocorreu um erro ao enviar o link.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <MoveLeft className="h-4 w-4" /> Voltar para Home
            </Link>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <div className="flex flex-col items-center mb-8">
                    <Logo lang="en" size={64} showText={true} className="flex-col animate-pulse" />
                </div>

                <Card className="border-border/40 shadow-xl bg-card/50 backdrop-blur">
                    <CardHeader className="space-y-1 text-center">
                        <CardTitle className="text-2xl font-heading">
                            {isSent ? "Verifique seu e-mail" : "Acesse seu Diagnóstico"}
                        </CardTitle>
                        <CardDescription>
                            {isSent
                                ? "Enviamos um link de acesso para o seu endereço de e-mail."
                                : "Entre com seu e-mail para salvar seu histórico e desbloquear relatórios."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        {!isSent ? (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-xs uppercase tracking-widest text-muted-foreground">E-mail</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            placeholder="seu@email.com"
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
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...
                                        </>
                                    ) : (
                                        "Enviar Link de Acesso"
                                    )}
                                </Button>
                                <div className="pt-2">
                                    <Button variant="outline" className="w-full h-10 rounded-lg border-dashed text-muted-foreground hover:text-primary transition-colors" asChild>
                                        <Link href="/dashboard">
                                            Acessar Modo Demo (Preview)
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
                                        Não recebeu? Verifique o spam ou tente novamente.
                                    </p>
                                    <Button variant="link" className="text-xs" onClick={() => setIsSent(false)}>
                                        Tentar outro e-mail
                                    </Button>
                                </div>
                                <Button variant="outline" className="w-full" asChild>
                                    <Link href="/dashboard">
                                        (Link para Demo: Ir ao Dashboard)
                                    </Link>
                                </Button>
                            </div>
                        )}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-border/40" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">Sem senhas</span>
                            </div>
                        </div>
                        <p className="px-8 text-center text-xs text-muted-foreground">
                            Ao continuar, você concorda com nossos{" "}
                            <Link href="#" className="underline hover:text-primary">Termos</Link> e{" "}
                            <Link href="#" className="underline hover:text-primary">Privacidade</Link>.
                        </p>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
