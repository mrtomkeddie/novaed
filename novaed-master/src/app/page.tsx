

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase-auth';
import { LandingHeader } from '@/components/landing-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Users, TrendingUp, Star, BookOpenCheck, Sparkles, Lock, Bot, ShieldCheck, CheckCircle } from 'lucide-react';

const stats = [
  { icon: <Users />, value: "1,000+", label: "Students Engaged" },
  { icon: <TrendingUp />, value: "95%", label: "Positive Feedback" },
  { icon: <Star />, value: "4.8★", label: "User Rating" },
];

const features = [
  { icon: <Bot />, title: "Personalized AI Tutor", description: "Adapts to your child's learning style with patient, step-by-step guidance." },
  { icon: <BookOpenCheck />, title: "Structured Curriculum", description: "Follow clear, expertly-designed learning paths for each core subject." },
  { icon: <Sparkles />, title: "Gamified Learning", description: "Earn XP and take on 'Boss Challenges' to make learning a fun adventure." },
  { icon: <Lock />, title: "Safe & Secure", description: "Your data is private, encrypted, and never shared. A secure learning environment." },
];

const formPerks = [
    { icon: <Sparkles className="text-accent" />, text: "Fun, Mario-themed lessons" },
    { icon: <TrendingUp className="text-accent" />, text: "Adapts to your child's pace" },
    { icon: <CheckCircle className="text-accent" />, text: "Track progress and mastery" },
]

export default function LandingPage() {
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName) {
      toast({
        variant: 'destructive',
        title: 'First Name Required',
        description: 'Please enter your first name to continue.',
      });
      return;
    }
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: firstName,
        });
      }

      toast({ title: 'Account Created', description: "Welcome to NovaEd! Let's get learning." });
      
      // Ensure the router push happens after state updates are likely processed
      router.push('/dashboard');
      
    } catch (error: any) {
      console.error('Signup error:', error);
      if (error.code === 'auth/email-already-in-use') {
        toast({
          title: 'Email Already Registered',
          description: 'An account with this email already exists. Please log in instead.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Signup Failed',
          description: error.message || 'Could not create account. Please try again.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <LandingHeader />
      <main className="flex-1">
        <section className="container mx-auto grid lg:grid-cols-2 gap-x-12 xl:gap-x-20 items-center py-12 md:py-20">
          {/* Left Column */}
          <div className="space-y-8 md:space-y-10">
            <div className="space-y-4 text-center lg:text-left">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                    Unlock Your Child's <br /> <span className="text-accent">Full&nbsp;Potential</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0">
                    NovaEd provides a fun, personalized learning adventure with an AI tutor that adapts to your child's unique pace and style.
                </p>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
                {stats.map((stat, index) => (
                    <div key={index} className="space-y-1">
                        <div className="flex items-center justify-center gap-2">
                            <div className="text-accent">{stat.icon}</div>
                            <p className="text-2xl font-bold">{stat.value}</p>
                        </div>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                ))}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                {features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-card/50">
                        <div className="p-2 bg-primary/10 rounded-md text-primary">{feature.icon}</div>
                        <div>
                            <h3 className="font-semibold">{feature.title}</h3>
                            <p className="text-sm text-muted-foreground">{feature.description}</p>
                        </div>
                    </div>
                ))}
            </div>
          </div>

          {/* Right Column (Signup Form) */}
          <div className="mt-12 lg:mt-0">
            <Card className="shadow-2xl shadow-primary/10">
              <CardHeader className="text-center">
                 <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
                    <ShieldCheck className="w-8 h-8 text-primary"/>
                 </div>
                 <CardTitle className="text-2xl">Start Your Journey</CardTitle>
                 <CardDescription>
                  Create an account to begin your personalized learning adventure.
                 </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                    {formPerks.map((perk, index) => (
                        <li key={index} className="flex items-center gap-3">
                            {perk.icon}
                            <span className="text-sm text-muted-foreground">{perk.text}</span>
                        </li>
                    ))}
                </ul>
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="Your first name"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <Button type="submit" className="w-full bg-btn-gradient text-accent-foreground hover:opacity-90" disabled={isLoading}>
                    {isLoading ? <Loader2 className="animate-spin" /> : 'Create My Account'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
