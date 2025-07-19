
import { DashboardClient } from "./dashboard-client";
import { auth } from '@/lib/firebase-auth';

// This is a Server Component.
export default async function DashboardPage() {
  const user = auth.currentUser;
  
  let greeting = "Welcome";
  
  // This logic runs on the server.
  // Note: In a true server component without client-side auth context,
  // you'd typically get user info from a server-side session.
  // The current `auth.currentUser` might be null on the first server render.
  // A more robust solution involves a library like next-auth or server-side token verification.
  if (user?.metadata.creationTime && user?.metadata.lastSignInTime) {
      const creationTime = new Date(user.metadata.creationTime).getTime();
      const lastSignInTime = new Date(user.metadata.lastSignInTime).getTime();
      if (lastSignInTime - creationTime > 10000) {
        const returnGreetings = [
          "Welcome back", "Great to see you again", "Let's get learning",
          "Ready for a new challenge?", "Time for another adventure",
        ];
        greeting = returnGreetings[Math.floor(Math.random() * returnGreetings.length)];
      }
  }

  return (
    <DashboardClient greeting={greeting} />
  );
}
