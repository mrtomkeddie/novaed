
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { AppSidebar } from '@/components/app-sidebar';

export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-card h-20 flex-shrink-0">
      <div className="container flex h-full items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
            <Image
            src="/logo.png"
            alt="NovaEd Logo"
            width={120}
            height={40}
            data-ai-hint="logo"
            />
        </Link>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="p-0"
            aria-labelledby="main-menu-title"
            aria-describedby="main-menu-description"
          >
            <SheetTitle id="main-menu-title" className="sr-only">Main Menu</SheetTitle>
            <SheetDescription id="main-menu-description" className="sr-only">
              Navigate to different sections of the application like Dashboard, Subjects, and Profile.
            </SheetDescription>
            <AppSidebar isDrawer={true} />
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
