
'use client';

import { useState, useEffect } from 'react';
import { AppHeader } from '@/components/app-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { saveUserProfile } from '@/ai/flows/user-profile';

// Hardcoded user for "Charlie"
const userId = 'charlie';

export function ProfileClient() {
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState('Charlie');
  const [email, setEmail] = useState('charlie@novaed.app');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      setIsLoading(true);
      try {
        const response = await fetch('/api/get-user-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        });
        if (response.ok) {
          const profile = await response.json();
          if (profile) {
            setDisplayName(profile.displayName || 'Charlie');
          }
        }
      } catch (error) {
        console.error("Failed to fetch profile", error);
        toast({
            variant: "destructive",
            title: "Failed to load profile",
            description: "Could not fetch profile data. Using default values.",
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchProfile();
  }, [toast]);


  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await saveUserProfile({
        userId,
        profileData: { displayName }
      });
      toast({
        title: 'Profile Updated!',
        description: 'Your changes have been saved successfully.',
      });
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Error saving profile",
            description: error.message || "Could not save your changes."
        });
    } finally {
        setIsSaving(false);
    }
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
                <CardTitle className="text-center">{displayName || 'Welcome!'}</CardTitle>
                <CardDescription className="text-center">{email}</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                    <div className="flex justify-center items-center h-40">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <form onSubmit={handleSave} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="displayName">Display Name</Label>
                        <Input
                        id="displayName"
                        type="text"
                        placeholder="Enter your first name"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        disabled={isSaving}
                        />
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={isSaving}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Save Changes
                    </Button>
                    </form>
                )}
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
}
