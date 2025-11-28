
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { logProgress } from '@/ai/flows/log-progress';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await logProgress(body);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in log-progress API route:', error);
    return NextResponse.json({ error: error.message || 'An unexpected error occurred' }, { status: 500 });
  }
}
