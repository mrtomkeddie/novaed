
'use server';
/**
 * @fileOverview Manages logging user progress to Firestore.
 * - logProgress: Saves a lesson summary for a user.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import * as admin from 'firebase-admin';

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

const LogProgressInputSchema = z.object({
  userId: z.string(),
  summary: z.any(), // Using z.any() because the structure is already defined by GenerateLessonSummaryOutput
});

const LogProgressOutputSchema = z.object({
  success: z.boolean(),
  error: z.string().optional(),
});

const logProgressFlow = ai.defineFlow(
  {
    name: 'logProgress',
    inputSchema: LogProgressInputSchema,
    outputSchema: LogProgressOutputSchema,
  },
  async ({ userId, summary }) => {
    try {
      initializeFirebaseAdmin();
      const db = admin.firestore();
      
      const progressRef = db.collection('users').doc(userId).collection('progress').doc();
      
      await progressRef.set({
        ...summary,
        // Ensure date is a Firestore timestamp for proper ordering.
        date: admin.firestore.Timestamp.fromDate(new Date(summary.date)),
      });

      return { success: true };
    } catch (error: any) {
      console.error("Error logging progress:", error);
      return { success: false, error: error.message || 'An unknown error occurred' };
    }
  }
);

export async function logProgress(input: z.infer<typeof LogProgressInputSchema>): Promise<z.infer<typeof LogProgressOutputSchema>> {
  return logProgressFlow(input);
}
