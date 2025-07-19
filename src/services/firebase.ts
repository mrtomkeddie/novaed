
'use server';

import type { GenerateLessonSummaryOutput } from '@/ai/flows/generate-lesson-summary';
import type { UserProfile } from '@/types';
import { logProgress } from '@/ai/flows/log-progress';
import { getUserProfile as getUserProfileFlow, saveUserProfile as saveUserProfileFlow } from '@/ai/flows/user-profile';
import { getAllUserProgress as getAllUserProgressFlow, getUserProgress as getUserProgressFlow } from '@/ai/flows/get-user-progress';

// This file now acts as a simple bridge between your server components/API routes and the Genkit flows.
// This keeps a clean separation of concerns.

export async function saveUserProfile(userId: string, profileData: UserProfile): Promise<void> {
  await saveUserProfileFlow({ userId, profileData });
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  return await getUserProfileFlow({ userId });
}

export async function saveUserProgress(userId: string, summary: GenerateLessonSummaryOutput): Promise<void> {
    await logProgress({ userId, summary });
}

export async function getLastUserProgress(userId: string, subjectId: string): Promise<GenerateLessonSummaryOutput | null> {
    return await getUserProgressFlow({ userId, subjectId });
}

export async function getAllUserProgress(userId: string): Promise<GenerateLessonSummaryOutput[]> {
    return await getAllUserProgressFlow({ userId });
}
