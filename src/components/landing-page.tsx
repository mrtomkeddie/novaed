'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Sparkles, BookOpen, BrainCircuit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function LandingPage() {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const handleJoinWaitlist = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setIsSubmitting(true);
        
        try {
            const response = await fetch("https://formspree.io/f/xzznvezq", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({ email })
            });

            if (response.ok) {
                setIsSubmitting(false);
                setEmail('');
                toast({
                    title: "You're on the list! 🚀",
                    description: "We'll keep you posted on new updates and features.",
                });
            } else {
                throw new Error("Failed to submit");
            }
        } catch (error) {
            setIsSubmitting(false);
            toast({
                title: "Something went wrong",
                description: "Please try again later.",
                variant: "destructive"
            });
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Navbar */}
            <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
                        <Image 
                            src="/logo.png" 
                            alt="NovaEd Logo" 
                            width={48} 
                            height={48} 
                            className="w-12 h-12 object-contain"
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                             <Badge variant="secondary" className="font-normal">Beta v0.1</Badge>
                        </div>
                        <Button asChild variant="ghost">
                            <Link href="/login">Login</Link>
                        </Button>
                    </div>
                </div>
            </header>

            <main className="flex-1">
                {/* Hero Section */}
                <section className="py-20 md:py-32 px-4 text-center space-y-8 max-w-4xl mx-auto">
                    <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary hover:bg-primary/20 mb-4">
                        Currently in Open Beta
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold font-headline tracking-tight text-foreground">
                        The AI Tutor Tailored for <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                             Your Home Curriculum
                        </span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        NovaEd turns daily lessons into an interactive adventure. 
                        Personalized support, gamified progress, and a tutor that never gets tired.
                    </p>
                    
                    <div className="max-w-md mx-auto pt-4">
                         <Card className="bg-card/50 backdrop-blur-sm border-muted">
                            <CardContent className="pt-6">
                                <div className="mb-4 text-left">
                                    <p className="text-sm font-semibold text-foreground">Join the Waitlist</p>
                                    <p className="text-xs text-muted-foreground">Get early access when spots open up.</p>
                                </div>
                                <form onSubmit={handleJoinWaitlist} className="flex flex-col gap-3">
                                    <div className="flex gap-2">
                                        <Input 
                                            type="email" 
                                            placeholder="Enter your email" 
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="h-10"
                                        />
                                        <Button type="submit" disabled={isSubmitting} className="h-10 px-4">
                                            {isSubmitting ? "..." : "Join"}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* Features Grid */}
                <section className="py-20 bg-muted/30 border-y">
                    <div className="container mx-auto px-4">
                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="space-y-4 p-6 rounded-xl border bg-card/50">
                                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 text-blue-600 rounded-lg flex items-center justify-center">
                                    <BrainCircuit className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold">Adaptive AI Tutor</h3>
                                <p className="text-muted-foreground">
                                    Gets to know your learning style and adapts explanations to help you master every topic.
                                </p>
                            </div>
                            <div className="space-y-4 p-6 rounded-xl border bg-card/50">
                                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 text-green-600 rounded-lg flex items-center justify-center">
                                    <BookOpen className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold">Curriculum Aligned</h3>
                                <p className="text-muted-foreground">
                                    Lessons that match your exact school curriculum, so you're always learning what matters.
                                </p>
                            </div>
                            <div className="space-y-4 p-6 rounded-xl border bg-card/50">
                                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 text-purple-600 rounded-lg flex items-center justify-center">
                                    <Sparkles className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold">Gamified Learning</h3>
                                <p className="text-muted-foreground">
                                    Earn XP, level up, and complete quests. Learning feels less like work and more like play.
                                </p>
                            </div>
                        </div>
                    </div>
                 </section>
            </main>

            <footer className="py-8 border-t text-center text-sm text-muted-foreground">
                <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p>© {new Date().getFullYear()} NovaEd. All rights reserved.</p>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
                        <a href="#" className="hover:text-foreground transition-colors">Terms</a>
                        <a href="#" className="hover:text-foreground transition-colors">Contact</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
