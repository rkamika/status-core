"use client";

import { use, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    BarChart3,
    TrendingUp,
    Users,
    Ticket,
    Settings,
    RefreshCcw,
    Plus,
    Trash2,
    DollarSign,
    Lock,
    Eye,
    Globe,
    Zap,
    Key,
    User,
    LogOut,
    AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    getGlobalStats,
    getSystemSetting,
    updateSystemSetting,
    getPromoCodes,
    createPromoCode,
    deactivatePromoCode,
    updateAdminPassword,
    ADMIN_EMAIL,
    GlobalStats,
    PromoCode
} from "@/lib/admin";
import { Locale } from "@/lib/types";
import { Logo } from "@/components/logo";
import { supabase } from "@/lib/supabase";

export default function AdminDashboard({ params }: { params: Promise<{ lang: Locale }> }) {
    const { lang } = use(params);

    // Auth State
    const [user, setUser] = useState<any>(null);
    const [isLoadingAuth, setIsLoadingAuth] = useState(true);
    const [email, setEmail] = useState(ADMIN_EMAIL);
    const [password, setPassword] = useState("");
    const [authError, setAuthError] = useState("");

    // Force Change Password State
    const [showResetFlow, setShowResetFlow] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

    // Data State
    const [stats, setStats] = useState<GlobalStats | null>(null);
    const [price, setPrice] = useState("97.00");
    const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(false);

    // UI State
    const [newPromoCode, setNewPromoCode] = useState("");
    const [newPromoDiscount, setNewPromoDiscount] = useState("100");

    const refreshData = useCallback(async () => {
        setIsLoadingData(true);
        try {
            const [s, p, pc] = await Promise.all([
                getGlobalStats(),
                getSystemSetting('report_price'),
                getPromoCodes()
            ]);
            setStats(s);
            if (p) setPrice(p);
            setPromoCodes(pc);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoadingData(false);
        }
    }, []);

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user?.email === ADMIN_EMAIL) {
                setUser(session.user);
                // Check if they need to change password (metadata)
                if (session.user.user_metadata?.is_initial_login !== false) {
                    setShowResetFlow(true);
                } else {
                    refreshData();
                }
            }
            setIsLoadingAuth(false);
        };
        checkSession();
    }, [refreshData]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthError("");
        if (email !== ADMIN_EMAIL) {
            setAuthError("Unauthorized email address.");
            return;
        }

        setIsLoadingAuth(true);
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;
            if (data.user?.email !== ADMIN_EMAIL) {
                await supabase.auth.signOut();
                throw new Error("Unauthorized access.");
            }

            setUser(data.user);
            // If user_metadata doesn't have is_initial_login: false, it's first login
            if (data.user.user_metadata?.is_initial_login !== false) {
                setShowResetFlow(true);
            } else {
                refreshData();
            }
        } catch (err: any) {
            setAuthError(err.message || "Invalid credentials");
        } finally {
            setIsLoadingAuth(false);
        }
    };

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setAuthError("Passwords do not match.");
            return;
        }
        if (newPassword.length < 8) {
            setAuthError("Password must be at least 8 characters.");
            return;
        }

        setIsUpdatingPassword(true);
        try {
            await updateAdminPassword(newPassword);
            setShowResetFlow(false);
            refreshData();
        } catch (err: any) {
            setAuthError(err.message || "Failed to update password");
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setShowResetFlow(false);
    };

    const handleUpdatePrice = async () => {
        await updateSystemSetting('report_price', price);
        alert("Preço atualizado!");
    };

    const handleCreatePromo = async () => {
        if (!newPromoCode) return;
        await createPromoCode(newPromoCode, parseInt(newPromoDiscount));
        setNewPromoCode("");
        refreshData();
    };

    const handleDeactivatePromo = async (id: string) => {
        await deactivatePromoCode(id);
        refreshData();
    };

    if (isLoadingAuth) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <RefreshCcw className="h-8 w-8 text-primary animate-spin" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md space-y-8"
                >
                    <div className="text-center space-y-4">
                        <Logo lang={lang} className="mx-auto" />
                        <h1 className="text-3xl font-black font-heading tracking-tighter italic text-white uppercase">Admin Secure Node</h1>
                    </div>

                    <Card className="bg-zinc-900 border-zinc-800 shadow-2xl overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-full h-1 bg-primary/20" />
                        <CardHeader>
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                                <Lock className="h-4 w-4" /> Identity Verification
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleLogin} className="space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Admin Email</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-3 h-4 w-4 text-zinc-600" />
                                            <Input
                                                type="email"
                                                placeholder="admin@statuscore.com"
                                                value={email}
                                                readOnly
                                                className="bg-black border-zinc-800 pl-10 text-zinc-400 font-bold"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Password</Label>
                                        <div className="relative">
                                            <Key className="absolute left-3 top-3 h-4 w-4 text-zinc-600" />
                                            <Input
                                                type="password"
                                                placeholder="••••••••"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="bg-black border-zinc-800 pl-10 font-bold tracking-widest"
                                            />
                                        </div>
                                    </div>
                                </div>
                                {authError && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -5 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="flex items-center gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold"
                                    >
                                        <AlertCircle className="h-4 w-4 shrink-0" />
                                        {authError}
                                    </motion.div>
                                )}
                                <Button className="w-full h-12 font-black uppercase tracking-widest bg-white text-black hover:bg-zinc-200 transition-colors" type="submit">
                                    Authenticate Access
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                    <p className="text-[10px] text-center text-zinc-600 font-black uppercase tracking-[0.3em]">Encrypted Session Node v4.0</p>
                </motion.div>
            </div>
        );
    }

    if (showResetFlow) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md"
                >
                    <Card className="bg-zinc-900 border-primary/20 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-primary animate-pulse" />
                        <CardHeader>
                            <CardTitle className="text-2xl font-black italic uppercase tracking-tight text-white">Secure Initialization</CardTitle>
                            <CardDescription className="text-zinc-400 font-medium">
                                This is your first login. For your security, you must define a new permanent password.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handlePasswordUpdate} className="space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">New Secure Password</Label>
                                        <Input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="bg-black border-zinc-800 font-bold tracking-widest"
                                            placeholder="Min 8 characters"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Confirm Password</Label>
                                        <Input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="bg-black border-zinc-800 font-bold tracking-widest"
                                            placeholder="Repeat password"
                                            required
                                        />
                                    </div>
                                </div>
                                {authError && (
                                    <p className="text-xs text-rose-500 font-bold bg-rose-500/10 p-2 rounded border border-rose-500/20">{authError}</p>
                                )}
                                <Button className="w-full h-12 bg-primary text-black font-black uppercase tracking-widest hover:bg-primary/90" type="submit" disabled={isUpdatingPassword}>
                                    {isUpdatingPassword ? <RefreshCcw className="h-5 w-5 animate-spin" /> : "Update & Access Dashboard"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-primary/30">
            <header className="px-6 h-16 border-b border-white/5 bg-black/50 backdrop-blur sticky top-0 z-50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Logo lang={lang} size={30} />
                    <Badge variant="outline" className="border-primary/20 text-primary font-black italic">
                        PLATINUM CONTROL
                    </Badge>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hidden md:block">
                        Session: {user.email}
                    </span>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={refreshData}
                        disabled={isLoadingData}
                        className="text-zinc-500 hover:text-white"
                    >
                        <RefreshCcw className={`h-4 w-4 mr-2 ${isLoadingData ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleLogout}
                        className="text-zinc-500 hover:text-rose-500"
                    >
                        <LogOut className="h-4 w-4" />
                    </Button>
                </div>
            </header>

            <main className="container mx-auto p-8 space-y-12">
                {/* 1. STATS OVERVIEW */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Reports"
                        value={stats?.totalReports || 0}
                        icon={BarChart3}
                        trend="+12%"
                    />
                    <StatCard
                        title="Paid Unlocks"
                        value={stats?.paidConversions || 0}
                        icon={Users}
                        color="text-primary"
                    />
                    <StatCard
                        title="Conversion Rate"
                        value={`${stats?.conversionRate.toFixed(1) || 0}%`}
                        icon={TrendingUp}
                        color="text-emerald-500"
                    />
                    <StatCard
                        title="Estimated Revenue"
                        value={`R$ ${((stats?.paidConversions || 0) * parseFloat(price)).toLocaleString('pt-BR')}`}
                        icon={DollarSign}
                        color="text-amber-500"
                    />
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* 2. COMMERCIAL CONTROL */}
                    <Card className="bg-zinc-900 border-white/5 lg:col-span-1">
                        <CardHeader>
                            <CardTitle className="text-lg font-black italic uppercase tracking-tight flex items-center gap-2">
                                <Settings className="h-5 w-5 text-primary" /> Settings
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Global Report Price (BRL)</label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">R$</div>
                                        <Input
                                            value={price}
                                            onChange={(e) => setPrice(e.target.value)}
                                            className="bg-black border-zinc-800 pl-10 font-bold text-lg"
                                        />
                                    </div>
                                    <Button onClick={handleUpdatePrice} className="bg-primary hover:bg-primary/90 text-black font-black">
                                        Set
                                    </Button>
                                </div>
                            </div>

                            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                                <div className="flex items-center gap-2 text-primary text-xs font-black uppercase mb-1">
                                    <Zap className="h-3 w-3" /> Live Update
                                </div>
                                <p className="text-[10px] text-zinc-400 font-medium">Changing the price here will immediately affect the checkout page for all users worldwide.</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 3. PROMO CODE MANAGER */}
                    <Card className="bg-zinc-900 border-white/5 lg:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-lg font-black italic uppercase tracking-tight flex items-center gap-2">
                                <Ticket className="h-5 w-5 text-emerald-500" /> Promo Codes
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex gap-4 p-4 rounded-2xl bg-black border border-white/5">
                                <div className="flex-1 space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">New Code</label>
                                    <Input
                                        placeholder="EX: VIP100"
                                        value={newPromoCode}
                                        onChange={(e) => setNewPromoCode(e.target.value)}
                                        className="bg-zinc-900 border-zinc-800 uppercase"
                                    />
                                </div>
                                <div className="w-32 space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Discount %</label>
                                    <Input
                                        type="number"
                                        value={newPromoDiscount}
                                        onChange={(e) => setNewPromoDiscount(e.target.value)}
                                        className="bg-zinc-900 border-zinc-800"
                                    />
                                </div>
                                <div className="flex items-end">
                                    <Button onClick={handleCreatePromo} className="bg-emerald-500 hover:bg-emerald-600 font-black">
                                        <Plus className="h-4 w-4 mr-2" /> Generate
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between px-4 text-[10px] font-black uppercase tracking-widest text-zinc-600">
                                    <span>Active Coupon Code</span>
                                    <div className="flex gap-12">
                                        <span>Discount</span>
                                        <span className="w-20">Actions</span>
                                    </div>
                                </div>

                                <AnimatePresence mode="popLayout">
                                    {promoCodes.map((pc) => (
                                        <motion.div
                                            key={pc.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 10 }}
                                            className={`flex items-center justify-between p-4 rounded-xl border ${pc.is_active ? 'bg-zinc-900/50 border-white/5' : 'bg-zinc-950 border-zinc-900 opacity-40'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="font-black tracking-widest font-mono text-lg">{pc.code}</span>
                                                {pc.is_active ? (
                                                    <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[8px] uppercase">Active</Badge>
                                                ) : (
                                                    <Badge className="bg-zinc-500/10 text-zinc-500 border-none text-[8px] uppercase">Inactive</Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-8">
                                                <span className="font-black text-emerald-500">{pc.discount_percent}%</span>
                                                <div className="flex items-center gap-2">
                                                    <div className="text-[10px] font-bold text-zinc-500 mr-4">Used: {pc.used_count}x</div>
                                                    {pc.is_active && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleDeactivatePromo(pc.id)}
                                                            className="h-8 w-8 text-rose-500 hover:bg-rose-500/10"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* 4. DISTRIBUTION ANALYSIS */}
                <div className="grid md:grid-cols-2 gap-8">
                    <Card className="bg-zinc-900 border-white/5">
                        <CardHeader>
                            <CardTitle className="text-lg font-black italic uppercase tracking-tight flex items-center gap-2">
                                <Globe className="h-5 w-5 text-blue-500" /> Language Reach
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {Object.entries(stats?.langDistribution || {}).map(([lang, count]) => (
                                <div key={lang} className="space-y-1">
                                    <div className="flex justify-between items-end">
                                        <span className="text-xs font-black uppercase tracking-widest">{lang}</span>
                                        <span className="text-xs font-bold opacity-40">{count} records</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-black rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-500"
                                            style={{ width: `${(count / (stats?.totalReports || 1)) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="bg-zinc-900 border-white/5">
                        <CardHeader>
                            <CardTitle className="text-lg font-black italic uppercase tracking-tight flex items-center gap-2">
                                <Eye className="h-5 w-5 text-amber-500" /> Common States
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {Object.entries(stats?.stateDistribution || {}).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([state, count]) => (
                                <div key={state} className="space-y-1">
                                    <div className="flex justify-between items-end">
                                        <span className="text-xs font-black uppercase tracking-widest">{state}</span>
                                        <span className="text-xs font-bold opacity-40">{count} occurrences</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-black rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-amber-500"
                                            style={{ width: `${(count / (stats?.totalReports || 1)) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </main>

            <footer className="p-12 border-t border-white/5 flex flex-col items-center gap-2">
                <Logo lang={lang} size={20} className="opacity-20" />
                <p className="text-[10px] font-medium tracking-[0.5em] text-zinc-700 uppercase">Status Core Admin Node // Restricted Area</p>
            </footer>
        </div>
    );
}

function StatCard({ title, value, icon: Icon, color = "text-white", trend }: { title: string, value: string | number, icon: any, color?: string, trend?: string }) {
    return (
        <Card className="bg-zinc-900 border-white/5 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:scale-110 transition-transform">
                <Icon className="h-16 w-16" />
            </div>
            <CardHeader className="pb-2">
                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-baseline gap-2">
                    <span className={`text-3xl font-black italic ${color}`}>{value}</span>
                    {trend && <span className="text-[10px] font-bold text-emerald-500">{trend}</span>}
                </div>
            </CardContent>
        </Card>
    );
}
