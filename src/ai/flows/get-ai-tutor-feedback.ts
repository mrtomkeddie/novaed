
'use server';
/**
 * @fileOverview Provides AI-driven feedback for a tutoring session.
 * - getAITutorFeedback: Generates a response from the AI tutor based on the chat history.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { masterPrompt } from '@/data/prompts/master';
import { mathsPrompt } from '@/data/prompts/maths';
import { sciencePrompt } from '@/data/prompts/science';
import { englishPrompt } from '@/data/prompts/english';
import { creatorPrompt } from '@/data/prompts/creator';

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
  lessonPhase: z.enum(['Warm-Up & Recap', 'Teach & Assess', 'Wind-Down & Bonus']).describe('The current phase of the 25-minute lesson.'),
});

// Define the output schema for the AI's feedback.
const GetAITutorFeedbackOutputSchema = z.object({
  feedback: z.string().describe("The AI tutor's next message to the user."),
  multipleChoiceOptions: z.array(z.string()).nullable().describe('An optional list of multiple-choice answers for the user.'),
});
export type GetAITutorFeedbackOutput = z.infer<typeof GetAITutorFeedbackOutputSchema>;

// Helper to get the correct subject prompt
const getSubjectPrompt = (subjectName: string): string => {
    const lowerCaseSubject = subjectName.toLowerCase();
    if (lowerCaseSubject.includes('maths')) {
        return mathsPrompt;
    }
    if (lowerCaseSubject.includes('physics') || lowerCaseSubject.includes('chemistry') || lowerCaseSubject.includes('biology')) {
        return sciencePrompt;
    }
    if (lowerCaseSubject.includes('english')) {
        return englishPrompt;
    }
    if (lowerCaseSubject.includes('creator')) {
        return creatorPrompt;
    }
    return ''; // A fallback generic prompt
};


// Define the main flow.
const aiTutorFeedbackFlow = ai.defineFlow(
  {
    name: 'getAITutorFeedbackFlow',
    inputSchema: GetAITutorFeedbackInputSchema,
    outputSchema: GetAITutorFeedbackOutputSchema,
  },
  async (input) => {

    if (input.chatHistory.length === 1 && input.chatHistory[0].content === 'start') {
        return {
            feedback: `Mamma mia, it's-a time for ${input.subject}! Let's start our adventure into "${input.topicTitle}". I'm-a so excited! What's the first thing that comes to mind when you hear that topic?`,
            multipleChoiceOptions: null,
        };
    }

    const subjectPrompt = getSubjectPrompt(input.subject);
    
    // The prompt now combines the master instructions with the subject-specific module.
    const prompt = `
      ${masterPrompt}

      ${subjectPrompt}

      Your goal is to teach the user about "${input.topicTitle}" in the subject "${input.subject}".

      The lesson is currently in the "${input.lessonPhase}" phase. Follow the rules for this phase precisely.

      Rules for this specific interaction:
      1.  Keep your responses under 60 words.
      2.  Ask one question at a time.
      3.  Always end your response with a question to the user.
      4.  This is a continuing conversation. Your response should be based on the user's last message.
      5.  Provide your response in a JSON format with two fields: 'feedback' (your message to the user) and 'multipleChoiceOptions' (an array of strings for the user to choose from, or null if it's an open question).
      6.  If the user's answer is a single word or short phrase, provide 2-4 multiple-choice options.
      7.  If the user gives a detailed answer, ask an open-ended follow-up question and set 'multipleChoiceOptions' to null.
      8.  If the user expresses uncertainty (e.g., "not sure", "unsure", "idk", "I don't know"), do NOT include variants of uncertainty in 'multipleChoiceOptions'. Instead, give a short hint and ask a simpler follow-up.
      9.  Do not repeat the exact same question as your previous message. Make each follow-up progress the lesson.
      10. Ensure 'multipleChoiceOptions' are unique case-insensitively; avoid duplicates.
      
      Analyze the chat history and provide the next message based on all the instructions above.

      Chat History:
      {{#each chatHistory}}
      {{role}}: {{content}}
      {{/each}}
    `;
    
    try {
      const { output } = await ai.generate({
        prompt,
        model: 'openai/gpt-4o',
        output: { schema: GetAITutorFeedbackOutputSchema },
        context: { chatHistory: input.chatHistory },
      });

      if (!output) {
        return {
          feedback: `Let's continue with "${input.topicTitle}". What do you think about this topic?`,
          multipleChoiceOptions: null,
        };
      }
      
      return output;
    } catch (e) {
      const lastUser = [...input.chatHistory].reverse().find(m => m.role === 'user');
      const short = lastUser ? lastUser.content.trim() : '';
      const norm = short.toLowerCase();
      const uncertain = ['not sure','unsure','idk','i don\'t know','dont know','no idea','?'].includes(norm);
      if (uncertain) {
        return {
          feedback: `No problem. Would you like a hint, an example, or an easier question?`,
          multipleChoiceOptions: ['Give me a hint','Explain with example','Ask an easier question'],
        };
      }
      const isShort = short.length > 0 && short.length <= 24;
      if (isShort) {
        return {
          feedback: `Okay. What do you think about "${short}"?`,
          multipleChoiceOptions: null,
        };
      }
      return {
        feedback: `Can you explain a bit more about "${input.topicTitle}"?`,
        multipleChoiceOptions: null,
      };
    }
  }
);

export async function getAITutorFeedback(input: z.infer<typeof GetAITutorFeedbackInputSchema>): Promise<GetAITutorFeedbackOutput> {
  return aiTutorFeedbackFlow(input);
}
