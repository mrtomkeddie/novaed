
'use server';
/**
 * @fileOverview Manages user profile data in Firestore.
 * - getUserProfile: Retrieves a user's profile.
 * - saveUserProfile: Saves a user's profile.
 */
import * as admin from 'firebase-admin';
import type { UserProfile } from '@/types';

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

export async function getUserProfile({ userId }: { userId: string }): Promise<UserProfile | null> {
    initializeFirebaseAdmin();
    const db = admin.firestore();

    const doc = await db.collection('users').doc(userId).get();
    if (!doc.exists) {
        return null;
    }
    return doc.data() as UserProfile;
}

export async function saveUserProfile({ userId, profileData }: { userId: string, profileData: UserProfile }): Promise<void> {
    initializeFirebaseAdmin();
    const db = admin.firestore();

    await db.collection('users').doc(userId).set({
        ...profileData,
        lastProfileUpdate: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
}
