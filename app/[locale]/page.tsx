'use client';

import { ApplyModal } from '@/components/jobs/ApplyModal';
import { Alert } from '@/components/ui/Alert';
import { DataTable } from '@/components/ui/DataTable';
import { useJobs } from '@/hooks/useJobs';
import { applyToJob } from '@/lib/api/jobs';
import { JobOpportunity } from '@/lib/types';
import { formatDateLocale } from '@/lib/utils/date';
import { Briefcase, Eye, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

export default function HomePage() {
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
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

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

  const [selectedJob, setSelectedJob] = useState<JobOpportunity | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApply = (job: JobOpportunity) => {
    setSelectedJob(job);
  };

  const handleSubmitApplication = async (data: { name: string; email: string; phone: string; cv: File | null }) => {
    if (!selectedJob || !data.cv) {
      setAlert({
        type: 'error',
        message: t('jobs.cvRequired')
      });
      setTimeout(() => setAlert(null), 5000);
      return;
    }

    setIsSubmitting(true);
    try {
      await applyToJob(selectedJob.id, {
        name: data.name,
        email: data.email,
        phone: data.phone,
        cv: data.cv,
      });

      setAlert({
        type: 'success',
        message: t('jobs.applicationSubmitted', { title: selectedJob.title })
      });
      setSelectedJob(null);
      setTimeout(() => setAlert(null), 5000);
    } catch (error) {
      console.error('Error submitting application:', error);
      const errorMessage = error instanceof Error ? error.message : t('jobs.applicationError');
      setAlert({
        type: 'error',
        message: errorMessage
      });
      setTimeout(() => setAlert(null), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
          <Briefcase className="h-8 w-8" />
          {t('jobs.title')}
        </h1>
        <p className="text-gray-400">
          {t('jobs.subtitle')}
        </p>
      </div>

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
          autoClose
        />
      )}

      <div className="mb-6">
        <input
          type="text"
          placeholder={t('common.searchJobs')}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 text-white"
        />
      </div>

      {isLoading ? (
        <div className="bg-gray-800 rounded-lg shadow overflow-hidden p-8">
          <div className="flex items-center justify-center gap-2 text-gray-400">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>{t('jobs.loadingJobs')}</span>
          </div>
        </div>
      ) : error ? (
        <div className="bg-gray-800 rounded-lg shadow overflow-hidden p-8">
          <div className="text-center text-red-400">
            {t('jobs.errorLoadingJobs')}
          </div>
        </div>
      ) : (
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
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center"
                title={t('common.viewApply')}
              >
                <Eye className="h-5 w-5" />
              </button>
            )}
          />
        </div>
      )}

      {selectedJob && (
        <ApplyModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onSubmit={handleSubmitApplication}
          isLoading={isSubmitting}
        />
      )}
    </div>
  );
}
