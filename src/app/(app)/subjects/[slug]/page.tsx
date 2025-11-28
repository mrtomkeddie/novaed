
import { redirect } from 'next/navigation';

// Legacy redirect to the main chat page for the subject.
export default async function SubjectPageRedirect({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  redirect(`/subjects/${slug}/chat`);
}
