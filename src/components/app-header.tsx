
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Map, LayoutDashboard, Gamepad2, Award, Menu, UserCircle2, MessageSquareText } from 'lucide-react';

export function AppHeader() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { href: '/curriculum', label: 'Subjects', icon: Map, exact: false },
    { href: '/progress', label: 'Progress', icon: Award, exact: true },
    { href: '/free-play', label: 'Free Play', icon: Gamepad2, exact: true },
    { href: '/profile', label: 'Profile', icon: UserCircle2, exact: true },
    { href: '/prompts', label: 'Prompts', icon: MessageSquareText, exact: true },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="NovaEd Logo"
            width={100}
            height={40}
            priority
            data-ai-hint="logo"
          />
        </Link>
        
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[240px] p-0">
            <div className="flex flex-col h-full">
              <div className="border-b p-4">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <Link href="/dashboard" className="flex items-center gap-2">
                  <Image
                    src="/logo.png"
                    alt="NovaEd Logo"
                    width={100}
                    height={40}
                    data-ai-hint="logo"
                  />
                </Link>
              </div>
              <nav className="flex flex-col gap-2 p-4 flex-grow">
                {navLinks.map((link) => {
                  const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href);
                  return (
                    <Button
                      key={link.href}
                      asChild
                      variant={isActive ? 'secondary' : 'ghost'}
                      className="justify-start"
                    >
                      <Link href={link.href}>
                        <link.icon className="mr-2 h-4 w-4" />
                        {link.label}
                      </Link>
                    </Button>
                  );
                })}
              </nav>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
