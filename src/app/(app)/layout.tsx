
'use client';

import { AppHeader } from '@/components/app-header';
import { usePathname } from 'next/navigation';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const isChatPage = pathname.includes('/chat');

  if (isChatPage) {
    return <main>{children}</main>;
  }

  return (
    <div className="flex flex-col h-screen">
      <AppHeader />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
