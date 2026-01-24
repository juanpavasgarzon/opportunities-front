'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { JobForm } from '@/components/jobs/JobForm';
import { OpportunityFormPageLayout } from '@/components/opportunities/OpportunityFormPageLayout';
import { useCreateJob } from '@/hooks/useJobs';
import { JobOpportunity } from '@/lib/types';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function CreateOpportunityPage() {
  return (
    <ProtectedRoute requiredRole={['owner', 'admin']}>
      <CreateOpportunityContent />
    </ProtectedRoute>
  );
}

function CreateOpportunityContent() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const createJobMutation = useCreateJob();

  const handleSubmit = async (data: Partial<JobOpportunity>) => {
    try {
      await createJobMutation.mutateAsync({
        title: data.title || '',
        reference: data.reference || '',
        job_type: data.job_type || '',
        experience: data.experience || '',
        location: data.location || '',
        industry: data.industry || '',
        information: data.information || '',
        company_name: data.company_name || '',
        company_info: data.company_info || '',
        salary_range: data.salary_range || '',
        currency: data.currency || '',
        post_date: data.post_date || new Date().toISOString().split('T')[0],
      });
      
      toast.success(t('jobs.jobCreated'));
      router.push(`/${locale}/admin/opportunities`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('jobs.jobCreateError');
      toast.error(errorMessage);
      throw error; // Re-throw to let JobForm handle the error display
    }
  };

  return (
    <OpportunityFormPageLayout
      backUrl={`/${locale}/admin/opportunities`}
    >
      <JobForm
        onSubmit={handleSubmit}
        onCancel={() => router.push(`/${locale}/admin/opportunities`)}
        isLoading={createJobMutation.isPending}
      />
    </OpportunityFormPageLayout>
  );
}
