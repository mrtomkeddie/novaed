
'use server';
/**
 * @fileOverview Generates a summary of a user's lesson interaction.
 * - generateLessonSummary: Creates a summary, determines mastery, and assigns XP.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the structure for a single message in the chat history.
const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
});

// Define the input schema for the lesson summary flow.
const GenerateLessonSummaryInputSchema = z.object({
  subject: z.string().describe('The subject the user was studying, e.g., "Maths (Core)".'),
  topicTitle: z.string().describe('The specific topic title of the lesson, e.g., "Number Sense: Place value, ordering, negative numbers, rounding".'),
  topicId: z.string().describe('The unique identifier for the topic, e.g., "mc-1-1".'),
  chatHistory: z.array(ChatMessageSchema).describe('The full conversation history for the lesson.'),
});

// Define the output schema for the lesson summary.
export const GenerateLessonSummaryOutputSchema = z.object({
  subject: z.string().describe('The subject of the lesson.'),
  topic_title: z.string().describe('The title of the lesson topic.'),
  topic_id: z.string().describe('The unique ID of the topic.'),
  tutor_summary: z.string().describe("A concise (1-2 sentence) summary from the tutor's perspective on how the lesson went."),
  mastery_status: z.enum(['Yes', 'No']).describe("A simple 'Yes' or 'No' based on whether the student showed a good understanding of the topic."),
  xp_earned: z.number().int().describe('Experience points earned. 100 for mastery, 25 if needs review.'),
  learning_style_used: z.enum(['Interactive', 'Visual', 'Problem-Solving', 'Expository']).describe('The primary teaching style used in the lesson.'),
  date: z.string().describe('The date of the lesson in ISO 8601 format.'),
});

export type GenerateLessonSummaryOutput = z.infer<typeof GenerateLessonSummaryOutputSchema>;

export async function generateLessonSummary(input: z.infer<typeof GenerateLessonSummaryInputSchema>): Promise<GenerateLessonSummaryOutput> {
  return lessonSummaryFlow(input);
}

// Define the prompt for the AI to generate the summary.
const lessonSummaryPrompt = ai.definePrompt({
  name: 'lessonSummaryPrompt',
  input: { schema: GenerateLessonSummaryInputSchema },
  output: { schema: GenerateLessonSummaryOutputSchema },
  prompt: `You are an expert educational assessor. Your task is to analyze a student's chat conversation with an AI tutor and generate a concise summary of their performance.

Analyze the provided chat history for the lesson on "{{topicTitle}}" in the subject "{{subject}}".

Based on the conversation:
1.  **Tutor Summary**: Write a brief, one-sentence summary of how the student engaged with the lesson.
2.  **Mastery Status**: Determine if the student grasped the key concepts. If they answered most questions correctly and seemed confident, set 'mastery_status' to "Yes". If they struggled, were corrected often, or ended the lesson early, set it to "No".
3.  **XP Earned**: Award 100 XP if mastery_status is "Yes", and 25 XP if it's "No".
4.  **Learning Style**: Identify the dominant teaching style from the tutor's messages.
5.  **Fill all other fields** with the provided data (subject, topic_title, topic_id). Set the date to today.

Here is the chat history:
{{#each chatHistory}}
{{role}}: {{content}}
{{/each}}
`,
});

// Define the main flow that calls the prompt.
const lessonSummaryFlow = ai.defineFlow(
  {
    name: 'generateLessonSummaryFlow',
    inputSchema: GenerateLessonSummaryInputSchema,
    outputSchema: GenerateLessonSummaryOutputSchema,
  },
  async (input) => {
    // Add the current date to the input before calling the prompt.
    const datedInput = {
        ...input,
        date: new Date().toISOString(),
    };
    
    const { output } = await lessonSummaryPrompt(datedInput);
    
    // Ensure the output is not null.
    if (!output) {
      throw new Error("Failed to generate lesson summary.");
    }

    return output;
  }
);
