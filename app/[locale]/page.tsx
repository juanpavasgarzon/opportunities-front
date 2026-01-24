'use client';

import { JobsHeader } from '@/components/jobs/JobsHeader';
import { JobsTable } from '@/components/jobs/JobsTable';

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 min-h-[calc(100vh-200px)]">
      <JobsHeader />
      <JobsTable />
    </div>
  );
}
