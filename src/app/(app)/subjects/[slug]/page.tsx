
import { redirect } from 'next/navigation';

// This page is no longer used and now redirects to the main chat page for the subject.
// It is kept for legacy URL support.
export default function SubjectPageRedirect({ params }: { params: { slug: string } }) {
  redirect(`/subjects/${params.slug}/chat`);
}
