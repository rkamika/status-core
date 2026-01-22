import { supabase } from './supabase';
import { Locale } from './types';

export interface GlobalStats {
    totalReports: number;
    paidConversions: number;
    conversionRate: number;
    langDistribution: Record<Locale, number>;
    stateDistribution: Record<string, number>;
}

export interface PromoCode {
    id: string;
    code: string;
    discount_percent: number;
    is_active: boolean;
    used_count: number;
    created_at: string;
}

// 1. GET GLOBAL STATS
export async function getGlobalStats(): Promise<GlobalStats> {
    try {
        const { data: diagnoses, error } = await supabase
            .from('diagnoses')
            .select('lang, state, is_unlocked');

        if (error) throw error;
        if (!diagnoses) return { totalReports: 0, paidConversions: 0, conversionRate: 0, langDistribution: { pt: 0, en: 0, es: 0 }, stateDistribution: {} };

        const total = diagnoses.length;
        const unlocked = diagnoses.filter(d => d.is_unlocked).length;

        const langDist: Record<Locale, number> = { pt: 0, en: 0, es: 0 };
        const stateDist: Record<string, number> = {};

        diagnoses.forEach(d => {
            if (d.lang) langDist[d.lang as Locale] = (langDist[d.lang as Locale] || 0) + 1;
            if (d.state) stateDist[d.state] = (stateDist[d.state] || 0) + 1;
        });

        return {
            totalReports: total,
            paidConversions: unlocked,
            conversionRate: total > 0 ? (unlocked / total) * 100 : 0,
            langDistribution: langDist,
            stateDistribution: stateDist
        };
    } catch (error) {
        console.error('Error fetching global stats:', error);
        throw error;
    }
}

// 2. SETTINGS (Price, etc)
export async function getSystemSetting(key: string): Promise<string | null> {
    try {
        const { data, error } = await supabase
            .from('system_settings')
            .select('value')
            .eq('key', key)
            .single();

        if (error) return null;
        return data?.value || null;
    } catch {
        return null;
    }
}

export async function updateSystemSetting(key: string, value: string): Promise<void> {
    try {
        const { error } = await supabase
            .from('system_settings')
            .upsert({ key, value, updated_at: new Date().toISOString() });

        if (error) throw error;
    } catch (error) {
        console.error(`Error updating setting ${key}:`, error);
    }
}

// 3. PROMO CODES
export async function getPromoCodes(): Promise<PromoCode[]> {
    try {
        const { data, error } = await supabase
            .from('promo_codes')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching promo codes:', error);
        return [];
    }
}

export async function createPromoCode(code: string, discount: number): Promise<void> {
    try {
        const { error } = await supabase
            .from('promo_codes')
            .insert({
                code: code.toUpperCase(),
                discount_percent: discount,
                is_active: true
            });

        if (error) throw error;
    } catch (error) {
        console.error('Error creating promo code:', error);
        throw error;
    }
}

export async function validatePromoCode(code: string): Promise<PromoCode | null> {
    try {
        const { data, error } = await supabase
            .from('promo_codes')
            .select('*')
            .eq('code', code.toUpperCase())
            .eq('is_active', true)
            .single();

        if (error || !data) return null;
        return data as PromoCode;
    } catch {
        return null;
    }
}

export async function deactivatePromoCode(id: string): Promise<void> {
    try {
        await supabase.from('promo_codes').update({ is_active: false }).eq('id', id);
    } catch (error) {
        console.error('Error deactivating promo code:', error);
    }
}
