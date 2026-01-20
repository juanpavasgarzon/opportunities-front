'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { JobOpportunity } from '@/lib/types';
import { FileText, Loader2, Upload, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';

interface ApplyModalProps {
  job: JobOpportunity;
  onClose: () => void;
  onSubmit: (data: { name: string; email: string; phone: string; cv: File | null }) => void;
  isLoading?: boolean;
}

export function ApplyModal({ job, onClose, onSubmit, isLoading = false }: ApplyModalProps) {
  const t = useTranslations();
  const modalRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvFileName, setCvFileName] = useState('');

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCvFile(file);
      setCvFileName(file.name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, email, phone, cv: cvFile });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div ref={modalRef} className="bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-700 animate-in zoom-in-95 duration-200">
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">
            {t('common.apply')} - {job.title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="border-b border-gray-700 pb-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">
              {t('common.application')}
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label={t('common.name')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                label={t('auth.email')}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                label={t('common.phone')}
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                {t('common.cv')} (PDF, DOC, DOCX)
              </label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 px-4 py-2 border border-gray-600 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors">
                  <Upload className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-300">
                    {cvFileName || t('common.chooseFile')}
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                {cvFileName && (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <FileText className="h-4 w-4" />
                    <span>{cvFileName}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-700">
              <Button variant="outline" type="button" onClick={onClose} disabled={isLoading}>
                {t('common.cancel')}
              </Button>
              <Button variant="primary" type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    {t('common.loading')}
                  </>
                ) : (
                  <>
                    {t('common.submit')} {t('common.application')}
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
