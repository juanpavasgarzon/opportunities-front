'use client';

import { DataTable } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { OpportunitiesTableActions } from '@/components/opportunities/OpportunitiesTableActions';
import { OpportunitiesSearchBar } from '@/components/opportunities/OpportunitiesSearchBar';
import { useJobs } from '@/hooks/useJobs';
import { JobOpportunity } from '@/lib/types';
import { formatDateLocale } from '@/lib/utils/date';
import { Loader2, Plus } from '@/components/icons';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

interface OpportunitiesTableProps {
  onEdit: (job: JobOpportunity) => void;
  onDelete: (job: JobOpportunity) => void;
  onCreate: () => void;
}

export function OpportunitiesTable({
  onEdit,
  onDelete,
  onCreate,
}: OpportunitiesTableProps) {
  const t = useTranslations();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [inputValue, setInputValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const { data: jobsResponse, isLoading, error } = useJobs({
    page: currentPage,
    pageSize,
    search: searchTerm || undefined,
    sortBy: sortConfig?.key,
    sortOrder: sortConfig?.direction,
  });

  const jobs = jobsResponse?.data || [];
  const totalCount = jobsResponse?.total || 0;

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(inputValue);
      setCurrentPage(1);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [inputValue]);

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

  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-lg shadow overflow-hidden p-8">
        <div className="flex items-center justify-center gap-2 text-gray-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>{t('jobs.loadingJobs')}</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 rounded-lg shadow overflow-hidden p-8">
        <div className="text-center text-red-400">
          {t('jobs.errorLoadingJobs')}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        <OpportunitiesSearchBar value={inputValue} onChange={setInputValue} />
        <Button
          variant="primary"
          onClick={onCreate}
          className="flex items-center justify-center gap-2 text-sm sm:text-base w-full sm:w-auto"
        >
          <Plus size={18} className="sm:w-5 sm:h-5" />
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
              onEdit={onEdit}
              onDelete={onDelete}
            />
          )}
        />
      </div>
    </>
  );
}
