
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bot, FileText, ChevronRight } from 'lucide-react';

export default function SettingsPage() {
  const settingsLinks = [
    {
      href: '/prompts',
      icon: Bot,
      title: 'Tutor Prompts',
      description: 'View the prompts that define the AI tutor\'s personality.'
    },
    {
      href: '/lesson-structure',
      icon: FileText,
      title: 'Lesson Structure',
      description: 'See the rules that guide the AI\'s lesson flow.'
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <section className="text-center mb-12">
            <h1 className="text-4xl font-bold font-headline tracking-tight sm:text-5xl">
              Settings
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Manage application settings and view tutor configuration.
            </p>
          </section>

          <div className="max-w-2xl mx-auto space-y-4">
            {settingsLinks.map((link) => (
              <Link href={link.href} key={link.href} className="block">
                <Card className="hover:bg-muted/50 transition-colors">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center gap-4">
                       <div className="p-3 bg-primary/10 rounded-lg shrink-0">
                         <link.icon className="w-6 h-6 text-primary" />
                       </div>
                       <div>
                          <CardTitle>{link.title}</CardTitle>
                          <CardDescription className="mt-1">{link.description}</CardDescription>
                       </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
