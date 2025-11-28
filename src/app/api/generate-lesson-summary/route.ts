export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { generateLessonSummary } from '@/ai/flows/generate-lesson-summary';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const summary = await generateLessonSummary(body);
    return NextResponse.json(summary);
  } catch (error: any) {
    console.error('Error in generate-lesson-summary API route:', error);
    return NextResponse.json({ error: error.message || 'An unexpected error occurred' }, { status: 500 });
  }
}
