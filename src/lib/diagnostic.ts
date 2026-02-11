export type DiagnosisState =
    | "CONFUSION"
    | "OVERLOAD"
    | "REACTIVITY"
    | "UNCERTAINTY"
    | "DISCONNECTION"
    | "STAGNATION"
    | "CLARITY"
    | "ALIGNMENT";

export type Locale = "pt" | "en" | "es";

export interface PillarScore {
    pillarKey: string;
    value: number; // 0 to 100
    color: string;
    tier: "low" | "mid" | "high";
    // For backward compatibility during migration
    label?: string;
    insight?: string;
}

export interface StateConfig {
    color: string;
}

export interface DiagnosisResult {
    state: DiagnosisState;
    color: string;
    confidence: number;
    pillarScores: PillarScore[];
    v3Insights: {
        antifragilityScore: number;
        bottleneckPillarKey: string;
        correlationKeys: string[];
        archetypeKey: string;
        // For backward compatibility during migration
        bottleneckLabel?: string;
        correlations?: string[];
        archetype?: string;
    };
    // For backward compatibility
    label?: string;
    one_liner?: string;
}

export const STATE_CONFIGS: Record<DiagnosisState, StateConfig> = {
    ALIGNMENT: { color: "rgba(34, 197, 94, 0.7)" },
    CLARITY: { color: "rgba(20, 184, 166, 0.7)" },
    UNCERTAINTY: { color: "rgba(249, 115, 22, 0.7)" },
    CONFUSION: { color: "rgba(245, 158, 11, 0.7)" },
    OVERLOAD: { color: "rgba(239, 68, 68, 0.7)" },
    REACTIVITY: { color: "rgba(185, 28, 28, 0.7)" },
    DISCONNECTION: { color: "rgba(59, 130, 246, 0.7)" },
    STAGNATION: { color: "rgba(107, 114, 128, 0.7)" },
};

// Simplified questions structure just to keep track of how many and which pillars
export const QUESTION_METADATA = [
    { id: 1, pillar: "SAUDE" }, { id: 2, pillar: "SAUDE" },
    { id: 3, pillar: "TRABALHO" }, { id: 4, pillar: "TRABALHO" },
    { id: 5, pillar: "RELACIONAMENTOS" }, { id: 6, pillar: "RELACIONAMENTOS" },
    { id: 7, pillar: "FINANCEIRO" }, { id: 8, pillar: "FINANCEIRO" },
    { id: 9, pillar: "IDENTIDADE" }, { id: 10, pillar: "IDENTIDADE" },
    { id: 11, pillar: "LAZER" }, { id: 12, pillar: "LAZER" },
    { id: 13, pillar: "ESPIRITUALIDADE" }, { id: 14, pillar: "ESPIRITUALIDADE" },
];

export function calculateDiagnosis(answers: Record<number, number>): DiagnosisResult {
    const pillarKeys = ["SAUDE", "TRABALHO", "RELACIONAMENTOS", "FINANCEIRO", "IDENTIDADE", "LAZER", "ESPIRITUALIDADE"];

    const pillarColors: Record<string, string> = {
        SAUDE: "#FF5F5F",
        TRABALHO: "#4FACFE",
        RELACIONAMENTOS: "#FF5D9E",
        FINANCEIRO: "#2AF598",
        IDENTIDADE: "#C471ED",
        LAZER: "#FEE140",
        ESPIRITUALIDADE: "#7980FF"
    };

    const scores: Record<string, number> = {};
    const pillarScoresList: PillarScore[] = [];

    pillarKeys.forEach(pillarKey => {
        const qIds = QUESTION_METADATA.filter(q => q.pillar === pillarKey).map(q => q.id);
        const sum = qIds.reduce((acc, qId) => acc + (answers[qId] || 0), 0);
        const avg = sum / qIds.length;
        const scoreValue = Math.round(avg * 20);
        const tier = scoreValue < 40 ? "low" : scoreValue < 75 ? "mid" : "high";

        scores[pillarKey] = avg;
        pillarScoresList.push({
            pillarKey,
            value: scoreValue,
            color: pillarColors[pillarKey],
            tier
        });
    });

    const overallAvg = Object.values(scores).reduce((a, b) => a + b, 0) / pillarKeys.length;

    // Determination Logic
    let state: DiagnosisState = "CLARITY";

    if (overallAvg >= 4.5) state = "ALIGNMENT";
    else if (overallAvg >= 3.8) state = "CLARITY";
    else if (scores.SAUDE + scores.LAZER < 5.5) state = "OVERLOAD";
    else if (scores.IDENTIDADE + scores.ESPIRITUALIDADE < 5.5) state = "DISCONNECTION";
    else if (scores.TRABALHO + scores.FINANCEIRO < 5.5) state = "UNCERTAINTY";
    else if (scores.RELACIONAMENTOS < 2.5) state = "REACTIVITY";
    else if (scores.IDENTIDADE < 3) state = "CONFUSION";
    else if (overallAvg < 2.8) state = "STAGNATION";

    const config = STATE_CONFIGS[state];

    // V3 Intelligence Logic
    const bottleneck = pillarScoresList.reduce((prev, curr) => prev.value < curr.value ? prev : curr);

    // Antifragility: (Identity + Meaning + Health) / 3
    const idScore = pillarScoresList.find(p => p.pillarKey === "IDENTIDADE")?.value || 0;
    const spirScore = pillarScoresList.find(p => p.pillarKey === "ESPIRITUALIDADE")?.value || 0;
    const healthScore = pillarScoresList.find(p => p.pillarKey === "SAUDE")?.value || 0;
    const antifragilityScore = Math.round((idScore + spirScore + healthScore) / 3);

    const correlationKeys: string[] = [];
    const workScore = pillarScoresList.find(p => p.pillarKey === "TRABALHO")?.value || 0;
    const financeScore = pillarScoresList.find(p => p.pillarKey === "FINANCEIRO")?.value || 0;
    const relScore = pillarScoresList.find(p => p.pillarKey === "RELACIONAMENTOS")?.value || 0;

    if (workScore > 80 && healthScore < 50) correlationKeys.push("work_vs_health");
    if (financeScore < 40 && relScore < 50) correlationKeys.push("finance_vs_rel");
    if (idScore > 85 && spirScore < 40) correlationKeys.push("id_vs_spir");
    if (healthScore < 40) correlationKeys.push("vitality_brake");

    if (correlationKeys.length === 0) {
        correlationKeys.push("harmony");
    }

    const archetypeKey = overallAvg > 4 ? "architect_of_destiny" : "transition_explorer";

    return {
        state,
        color: config.color,
        confidence: Math.min(100, Math.floor(70 + overallAvg * 6)),
        pillarScores: pillarScoresList,
        v3Insights: {
            antifragilityScore,
            bottleneckPillarKey: bottleneck.pillarKey,
            correlationKeys,
            archetypeKey
        }
    };
}
