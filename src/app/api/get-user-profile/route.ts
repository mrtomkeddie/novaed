'use server';

import { NextResponse } from 'next/server';
import { getUserProfile } from '@/ai/flows/user-profile';

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const profile = await getUserProfile({ userId });
    return NextResponse.json(profile);
  } catch (error: any) {
    console.error('Error in get-user-profile API route:', error);
    return NextResponse.json({ error: error.message || 'An unexpected error occurred' }, { status: 500 });
  }
}
