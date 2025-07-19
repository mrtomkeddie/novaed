'use server';

import { NextResponse } from 'next/server';
import { getAITutorFeedback } from '@/ai/flows/get-ai-tutor-feedback';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const feedback = await getAITutorFeedback(body);
    return NextResponse.json(feedback);
  } catch (error: any) {
    console.error('Error in get-ai-tutor-feedback API route:', error);
    return NextResponse.json({ error: error.message || 'An unexpected error occurred' }, { status: 500 });
  }
}
