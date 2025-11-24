'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Send, Bot, User, Loader2, CalculatorIcon, X, TimerIcon, Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { subjects } from '@/data/subjects';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import type { Lesson, UserProfile } from '@/types';
import { Calculator } from '@/components/calculator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

type Message = {
  role: 'user' | 'assistant';
  content: string;
  feedback?: string;
  multipleChoiceOptions?: string[] | null;
};

type LessonPhase = 'Warm-Up & Recap' | 'Teach & Assess' | 'Wind-Down & Bonus';

// Hardcoded user for "Charlie"
const userId = 'charlie';
const userProfile: UserProfile = { displayName: 'Charlie' };

const LESSON_DURATION_SECONDS = 25 * 60; // 25 minutes

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const subject = subjects.find((s) => s.id === slug);
  const { toast } = useToast();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isNovaTyping, setIsNovaTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLogging, setIsLogging] = useState(false);
  const [currentTopic, setCurrentTopic] = useState<Lesson | null>(null);
  const [isCalcOpen, setIsCalcOpen] = useState(false);
  
  const [timeRemaining, setTimeRemaining] = useState(LESSON_DURATION_SECONDS);
  const [lessonPhase, setLessonPhase] = useState<LessonPhase>('Warm-Up & Recap');
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isTimeUp, setIsTimeUp] = useState(false);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const isInitialLoad = useRef(true);

  // Timer effect
  useEffect(() => {
    if (!isTimerRunning || isLogging) return;

    if (timeRemaining <= 0) {
      setIsTimeUp(true); // Set time up flag
      setIsTimerRunning(false); // Stop the timer
      toast({
        title: "Time's up!",
        description: "Please finish your current thought. The lesson will end after your next message.",
      });
      return;
    }

    const timerId = setInterval(() => {
      setTimeRemaining(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeRemaining, isTimerRunning, isLogging, toast]);

  // Lesson phase effect
  useEffect(() => {
    if (timeRemaining > 20 * 60) {
      setLessonPhase('Warm-Up & Recap');
    } else if (timeRemaining > 5 * 60) {
      setLessonPhase('Teach & Assess');
    } else {
      setLessonPhase('Wind-Down & Bonus');
    }
  }, [timeRemaining]);


  useEffect(() => {
    if (subject && isInitialLoad.current) {
        isInitialLoad.current = false; // Prevent this from running on re-renders
        const startLesson = async () => {
            setIsLoading(true);
            let topic: Lesson | null = null;
            try {
                const response = await fetch('/api/get-user-progress', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId, subjectId: subject.id }),
                });

                if (response.ok) {
                  const lastProgress = await response.json();
                  
                  if (lastProgress && lastProgress.topic_id) {
                      const lastTopicIndex = subject.lessons.findIndex(l => l.id === lastProgress.topic_id);
                      if (lastTopicIndex > -1 && lastTopicIndex + 1 < subject.lessons.length) {
                          topic = subject.lessons[lastTopicIndex + 1];
                      } else {
                          // If last lesson was the final one, start from beginning.
                          topic = subject.lessons[0];
                      }
                  } else {
                      // No progress found, start with the first lesson.
                      topic = subject.lessons[0];
                  }
                } else {
                    // API failed, but we can still start the first lesson.
                    console.warn('Failed to fetch user progress. Starting from first lesson.');
                    topic = subject.lessons[0];
                }

                setCurrentTopic(topic);
                // Immediately get the first message from the tutor
                await sendUserMessageAndGetFeedback('start', topic);

            } catch (error) {
                console.error('Error determining lesson start:', error);
                // Fallback to first lesson even if fetch itself fails
                topic = subject.lessons[0];
                setCurrentTopic(topic);
                await sendUserMessageAndGetFeedback('start', topic);
            } finally {
                setIsLoading(false);
                setIsTimerRunning(true); // Start timer after initial load
            }
        };
        startLesson();
    }
  }, [subject]);

  useEffect(() => {
    const viewport = scrollAreaRef.current?.querySelector('div[data-radix-scroll-area-viewport]');
    if (viewport) {
      viewport.scrollTop = viewport.scrollHeight;
    }
  }, [messages, isNovaTyping]);

  const sendUserMessageAndGetFeedback = async (content: string, topicOverride?: Lesson | null) => {
    const topicToUse = topicOverride || currentTopic;
    if (isNovaTyping || isLogging || !subject || !topicToUse) return;
  
    const isFirstInteraction = content === 'start';
    let currentMessages = messages;
  
    if (!isFirstInteraction) {
      const userMessage: Message = { role: 'user', content };
      currentMessages = [...messages, userMessage];
      setMessages(currentMessages);
    }
  
    setIsNovaTyping(true);
    setInput('');
  
    const chatHistoryForApi = isFirstInteraction
      ? [{ role: 'user', content: 'start' }]
      : currentMessages.map(m => ({
          role: m.role,
          content: m.feedback || m.content,
      }));
  
    try {
      const response = await fetch('/api/get-ai-tutor-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          topicTitle: topicToUse.title,
          chatHistory: chatHistoryForApi,
          subject: subject.name,
          lessonPhase: lessonPhase,
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get AI feedback');
      }
  
      const result = await response.json();
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: result.feedback,
        feedback: result.feedback,
        multipleChoiceOptions: result.multipleChoiceOptions,
      };
      
      setMessages(prevMessages => [...prevMessages, assistantMessage]);
      
      // If time is up, end the lesson after this final response.
      if (isTimeUp && !isFirstInteraction) {
        handleEndLesson();
      }
  
    } catch (error: any) {
      console.error('Error getting feedback:', error);
      toast({
        variant: 'destructive',
        title: 'An AI Error Occurred',
        description: error.message || 'There was a problem getting a response from Nova. Please try again.',
      });
      // Restore previous state without the user message if it wasn't the first interaction
      if (!isFirstInteraction) {
        setMessages(messages);
      }
    } finally {
      setIsNovaTyping(false);
    }
  };

  const handleEndLesson = async () => {
    if (!subject || !currentTopic || isLogging) return;
    setIsTimerRunning(false);
    setIsLogging(true);
    toast({
      title: 'Ending lesson...',
      description: 'Nova is summarizing your progress.',
    });

    // Use a short delay to allow the toast to be seen before navigating
    await new Promise(resolve => setTimeout(resolve, 1500));

    const simplifiedHistory = messages.map(m => ({
        role: m.role,
        content: m.feedback || m.content,
    }));

    try {
      const summaryResponse = await fetch('/api/generate-lesson-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: subject.name,
          topicTitle: currentTopic.title,
          topicId: currentTopic.id,
          chatHistory: simplifiedHistory,
        }),
      });

      if (!summaryResponse.ok) {
        throw new Error('Failed to generate lesson summary');
      }

      const summary = await summaryResponse.json();
      
      const logResponse = await fetch('/api/log-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userId, summary }),
      });

      if (!logResponse.ok) {
        throw new Error('Failed to log progress');
      }

      const { success, error } = await logResponse.json();

      if (success) {
        toast({
          title: 'Progress Saved! 🎉',
          description: 'Your lesson summary has been logged successfully.',
        });
        
        router.push('/dashboard');
      } else {
        toast({
          variant: 'destructive',
          title: 'Error Saving Progress',
          description: error || 'Your progress could not be saved.',
          duration: 8000,
        });
        router.push('/dashboard');
      }
    } catch (error: any) {
      console.error('Error ending lesson:', error);
      toast({
        variant: 'destructive',
        title: 'Error Ending Lesson',
        description: error.message || 'Could not save your progress. Redirecting to dashboard.',
      });
      // Still redirect even if saving fails
      router.push('/dashboard');
    } finally {
      setIsLogging(false);
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const lastMessage = messages[messages.length - 1];
  const lastMessageHasOptions =
    lastMessage?.role === 'assistant' &&
    (lastMessage.multipleChoiceOptions?.length ?? 0) > 0 &&
    !isNovaTyping;

  if (isLoading || !subject) {
    return (
      <div className="flex flex-col h-screen bg-background items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Preparing your lesson...</p>
      </div>
    );
  }
  
  const showPauseDialog = !isTimerRunning && !isLoading && !isLogging && !isTimeUp;
  const showCalculator = ['maths', 'physics', 'chemistry'].some(term => subject.name.toLowerCase().includes(term));

  return (
    <>
      <Dialog open={showPauseDialog} onOpenChange={(open) => setIsTimerRunning(open)}>
        <DialogContent showCloseButton={false} onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
          <DialogHeader className="items-center text-center">
            <DialogTitle className="text-2xl">Lesson Paused</DialogTitle>
            <DialogDescription>
              Take your time. The lesson will be waiting for you.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center p-4">
            <Button size="lg" onClick={() => setIsTimerRunning(true)}>
              <Play className="mr-2" />
              Resume Lesson
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <div className="flex h-screen bg-background">
        <div className="flex flex-col flex-1 min-w-0">
            <header className="relative flex items-center justify-between p-3 border-b bg-card h-20 sm:h-16">
                <div className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2">
                    <Button asChild variant="ghost" size="icon" className="shrink-0">
                    <Link href="/dashboard">
                        <ArrowLeft />
                        <span className="sr-only">Back to Dashboard</span>
                    </Link>
                    </Button>
                </div>

                <div className="text-center px-14 sm:px-16 flex-1 flex flex-col items-center justify-center">
                    <h1 className="text-base sm:text-lg font-bold font-headline text-foreground truncate w-full">
                    {currentTopic?.title || subject.name}
                    </h1>
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mt-1">
                        <span>{subject.name}</span>
                        <span className="hidden sm:inline mx-1">•</span>
                        <span>{lessonPhase}</span>
                    </div>
                </div>
                
                <div className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <div className="flex items-center gap-2 rounded-md bg-secondary px-3 py-1.5 font-mono text-secondary-foreground">
                        <TimerIcon className="w-5 h-5 text-primary" />
                        <span className="text-lg font-semibold">{formatTime(timeRemaining)}</span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 ml-1"
                            onClick={() => setIsTimerRunning(false)}
                            disabled={isTimeUp || !isTimerRunning}
                        >
                            <Pause className="w-4 h-4" />
                            <span className="sr-only">Pause timer</span>
                        </Button>
                    </div>
                    <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="outline" disabled={isLogging || isNovaTyping} className="hidden sm:flex">
                        {isLogging ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        End Lesson
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to end the lesson?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will save your progress and return you to the dashboard.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleEndLesson}>Continue</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                    </AlertDialog>
                </div>
            </header>

            <main className="flex-1 overflow-hidden">
            <ScrollArea className="h-full" ref={scrollAreaRef}>
                <div className="p-4 space-y-6">
                {messages.map((message, index) => (
                    <div
                    key={index}
                    className={cn(
                        'flex items-start gap-3',
                        message.role === 'user' ? 'justify-end' : ''
                    )}
                    >
                    {message.role === 'assistant' && (
                        <Avatar className="w-8 h-8">
                        <AvatarImage src="/icon.png" alt="NovaEd Icon" />
                        <AvatarFallback>
                            <Bot className="w-5 h-5"/>
                        </AvatarFallback>
                        </Avatar>
                    )}
                    <div
                        className={cn(
                        'p-3 rounded-lg max-w-lg lg:max-w-xl shadow-sm relative group',
                        message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-card'
                        )}
                    >
                        <p className="text-base whitespace-pre-wrap">{message.feedback || message.content}</p>
                        
                        {message.role === 'assistant' &&
                        message.multipleChoiceOptions &&
                        message.multipleChoiceOptions.length > 0 &&
                        index === messages.length - 1 &&
                        !isNovaTyping && (
                            <div className="mt-4 flex flex-col sm:flex-row sm:flex-wrap gap-3">
                            {message.multipleChoiceOptions.map((option, i) => (
                                <Button
                                key={i}
                                variant="outline"
                                className="w-full sm:w-auto justify-center text-base px-6 py-3 h-auto"
                                onClick={() => sendUserMessageAndGetFeedback(option)}
                                disabled={isTimeUp}
                                >
                                {option}
                                </Button>
                            ))}
                            </div>
                        )}
                    </div>
                    {message.role === 'user' && (
                        <Avatar className="w-8 h-8">
                        <AvatarFallback>
                            <User className="w-5 h-5"/>
                        </AvatarFallback>
                        </Avatar>
                    )}
                    </div>
                ))}
                {isNovaTyping && (
                    <div className="flex items-start gap-3">
                    <Avatar className="w-8 h-8">
                        <AvatarImage src="/icon.png" alt="NovaEd Icon" />
                        <AvatarFallback>
                            <Bot className="w-5 h-5"/>
                        </AvatarFallback>
                        </Avatar>
                        <div className="p-3 rounded-lg bg-card flex items-center space-x-2 shadow-sm">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        <span className="text-sm text-muted-foreground">Nova is thinking...</span>
                        </div>
                    </div>
                )}
                </div>
            </ScrollArea>
            </main>

            <footer className="p-2 sm:p-4 border-t bg-card">
            <form onSubmit={(e) => { e.preventDefault(); sendUserMessageAndGetFeedback(input); }} className="flex items-center gap-2 sm:gap-3">
                <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                    isTimeUp
                    ? 'Time is up. Type your final message...'
                    : lastMessageHasOptions
                    ? 'Select an option above'
                    : 'Type your message to Nova...'
                }
                autoComplete="off"
                disabled={isNovaTyping || isLogging || (lastMessageHasOptions && !isTimeUp)}
                className="text-base h-12 flex-1"
                />
                {showCalculator && (
                  <Button type="button" variant="outline" size="lg" className="h-12 shrink-0 px-3 sm:px-4" onClick={() => setIsCalcOpen(true)}>
                    <CalculatorIcon className="h-5 w-5" />
                    <span className="sr-only sm:not-sr-only sm:ml-2">Calculator</span>
                  </Button>
                )}
                <Button type="submit" size="lg" disabled={!input.trim() || isNovaTyping || isLogging || (lastMessageHasOptions && !isTimeUp)} className="h-12 shrink-0 px-3 sm:px-4">
                <Send className="h-5 w-5" />
                <span className="sr-only sm:not-sr-only sm:ml-2">Send</span>
                </Button>
            </form>
            </footer>
        </div>
        <aside className={cn(
            "flex-col border-l bg-card transition-[width] duration-300 ease-in-out",
            isCalcOpen ? "flex w-[320px] sm:w-[360px]" : "w-0"
        )}>
            <div className={cn("overflow-hidden", !isCalcOpen && "hidden")}>
            <div className="flex items-center justify-between p-4 border-b h-16 shrink-0">
                <h2 className="text-lg font-semibold font-headline">Scientific Calculator</h2>
                <Button variant="ghost" size="icon" onClick={() => setIsCalcOpen(false)}>
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close calculator</span>
                </Button>
            </div>
            <div className="p-4">
                <Calculator />
            </div>
            </div>
        </aside>
      </div>
    </>
  );
}
