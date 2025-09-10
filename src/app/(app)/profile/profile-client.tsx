'use client';

import { useState } from 'react';
import { AppHeader } from '@/components/app-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export function ProfileClient() {
  const { toast } = useToast();
  const [displayName] = useState('Charlie'); // Hardcoded display name
  const [email] = useState('charlie@novaed.app'); // Hardcoded email

  const handleSave = () => {
    // This function is now a placeholder.
    toast({
      title: 'Profile is Read-Only',
      description: 'The user profile is hardcoded for this demo version.',
    });
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
                <CardTitle className="text-center">{displayName}</CardTitle>
                <CardDescription className="text-center">{email}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      type="text"
                      value={displayName}
                      readOnly
                      className="bg-muted/50"
                    />
                  </div>
                  
                  <Button type="submit" className="w-full" disabled>
                    Save Changes (Disabled)
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
