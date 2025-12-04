'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Mock authentication
        // In a real app, this would call an API
        if (email.toLowerCase() === 'charlie@novaed.com' && password === 'novaed123') {
            // Set auth cookie (expires in 7 days)
            document.cookie = "auth=true; path=/; max-age=604800; SameSite=Lax";
            
            toast({
                title: "Welcome back, Charlie! 👋",
                description: "Redirecting to your dashboard...",
            });

            setTimeout(() => {
                router.push('/dashboard');
            }, 1000);
        } else {
            toast({
                title: "Access Denied",
                description: "Invalid email or password.",
                variant: "destructive"
            });
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center space-y-2">
                    <div className="mx-auto mb-4">
                         <Image 
                            src="/logo.png" 
                            alt="NovaEd Logo" 
                            width={64} 
                            height={64} 
                            className="w-16 h-16 object-contain"
                        />
                    </div>
                    <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
                    <CardDescription>Enter your credentials to access your workspace</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input 
                                id="email" 
                                type="email" 
                                placeholder="charlie@novaed.com" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input 
                                id="password" 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? "Signing in..." : "Sign In"}
                        </Button>
                        <div className="text-center text-sm text-muted-foreground">
                            <Link href="/" className="hover:underline">
                                Back to Home
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
