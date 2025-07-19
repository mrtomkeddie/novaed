
'use server';
/**
 * @fileOverview Manages fetching user progress from Firestore.
 * - getLastUserProgress: Fetches the most recent progress for a specific subject.
 * - getAllUserProgress: Fetches all progress records for a user.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import * as admin from 'firebase-admin';
import { subjects } from '@/data/subjects';
import type { GenerateLessonSummaryOutput } from '@/ai/flows/generate-lesson-summary';

// Helper function to initialize Firebase Admin SDK safely.
function initializeFirebaseAdmin() {
    if (admin.apps.length > 0) {
        return admin.app();
    }
    // Make sure to use the correct project ID from environment variables.
    return admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
}

const GetUserProgressInputSchema = z.object({
  userId: z.string(),
  subjectId: z.string(),
});

const GetAllUserProgressInputSchema = z.object({
  userId: z.string(),
});

// The schema should be nullable to handle cases where no progress is found.
const ProgressOutputSchema = z.any().nullable(); 

// Helper function to safely serialize Firestore data
function serializeFirestoreDoc(doc: admin.firestore.DocumentData | undefined): GenerateLessonSummaryOutput | null {
    if (!doc) return null;
    
    const data = doc;
    // Safely convert Firestore Timestamp to ISO string
    if (data.date && typeof data.date.toDate === 'function') {
        data.date = data.date.toDate().toISOString();
    }
    
    return data as GenerateLessonSummaryOutput;
}


const getUserProgressFlow = ai.defineFlow(
  {
    name: 'getUserProgress',
    inputSchema: GetUserProgressInputSchema,
    outputSchema: ProgressOutputSchema,
  },
  async ({ userId, subjectId }) => {
    initializeFirebaseAdmin();
    const db = admin.firestore();

    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) {
        console.warn(`Subject not found for ID: ${subjectId}`);
        return null;
    }

    const snapshot = await db.collection('users').doc(userId).collection('progress')
      .where('subject', '==', subject.name)
      .orderBy('date', 'desc')
      .limit(1)
      .get();
      
    if (snapshot.empty) {
      return null;
    }
    
    // Serialize the document data before returning
    return serializeFirestoreDoc(snapshot.docs[0].data());
  }
);

const getAllUserProgressFlow = ai.defineFlow(
    {
        name: 'getAllUserProgressFlow',
        inputSchema: GetAllUserProgressInputSchema,
        outputSchema: z.array(z.any()),
    },
    async ({ userId }) => {
        initializeFirebaseAdmin();
        const db = admin.firestore();
        
        const snapshot = await db.collection('users').doc(userId).collection('progress')
            .orderBy('date', 'desc')
            .get();
        
        if (snapshot.empty) {
            return [];
        }

        // Serialize each document in the array
        return snapshot.docs.map(doc => serializeFirestoreDoc(doc.data())).filter(Boolean) as GenerateLessonSummaryOutput[];
    }
);

export async function getLastUserProgress(input: z.infer<typeof GetUserProgressInputSchema>): Promise<GenerateLessonSummaryOutput | null> {
    return getUserProgressFlow(input);
}

export async function getAllUserProgress(input: z.infer<typeof GetAllUserProgressInputSchema>): Promise<GenerateLessonSummaryOutput[]> {
    return getAllUserProgressFlow(input);
}
