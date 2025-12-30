export interface AIAnalysisRequest {
    pillarScores: { label: string; value: number }[];
    qualitativeContext: string;
    lang: string;
}

export interface AIAnalysisResponse {
    executiveSummary: string;
    sevenDayPlan: { day: string; action: string; pilar: string }[];
    stoicRefinement: string;
}

export async function getAIAnalysis(data: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
        throw new Error("OpenAI API Key not configured");
    }

    const prompt = `
    You are the STATUS CORE AI, an Elite Performance Mentor and Psychological Strategist.
    Analyze the following 7 Life Pillar scores (0-100) and the user's qualitative personal context.
    
    CRITICAL: The qualitative context ("context" below) is where the user shares their current struggle, feelings, or specific situation. 
    You MUST weave this context into your Executive Summary and Action Plan to make it feel deeply personal and not just a generic score analysis.
    
    Data:
    pillars: ${JSON.stringify(data.pillarScores)}
    context: "${data.qualitativeContext || "No context provided"}"
    language: ${data.lang}
    
    Tasks:
    1. Executive Summary: 2 paragraphs in a premium, wise, and direct tone. Analyze the correlations and the "ripple effect". If context is provided, address it directly.
    2. 7-Day Action Plan: EXACTLY 7 practical, high-impact actions (Day 1 to Day 7). Use the "pilar" field to map each day to one of the 7 pillars.
    3. Stoic Refinement: A deep stoic reflection tailored to these specific results and context.
    
    Response Format (JSON only):
    {
      "executiveSummary": "...",
      "sevenDayPlan": [
        {"day": "Day 1", "action": "...", "pilar": "..."},
        {"day": "Day 2", "action": "...", "pilar": "..."},
        {"day": "Day 3", "action": "...", "pilar": "..."},
        {"day": "Day 4", "action": "...", "pilar": "..."},
        {"day": "Day 5", "action": "...", "pilar": "..."},
        {"day": "Day 6", "action": "...", "pilar": "..."},
        {"day": "Day 7", "action": "...", "pilar": "..."}
      ],
      "stoicRefinement": "..."
    }
    `;

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
    } catch (error) {
        console.error("AI Analysis Error:", error);
        throw error;
    }
}
