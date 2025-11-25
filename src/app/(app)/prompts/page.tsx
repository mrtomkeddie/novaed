
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import fs from 'fs';
import path from 'path';

// Helper function to read a file, returning an error message on failure.
const readFileContent = (filePath: string) => {
    try {
        const fullPath = path.join(process.cwd(), filePath);
        return fs.readFileSync(fullPath, 'utf-8');
    } catch (error) {
        console.error(`Could not read prompt file: ${filePath}`, error);
        return `Error: Could not load the prompt. The file '${filePath}' may be missing.`;
    }
}

export default function PromptsPage() {
  const masterPrompt = readFileContent('public/Tutor Prompt.md');
  const mathsPrompt = readFileContent('public/prompts/maths.md');
  const sciencePrompt = readFileContent('public/prompts/science.md');
  const englishPrompt = readFileContent('public/prompts/english.md');
  const creatorPrompt = readFileContent('public/prompts/creator.md');
    
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <section className="text-center mb-12">
            <h1 className="text-4xl font-bold font-headline tracking-tight sm:text-5xl">
              Tutor Prompts
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              These are the prompts used to give the AI tutor its personality and subject-specific knowledge.
            </p>
          </section>

          <div className="max-w-4xl mx-auto space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Core Tutor Brain</CardTitle>
                <CardDescription>
                  This prompt defines the base personality, rules, and gamification engine for Nova.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid w-full gap-1.5">
                  <Label htmlFor="master-prompt">Master Prompt</Label>
                  <Textarea
                    readOnly
                    id="master-prompt"
                    defaultValue={masterPrompt}
                    className="h-96 resize-none font-mono text-sm"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                  <CardTitle>Subject Modules</CardTitle>
                  <CardDescription>
                    These modules are appended to the core prompt to provide subject-specific context, rules, and locations.
                  </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>Maths Module (Mushroom Kingdom)</AccordionTrigger>
                    <AccordionContent>
                       <Textarea readOnly defaultValue={mathsPrompt} className="h-72 resize-none font-mono text-sm bg-muted/20" />
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger>Science Module (Bowser's Lab)</AccordionTrigger>
                    <AccordionContent>
                      <Textarea readOnly defaultValue={sciencePrompt} className="h-72 resize-none font-mono text-sm bg-muted/20" />
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3">
                    <AccordionTrigger>English Module (Peach’s Library)</AccordionTrigger>
                    <AccordionContent>
                      <Textarea readOnly defaultValue={englishPrompt} className="h-72 resize-none font-mono text-sm bg-muted/20" />
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-4">
                    <AccordionTrigger>Creator & Tech Module (E. Gadd’s Workshop)</AccordionTrigger>
                    <AccordionContent>
                      <Textarea readOnly defaultValue={creatorPrompt} className="h-72 resize-none font-mono text-sm bg-muted/20" />
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
