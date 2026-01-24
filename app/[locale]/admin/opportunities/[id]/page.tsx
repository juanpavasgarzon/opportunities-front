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
import { useState } from 'react';

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
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubmit = async (data: Partial<JobOpportunity>) => {
    setAlert(null);
    try {
      await updateJobMutation.mutateAsync({ id: jobId, data });
      
      setAlert({
        type: 'success',
        message: t('jobs.jobUpdated')
      });
      
      setTimeout(() => {
        router.push(`/${locale}/admin/opportunities`);
      }, 1500);
    } catch (error) {
      throw error; // Re-throw to let JobForm handle the error display
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
      alert={alert}
      onAlertClose={() => setAlert(null)}
      backUrl={`/${locale}/admin/opportunities`}
    >
      <JobForm
        job={job}
        onSubmit={handleSubmit}
        onCancel={() => router.push(`/${locale}/admin/opportunities`)}
        isLoading={updateJobMutation.isPending}
        initialAlert={alert}
      />
    </OpportunityFormPageLayout>
  );
}
