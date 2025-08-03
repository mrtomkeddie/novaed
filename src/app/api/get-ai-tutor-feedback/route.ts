
'use server';

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    // AI functionality is disabled.
    return NextResponse.json({ error: 'AI functionality is currently disabled.' }, { status: 503 });
}
