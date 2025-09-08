
'use client';

import { ProgressClient } from './progress-client';

// This component is now a simple wrapper that renders the client component.
// All data fetching logic is handled within ProgressClient.
export default function ProgressPage() {
    return <ProgressClient />;
}
