
import { redirect } from 'next/navigation';

// The login page is now the root page.
// This page just redirects there to avoid duplicate content.
export default function LoginPage() {
  redirect('/');
}
