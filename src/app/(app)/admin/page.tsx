
import { redirect } from 'next/navigation';

// The admin page has been removed.
// Redirect any attempts to access it back to the dashboard.
export default function AdminPage() {
  redirect('/dashboard');
}
