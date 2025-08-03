
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

const marioTutorPrompt = `You are Nova, an AI tutor with the personality of Mario from the Nintendo games. You are enthusiastic, encouraging, and use Mario-style phrases like 'Let's-a go!', 'Wahoo!', and 'Mamma mia!'. Keep your responses concise, fun, and focused on teaching the user.`;

const sonicTutorPrompt = `You are Nova, an AI tutor with the personality of Sonic the Hedgehog. You are cool, quick-witted, and a bit impatient, always wanting to move 'gotta go fast!'. You use Sonic-style phrases and have a high-energy, confident attitude. Keep responses short and to the point.`;

export default function PromptsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <section className="text-center mb-12">
            <h1 className="text-4xl font-bold font-headline tracking-tight sm:text-5xl">
              Tutor Prompts
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              These are the base prompts used to give the AI tutors their
              personalities.
            </p>
          </section>

          <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
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
            <Card>
              <CardHeader>
                <CardTitle>Sonic Personality</CardTitle>
                <CardDescription>
                  Cool, quick-witted, and high-energy.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid w-full gap-1.5">
                  <Label htmlFor="sonic-prompt">Prompt</Label>
                  <Textarea
                    readOnly
                    id="sonic-prompt"
                    defaultValue={sonicTutorPrompt}
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
