
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ForgotPasswordPage() {
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
            <CardTitle className="text-2xl font-headline">Forgot Password</CardTitle>
            <CardDescription>
                Enter your email to receive a link to reset your password.
            </CardDescription>
            </CardHeader>
            <CardContent>
            <form className="space-y-4">
                <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                />
                </div>
                <Button type="submit" className="w-full">
                    Send Reset Link
                </Button>
                <Button variant="outline" className="w-full" asChild>
                    <Link href="/login">Back to Sign In</Link>
                </Button>
            </form>
            </CardContent>
        </Card>
    </div>
  );
}
