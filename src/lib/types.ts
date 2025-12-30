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

export interface V3Insights {
    antifragilityScore: number;
    bottleneckLabel: string;
    correlations: string[];
    archetype: string;
    aiAnalysis?: {
        executiveSummary: string;
        sevenDayPlan: { day: string; action: string; pilar: string }[];
        stoicRefinement: string;
    };
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

    // V3 Intelligence
    v3Insights?: V3Insights;
}

export interface UserStorage {
    diagnoses: SavedDiagnosis[];
    currentDiagnosisId?: string;
}
