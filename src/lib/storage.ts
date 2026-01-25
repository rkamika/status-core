// Cloud + LocalStorage utilities for STATUS CORE
import { SavedDiagnosis, UserStorage } from './types';
import { supabase } from './supabase';

const STORAGE_KEY = 'status-core-data';

// Generate unique ID
export function generateId(): string {
    if (typeof window !== 'undefined' && window.crypto && typeof window.crypto.randomUUID === 'function') {
        return window.crypto.randomUUID();
    }
    return `diag-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Get all storage data (Local Fallback)
function getLocalStorage(): UserStorage {
    if (typeof window === 'undefined') return { diagnoses: [] };
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : { diagnoses: [] };
    } catch (error) {
        console.error('Error reading from localStorage:', error);
        return { diagnoses: [] };
    }
}

// Save storage data (Local Fallback)
function setLocalStorage(data: UserStorage): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
        console.error('Error writing to localStorage:', error);
    }
}

// Save a new diagnosis (Cloud First)
export async function saveDiagnosis(diagnosis: SavedDiagnosis): Promise<void> {
    // 1. Save to Supabase
    try {
        const { data: { user } } = await supabase.auth.getUser();

        const { error } = await supabase
            .from('diagnoses')
            .upsert({
                id: diagnosis.id,
                user_id: user?.id,
                lang: diagnosis.lang,
                answers: diagnosis.answers,
                qualitative_context: diagnosis.qualitativeContext,
                state: diagnosis.state,
                confidence: diagnosis.confidence,
                label: diagnosis.label,
                color: diagnosis.color,
                one_liner: diagnosis.oneLiner,
                dimensions: diagnosis.dimensions,
                is_unlocked: diagnosis.isUnlocked,
                v3_insights: diagnosis.v3Insights,
                created_at: new Date(diagnosis.timestamp).toISOString()
            });

        if (error) throw error;
    } catch (error) {
        console.error('Supabase Save Error:', error);
    }

    // 2. Local Fallback/Cache
    const storage = getLocalStorage();
    storage.diagnoses = [diagnosis, ...storage.diagnoses.filter(d => d.id !== diagnosis.id)].slice(0, 50);
    storage.currentDiagnosisId = diagnosis.id;
    setLocalStorage(storage);
}

// Get diagnosis by ID
export async function getDiagnosisById(id: string): Promise<SavedDiagnosis | null> {
    // 2. Local Fallback
    const storage = getLocalStorage();
    const localVersion = storage.diagnoses.find(d => d.id === id) || null;

    // 1. Try Supabase
    let cloudVersion: SavedDiagnosis | null = null;
    try {
        const { data, error } = await supabase
            .from('diagnoses')
            .select('*')
            .eq('id', id)
            .single();

        if (data && !error) {
            cloudVersion = {
                id: data.id,
                timestamp: new Date(data.created_at).getTime(),
                lang: data.lang,
                answers: data.answers,
                qualitativeContext: data.qualitative_context,
                state: data.state,
                confidence: data.confidence,
                label: data.label,
                color: data.color,
                oneLiner: data.one_liner,
                dimensions: data.dimensions,
                isUnlocked: data.is_unlocked,
                v3Insights: data.v3_insights
            } as SavedDiagnosis;
        }
    } catch (error) {
        console.error('Supabase Fetch Error:', error);
    }

    // Merge strategy:
    // If we have cloud data, use it as base. 
    // BUT if local data exists and shows 'isUnlocked: true', override cloud.
    if (cloudVersion && localVersion) {
        return {
            ...cloudVersion,
            isUnlocked: cloudVersion.isUnlocked || localVersion.isUnlocked
        };
    }

    return cloudVersion || localVersion;
}

// Get all diagnoses
export async function getAllDiagnoses(): Promise<SavedDiagnosis[]> {
    // 1. Try Supabase (User specific)
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data, error } = await supabase
                .from('diagnoses')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (data && !error) {
                return data.map(d => ({
                    id: d.id,
                    timestamp: new Date(d.created_at).getTime(),
                    lang: d.lang,
                    answers: d.answers,
                    qualitativeContext: d.qualitative_context,
                    state: d.state,
                    confidence: d.confidence,
                    label: d.label,
                    color: d.color,
                    oneLiner: d.one_liner,
                    dimensions: d.dimensions,
                    isUnlocked: d.is_unlocked,
                    v3Insights: d.v3_insights
                })) as SavedDiagnosis[];
            }
        }
    } catch (error) {
        console.error('Supabase History Error:', error);
    }

    // 2. Local Fallback
    const storage = getLocalStorage();
    return storage.diagnoses;
}

// Get current diagnosis ID
export function getCurrentDiagnosisId(): string | null {
    const storage = getLocalStorage();
    return storage.currentDiagnosisId || null;
}

// Mark diagnosis as unlocked
export async function unlockDiagnosis(id: string): Promise<void> {
    // 1. Update Supabase
    try {
        const { error } = await supabase
            .from('diagnoses')
            .update({
                is_unlocked: true,
                unlocked_at: new Date().toISOString()
            })
            .eq('id', id);
        if (error) throw error;
    } catch (error) {
        console.error('Supabase Unlock Error:', error);
    }

    // 2. Update Local
    const storage = getLocalStorage();
    const diagnosis = storage.diagnoses.find(d => d.id === id);
    if (diagnosis) {
        diagnosis.isUnlocked = true;
        diagnosis.unlockedAt = Date.now();
        setLocalStorage(storage);
    }
}

// Update a diagnosis with new data (like AI insights)
export async function updateDiagnosis(id: string, updates: Partial<SavedDiagnosis>): Promise<void> {
    // 1. Update Supabase
    try {
        const mappedUpdates: any = {};
        if (updates.v3Insights) mappedUpdates.v3_insights = updates.v3Insights;
        if (updates.label) mappedUpdates.label = updates.label;

        if (Object.keys(mappedUpdates).length > 0) {
            await supabase.from('diagnoses').update(mappedUpdates).eq('id', id);
        }
    } catch (error) {
        console.error('Supabase Update Error:', error);
    }

    // 2. Update Local
    const storage = getLocalStorage();
    const index = storage.diagnoses.findIndex(d => d.id === id);
    if (index !== -1) {
        storage.diagnoses[index] = { ...storage.diagnoses[index], ...updates };
        setLocalStorage(storage);
    }
}

// Delete diagnosis
export async function deleteDiagnosis(id: string): Promise<void> {
    // 1. Delete Supabase
    try {
        await supabase.from('diagnoses').delete().eq('id', id);
    } catch (error) {
        console.error('Supabase Delete Error:', error);
    }

    // 2. Delete Local
    const storage = getLocalStorage();
    storage.diagnoses = storage.diagnoses.filter(d => d.id !== id);
    if (storage.currentDiagnosisId === id) {
        storage.currentDiagnosisId = storage.diagnoses[0]?.id || undefined;
    }
    setLocalStorage(storage);
}

// Clear all data (for testing)
export function clearAllData(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
}
