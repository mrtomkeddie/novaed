'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppHeader } from "@/components/app-header";
import { subjects } from "@/data/subjects";
import { timetableData } from "@/components/timetable";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Timetable } from '@/components/timetable';
import { ArrowRight, Gamepad2, SkipForward, CalendarDays, CheckCircle, RefreshCw, Loader2 } from 'lucide-react';
import type { Subject } from '@/types';
import { useToast } from '@/hooks/use-toast';

type DailyLesson = {
    subjectName: string;
    lessonTitle: string;
    subject: Subject | undefined;
}

export function DashboardClient() {
  const [todaysLessons, setTodaysLessons] = useState<DailyLesson[]>([]);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [greeting, setGreeting] = useState("Welcome");
  const welcomeName = 'Charlie'; // Hardcoded user name
  const [isLoading, setIsLoading] = useState(true); // Only for lesson loading
  const { toast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    // Determine today's lessons from timetable
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const scheduledLessons = timetableData.find(d => d.day === today)?.periods || [];
    
    const lessonsWithSubjects: DailyLesson[] = scheduledLessons.map(lessonName => {
        const subject = subjects.find(s => s.name.toLowerCase() === lessonName.toLowerCase());
        return {
            subjectName: lessonName,
            lessonTitle: subject?.description || 'Time to learn!',
            subject: subject,
        };
    }).filter(l => l.subject);

    setTodaysLessons(lessonsWithSubjects);

    // Get today's progress from localStorage
    const savedProgress = localStorage.getItem('dailyProgress');
    const todayStr = new Date().toISOString().split('T')[0];
    if (savedProgress) {
        try {
            const { date, index } = JSON.parse(savedProgress);
            if (date === todayStr) {
                setCurrentLessonIndex(index);
            } else {
                localStorage.setItem('dailyProgress', JSON.stringify({ date: todayStr, index: 0 }));
                setCurrentLessonIndex(0);
            }
        } catch (e) {
            localStorage.setItem('dailyProgress', JSON.stringify({ date: todayStr, index: 0 }));
            setCurrentLessonIndex(0);
        }
    } else {
        localStorage.setItem('dailyProgress', JSON.stringify({ date: todayStr, index: 0 }));
    }

    // Set a random greeting
    const returnGreetings = [
        "Welcome back", "Great to see you again", "Let's get learning",
        "Ready for a new challenge?", "Time for another adventure",
    ];
    setGreeting(returnGreetings[Math.floor(Math.random() * returnGreetings.length)]);

    setIsLoading(false);

  }, []);

  const handleSkip = () => {
    const newIndex = currentLessonIndex + 1;
    setCurrentLessonIndex(newIndex);
    const todayStr = new Date().toISOString().split('T')[0];
    localStorage.setItem('dailyProgress', JSON.stringify({ date: todayStr, index: newIndex }));
  };

  const handleResetProgress = () => {
    setCurrentLessonIndex(0);
    const todayStr = new Date().toISOString().split('T')[0];
    localStorage.setItem('dailyProgress', JSON.stringify({ date: todayStr, index: 0 }));
  };

  const currentLesson = todaysLessons[currentLessonIndex];
  const allLessonsDone = todaysLessons.length > 0 && currentLessonIndex >= todaysLessons.length;

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <section className="text-center mb-10">
            {isLoading ? (
                <div className="flex items-center justify-center h-14">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : (
                <>
                <h1 className="text-4xl font-bold font-headline tracking-tight sm:text-5xl capitalize">
                    {greeting}, {welcomeName}!
                </h1>
                <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                    {allLessonsDone ? "You've completed your missions for today!" : "Here is your next lesson for today. Let's get started!"}
                </p>
                </>
            )}
          </section>

          <section className="max-w-2xl mx-auto mb-10">
            {allLessonsDone ? (
                <Card className="text-center bg-gradient-to-br from-card to-secondary/50">
                    <CardHeader>
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
                            <CheckCircle className="h-8 w-8 text-green-500" />
                        </div>
                        <CardTitle className="mt-4">All lessons complete!</CardTitle>
                        <CardDescription>
                           Great job! You powered through all your lessons for today.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">
                           You can relax, or if you're feeling adventurous, jump into Free Play mode to practice any subject you like.
                        </p>
                        <Button asChild size="lg">
                            <Link href="/free-play">
                                <Gamepad2 className="mr-2"/>
                                Go to Free Play
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : currentLesson && currentLesson.subject ? (
                <Card className="shadow-lg hover:shadow-primary/20 transition-shadow">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-semibold text-primary">Today's Next Lesson</p>
                                <CardTitle className="mt-1 text-2xl font-headline">{currentLesson.subjectName}</CardTitle>
                            </div>
                            <div className="p-3 bg-primary/10 rounded-lg">
                                <currentLesson.subject.icon className="w-6 h-6 text-primary" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                         <div className="flex flex-col sm:flex-row gap-4">
                             <Button asChild size="lg" className="w-full bg-btn-gradient text-accent-foreground hover:opacity-90 text-lg h-24 sm:h-auto">
                                <Link href={`/subjects/${currentLesson.subject.id}/chat`}>
                                    Start Lesson
                                    <ArrowRight className="ml-2"/>
                                </Link>
                            </Button>
                            <Button size="lg" variant="outline" onClick={handleSkip} className="w-full text-lg h-24 sm:h-auto">
                                <SkipForward className="mr-2"/>
                                Skip Lesson
                            </Button>
                         </div>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardHeader className="text-center">
                        <CardTitle>No lessons scheduled for today.</CardTitle>
                        <CardDescription>Enjoy your day off or head to Free Play to learn something new!</CardDescription>
                    </CardHeader>
                     <CardContent className="text-center">
                         <Button asChild>
                            <Link href="/free-play">
                                <Gamepad2 className="mr-2"/>
                                Go to Free Play
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            )}
          </section>

          <div className="flex justify-center items-center gap-4">
              <Dialog>
                  <DialogTrigger asChild>
                      <Button variant="ghost">
                          <CalendarDays className="mr-2" />
                          View Full Timetable
                      </Button>
                  </DialogTrigger>
                  <DialogContent className="w-auto max-w-[95vw] sm:max-w-2xl">
                      <DialogHeader>
                          <DialogTitle>Weekly Timetable</DialogTitle>
                      </DialogHeader>
                      <Timetable />
                  </DialogContent>
              </Dialog>
              {currentLessonIndex > 0 && (
                <Button variant="ghost" onClick={handleResetProgress}>
                    <RefreshCw className="mr-2" />
                    Reset Today's Progress
                </Button>
              )}
          </div>
        </div>
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} NovaEd. All rights reserved.
      </footer>
    </div>
  );
}
