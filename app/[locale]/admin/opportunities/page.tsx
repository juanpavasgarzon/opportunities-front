'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Alert } from '@/components/ui/Alert';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { DataTable } from '@/components/ui/DataTable';
import { OpportunitiesHeader } from '@/components/opportunities/OpportunitiesHeader';
import { OpportunitiesSearchBar } from '@/components/opportunities/OpportunitiesSearchBar';
import { OpportunitiesTableActions } from '@/components/opportunities/OpportunitiesTableActions';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import { useDeleteJob, useJobs } from '@/hooks/useJobs';
import { JobOpportunity } from '@/lib/types';
import { formatDateLocale } from '@/lib/utils/date';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function OpportunitiesPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [inputValue, setInputValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  
  const { data: jobsResponse } = useJobs({
    page: currentPage,
    pageSize,
    search: searchTerm || undefined,
    sortBy: sortConfig?.key,
    sortOrder: sortConfig?.direction,
  });
  
  const jobs = jobsResponse?.data || [];
  const totalCount = jobsResponse?.total || 0;
  
  const deleteJobMutation = useDeleteJob();
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; job: JobOpportunity | null }>({
    isOpen: false,
    job: null
  });
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(inputValue);
      setCurrentPage(1);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [inputValue]);

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
      setAlert({
        type: 'success',
        message: t('jobs.jobDeleted')
      });
      setTimeout(() => setAlert(null), 3000);
    } catch (error) {
      console.error('Error deleting job:', error);
      setAlert({
        type: 'error',
        message: t('jobs.jobDeleteError')
      });
      setTimeout(() => setAlert(null), 3000);
    }
  };

  const handleEdit = (job: JobOpportunity) => {
    router.push(`/${locale}/admin/opportunities/${job.id}`);
  };

  const handleCreate = () => {
    router.push(`/${locale}/admin/opportunities/new`);
  };

  const columns = [
    {
      key: 'title' as const,
      label: t('jobs.titleColumn'),
      sortable: true
    },
    {
      key: 'job_type' as const,
      label: t('jobs.jobType'),
      sortable: true,
      render: (value: unknown) => (value as string) || '--'
    },
    {
      key: 'experience' as const,
      label: t('jobs.experience'),
      sortable: true,
      render: (value: unknown) => (value as string) || '--'
    },
    {
      key: 'location' as const,
      label: t('jobs.location'),
      sortable: true,
      render: (value: unknown) => (value as string) || '--'
    },
    {
      key: 'company_name' as const,
      label: t('jobs.companyName'),
      sortable: true,
      render: (value: unknown) => (value as string) || '--'
    },
    {
      key: 'salary_range' as const,
      label: t('jobs.salaryRange'),
      sortable: true,
      render: (value: unknown, row: JobOpportunity) => {
        const salary = (value as string) || '';
        if (!salary) {
          return '--';
        }
        return `${salary}${row.currency ? ` (${row.currency})` : ''}`;
      }
    },
    {
      key: 'currency' as const,
      label: t('jobs.currency'),
      sortable: true,
      render: (value: unknown) => (value as string) || '--'
    },
    {
      key: 'post_date' as const,
      label: t('jobs.postDate'),
      sortable: true,
      render: (value: unknown) => formatDateLocale(value as string)
    }
  ];

  return (
    <ProtectedRoute requiredRole={['owner', 'admin']}>
      <div>
        <OpportunitiesHeader />

        {alert && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
            autoClose
          />
        )}

        <div className="mb-6 flex items-center justify-between gap-4">
          <OpportunitiesSearchBar value={inputValue} onChange={setInputValue} />
          <Button
            variant="primary"
            onClick={handleCreate}
            className="flex items-center gap-2"
          >
            <Plus size={20} />
            {t('common.create')}
          </Button>
        </div>

        <div className="bg-gray-800 rounded-lg shadow overflow-hidden">
          <DataTable
            data={jobs}
            columns={columns}
            pageSize={pageSize}
            currentPage={currentPage}
            totalCount={totalCount}
            onPageChange={setCurrentPage}
            onSortChange={(key, direction) => {
              setSortConfig(direction ? { key, direction } : null);
              setCurrentPage(1);
            }}
            sortConfig={sortConfig}
            serverSide={true}
            actions={(job) => (
              <OpportunitiesTableActions
                job={job}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
          />
        </div>

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
