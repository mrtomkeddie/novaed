
'use server';

import type { GenerateLessonSummaryOutput } from '@/ai/flows/generate-lesson-summary';
import type { UserProfile } from '@/types';
import { logProgress } from '@/ai/flows/log-progress';
import { getUserProfile, saveUserProfile } from '@/ai/flows/user-profile';
import { getAllUserProgress, getLastUserProgress } from '@/ai/flows/get-user-progress';

// This file now acts as a simple bridge between your server components/API routes and the server functions.

export async function saveUserProfileService(userId: string, profileData: UserProfile): Promise<void> {
  await saveUserProfile({ userId, profileData });
}

export async function getUserProfileService(userId: string): Promise<UserProfile | null> {
  return await getUserProfile({ userId });
}

export async function saveUserProgress(userId: string, summary: GenerateLessonSummaryOutput): Promise<{success: boolean, error?: string}> {
    return await logProgress({ userId, summary });
}

export async function getLastUserProgressService(userId: string, subjectId: string): Promise<GenerateLessonSummaryOutput | null> {
    return await getLastUserProgress({ userId, subjectId });
}

export async function getAllUserProgressService(userId: string): Promise<GenerateLessonSummaryOutput[]> {
    return await getAllUserProgress({ userId });
}
