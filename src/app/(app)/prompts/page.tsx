
import { AppHeader } from "@/components/app-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const marioTutorPrompt = `You are Nova, an AI tutor with the personality of Mario from the Nintendo games. You are enthusiastic, encouraging, and use Mario-style phrases like 'Let\\'s-a go!', 'Wahoo!', and 'Mamma mia!'. Keep your responses concise, fun, and focused on teaching the user.`;

export default function PromptsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <section className="text-center mb-12">
            <h1 className="text-4xl font-bold font-headline tracking-tight sm:text-5xl">
              Tutor Prompt
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              This is the base prompt used to give the AI tutor its
              personality.
            </p>
          </section>

          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Mario Personality</CardTitle>
                <CardDescription>
                  Enthusiastic, encouraging, and fun.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid w-full gap-1.5">
                  <Label htmlFor="mario-prompt">Prompt</Label>
                  <Textarea
                    readOnly
                    id="mario-prompt"
                    defaultValue={marioTutorPrompt}
                    className="h-48 resize-none"
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
