
'use server';
/**
 * @fileOverview Manages user profile data.
 * For this simplified version, it always returns a hardcoded profile for "Charlie".
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { UserProfile } from '@/types';

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

// A hardcoded default profile.
const defaultProfile: UserProfile = { displayName: 'Charlie' };

const getUserProfileFlow = ai.defineFlow(
  {
    name: 'getUserProfile',
    inputSchema: GetUserProfileInputSchema,
    outputSchema: UserProfileSchema.nullable(),
  },
  async () => {
    // Always return the hardcoded "Charlie" profile.
    return defaultProfile;
  }
);

const saveUserProfileFlow = ai.defineFlow(
    {
        name: 'saveUserProfile',
        inputSchema: SaveUserProfileInputSchema,
        outputSchema: z.void(),
    },
    async () => {
        // This function no longer does anything, as the profile is hardcoded.
        console.log("Profile saving is disabled.");
        return;
    }
);

export async function getUserProfile(input: z.infer<typeof GetUserProfileInputSchema>): Promise<UserProfile | null> {
    return getUserProfileFlow(input);
}

export async function saveUserProfile(input: z.infer<typeof SaveUserProfileInputSchema>): Promise<void> {
    return saveUserProfileFlow(input);
}
