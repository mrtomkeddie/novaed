
import { redirect } from 'next/navigation';

// The chat page has been disabled while AI functionality is removed.
// Redirect any attempts to access it back to the dashboard.
export default function ChatPage() {
  redirect('/dashboard');
}
