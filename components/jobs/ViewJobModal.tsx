'use client';

import { Button } from '@/components/ui/Button';
import { JobOpportunity } from '@/lib/types';
import { formatDateLocale } from '@/lib/utils/date';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';

interface ViewJobModalProps {
  job: JobOpportunity;
  onClose: () => void;
}

export function ViewJobModal({ job, onClose }: ViewJobModalProps) {
  const t = useTranslations();
  const modalRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div ref={modalRef} className="bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-700 animate-in zoom-in-95 duration-200">
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">
            {job.title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Job Details Section */}
          <div className="border-b border-gray-700 pb-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-bold text-white">{t('jobs.titleColumn')}:</span>
                <p className="text-gray-300 mt-1">{job.title || '--'}</p>
              </div>
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
              <div>
                <span className="font-bold text-white">{t('jobs.postDate')}:</span>
                <p className="text-gray-300 mt-1">
                  {job.post_date ? formatDateLocale(job.post_date) : '--'}
                </p>
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

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" type="button" onClick={onClose}>
              {t('common.close')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
