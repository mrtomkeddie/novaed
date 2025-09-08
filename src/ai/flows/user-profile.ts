
'use server';
/**
 * @fileOverview Manages user profile data in Firestore.
 * - getUserProfile: Retrieves a user's profile.
 * - saveUserProfile: Saves a user's profile.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import * as admin from 'firebase-admin';
import type { UserProfile } from '@/types';

// Helper function to initialize Firebase Admin SDK safely.
function initializeFirebaseAdmin() {
    if (admin.apps.length > 0) {
        return admin.app();
    }
    return admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: process.env.FIREBASE_PROJECT_ID,
    });
}

const UserProfileSchema = z.object({
    displayName: z.string(),
});

const GetUserProfileInputSchema = z.object({
    userId: z.string(),
});

const SaveUserProfileInputSchema = z.object({
  userId: z.string(),
  profileData: UserProfileSchema,
});

const getUserProfileFlow = ai.defineFlow(
  {
    name: 'getUserProfile',
    inputSchema: GetUserProfileInputSchema,
    outputSchema: UserProfileSchema.nullable(),
  },
  async ({ userId }) => {
    initializeFirebaseAdmin();
    const db = admin.firestore();

    const doc = await db.collection('users').doc(userId).get();
    if (!doc.exists) {
        // If profile doesn't exist, create a default one for "Charlie"
        const defaultProfile = { displayName: 'Charlie' };
        await db.collection('users').doc(userId).set(defaultProfile);
        return defaultProfile;
    }
    return doc.data() as UserProfile;
  }
);

const saveUserProfileFlow = ai.defineFlow(
    {
        name: 'saveUserProfile',
        inputSchema: SaveUserProfileInputSchema,
        outputSchema: z.void(),
    },
    async ({ userId, profileData }) => {
        initializeFirebaseAdmin();
        const db = admin.firestore();

        await db.collection('users').doc(userId).set({
            ...profileData,
            lastProfileUpdate: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
    }
);

export async function getUserProfile(input: z.infer<typeof GetUserProgressInputSchema>): Promise<UserProfile | null> {
    return getUserProfileFlow(input);
}

export async function saveUserProfile(input: z.infer<typeof SaveUserProfileInputSchema>): Promise<void> {
    return saveUserProfileFlow(input);
}

export type GetUserProgressInputSchema = z.infer<typeof GetUserProfileInputSchema>
