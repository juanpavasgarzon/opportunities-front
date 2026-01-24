'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { OpportunitiesHeader } from '@/components/opportunities/OpportunitiesHeader';
import { OpportunitiesTable } from '@/components/opportunities/OpportunitiesTable';
import { useDeleteJob } from '@/hooks/useJobs';
import { JobOpportunity } from '@/lib/types';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function OpportunitiesPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const deleteJobMutation = useDeleteJob();
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; job: JobOpportunity | null }>({
    isOpen: false,
    job: null
  });

  const handleDelete = (job: JobOpportunity) => {
    setDeleteConfirm({
      isOpen: true,
      job
    });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.job) {
      return;
    }
    
    try {
      await deleteJobMutation.mutateAsync(deleteConfirm.job.id);
      toast.success(t('jobs.jobDeleted'));
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error(t('jobs.jobDeleteError'));
    }
  };

  const handleEdit = (job: JobOpportunity) => {
    router.push(`/${locale}/admin/opportunities/${job.id}`);
  };

  const handleCreate = () => {
    router.push(`/${locale}/admin/opportunities/new`);
  };

  return (
    <ProtectedRoute requiredRole={['owner', 'admin']}>
      <div>
        <OpportunitiesHeader />

        <OpportunitiesTable
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCreate={handleCreate}
        />

        <ConfirmModal
          isOpen={deleteConfirm.isOpen}
          onClose={() => setDeleteConfirm({ isOpen: false, job: null })}
          onConfirm={confirmDelete}
          title={t('common.areYouSure')}
          message={
            deleteConfirm.job
              ? t('jobs.confirmDeleteJob', { title: deleteConfirm.job.title })
              : ''
          }
          confirmText={t('common.delete')}
          cancelText={t('common.cancel')}
          variant="danger"
        />
      </div>
    </ProtectedRoute>
  );
}
