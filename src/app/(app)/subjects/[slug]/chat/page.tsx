
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Send, Bot, User, Loader2, CalculatorIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { subjects } from '@/data/subjects';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import type { Lesson } from '@/types';
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

type Message = {
  role: 'user' | 'assistant';
  content: string;
  feedback?: string;
  multipleChoiceOptions?: string[] | null;
};

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
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

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (subject && user) {
      const determineCurrentTopicAndGreet = async () => {
        setIsLoading(true);
        try {
          const response = await fetch('/api/get-user-progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.uid, subjectId: subject.id }),
          });

          // Even if the response is not "ok" (e.g., 404), we can still proceed
          // by assuming no progress exists. We'll only throw for server errors.
          if (response.status >= 500) {
            throw new Error(`Server error: ${response.statusText}`);
          }
          
          const lastProgress = await response.json();
          let topic: Lesson | null = null;

          if (lastProgress && lastProgress.topic_id) {
            const lastTopicIndex = subject.lessons.findIndex(l => l.id === lastProgress.topic_id);
            if (lastTopicIndex > -1 && lastTopicIndex + 1 < subject.lessons.length) {
              // User has completed the last lesson, move to the next one
              topic = subject.lessons[lastTopicIndex + 1];
            } else {
              // User has completed all lessons or is on the last one, start from the first uncompleted or first overall
              topic = subject.lessons.find(l => !l.completed) || subject.lessons[0];
            }
          } else {
            // No progress for this subject, start from the first lesson
            topic = subject.lessons.find(l => !l.completed) || subject.lessons[0];
          }
          
          setCurrentTopic(topic);
          const userName = user.displayName || user.email?.split('@')[0] || 'User';
          
          const initialMessage: Message = {
            role: 'assistant',
            content: `Hey ${userName}! Ready to start our lesson on "${topic.title}"?`,
            multipleChoiceOptions: ["Let's Go!"],
          };
          
          setMessages([initialMessage]);

        } catch (error) {
          console.error('Error determining topic:', error);
          const topic = subject.lessons.find(l => !l.completed) || subject.lessons[0];
          setCurrentTopic(topic);
          const welcomeName = user.displayName || user.email?.split('@')[0] || 'User';
          const errorMessage: Message = {
              role: 'assistant',
              content: `Hey ${welcomeName}! Ready to start with "${topic.title}"?`,
              multipleChoiceOptions: ["Let's Go!"]
          };
          setMessages([errorMessage]);
          toast({
            variant: 'destructive',
            title: 'Could not load progress',
            description: 'Starting from the first lesson. Your progress may not have loaded.',
          });
        } finally {
          setIsLoading(false);
        }
      };

      determineCurrentTopicAndGreet();
    }
  }, [subject, toast, user]);

  useEffect(() => {
    const viewport = scrollAreaRef.current?.querySelector('div[data-radix-scroll-area-viewport]');
    if (viewport) {
      viewport.scrollTop = viewport.scrollHeight;
    }
  }, [messages, isNovaTyping]);

  const sendUserMessageAndGetFeedback = async (content: string) => {
    if (isNovaTyping || isLogging || !subject || !currentTopic || !user) return;

    const isFirstInteraction = messages.length === 1 && (content === "Let's Go!");
    
    const userMessage: Message = { role: 'user', content };
    let currentMessages = messages;
    
    if (isFirstInteraction) {
        currentMessages = [{ role: 'user', content: 'start' }];
    } else {
        currentMessages = [...messages, userMessage];
        setMessages(currentMessages);
    }
    
    setIsNovaTyping(true);
    setInput('');

    const simplifiedHistory = currentMessages.map(m => ({
        role: m.role,
        content: m.feedback || m.content,
    }));

    try {
      const response = await fetch('/api/get-ai-tutor-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          topicTitle: currentTopic.title,
          chatHistory: simplifiedHistory,
          subject: subject.name,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI feedback');
      }

      const result = await response.json();
      const finalMessages = isFirstInteraction ? messages : currentMessages;

      setMessages([
        ...finalMessages,
        {
          role: 'assistant',
          content: result.feedback,
          feedback: result.feedback,
          multipleChoiceOptions: result.multipleChoiceOptions,
        },
      ]);
      
    } catch (error: any)
    {
      console.error('Error getting feedback:', error);
      toast({
        variant: 'destructive',
        title: 'An AI Error Occurred',
        description: error.message || 'There was a problem getting a response from Nova. Please try again.',
      });
    } finally {
      setIsNovaTyping(false);
    }
  };

  const handleEndLesson = async () => {
    if (!subject || !currentTopic || !user) return;
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
      
      const logResponse = await fetch('/api/log-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid, summary }),
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
        
        const todayStr = new Date().toISOString().split('T')[0];
        const dailyProgress = localStorage.getItem('dailyProgress');
        if (dailyProgress) {
            try {
                const { date, index } = JSON.parse(dailyProgress);
                if (date === todayStr) {
                    localStorage.setItem('dailyProgress', JSON.stringify({ date: todayStr, index: index + 1 }));
                }
            } catch (e) {
                // If localStorage is corrupt, reset it
                localStorage.setItem('dailyProgress', JSON.stringify({ date: todayStr, index: 0 }));
            }
        }
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
        description: error.message || 'Could not save your progress. Please try again.',
      });
    } finally {
      setIsLogging(false);
    }
  }

  const lastMessage = messages[messages.length - 1];
  const lastMessageHasOptions =
    lastMessage?.role === 'assistant' &&
    (lastMessage.multipleChoiceOptions?.length ?? 0) > 0 &&
    !isNovaTyping;

  if (authLoading || !subject || !user) {
    return (
      <div className="flex flex-col h-screen bg-background items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Preparing your lesson...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <div className="flex flex-col flex-1 min-w-0">
        <header className="relative flex items-center justify-between p-3 border-b bg-card h-16">
            <div className="absolute left-2 sm:left-4">
                <Button asChild variant="ghost" size="icon" className="shrink-0">
                <Link href="/dashboard">
                    <ArrowLeft />
                    <span className="sr-only">Back to Dashboard</span>
                </Link>
                </Button>
            </div>

            <div className="text-center px-14 sm:px-16 flex-1">
                <h1 className="text-base sm:text-lg font-bold font-headline text-foreground truncate">
                {currentTopic?.title || subject.name}
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                {subject.name}
                </p>
            </div>
            
            <div className="absolute right-2 sm:right-4">
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
              placeholder={lastMessageHasOptions ? 'Select an option above' : 'Type your message to Nova...'}
              autoComplete="off"
              disabled={isNovaTyping || isLogging || lastMessageHasOptions}
              className="text-base h-12 flex-1"
            />
            <Button type="button" variant="outline" size="lg" className="h-12 shrink-0 px-3 sm:px-4" onClick={() => setIsCalcOpen(true)}>
              <CalculatorIcon className="h-5 w-5" />
              <span className="sr-only sm:not-sr-only sm:ml-2">Calculator</span>
            </Button>
            <Button type="submit" size="lg" disabled={!input.trim() || isNovaTyping || isLogging || lastMessageHasOptions} className="h-12 shrink-0 px-3 sm:px-4">
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
  );
}
