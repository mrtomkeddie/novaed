
import { redirect } from 'next/navigation';

// This page is no longer used since user authentication has been removed.
export default function LoginPage() {
  redirect('/dashboard');
}
