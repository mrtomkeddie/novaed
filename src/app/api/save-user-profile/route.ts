'use server';

import { NextResponse } from 'next/server';
import { saveUserProfile } from '@/ai/flows/user-profile';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await saveUserProfile(body);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in save-user-profile API route:', error);
    return NextResponse.json({ error: error.message || 'An unexpected error occurred' }, { status: 500 });
  }
}
