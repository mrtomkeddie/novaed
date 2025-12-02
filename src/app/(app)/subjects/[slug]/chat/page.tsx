'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Send, Bot, User, Loader2, CalculatorIcon, X, TimerIcon, Pause, Play, Award, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { subjects } from '@/data/subjects';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import type { Lesson, UserProfile } from '@/types';
import type { GenerateLessonSummaryOutput } from '@/ai/flows/generate-lesson-summary';
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
    DialogClose
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { InteractiveImage } from '@/components/interactive-image';


type Message = {
  role: 'user' | 'assistant';
  content: string;
  feedback?: string;
  multipleChoiceOptions?: string[] | null;
  interactiveImage?: {
    imageUrl: string;
    targets: { name: string; x: number; y: number; radius: number }[];
  } | null;
};

type LessonPhase = 'Warm-Up & Recap' | 'Teach & Assess' | 'Wind-Down & Bonus';

// Hardcoded user for "Charlie"
const userId = 'charlie';

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
  const [lessonSummary, setLessonSummary] = useState<GenerateLessonSummaryOutput | null>(null);
  const [animationState, setAnimationState] = useState<{ target: string | null; type: 'correct' | 'incorrect' | null }>({ target: null, type: null });

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
    const viewport = scrollAreaRef.current?.querySelector('div[data-radix-scroll-area-viewport]');
    if (viewport) {
      viewport.scrollTop = viewport.scrollHeight;
    }
  }, [messages, isNovaTyping]);

  const handleImageTargetClick = (name: string) => {
    // This is where you could add logic to check if the answer is correct.
    // For now, we'll just simulate a "correct" animation and send it as the user's message.
    setAnimationState({ target: name, type: 'correct' });
    setTimeout(() => {
      setAnimationState({ target: null, type: null });
      sendUserMessageAndGetFeedback(`I clicked on ${name}.`);
    }, 500); // Duration of the animation
  };

  const handleEndLesson = useCallback(async () => {
    if (!subject || !currentTopic || isLogging) return;
    setIsTimerRunning(false);
    setIsLogging(true);
    toast({
      title: 'Ending lesson...',
      description: 'Nova is summarizing your progress.',
    });

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
      setLessonSummary(summary);

      const logResponse = await fetch('/api/log-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userId, summary }),
      });

      if (!logResponse.ok) {
        throw new Error('Failed to log progress');
      }

    } catch (error: any) {
      console.error('Error ending lesson:', error);
      toast({
        variant: 'destructive',
        title: 'Error Ending Lesson',
        description: error.message || 'Could not save your progress. Redirecting to dashboard.',
      });
      router.push('/dashboard');
    } finally {
      setIsLogging(false);
    }
  }, [subject, currentTopic, isLogging, messages, router, toast])

  const sendUserMessageAndGetFeedback = useCallback(async (content: string, topicOverride?: Lesson | null) => {
    const topicToUse = topicOverride || currentTopic;
    if (isNovaTyping || isLogging || !subject || !topicToUse) return;
  
    const isFirstInteraction = content === 'start';
    const normalized = (() => {
      const s = content.trim().toLowerCase();
      const uncertain = ['not sure','unsure','idk','i don\'t know','dont know','no idea','?'];
      if (uncertain.includes(s)) return "I'm not sure. Please give a quick hint.";
      return content;
    })();
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
      : (() => {
          const mapped = currentMessages.map(m => ({
            role: m.role,
            content: m.feedback || m.content,
          }));
          const last = mapped[mapped.length - 1];
          if (last && last.role === 'user') last.content = normalized;
          return mapped;
        })();
  
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
      if (!result || typeof result.feedback !== 'string') {
        throw new Error('Invalid AI feedback received');
      }
      
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
  }, [isNovaTyping, isLogging, subject, currentTopic, lessonPhase, isTimeUp, toast, messages, handleEndLesson]);

  

  useEffect(() => {
    if (subject && isInitialLoad.current) {
      isInitialLoad.current = false;
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
                topic = subject.lessons[0];
              }
            } else {
              topic = subject.lessons[0];
            }
          } else {
            topic = subject.lessons[0];
          }

          setCurrentTopic(topic);
          await sendUserMessageAndGetFeedback('start', topic);
        } catch (error) {
          console.error('Error determining lesson start:', error);
          topic = subject.lessons[0];
          setCurrentTopic(topic);
          await sendUserMessageAndGetFeedback('start', topic);
        } finally {
          setIsLoading(false);
          setIsTimerRunning(true);
        }
      };
      startLesson();
    }
  }, [subject, sendUserMessageAndGetFeedback]);

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
  
  const lastMessageIsInteractiveImage =
    lastMessage?.role === 'assistant' &&
    !!lastMessage.interactiveImage &&
    !isNovaTyping;

  if (isLoading || !subject) {
    return (
      <div className="flex flex-col h-screen bg-background items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Preparing your lesson...</p>
      </div>
    );
  }
  
  const showPauseDialog = !isTimerRunning && !isLoading && !isLogging && !isTimeUp && !lessonSummary;
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
           <DialogClose className="sr-only" />
        </DialogContent>
      </Dialog>

      <Dialog open={!!lessonSummary} onOpenChange={() => router.push('/dashboard')}>
        <DialogContent showCloseButton={false} onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
          <DialogHeader className="items-center text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <DialogTitle className="text-2xl">Lesson Complete!</DialogTitle>
            <DialogDescription>
              Great work! Here's a summary of your performance.
            </DialogDescription>
          </DialogHeader>
          {lessonSummary && (
            <div className="my-4 space-y-4">
              <div className="p-4 rounded-lg bg-secondary text-center">
                <p className="text-sm text-secondary-foreground">TOPIC</p>
                <p className="font-semibold">{lessonSummary.topic_title}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-4 rounded-lg bg-secondary">
                  <p className="text-sm text-secondary-foreground">MASTERY</p>
                  <Badge variant={lessonSummary.mastery_status === 'Yes' ? 'default' : 'destructive'} className={cn("text-lg", lessonSummary.mastery_status === 'Yes' ? 'bg-green-600' : '')}>
                    {lessonSummary.mastery_status}
                  </Badge>
                </div>
                <div className="p-4 rounded-lg bg-secondary">
                  <p className="text-sm text-secondary-foreground">XP EARNED</p>
                  <p className="font-semibold text-lg flex items-center justify-center gap-2">
                    <Award className="text-yellow-500" />
                    {lessonSummary.xp_earned}
                  </p>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-secondary text-center">
                <p className="text-sm text-secondary-foreground">TUTOR'S SUMMARY</p>
                <p className="italic">"{lessonSummary.tutor_summary}"</p>
              </div>
            </div>
          )}
          <div className="flex justify-center">
            <Button size="lg" onClick={() => router.push('/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
          <DialogClose className="sr-only" />
        </DialogContent>
      </Dialog>
      
      <div className="flex h-screen bg-background">
        <div className="flex flex-col flex-1 min-w-0">
            <header className="relative flex items-center justify-between p-3 border-b bg-card h-20">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <ArrowLeft />
                            <span className="sr-only">Back to Dashboard</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure you want to leave?</AlertDialogTitle>
                          <AlertDialogDescription>
                            If you leave now, your lesson progress will not be saved.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Stay</AlertDialogCancel>
                          <AlertDialogAction onClick={() => router.push('/dashboard')}>Leave</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                </div>
                <div className="text-center px-4 flex-1 flex flex-col items-center justify-center">
                    <h1 className="text-lg font-bold font-headline text-foreground truncate w-full">
                    {currentTopic?.title || subject.name}
                    </h1>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <span>{subject.name}</span>
                        <span className="mx-1">•</span>
                        <span>{lessonPhase}</span>
                    </div>
                </div>
                
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
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
                        <Button variant="outline" disabled={isLogging || isNovaTyping}>
                        {isLogging ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        End Lesson
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to end the lesson?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will save your progress and show your results.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleEndLesson}>End Lesson</AlertDialogAction>
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

                        {message.interactiveImage && (
                          <InteractiveImage 
                              imageUrl={message.interactiveImage.imageUrl}
                              targets={message.interactiveImage.targets}
                              onTargetClick={handleImageTargetClick}
                              animationState={animationState}
                          />
                        )}
                        
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
                    : lastMessageIsInteractiveImage
                    ? 'Click on the image above to answer'
                    : 'Type your message to Nova...'
                }
                autoComplete="off"
                disabled={isNovaTyping || isLogging || (lastMessageHasOptions && !isTimeUp) || lastMessageIsInteractiveImage}
                className="text-base h-12 flex-1"
                />
                {showCalculator && (
                  <Button type="button" variant="outline" size="lg" className="h-12 shrink-0 px-3 sm:px-4" onClick={() => setIsCalcOpen(true)}>
                    <CalculatorIcon className="h-5 w-5" />
                    <span className="sr-only sm:not-sr-only sm:ml-2">Calculator</span>
                  </Button>
                )}
                <Button type="submit" size="lg" disabled={!input.trim() || isNovaTyping || isLogging || (lastMessageHasOptions && !isTimeUp) || lastMessageIsInteractiveImage} className="h-12 shrink-0 px-3 sm:px-4">
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
