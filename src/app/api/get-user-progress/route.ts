
'use server';

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    // User progress functionality is disabled.
    return NextResponse.json({ error: 'User progress functionality is currently disabled.' }, { status: 503 });
}
