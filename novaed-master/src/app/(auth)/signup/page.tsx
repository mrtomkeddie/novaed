import { redirect } from 'next/navigation';

// This page is now deprecated. The signup form is on the landing page.
export default function SignupPageRedirect() {
  redirect('/');
}
