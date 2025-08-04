

'use client';

import Link from 'next/link';
import { LandingHeader } from '@/components/landing-header';
import { Button } from '@/components/ui/button';
import { Users, TrendingUp, Star, BookOpenCheck, Sparkles, Bot } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const stats = [
  { icon: <Users />, value: "1,000+", label: "Students Engaged" },
  { icon: <TrendingUp />, value: "95%", label: "Positive Feedback" },
  { icon: <Star />, value: "4.8★", label: "User Rating" },
];

const features = [
  { icon: <Bot />, title: "Personalized AI Tutor", description: "Adapts to your child's learning style with patient, step-by-step guidance." },
  { icon: <BookOpenCheck />, title: "Structured Curriculum", description: "Follow clear, expertly-designed learning paths for each core subject." },
  { icon: <Sparkles />, title: "Gamified Learning", description: "Earn XP and take on 'Boss Challenges' to make learning a fun adventure." },
];


export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <LandingHeader />
      <main className="flex-1">
        <section className="container mx-auto grid lg:grid-cols-2 gap-12 items-center py-16 md:py-24">
          <div className="space-y-6 text-center lg:text-left">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                  Unlock Your Child's <br /> <span className="text-accent">Full&nbsp;Potential</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg mx-auto lg:mx-0">
                  NovaEd provides a fun, personalized learning adventure with an AI tutor that adapts to your child's unique pace and style.
              </p>
              <div className="mt-16 grid grid-cols-3 gap-8 text-center w-full max-w-lg mx-auto lg:mx-0">
                  {stats.map((stat, index) => (
                      <div key={index} className="space-y-2">
                          <div className="flex items-center justify-center lg:justify-start gap-2">
                              <div className="text-accent">{stat.icon}</div>
                              <p className="text-3xl font-bold">{stat.value}</p>
                          </div>
                          <p className="text-md text-muted-foreground">{stat.label}</p>
                      </div>
                  ))}
              </div>
          </div>
          
          <div>
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-headline">Get Started Free</CardTitle>
                    <CardDescription>Create an account to start the learning adventure.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="space-y-4">
                        <div className="space-y-2 text-left">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" placeholder="Your name" />
                        </div>
                        <div className="space-y-2 text-left">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="you@example.com" />
                        </div>
                        <div className="space-y-2 text-left">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" placeholder="••••••••" />
                        </div>
                        <Button size="lg" className="w-full bg-btn-gradient text-accent-foreground hover:opacity-90">
                            Create Account
                        </Button>
                    </form>
                </CardContent>
            </Card>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-secondary/30">
          <div className="container mx-auto">
            <div className="mt-20 grid md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl mx-auto">
                {features.map((feature, index) => (
                    <div key={index} className="flex items-start text-left gap-4 p-6 rounded-lg bg-card/50">
                        <div className="p-3 bg-primary/10 rounded-lg text-primary">{feature.icon}</div>
                        <div>
                            <h3 className="text-xl font-semibold">{feature.title}</h3>
                            <p className="text-md text-muted-foreground mt-2">{feature.description}</p>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        </section>

      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} NovaEd. All rights reserved.
      </footer>
    </div>
  );
}
