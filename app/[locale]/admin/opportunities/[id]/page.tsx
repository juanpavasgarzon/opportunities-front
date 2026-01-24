'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { JobForm } from '@/components/jobs/JobForm';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { OpportunityFormPageLayout } from '@/components/opportunities/OpportunityFormPageLayout';
import { useJob, useUpdateJob } from '@/hooks/useJobs';
import { JobOpportunity } from '@/lib/types';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, useParams } from 'next/navigation';
import toast from 'react-hot-toast';

export default function EditOpportunityPage() {
  return (
    <ProtectedRoute requiredRole={['owner', 'admin']}>
      <EditOpportunityContent />
    </ProtectedRoute>
  );
}

function EditOpportunityContent() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;
  
  const { data: job, isLoading, error } = useJob(jobId);
  const updateJobMutation = useUpdateJob();

  const handleSubmit = async (data: Partial<JobOpportunity>) => {
    try {
      await updateJobMutation.mutateAsync({ id: jobId, data });
      
      toast.success(t('jobs.jobUpdated'));
      router.push(`/${locale}/admin/opportunities`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('jobs.jobUpdateError');
      toast.error(errorMessage);
      throw error;
    }
  };

  if (isLoading) {
    return <LoadingState message={t('common.loading')} />;
  }

  if (error || !job) {
    return (
      <ErrorState
        message={t('jobs.errorLoadingJobs')}
        onRetry={() => router.push(`/${locale}/admin/opportunities`)}
        retryText={t('common.goBack')}
      />
    );
  }

  return (
    <OpportunityFormPageLayout
      backUrl={`/${locale}/admin/opportunities`}
    >
      <JobForm
        job={job}
        onSubmit={handleSubmit}
        onCancel={() => router.push(`/${locale}/admin/opportunities`)}
        isLoading={updateJobMutation.isPending}
      />
    </OpportunityFormPageLayout>
  );
}
