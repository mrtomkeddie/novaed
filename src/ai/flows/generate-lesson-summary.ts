
'use server';
/**
 * @fileOverview This file is no longer in use as AI functionality has been removed.
 */
import { z } from 'zod';

// This file is retained to prevent build errors from components that may still reference its types.
// All AI logic has been removed.

const GenerateLessonSummaryOutputSchema = z.object({
  subject: z.string(),
  topic_title: z.string(),
  topic_id: z.string(),
  tutor_summary: z.string(),
  mastery_status: z.enum(['Yes', 'No']),
  xp_earned: z.number().int(),
  learning_style_used: z.enum(['Interactive', 'Visual', 'Problem-Solving', 'Expository']),
  date: z.string(),
});

export type GenerateLessonSummaryOutput = z.infer<typeof GenerateLessonSummaryOutputSchema>;
