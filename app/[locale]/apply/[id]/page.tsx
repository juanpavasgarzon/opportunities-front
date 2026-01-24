'use client';

import { ApplicationForm } from '@/components/jobs/ApplicationForm';
import { JobOpportunityInfo } from '@/components/jobs/JobOpportunityInfo';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { useJob } from '@/hooks/useJobs';
import { applyToJob } from '@/lib/api/jobs';
import { ArrowLeft, Loader2, Share2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ApplyPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;

  const { data: job, isLoading: isLoadingJob, error: jobError } = useJob(jobId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleShare = async () => {
    if (typeof window !== 'undefined' && job) {
      const url = `${window.location.origin}/${locale}/apply/${jobId}`;
      const shareData = {
        title: job.title,
        text: `${t('common.shareJob')}: ${job.title}`,
        url: url,
      };

      try {
        if (navigator.share && navigator.canShare(shareData)) {
          await navigator.share(shareData);
        } else {
          await navigator.clipboard.writeText(url);
          setAlert({
            type: 'success',
            message: t('common.linkCopied'),
          });
          setTimeout(() => setAlert(null), 3000);
        }
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          try {
            await navigator.clipboard.writeText(url);
            setAlert({
              type: 'success',
              message: t('common.linkCopied'),
            });
            setTimeout(() => setAlert(null), 3000);
          } catch {
            setAlert({
              type: 'error',
              message: t('common.shareError'),
            });
            setTimeout(() => setAlert(null), 3000);
          }
        }
      }
    }
  };

  const handleSubmit = async (data: { name: string; email: string; phone: string; cv: File }) => {
    setIsSubmitting(true);
    setAlert(null);

    try {
      await applyToJob(jobId, {
        name: data.name,
        email: data.email,
        phone: data.phone,
        cv: data.cv,
      });

      setAlert({
        type: 'success',
        message: t('jobs.applicationSubmitted', { title: job?.title || '' }),
      });

      setTimeout(() => {
        router.push(`/${locale}`);
      }, 2000);
    } catch {
      setAlert({
        type: 'error',
        message: t('jobs.applicationError'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingJob) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  if (jobError || !job) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{t('jobs.errorLoadingJobs')}</p>
          <Button variant="outline" onClick={() => router.push(`/${locale}`)}>
            {t('common.goHome')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => router.push(`/${locale}`)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('common.goBack')}
          </Button>
          <Button
            variant="outline"
            onClick={handleShare}
            className="flex items-center gap-2"
          >
            <Share2 className="h-4 w-4" />
            {t('common.share')}
          </Button>
        </div>

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
          <JobOpportunityInfo job={job} />
          <ApplicationForm 
            onSubmit={handleSubmit} 
            isSubmitting={isSubmitting}
            onValidationError={(message) => {
              setAlert({
                type: 'error',
                message,
              });
            }}
          />
        </div>
      </div>
    </div>
  );
}
