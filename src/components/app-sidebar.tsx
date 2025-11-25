
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Map, LayoutDashboard, Gamepad2, Award, UserCircle2, Bot, FileText } from 'lucide-react';

export function AppSidebar() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { href: '/curriculum', label: 'Subjects', icon: Map, exact: false },
    { href: '/progress', label: 'Progress', icon: Award, exact: true },
    { href: '/free-play', label: 'Free Play', icon: Gamepad2, exact: true },
    { href: '/prompts', label: 'Tutor Prompts', icon: Bot, exact: true },
    { href: '/lesson-structure', label: 'Lesson Structure', icon: FileText, exact: true },
    { href: '/profile', label: 'Profile', icon: UserCircle2, exact: true },
  ];

  return (
    <aside className="w-64 flex-shrink-0 border-r bg-card text-card-foreground">
        <div className="flex flex-col h-screen">
            <div className="border-b p-4 h-20 flex items-center flex-shrink-0">
                <Link href="/dashboard" className="flex items-center gap-2">
                    <Image
                    src="/logo.png"
                    alt="NovaEd Logo"
                    width={120}
                    height={40}
                    data-ai-hint="logo"
                    />
                </Link>
            </div>
            <nav className="flex flex-col gap-2 p-4 flex-grow overflow-y-auto">
            {navLinks.map((link) => {
                const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href);
                return (
                <Button
                    key={link.href}
                    asChild
                    variant={isActive ? 'secondary' : 'ghost'}
                    className="justify-start text-base py-6"
                >
                    <Link href={link.href}>
                    <link.icon className="mr-3 h-5 w-5" />
                    {link.label}
                    </Link>
                </Button>
                );
            })}
            </nav>
            <div className="p-4 border-t flex-shrink-0">
            <Button variant="outline" className="w-full text-base py-6" asChild>
                <Link href="/">Sign Out</Link>
            </Button>
            </div>
        </div>
    </aside>
  );
}
