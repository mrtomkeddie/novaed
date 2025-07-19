'use server';
/**
 * @fileOverview Manages fetching user progress from Firestore.
 * - getUserProgress: Fetches the most recent progress for a specific subject.
 * - getAllUserProgressFlow: Fetches all progress records for a user.
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

// Using z.any() because the structure is already defined by GenerateLessonSummaryOutput
const ProgressOutputSchema = z.any(); 

export const getUserProgress = ai.defineFlow(
  {
    name: 'getUserProgress',
    inputSchema: GetUserProgressInputSchema,
    outputSchema: ProgressOutputSchema,
  },
  async ({ userId, subjectId }) => {
    initializeFirebaseAdmin();
    const db = admin.firestore();

    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return null;

    const snapshot = await db.collection('users').doc(userId).collection('progress')
      .where('subject', '==', subject.name)
      .orderBy('date', 'desc')
      .limit(1)
      .get();
      
    if (snapshot.empty) {
      return null;
    }
    
    return snapshot.docs[0].data() as GenerateLessonSummaryOutput;
  }
);

export const getAllUserProgressFlow = ai.defineFlow(
    {
        name: 'getAllUserProgressFlow',
        inputSchema: GetAllUserProgressInputSchema,
        outputSchema: z.array(ProgressOutputSchema),
    },
    async ({ userId }) => {
        initializeFirebaseAdmin();
        const db = admin.firestore();
        
        const snapshot = await db.collection('users').doc(userId).collection('progress').get();
        
        if (snapshot.empty) {
            return [];
        }

        return snapshot.docs.map(doc => doc.data() as GenerateLessonSummaryOutput);
    }
);
