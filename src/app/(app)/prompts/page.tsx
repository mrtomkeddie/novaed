
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
import fs from 'fs';
import path from 'path';

// Read the master prompt from the markdown file.
const getMasterPrompt = () => {
    try {
        const promptFilePath = path.join(process.cwd(), 'prompt.md');
        return fs.readFileSync(promptFilePath, 'utf-8');
    } catch (error) {
        console.error("Could not read prompt.md:", error);
        return "Error: Could not load the master prompt. The file 'prompt.md' may be missing.";
    }
}

export default function PromptsPage() {
  const masterPrompt = getMasterPrompt();
    
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
                <CardTitle>Core Personality</CardTitle>
                <CardDescription>
                  This prompt defines the base personality for the AI tutor, Nova.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid w-full gap-1.5">
                  <Label htmlFor="master-prompt">Master Prompt</Label>
                  <Textarea
                    readOnly
                    id="master-prompt"
                    defaultValue={masterPrompt}
                    className="h-48 resize-none font-mono text-sm"
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
