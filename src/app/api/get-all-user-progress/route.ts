export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getAllUserProgress } from '@/ai/flows/get-user-progress';

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const progressData = await getAllUserProgress({ userId });
    return NextResponse.json(progressData);
  } catch (error: any) {
    console.error('Error in get-all-user-progress API route:', error);
    return NextResponse.json({ error: error.message || 'An unexpected error occurred' }, { status: 500 });
  }
}
