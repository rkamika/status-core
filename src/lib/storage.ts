// LocalStorage utilities for STATUS CORE

import { SavedDiagnosis, UserStorage } from './types';

const STORAGE_KEY = 'status-core-data';

// Generate unique ID
export function generateId(): string {
    return `diag-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Get all storage data
function getStorage(): UserStorage {
    if (typeof window === 'undefined') return { diagnoses: [] };

    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : { diagnoses: [] };
    } catch (error) {
        console.error('Error reading from localStorage:', error);
        return { diagnoses: [] };
    }
}

// Save storage data
function setStorage(data: UserStorage): void {
    if (typeof window === 'undefined') return;

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
        console.error('Error writing to localStorage:', error);
    }
}

// Save a new diagnosis
export function saveDiagnosis(diagnosis: SavedDiagnosis): void {
    const storage = getStorage();

    // Remove any existing diagnosis with same ID
    storage.diagnoses = storage.diagnoses.filter(d => d.id !== diagnosis.id);

    // Add new diagnosis at the beginning
    storage.diagnoses.unshift(diagnosis);

    // Keep only last 50 diagnoses
    storage.diagnoses = storage.diagnoses.slice(0, 50);

    // Update current diagnosis ID
    storage.currentDiagnosisId = diagnosis.id;

    setStorage(storage);
}

// Get diagnosis by ID
export function getDiagnosisById(id: string): SavedDiagnosis | null {
    const storage = getStorage();
    return storage.diagnoses.find(d => d.id === id) || null;
}

// Get all diagnoses
export function getAllDiagnoses(): SavedDiagnosis[] {
    const storage = getStorage();
    return storage.diagnoses;
}

// Get current diagnosis ID
export function getCurrentDiagnosisId(): string | null {
    const storage = getStorage();
    return storage.currentDiagnosisId || null;
}

// Mark diagnosis as unlocked
export function unlockDiagnosis(id: string): void {
    const storage = getStorage();
    const diagnosis = storage.diagnoses.find(d => d.id === id);

    if (diagnosis) {
        diagnosis.isUnlocked = true;
        diagnosis.unlockedAt = Date.now();
        setStorage(storage);
    }
}

// Update a diagnosis with new data (like AI insights)
export function updateDiagnosis(id: string, updates: Partial<SavedDiagnosis>): void {
    const storage = getStorage();
    const index = storage.diagnoses.findIndex(d => d.id === id);

    if (index !== -1) {
        storage.diagnoses[index] = { ...storage.diagnoses[index], ...updates };
        setStorage(storage);
    }
}

// Delete diagnosis
export function deleteDiagnosis(id: string): void {
    const storage = getStorage();
    storage.diagnoses = storage.diagnoses.filter(d => d.id !== id);

    if (storage.currentDiagnosisId === id) {
        storage.currentDiagnosisId = storage.diagnoses[0]?.id;
    }

    setStorage(storage);
}

// Clear all data (for testing)
export function clearAllData(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
}
