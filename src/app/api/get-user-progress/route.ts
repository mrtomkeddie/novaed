'use server';

import { NextResponse } from 'next/server';
import { getUserProgress as getUserProgressFlow } from '@/ai/flows/get-user-progress';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const progress = await getUserProgressFlow(body);
    return NextResponse.json(progress);
  } catch (error: any) {
    console.error('Error in get-user-progress API route:', error);
    return NextResponse.json({ error: error.message || 'An unexpected error occurred' }, { status: 500 });
  }
}
