import { redirect } from 'next/navigation';

// This page just redirects to the main dashboard.
export default function AppRootPage() {
  redirect('/dashboard');
}
