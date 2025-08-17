
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-secondary/30 p-4">
      <div className="absolute top-6 left-6">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="NovaEd Logo"
            width={100}
            height={40}
            priority
            data-ai-hint="logo"
          />
        </Link>
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">Welcome!</CardTitle>
          <CardDescription>Sign in or create an account to start learning.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" defaultValue="learner@novaed.app" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="ml-auto inline-block text-sm underline"
                >
                  Forgot your password?
                </Link>
              </div>
              <Input id="password" type="password" defaultValue="password" />
            </div>
            <Button type="submit" className="w-full" asChild>
                <Link href="/dashboard">Sign In</Link>
            </Button>
            <Button variant="secondary" className="w-full" asChild>
                <Link href="/dashboard">Create an account</Link>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
