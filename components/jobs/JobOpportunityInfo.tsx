'use client';

import { JobOpportunity } from '@/lib/types';
import { useTranslations } from 'next-intl';

interface JobOpportunityInfoProps {
  job: JobOpportunity;
}

export function JobOpportunityInfo({ job }: JobOpportunityInfoProps) {
  const t = useTranslations();

  return (
    <div className="p-6 border-b border-gray-700">
      <h1 className="text-2xl font-bold text-white mb-6">
        {job.title}
      </h1>

      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
        <div>
          <span className="font-bold text-white">{t('jobs.companyName')}:</span>
          <p className="text-gray-300 mt-1">{job.company_name || '--'}</p>
        </div>
        <div>
          <span className="font-bold text-white">{t('jobs.location')}:</span>
          <p className="text-gray-300 mt-1">{job.location || '--'}</p>
        </div>
        <div>
          <span className="font-bold text-white">{t('jobs.jobType')}:</span>
          <p className="text-gray-300 mt-1">{job.job_type || '--'}</p>
        </div>
        <div>
          <span className="font-bold text-white">{t('jobs.experience')}:</span>
          <p className="text-gray-300 mt-1">{job.experience || '--'}</p>
        </div>
        <div>
          <span className="font-bold text-white">{t('jobs.salaryRange')}:</span>
          <p className="text-gray-300 mt-1">
            {job.salary_range ? `${job.salary_range}${job.currency ? ` (${job.currency})` : ''}` : '--'}
          </p>
        </div>
        <div>
          <span className="font-bold text-white">{t('jobs.industry')}:</span>
          <p className="text-gray-300 mt-1">{job.industry || '--'}</p>
        </div>
        <div>
          <span className="font-bold text-white">{t('jobs.reference')}:</span>
          <p className="text-gray-300 mt-1">{job.reference || '--'}</p>
        </div>
      </div>
      <div className="mt-4">
        <span className="font-bold text-white block mb-2">{t('jobs.information')}:</span>
        <p className="text-gray-300 whitespace-pre-wrap">{job.information || '--'}</p>
      </div>
      <div className="mt-4">
        <span className="font-bold text-white block mb-2">{t('jobs.companyInfo')}:</span>
        <p className="text-gray-300 whitespace-pre-wrap">{job.company_info || '--'}</p>
      </div>
    </div>
  );
}
