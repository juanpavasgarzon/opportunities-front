'use client';

import { DataTable } from '@/components/ui/DataTable';
import { useJobs } from '@/hooks/useJobs';
import { JobOpportunity } from '@/lib/types';
import { formatDateLocale } from '@/lib/utils/date';
import { Eye, Loader2 } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { JobsSearchBar } from './JobsSearchBar';

interface JobsTableProps {
  onApply?: (job: JobOpportunity) => void;
}

export function JobsTable({ onApply }: JobsTableProps) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
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
      key: 'company_name' as const,
      label: t('jobs.companyName'),
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
      key: 'post_date' as const,
      label: t('jobs.postDate'),
      sortable: true,
      render: (value: unknown) => formatDateLocale(value as string)
    }
  ];

  const handleApply = (job: JobOpportunity) => {
    if (onApply) {
      onApply(job);
    } else {
      router.push(`/${locale}/apply/${job.id}`);
    }
  };

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
      <JobsSearchBar value={inputValue} onChange={setInputValue} />
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
          actionsLabel={t('common.viewApply')}
          actions={(job) => (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleApply(job);
              }}
              className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center"
              title={t('common.viewApply')}
            >
              <Eye className="h-4 w-4" />
            </button>
          )}
        />
      </div>
    </>
  );
}
