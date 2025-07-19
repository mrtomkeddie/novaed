import { redirect } from 'next/navigation';
import { subjects } from '@/data/subjects';

export function generateStaticParams() {
  return subjects.map((subject) => ({
    slug: subject.id,
  }));
}

// This page is deprecated. The subject cards on the dashboard now link
// directly to the chat. The full curriculum view has been moved to its
// own dedicated page at `/curriculum`. We redirect there for any old links.
// We explicitly accept `params` here to prevent a Next.js enumeration error,
// even though we are just redirecting.
export default function SubjectPageRedirect({ params }: { params: { slug: string } }) {
  redirect('/curriculum');
}
