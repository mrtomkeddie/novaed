'use client';

import { useState, useEffect } from 'react';
import { AppHeader } from '@/components/app-header';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import type { Subject } from '@/types';
import { CurriculumMap } from '@/components/curriculum-map';
import { subjects as staticSubjects } from '@/data/subjects';
import type { GenerateLessonSummaryOutput } from '@/ai/flows/generate-lesson-summary';


export function CurriculumClient() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>(staticSubjects);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    staticSubjects[0]?.id || ''
  );

  useEffect(() => {
    if (user) {
      const fetchProgressAndMerge = async () => {
        setIsLoading(true);
        try {
          const response = await fetch('/api/get-all-user-progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.uid }),
          });

          if (!response.ok) {
            throw new Error('Failed to fetch progress data');
          }

          const progressData: GenerateLessonSummaryOutput[] = await response.json();
          
          if (progressData && progressData.length > 0) {
            const progressMap = new Map(progressData.map(p => [p.topic_id, p]));

            const subjectsWithProgress = staticSubjects.map(subject => ({
              ...subject,
              lessons: subject.lessons.map(lesson => ({
                ...lesson,
                completed: progressMap.has(lesson.id),
              })),
            }));
            setSubjects(subjectsWithProgress);
          } else {
            // No progress data, use static subjects
            setSubjects(staticSubjects);
          }
          
        } catch (error) {
          console.error("Failed to fetch or merge progress:", error);
          // On error, fallback to static subjects
          setSubjects(staticSubjects);
        } finally {
          setIsLoading(false);
        }
      };

      fetchProgressAndMerge();
    } else {
        setIsLoading(false);
    }
  }, [user]);

  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <section className="text-center mb-8">
            <h1 className="text-4xl font-bold font-headline tracking-tight sm:text-5xl">
              Subjects & Curriculum
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Select a subject to view its learning journey and curriculum map.
            </p>
          </section>

          <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex justify-center">
              <Select
                value={selectedSubjectId}
                onValueChange={setSelectedSubjectId}
              >
                <SelectTrigger className="w-full sm:w-[320px] text-base h-12">
                  <SelectValue placeholder="Select a subject..." />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => {
                    const Icon = subject.icon;
                    return (
                      <SelectItem
                        key={subject.id}
                        value={subject.id}
                        className="text-base"
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5 text-muted-foreground" />
                          <span>{subject.name}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center pt-10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : selectedSubject ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg shrink-0">
                      <selectedSubject.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold font-headline">
                        {selectedSubject.name}
                      </h2>
                      <p className="text-sm sm:text-base text-muted-foreground mt-1">
                        {selectedSubject.description}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <TooltipProvider delayDuration={0}>
                    <CurriculumMap lessons={selectedSubject.lessons} />
                  </TooltipProvider>
                </CardContent>
              </Card>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}
