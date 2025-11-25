
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { subjects } from '@/data/subjects';
import type { GenerateLessonSummaryOutput } from '@/ai/flows/generate-lesson-summary';
import { Loader2, Award, BookOpen, BrainCircuit, Calendar, Check, X } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const userId = 'charlie'; // Hardcoded user ID for "Charlie"

export function ProgressClient() {
  const [progressData, setProgressData] = useState<GenerateLessonSummaryOutput[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);

  useEffect(() => {
    async function fetchProgress() {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/get-all-user-progress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId }),
            });
            if (!response.ok) {
                throw new Error('Failed to fetch progress data.');
            }
            const data = await response.json();
            // Sort data by date descending
            const sortedData = data.sort((a: any, b: any) => {
                const dateA = a.date.seconds ? new Date(a.date.seconds * 1000) : new Date(a.date);
                const dateB = b.date.seconds ? new Date(b.date.seconds * 1000) : new Date(b.date);
                return dateB.getTime() - dateA.getTime();
            });
            setProgressData(sortedData);
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }
    fetchProgress();
  }, []);

  useEffect(() => {
    if (progressData.length > 0) {
        const uniqueSubjects = [...new Set(progressData.map(p => p.subject))];
        setAvailableSubjects(uniqueSubjects.sort());
    }
  }, [progressData]);

  const filteredProgressData = progressData.filter(summary =>
    selectedSubject === 'all' || summary.subject === selectedSubject
  );

  const getFormattedDate = (date: any) => {
    if (date.seconds) {
      return new Date(date.seconds * 1000).toLocaleDateString();
    }
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <section className="mb-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold font-headline tracking-tight">
                        Your Progress Report
                    </h1>
                    <p className="mt-2 text-lg text-muted-foreground">
                        A summary of all your learning achievements.
                    </p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                    <Select value={selectedSubject} onValueChange={setSelectedSubject} disabled={availableSubjects.length === 0}>
                        <SelectTrigger className="w-full sm:w-[240px]">
                            <SelectValue placeholder="Filter by subject..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Subjects</SelectItem>
                            {availableSubjects.map((subject) => (
                                <SelectItem key={subject} value={subject}>
                                    {subject}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
          </section>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center text-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-4 text-muted-foreground">Loading your progress...</p>
            </div>
          ) : error ? (
            <Card className="text-center py-10 bg-destructive/10 border-destructive">
                <CardHeader>
                    <CardTitle>Error Loading Progress</CardTitle>
                    <CardDescription>{error}</CardDescription>
                </CardHeader>
            </Card>
          ) : progressData.length === 0 ? (
            <Card className="text-center py-10">
                <CardHeader>
                    <CardTitle>No Progress... Yet!</CardTitle>
                    <CardDescription className="max-w-md mx-auto">
                        It looks like you haven't completed any lessons. Complete a lesson to see your progress report here.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild>
                        <Link href="/dashboard">Start a Lesson</Link>
                    </Button>
                </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredProgressData.map((summary, index) => {
                  const subjectId = subjects.find(s => s.name === summary.subject)?.id;
                  return (
                      <Card key={index} className="flex flex-col">
                      <CardHeader>
                          <div className="flex justify-between items-start">
                              <div>
                                  <CardTitle>{summary.topic_title}</CardTitle>
                                  <CardDescription>{summary.subject}</CardDescription>
                              </div>
                              <Badge variant={summary.mastery_status === 'Yes' ? 'default' : 'destructive'} className={summary.mastery_status === 'Yes' ? 'bg-green-600 text-primary-foreground hover:bg-green-700' : ''}>
                                  {summary.mastery_status === 'Yes' ? <Check className="mr-1" /> : <X className="mr-1" />}
                                  {summary.mastery_status === 'Yes' ? 'Mastered' : 'Needs Review'}
                              </Badge>
                          </div>
                      </CardHeader>
                      <CardContent className="flex-grow space-y-4">
                          <p className="text-sm text-muted-foreground italic">
                              "{summary.tutor_summary}"
                          </p>
                          <Separator />
                          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                              <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-muted-foreground" /> <span>{getFormattedDate(summary.date)}</span></div>
                              <div className="flex items-center gap-2"><Award className="w-4 h-4 text-muted-foreground" /> <span>{summary.xp_earned} XP</span></div>
                              <div className="flex items-center gap-2"><BookOpen className="w-4 h-4 text-muted-foreground" /> <span>{summary.learning_style_used} Style</span></div>
                              <div className="flex items-center gap-2"><BrainCircuit className="w-4 h-4 text-muted-foreground" /> <span>Responded Well</span></div>
                          </div>
                      </CardContent>
                      {summary.mastery_status === 'No' && subjectId && (
                          <CardFooter>
                              <Button variant="secondary" className="w-full" asChild>
                                  <Link href={`/subjects/${subjectId}/chat`}>
                                      Review Lesson
                                  </Link>
                              </Button>
                          </CardFooter>
                      )}
                      </Card>
                  )
                })}
              </div>
              {filteredProgressData.length === 0 && (
                <div className="col-span-full text-center py-10">
                  <p className="text-muted-foreground">No progress found for the selected subject.</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
