
import { redirect } from 'next/navigation';

// This layout is no longer used since user authentication has been removed.
export default function AuthLayout() {
  redirect('/');
}
