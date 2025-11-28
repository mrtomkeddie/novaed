
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getUserProfile } from '@/ai/flows/user-profile';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const profile = await getUserProfile(body);
    return NextResponse.json(profile);
  } catch (error: any) {
    console.error('Error in get-user-profile API route:', error);
    return NextResponse.json({ error: error.message || 'An unexpected error occurred' }, { status: 500 });
  }
}
