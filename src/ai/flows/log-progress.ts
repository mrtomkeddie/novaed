
'use server';
/**
 * @fileOverview Manages logging user progress to Firestore.
 * - logProgress: Saves a lesson summary for a user.
 */

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


export async function logProgress({ userId, summary }: { userId: string, summary: any }): Promise<{success: boolean, error?: string}> {
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
