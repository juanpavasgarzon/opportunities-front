'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { JobForm } from '@/components/jobs/JobForm';
import { OpportunityFormPageLayout } from '@/components/opportunities/OpportunityFormPageLayout';
import { useCreateJob } from '@/hooks/useJobs';
import { JobOpportunity } from '@/lib/types';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

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
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubmit = async (data: Partial<JobOpportunity>) => {
    setAlert(null);
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
      
      setAlert({
        type: 'success',
        message: t('jobs.jobCreated')
      });
      
      setTimeout(() => {
        router.push(`/${locale}/admin/opportunities`);
      }, 1500);
    } catch (error) {
      throw error; // Re-throw to let JobForm handle the error display
    }
  };

  return (
    <OpportunityFormPageLayout
      alert={alert}
      onAlertClose={() => setAlert(null)}
      backUrl={`/${locale}/admin/opportunities`}
    >
      <JobForm
        onSubmit={handleSubmit}
        onCancel={() => router.push(`/${locale}/admin/opportunities`)}
        isLoading={createJobMutation.isPending}
        initialAlert={alert}
      />
    </OpportunityFormPageLayout>
  );
}
