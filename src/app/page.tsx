import { redirect } from 'next/navigation';

// This page just redirects to the main dashboard.
// The landing page was removed in a previous step to simplify the app.
export default function RootPage() {
  redirect('/dashboard');
}
