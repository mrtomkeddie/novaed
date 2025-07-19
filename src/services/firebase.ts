
'use server';

import * as admin from 'firebase-admin';
import type { GenerateLessonSummaryOutput } from '@/ai/flows/generate-lesson-summary';
import type { UserProfile } from '@/types';
import { subjects } from '@/data/subjects';

// This function initializes Firebase Admin SDK. It's safe to call multiple times.
function initializeFirebaseAdmin() {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

    // Strict check for credentials before proceeding.
    if (!projectId) {
        console.warn(`Firebase Project ID is not set. Missing: NEXT_PUBLIC_FIREBASE_PROJECT_ID. Server-side Firestore operations will be skipped.`);
        return null;
    }
    
    // Use Application Default Credentials if already initialized
    if (admin.apps.length > 0) {
        return admin.app();
    }

    try {
        // Initialize with Application Default Credentials
        admin.initializeApp({
            credential: admin.credential.applicationDefault(),
            projectId: projectId,
        });
        return admin.app();
    } catch (error: any) {
        console.error('Firebase Admin Initialization Error:', error.message);
        // Return null on failure to prevent crashes
        return null;
    }
}

/**
 * Saves a user's profile data to Firestore.
 */
export async function saveUserProfile(userId: string, profileData: UserProfile): Promise<void> {
  const app = initializeFirebaseAdmin();
  if (!app) {
      console.warn("Skipping saveUserProfile: Firebase Admin not initialized.");
      return;
  }
  
  try {
    const db = admin.firestore();
    
    if (!userId) {
      throw new Error("User ID is required to save the profile.");
    }
    
    const userRef = db.collection('users').doc(userId);
    await userRef.set({
        ...profileData,
        lastProfileUpdate: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

  } catch (error: any) {
    console.error("Failed to save user profile:", error.message);
    throw new Error(error.message || 'An unexpected error occurred while saving the profile.');
  }
}

/**
 * Retrieves a user's profile data from Firestore.
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
    const app = initializeFirebaseAdmin();
    if (!app) {
        console.warn("Skipping getUserProfile: Firebase Admin not initialized.");
        return null;
    }

    try {
        const db = admin.firestore();

        if (!userId) {
            console.error("User ID is required to get a profile.");
            return null;
        }

        const userRef = db.collection('users').doc(userId);
        const doc = await userRef.get();

        if (!doc.exists) {
            return null;
        }

        return doc.data() as UserProfile;
    } catch (error) {
        if (error instanceof Error) {
            console.warn(`Could not get user profile: ${error.message}`);
        } else {
            console.warn('An unknown error occurred while getting user profile.');
        }
        return null;
    }
}

/**
 * Saves a user's lesson progress to Firestore.
 */
export async function saveUserProgress(userId: string, summary: GenerateLessonSummaryOutput): Promise<void> {
  const app = initializeFirebaseAdmin();
  if (!app) {
      console.warn("Skipping saveUserProgress: Firebase Admin not initialized.");
      return;
  }
  
  try {
    const db = admin.firestore();

    if (!userId) {
      throw new Error("User ID is required to save progress.");
    }
    if (!summary.topic_id) {
        throw new Error("Topic ID is missing from the summary and is required to save progress.");
    }


    const progressRef = db
      .collection('users')
      .doc(userId)
      .collection('progress')
      .doc(summary.topic_id); // Use topic_id for uniqueness per lesson

    await progressRef.set(summary, { merge: true });
    
    const userRef = db.collection('users').doc(userId);
    await userRef.set({
      lastProgressUpdate: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

  } catch (error: any) {
    console.error('Error saving progress to Firestore:', error.message);
    throw new Error('Failed to save progress to Firestore.');
  }
}

/**
 * Retrieves the last lesson progress for a specific subject for a user.
 */
export async function getLastUserProgress(userId: string, subjectId: string): Promise<GenerateLessonSummaryOutput | null> {
    const app = initializeFirebaseAdmin();
    if (!app) {
        console.warn("Skipping getLastUserProgress: Firebase Admin not initialized.");
        return null;
    }

    try {
        const allProgress = await getAllUserProgress(userId);
        if (allProgress.length === 0) {
            return null;
        }
        
        // Find the subject object to get its name
        const subject = subjects.find(s => s.id === subjectId);
        if (!subject) {
            return null; // Subject not found
        }
        
        // Filter progress for the given subject by name
        const subjectProgress = allProgress.filter(p => p.subject === subject.name);
        
        // If no progress for this subject, return null
        if (subjectProgress.length === 0) {
            return null;
        }

        // Sort the filtered progress by date to find the most recent one
        subjectProgress.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return subjectProgress[0];

    } catch (error) {
        if (error instanceof Error) {
            console.warn(`Could not get last user progress for subject ${subjectId}: ${error.message}`);
        } else {
            console.warn(`An unknown error occurred while getting last user progress for subject ${subjectId}.`);
        }
        return null;
    }
}


/**
 * Retrieves all lesson progress summaries for a user.
 */
export async function getAllUserProgress(userId: string): Promise<GenerateLessonSummaryOutput[]> {
    const app = initializeFirebaseAdmin();
    if (!app) {
        console.warn("Skipping getAllUserProgress: Firebase Admin not initialized.");
        return [];
    }

    try {
        const db = admin.firestore();

        if (!userId) {
            console.error("User ID is required to get progress.");
            return [];
        }
    
        const progressCollectionRef = db
            .collection('users')
            .doc(userId)
            .collection('progress');

        const snapshot = await progressCollectionRef.get();

        if (snapshot.empty) {
            return [];
        }

        return snapshot.docs.map(doc => doc.data() as GenerateLessonSummaryOutput);
    } catch (error) {
        if (error instanceof Error) {
            console.warn(`Could not get all user progress: ${error.message}`);
        } else {
            console.warn('An unknown error occurred while getting all user progress.');
        }
        return []; // Return empty array on error
    }
}
