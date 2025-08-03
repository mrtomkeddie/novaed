
'use client';

import { useState, useEffect } from 'react';
import { AppHeader } from "@/components/app-header";
import { SubjectCard } from "@/components/subject-card";
import { subjects as staticSubjects } from "@/data/subjects";
import { useAuth } from '@/hooks/use-auth';
import type { Subject } from '@/types';
import type { GenerateLessonSummaryOutput } from '@/ai/flows/generate-lesson-summary';
import { Loader2 } from 'lucide-react';

export default function FreePlayPage() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>(staticSubjects);
  const [isLoading, setIsLoading] = useState(true);

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
            setSubjects(staticSubjects);
          }
          
        } catch (error) {
          console.error("Failed to fetch or merge progress:", error);
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

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <section className="text-center mb-12">
            <h1 className="text-4xl font-bold font-headline tracking-tight sm:text-5xl">
              Free Play Mode
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose any subject you'd like to practice. Your adventure, your rules!
            </p>
          </section>

          {isLoading ? (
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {subjects.map((subject) => {
                  const completedLessons = subject.lessons.filter(l => l.completed).length;
                  return <SubjectCard key={subject.id} subject={subject} completedLessons={completedLessons} />
              })}
            </div>
          )}
        </div>
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} NovaEd. All rights reserved.
      </footer>
    </div>
  );
}
