import { NextResponse } from 'next/server';
import { getAIAnalysis } from '@/lib/ai';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const analysis = await getAIAnalysis(body);
        return NextResponse.json(analysis);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
