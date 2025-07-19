
import { DashboardClient } from "./dashboard-client";

// This is a Server Component.
// All dynamic logic, including greeting generation, is now handled in the Client Component
// to avoid hydration errors and ensure consistency.
export default async function DashboardPage() {
  return (
    <DashboardClient />
  );
}
