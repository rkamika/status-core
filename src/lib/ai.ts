export interface AIAnalysisRequest {
    pillarScores: { label: string; value: number }[];
    qualitativeContext: string;
    lang: string;
    type?: 'brief' | 'deep';
}

export interface AIAnalysisResponse {
    executiveSummary?: string;
    sevenDayPlan?: { day: string; action: string; pilar: string }[];
    stoicRefinement?: string;
    deepDiveAnalysis?: string;
}

export async function getAIAnalysis(data: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
        throw new Error("OpenAI API Key not configured");
    }

    const isDeep = data.type === 'deep';

    const prompt = isDeep ? `
    You are the STATUS CORE AI, an Elite Performance Mentor and Psychological Strategist.
    Analyze the following 7 Life Pillar scores (0-100) and the user's qualitative personal context.
    
    TASK: DEEP DIVE ANALYSIS
    Generate an EXTENSIVE (8-10 paragraphs), highly detailed systemic analysis in ${data.lang}. 
    Explain how the weakest pillars are affecting the strongest ones, the long-term risks if no action is taken, and the "Hidden Logic" behind their current state. 
    This must be the most valuable part of the report. It should read like chapters of a high-end strategy book.
    Address the user's qualitative context directly: "${data.qualitativeContext || "No context provided"}"
    
    Data:
    pillars: ${JSON.stringify(data.pillarScores)}
    
    Response Format (JSON only):
    {
      "deepDiveAnalysis": "..."
    }
    ` : `
    You are the STATUS CORE AI, an Elite Performance Mentor and Psychological Strategist.
    Analyze the following 7 Life Pillar scores (0-100) and the user's qualitative personal context.
    
    CRITICAL: The qualitative context ("context" below) is where the user shares their current struggle, feelings, or specific situation. 
    You MUST weave this context into your Executive Summary and Action Plan to make it feel deeply personal and not just a generic score analysis.
    
    LANGUAGE REQUIREMENT: You MUST respond in ${data.lang}. All text in the JSON fields must be in ${data.lang}.
    
    Data:
    pillars: ${JSON.stringify(data.pillarScores)}
    context: "${data.qualitativeContext || "No context provided"}"
    language: ${data.lang}
    
    Tasks:
    1. Executive Summary: 2 paragraphs in a premium, wise, and direct tone. Analyze the correlations and the "ripple effect". If context is provided, address it directly.
    2. 7-Day Action Plan: EXACTLY 7 practical, high-impact actions (Day 1 to Day 7). Use the "pilar" field to map each day to one of the 7 pillars.
       - IMPORTANT: Translate the "day" field (e.g., "Dia 1", "Day 1", "Día 1") into the user's language.
       - IMPORTANT: Translate the "pilar" field to one of these: ${Object.values(data.pillarScores).map(p => p.label).join(', ')}.
    3. Stoic Refinement: A deep stoic reflection tailored to these specific results and context.
    
    Response Format (JSON only):
    {
      "executiveSummary": "...",
      "sevenDayPlan": [
        {"day": "...", "action": "...", "pilar": "..."},
        {"day": "...", "action": "...", "pilar": "..."},
        {"day": "...", "action": "...", "pilar": "..."},
        {"day": "...", "action": "...", "pilar": "..."},
        {"day": "...", "action": "...", "pilar": "..."},
        {"day": "...", "action": "...", "pilar": "..."},
        {"day": "...", "action": "...", "pilar": "..."}
      ],
      "stoicRefinement": "..."
    }
    `;

    try {
        let retries = 2;
        let lastError = null;

        while (retries > 0) {
            try {
                const response = await fetch("https://api.openai.com/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${apiKey}`,
                    },
                    body: JSON.stringify({
                        model: "gpt-4o",
                        messages: [
                            { role: "system", content: "You are a specialized life strategist. Respond ONLY with valid JSON." },
                            { role: "user", content: prompt }
                        ],
                        response_format: { type: "json_object" }
                    }),
                });

                const json = await response.json();

                if (json.error) {
                    throw new Error(json.error.message);
                }

                return JSON.parse(json.choices[0].message.content);
            } catch (error: any) {
                console.warn(`AI Analysis Retry (${3 - retries}):`, error.message);
                lastError = error;
                retries--;
                if (retries > 0) await new Promise(r => setTimeout(r, 1000));
            }
        }
        throw lastError;
    } catch (error) {
        console.error("AI Analysis Error:", error);
        throw error;
    }
}
