'use client';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { JobOpportunity } from '@/lib/types';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

interface JobFormProps {
  job?: JobOpportunity | null;
  onSubmit: (data: Partial<JobOpportunity>) => Promise<void>;
  onCancel: () => void;
  onGoBack?: () => void;
  isLoading?: boolean;
  initialAlert?: { type: 'success' | 'error'; message: string } | null;
}

export function JobForm({ job, onSubmit, onCancel, onGoBack, isLoading = false, initialAlert = null }: JobFormProps) {
  const t = useTranslations();
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(initialAlert);
  const [formData, setFormData] = useState<Partial<JobOpportunity>>(
    job ? {
      title: job.title || '',
      job_type: job.job_type || '',
      experience: job.experience || '',
      location: job.location || '',
      industry: job.industry || '',
      information: job.information || '',
      company_name: job.company_name || '',
      company_info: job.company_info || '',
      salary_range: job.salary_range || '',
      currency: job.currency || '',
      post_date: job.post_date?.split('T')[0] || new Date().toISOString().split('T')[0],
      reference: job.reference || ''
    } : {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);

    if (!formData.title?.trim()) {
      setAlert({
        type: 'error',
        message: t('jobs.titleColumn') + ' is required'
      });
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error saving job:', error);
      setAlert({
        type: 'error',
        message: job ? t('jobs.jobUpdateError') : t('jobs.jobCreateError')
      });
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl pb-8">
      {alert && (
        <div className="mb-6">
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        </div>
      )}

      <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-2xl font-bold text-white">
            {job ? t('common.update') : t('common.create')} {t('jobs.title')}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
          <div className="flex justify-between items-center pt-4 border-t border-gray-700">
            {onGoBack && (
              <Button
                variant="outline"
                type="button"
                onClick={onGoBack}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                {t('common.goBack')}
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button
                variant="outline"
                type="button"
                onClick={onCancel}
                disabled={isLoading}
              >
                {t('common.cancel')}
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {t('common.loading')}
                  </>
                ) : (
                  t('common.save')
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
