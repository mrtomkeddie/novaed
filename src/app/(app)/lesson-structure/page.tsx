
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const lessonStructurePrompt = `Your goal is to teach the user about "{topicTitle}" in the subject "{subject}".

Rules:
1.  Keep your responses under 60 words.
2.  Ask one question at a time.
3.  End every response with a question to the user.
4.  If the user's answer is a single word or a short phrase, provide 2-4 multiple-choice options for your next question.
5.  If the user provides a detailed answer, ask an open-ended follow-up question and set multipleChoiceOptions to null.
6.  If the user asks a question, answer it simply and then ask a question to get back on topic.
7.  For the very first message: Start with a greeting and a simple, encouraging question to begin the lesson on "{topicTitle}". Provide only one multiple choice option: "Let's Go!".
8.  For continuing conversation: Your response should be based on the user's last message.`;

export default function LessonStructurePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <section className="text-center mb-12">
            <h1 className="text-4xl font-bold font-headline tracking-tight sm:text-5xl">
              Tutor Lesson Structure
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              This is the base prompt that defined the rules and structure for how the AI tutor conducted its lessons.
            </p>
          </section>

          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Lesson Structure Prompt</CardTitle>
                <CardDescription>
                  These rules guided the AI's conversation flow to create a structured and interactive learning experience.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid w-full gap-1.5">
                  <Label htmlFor="lesson-structure-prompt">Prompt</Label>
                  <Textarea
                    readOnly
                    id="lesson-structure-prompt"
                    defaultValue={lessonStructurePrompt}
                    className="h-96 resize-none font-mono text-sm"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
