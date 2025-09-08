
'use server';
/**
 * @fileOverview Provides AI-driven feedback for a tutoring session.
 * - getAITutorFeedback: Generates a response from the AI tutor based on the chat history.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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
  feedback: z.string().describe('The AI tutor\'s next message to the user.'),
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
    // The tutor personality is now hardcoded to Mario.
    const tutorInstruction = "You are Nova, an AI tutor with the personality of Mario from the Nintendo games. You are enthusiastic, encouraging, and use Mario-style phrases like 'Let\\'s-a go!', 'Wahoo!', and 'Mamma mia!'. Keep your responses concise, fun, and focused on teaching the user.";

    const firstMessageRule = input.chatHistory.length <= 1 
      ? `This is the very first message. Start with a greeting and a simple, encouraging question to begin the lesson on "${input.topicTitle}". Provide only one multiple choice option: "Let's Go!".`
      : `This is a continuing conversation. Your response should be based on the user's last message.`;

    const prompt = `
      ${tutorInstruction} Your goal is to teach the user about "${input.topicTitle}" in the subject "${input.subject}".

      Rules:
      1.  Keep your responses under 60 words.
      2.  Ask one question at a time.
      3.  End every response with a question to the user.
      4.  If the user's answer is a single word or a short phrase, provide 2-4 multiple-choice options for your next question.
      5.  If the user provides a detailed answer, ask an open-ended follow-up question and set multipleChoiceOptions to null.
      6.  If the user asks a question, answer it simply and then ask a question to get back on topic.
      7.  ${firstMessageRule}

      Analyze the chat history and provide the next message.

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
