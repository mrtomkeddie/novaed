
'use client';

import { useState, useEffect } from 'react';
import { AppHeader } from '@/components/app-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Bot, Clapperboard } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Using dummy data as user profiles are removed
const dummyProfile = {
    displayName: "Learner",
    email: "learner@novaed.app",
    tutorTheme: "mario",
}

export function ProfileClient() {
  const { toast } = useToast();
  const [firstName, setFirstName] = useState(dummyProfile.displayName);
  const [tutorTheme, setTutorTheme] = useState('mario');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('tutorTheme') || 'mario';
    setTutorTheme(savedTheme);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    localStorage.setItem('tutorTheme', tutorTheme);

    setTimeout(() => {
        toast({
            title: 'Profile Updated!',
            description: 'Your changes have been saved successfully.',
        });
        setIsSaving(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <section className="max-w-xl mx-auto">
            <h1 className="text-4xl font-bold font-headline tracking-tight text-center mb-8">
              Your Profile
            </h1>
            <Card>
              <CardHeader>
                <CardTitle className="text-center">{firstName || 'Welcome!'}</CardTitle>
                <CardDescription className="text-center">{dummyProfile.email}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSave} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="Enter your first name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      disabled={isSaving}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tutorTheme">Tutor Theme</Label>
                    <Select value={tutorTheme} onValueChange={setTutorTheme} disabled={isSaving}>
                      <SelectTrigger id="tutorTheme">
                        <SelectValue placeholder="Select a theme..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mario">
                          <div className="flex items-center gap-3">
                            <Bot className="w-5 h-5" />
                            <span>Mario</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="sonic">
                           <div className="flex items-center gap-3">
                            <Clapperboard className="w-5 h-5" />
                            <span>Sonic</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                     <p className="text-sm text-muted-foreground">Choose the personality for your AI tutor.</p>
                  </div>

                  <Button type="submit" className="w-full" disabled={isSaving}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Save Changes
                  </Button>
                </form>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
}
