
import { CurriculumClient } from './curriculum-client';

export default function CurriculumPage() {
  // All data fetching is now handled client-side to avoid build errors.
  return <CurriculumClient />;
}
