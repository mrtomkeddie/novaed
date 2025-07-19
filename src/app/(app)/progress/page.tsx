
'use client';

// This page has been converted to a full Client Component to resolve Vercel build issues.
// All data fetching is handled on the client side in ProgressClient.
import { ProgressClient } from './progress-client';

export default function ProgressPage() {
    return <ProgressClient initialProgress={[]} />;
}
