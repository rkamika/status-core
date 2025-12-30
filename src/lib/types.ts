// Core types for STATUS CORE application

export type Locale = 'pt' | 'en' | 'es';

export type DiagnosisState =
    | 'CONFUSION'
    | 'OVERLOAD'
    | 'REACTIVITY'
    | 'UNCERTAINTY'
    | 'DISCONNECTION'
    | 'STAGNATION'
    | 'CLARITY'
    | 'ALIGNMENT';

export interface Dimension {
    label: string;
    value: number;
    color: string;
}

export interface SavedDiagnosis {
    id: string;
    timestamp: number;
    lang: Locale;

    // Assessment data
    answers: Record<number, number>;
    qualitativeContext: string;

    // Diagnosis result
    state: DiagnosisState;
    confidence: number;
    label: string;
    color: string;
    oneLiner: string;

    // Dimensions for radar chart
    dimensions: Dimension[];

    // Access control
    isUnlocked: boolean;
    unlockedAt?: number;
}

export interface UserStorage {
    diagnoses: SavedDiagnosis[];
    currentDiagnosisId?: string;
}
