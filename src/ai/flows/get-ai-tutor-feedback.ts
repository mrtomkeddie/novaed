
'use server';
/**
 * @fileOverview Provides AI-driven feedback for a tutoring session.
 * - getAITutorFeedback: Generates a response from the AI tutor based on the chat history.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import fs from 'fs';
import path from 'path';

// Define the structure for a single message in the chat history.
const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
});

// Define the input schema for the feedback flow.
const GetAITutorFeedbackInputSchema = z.object({
  userId: z.string(),
  topicTitle: z.string().describe('The specific topic title of the lesson.'),
  subject: z.string().describe('The subject the user is studying.'),
  chatHistory: z.array(ChatMessageSchema).describe('The conversation history so far.'),
});

// Define the output schema for the AI's feedback.
const GetAITutorFeedbackOutputSchema = z.object({
  feedback: z.string().describe("The AI tutor's next message to the user."),
  multipleChoiceOptions: z.array(z.string()).nullable().describe('An optional list of multiple-choice answers for the user.'),
});
export type GetAITutorFeedbackOutput = z.infer<typeof GetAITutorFeedbackOutputSchema>;


// Define the main flow.
const aiTutorFeedbackFlow = ai.defineFlow(
  {
    name: 'getAITutorFeedbackFlow',
    inputSchema: GetAITutorFeedbackInputSchema,
    outputSchema: GetAITutorFeedbackOutputSchema,
  },
  async (input) => {

    // Read the master prompt from the markdown file.
    const promptFilePath = path.join(process.cwd(), 'prompt.md');
    const masterPrompt = fs.readFileSync(promptFilePath, 'utf-8');

    const firstMessageRule = input.chatHistory.length <= 1 
      ? `This is the very first message. Start with a greeting and a simple, encouraging question to begin the lesson on "${input.topicTitle}".`
      : `This is a continuing conversation. Your response should be based on the user's last message.`;
    
    // The prompt now combines the master instructions with dynamic data.
    const prompt = `
      ${masterPrompt}

      You are an AI assistant that provides tutoring feedback. Your goal is to teach the user about "${input.topicTitle}" in the subject "${input.subject}".

      Rules for this specific interaction:
      1.  Keep your responses under 60 words.
      2.  Ask one question at a time.
      3.  Always end your response with a question to the user.
      4.  ${firstMessageRule}
      5.  Provide your response in a JSON format with two fields: 'feedback' (your message to the user) and 'multipleChoiceOptions' (an array of strings for the user to choose from, or null if it's an open question).
      6.  If the user's answer is a single word or short phrase, provide 2-4 multiple-choice options.
      7.  If the user gives a detailed answer, ask an open-ended follow-up question and set 'multipleChoiceOptions' to null.
      
      Analyze the chat history and provide the next message based on all the instructions above.

      Chat History:
      {{#each chatHistory}}
      {{role}}: {{content}}
      {{/each}}
    `;
    
    const { output } = await ai.generate({
      prompt,
      model: 'openai/gpt-4o',
      output: {
          schema: GetAITutorFeedbackOutputSchema,
      },
      context: {
        chatHistory: input.chatHistory,
      },
    });

    if (!output) {
      throw new Error("Failed to get AI tutor feedback.");
    }
    
    return output;
  }
);

export async function getAITutorFeedback(input: z.infer<typeof GetAITutorFeedbackInputSchema>): Promise<GetAITutorFeedbackOutput> {
  return aiTutorFeedbackFlow(input);
}
