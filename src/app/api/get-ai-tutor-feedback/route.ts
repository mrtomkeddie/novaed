'use server';

import { NextResponse } from 'next/server';
import { getAITutorFeedback } from '@/ai/flows/get-ai-tutor-feedback';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.userId || !body.topicTitle || !body.subject || !body.chatHistory || !body.lessonPhase) {
      return NextResponse.json({ 
        error: 'Missing required fields: userId, topicTitle, subject, chatHistory, lessonPhase' 
      }, { status: 400 });
    }
    
    const feedback = await getAITutorFeedback(body);
    
    // Ensure the response has the expected structure
    if (!feedback || typeof feedback.feedback !== 'string') {
      console.error('Invalid feedback structure:', feedback);
      return NextResponse.json({ 
        error: 'Invalid response structure from AI tutor' 
      }, { status: 500 });
    }
    
    return NextResponse.json(feedback);
  } catch (error: any) {
    console.error('Error in get-ai-tutor-feedback API route:', error);
    
    // Provide more specific error messages
    if (error.name === 'ZodError') {
      return NextResponse.json({ 
        error: 'Schema validation failed: ' + error.message 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: error.message || 'An unexpected error occurred' 
    }, { status: 500 });
  }
}
