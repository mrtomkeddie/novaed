
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

const extractNumbers = (text: string): number[] => {
  const matches = text.match(/\d+/g);
  if (!matches) return [];
  return matches.map((n) => parseInt(n, 10));
};

const detectOperation = (text: string): 'add' | 'sub' | null => {
  const t = text.toLowerCase();
  if (/(spend|spent|lose|used|left|minus|take away|remove)/.test(t)) return 'sub';
  if (/(add|gain|collect|find|more|plus|get)/.test(t)) return 'add';
  return null;
};

const buildOptions = (correct: number, userGuess?: number): string[] => {
  const opts = new Set<number>();
  opts.add(correct);
  if (typeof userGuess === 'number') opts.add(userGuess);
  while (opts.size < 4) {
    const delta = Math.max(1, Math.floor(Math.random() * 3));
    const candidate = Math.random() < 0.5 ? correct + delta : correct - delta;
    if (candidate >= 0) opts.add(candidate);
  }
  return Array.from(opts).slice(0, 4).map((n) => `${n}`);
};

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
  insufficientQuota: z.boolean().optional().describe('True if the AI provider reported insufficient quota.'),
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
      const es = String(e ?? '').toLowerCase();
      const quotaErr = es.includes('insufficient_quota') || es.includes('exceeded your current quota') || es.includes('quota');
      const lastUser = [...input.chatHistory].reverse().find((m) => m.role === 'user');
      const lastAssistant = [...input.chatHistory].reverse().find((m) => m.role === 'assistant');
      const userText = lastUser ? lastUser.content.trim() : '';
      const norm = userText.toLowerCase();
      const uncertain = ['not sure','unsure','idk','i don\'t know','dont know','no idea','?'].includes(norm);
      if (uncertain) {
        return {
          feedback: `Okey-dokey! Want a hint, an example, or an easier question?`,
          multipleChoiceOptions: ['Give me a hint','Explain with example','Ask an easier question'],
          insufficientQuota: quotaErr || undefined,
        };
      }

      const isMath = input.subject.toLowerCase().includes('math');
      if (isMath && lastAssistant) {
        const op = detectOperation(lastAssistant.content);
        const nums = extractNumbers(lastAssistant.content);
        const userNums = extractNumbers(userText);
        if (op && nums.length >= 2 && userNums.length >= 1) {
          const a = nums[0];
          const b = nums[1];
          const expected = op === 'sub' ? a - b : a + b;
          const guess = userNums[0];
          if (guess === expected) {
            const followA = Math.max(1, expected);
            const followB = Math.min(9, Math.max(1, Math.floor(Math.random() * 5) + 1));
            const followAns = followA + followB;
            return {
              feedback: `Wahoo! Correct: ${expected}. +10 XP! If you have ${followA} coins and find ${followB} more, how many now?`,
              multipleChoiceOptions: buildOptions(followAns),
              insufficientQuota: quotaErr || undefined,
            };
          } else {
            return {
              feedback: `Boop! Not quite. Start with ${a}, ${op === 'sub' ? 'spend' : 'add'} ${b}. How many coins do you have ${op === 'sub' ? 'left' : 'now'}?`,
              multipleChoiceOptions: buildOptions(expected, guess),
              insufficientQuota: quotaErr || undefined,
            };
          }
        }
      }

      const isShort = userText.length > 0 && userText.length <= 24;
      if (isShort) {
        return {
          feedback: `Got it. Want a hint, an example, or a multiple-choice follow-up?`,
          multipleChoiceOptions: ['Give me a hint','Explain with example','Give multiple choice','Ask an easier question'],
          insufficientQuota: quotaErr || undefined,
        };
      }
      return {
        feedback: `Interesting. Tell me a bit more so I can tailor the next challenge. What would you add?`,
        multipleChoiceOptions: null,
        insufficientQuota: quotaErr || undefined,
      };
    }
  }
);

export async function getAITutorFeedback(input: z.infer<typeof GetAITutorFeedbackInputSchema>): Promise<GetAITutorFeedbackOutput> {
  return aiTutorFeedbackFlow(input);
}
