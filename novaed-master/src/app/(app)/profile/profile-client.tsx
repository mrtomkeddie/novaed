
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { AppHeader } from '@/components/app-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Bot, Clapperboard } from 'lucide-react';
import { saveUserProfile, getUserProfile } from '@/services/firebase';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function ProfileClient() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [firstName, setFirstName] = useState('');
  const [tutorTheme, setTutorTheme] = useState('mario');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      const loadProfile = async () => {
        setIsLoading(true);
        try {
          const profile = await getUserProfile(user.uid);
          if (profile) {
            setFirstName(profile.displayName || user.displayName || '');
            setTutorTheme(profile.tutorTheme || 'mario');
          } else {
            setFirstName(user.displayName || '');
            setTutorTheme('mario');
          }
        } catch (error) {
            console.error("Failed to load user profile", error);
            setFirstName(user.displayName || '');
            setTutorTheme('mario');
            toast({
                variant: 'destructive',
                title: 'Could not load profile',
                description: 'Using default settings.'
            });
        } finally {
          setIsLoading(false);
        }
      };
      loadProfile();
    }
  }, [user, toast]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!firstName.trim()) {
        toast({
            variant: 'destructive',
            title: 'First Name Required',
            description: 'Please enter a name.',
        });
        return;
    }
    
    setIsSaving(true);
    try {
      const profileData = {
        displayName: firstName.trim(),
        tutorTheme: tutorTheme,
      };
      await saveUserProfile(user.uid, profileData);
      
      toast({
        title: 'Profile Updated!',
        description: 'Your changes have been saved successfully.',
      });

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error.message || 'There was an error updating your profile.',
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (authLoading || isLoading) {
    return (
        <div className="flex flex-col h-screen bg-background items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Loading Profile...</p>
        </div>
    );
  }

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
                <CardDescription className="text-center">{user?.email}</CardDescription>
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
