

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
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
        
        <nav className="flex items-center gap-2">
            <Button asChild variant="ghost">
                <Link href="/login">
                    Sign In
                </Link>
            </Button>
        </nav>
      </div>
    </header>
  );
}
