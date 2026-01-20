'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ViewJobModal } from '@/components/jobs/ViewJobModal';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { DataTable } from '@/components/ui/DataTable';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { useCreateJob, useDeleteJob, useJobs, useUpdateJob } from '@/hooks/useJobs';
import { JobOpportunity } from '@/lib/types';
import { formatDateLocale } from '@/lib/utils/date';
import { Briefcase, Edit, Eye, Plus, Trash2, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';

export default function OpportunitiesPage() {
  const t = useTranslations();
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
  
  const createJobMutation = useCreateJob();
  const updateJobMutation = useUpdateJob();
  const deleteJobMutation = useDeleteJob();
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingJob, setEditingJob] = useState<JobOpportunity | null>(null);
  const [viewingJob, setViewingJob] = useState<JobOpportunity | null>(null);
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
    setEditingJob(job);
    setShowCreateModal(true);
  };

  const handleView = (job: JobOpportunity) => {
    setViewingJob(job);
  };

  const handleCreate = () => {
    setEditingJob(null);
    setShowCreateModal(true);
  };

  const handleSave = async (jobData: Partial<JobOpportunity>) => {
    try {
      if (editingJob) {
        await updateJobMutation.mutateAsync({
          id: editingJob.id,
          data: jobData
        });
        setAlert({
          type: 'success',
          message: t('jobs.jobUpdated')
        });
      } else {
        await createJobMutation.mutateAsync(jobData as Omit<JobOpportunity, 'id' | 'created_at' | 'updated_at'>);
        setAlert({
          type: 'success',
          message: t('jobs.jobCreated')
        });
      }
      setShowCreateModal(false);
      setEditingJob(null);
      setTimeout(() => setAlert(null), 3000);
    } catch (error) {
      console.error('Error saving job:', error);
      setAlert({
        type: 'error',
        message: editingJob ? t('jobs.jobUpdateError') : t('jobs.jobCreateError')
      });
      setTimeout(() => setAlert(null), 3000);
    }
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
        <h1 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
          <Briefcase className="h-8 w-8" />
          {t('admin.opportunities')}
        </h1>

        {alert && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
            autoClose
          />
        )}

        <div className="mb-6 flex items-center justify-between gap-4">
          <input
            type="text"
            placeholder={t('common.searchJobs')}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 text-white"
          />
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
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleView(job);
                  }}
                  className="flex items-center gap-1"
                >
                  <Eye size={14} />
                  {t('common.preview')}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(job);
                  }}
                  className="flex items-center gap-1"
                >
                  <Edit size={14} />
                  {t('common.edit')}
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(job);
                  }}
                  className="flex items-center gap-1"
                >
                  <Trash2 size={14} />
                  {t('common.delete')}
                </Button>
              </div>
            )}
          />
        </div>

        {showCreateModal && (
          <JobModal
            job={editingJob}
            onSave={handleSave}
            onClose={() => {
              setShowCreateModal(false);
              setEditingJob(null);
            }}
          />
        )}

        {viewingJob && (
          <ViewJobModal
            job={viewingJob}
            onClose={() => setViewingJob(null)}
          />
        )}

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

function JobModal({ 
  job, 
  onSave, 
  onClose 
}: { 
  job: JobOpportunity | null; 
  onSave: (data: Partial<JobOpportunity>) => void;
  onClose: () => void;
}) {
  const t = useTranslations();
  const modalRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState<Partial<JobOpportunity>>(
    job || {
      title: '',
      job_type: '',
      experience: '',
      location: '',
      industry: '',
      information: '',
      company_name: '',
      company_info: '',
      salary_range: '',
      currency: '',
      post_date: new Date().toISOString().split('T')[0],
      reference: ''
    }
  );

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div ref={modalRef} className="bg-gray-800 rounded-lg shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700 animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">
            {job ? t('common.update') : t('common.create')} {t('jobs.title')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t('jobs.titleColumn')}
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            <Input
              label={t('jobs.jobType')}
              value={formData.job_type || ''}
              onChange={(e) => setFormData({ ...formData, job_type: e.target.value })}
            />
            <Input
              label={t('jobs.experience')}
              value={formData.experience || ''}
              onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
            />
            <Input
              label={t('jobs.location')}
              value={formData.location || ''}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
            <Input
              label={t('jobs.industry')}
              value={formData.industry || ''}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
            />
            <Input
              label={t('jobs.companyName')}
              value={formData.company_name || ''}
              onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
            />
            <Input
              label={t('jobs.salaryRange')}
              value={formData.salary_range || ''}
              onChange={(e) => setFormData({ ...formData, salary_range: e.target.value })}
            />
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('jobs.currency')}
              </label>
              <select
                value={formData.currency || ''}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
              >
                <option value="">{t('jobs.selectCurrency')}</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="COP">COP ($)</option>
              </select>
            </div>
            <Input
              label={t('jobs.postDate')}
              type="date"
              value={formData.post_date?.split('T')[0] || ''}
              onChange={(e) => setFormData({ ...formData, post_date: e.target.value })}
            />
            <Input
              label={t('jobs.reference')}
              value={formData.reference || ''}
              onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
              placeholder="REF-0001"
            />
          </div>
          <Textarea
            label={t('jobs.information')}
            value={formData.information || ''}
            onChange={(e) => setFormData({ ...formData, information: e.target.value })}
            rows={4}
          />
          <Textarea
            label={t('jobs.companyInfo')}
            value={formData.company_info || ''}
            onChange={(e) => setFormData({ ...formData, company_info: e.target.value })}
            rows={4}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button variant="primary" type="submit">
              {t('common.save')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

