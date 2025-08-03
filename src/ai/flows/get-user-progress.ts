
'use server';
/**
 * @fileOverview Manages fetching user progress from Firestore.
 * - getLastUserProgress: Fetches the most recent progress for a specific subject.
 * - getAllUserProgress: Fetches all progress records for a user.
 */

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

// Helper function to safely serialize Firestore data, converting Timestamps to ISO strings.
function serializeFirestoreDoc(doc: admin.firestore.DocumentData) {
    const data = doc.data();
    if (data.date && typeof data.date.toDate === 'function') {
        data.date = data.date.toDate().toISOString();
    }
    return data;
}

export async function getLastUserProgress({ userId, subjectId }: { userId: string, subjectId: string }): Promise<GenerateLessonSummaryOutput | null> {
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
    
    return serializeFirestoreDoc(snapshot.docs[0]) as GenerateLessonSummaryOutput;
}

export async function getAllUserProgress({ userId }: { userId: string }): Promise<GenerateLessonSummaryOutput[]> {
    initializeFirebaseAdmin();
    const db = admin.firestore();
    
    const snapshot = await db.collection('users').doc(userId).collection('progress').get();
    
    if (snapshot.empty) {
        return [];
    }

    return snapshot.docs.map(doc => serializeFirestoreDoc(doc) as GenerateLessonSummaryOutput);
}
