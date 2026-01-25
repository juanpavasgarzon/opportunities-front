'use client';

import { ApplicationForm } from '@/components/jobs/ApplicationForm';
import { JobOpportunityInfo } from '@/components/jobs/JobOpportunityInfo';
import { Button } from '@/components/ui/Button';
import { useJob } from '@/hooks/useJobs';
import { applyToJob } from '@/lib/api/jobs';
import { ArrowLeft, Loader2, Share2 } from '@/components/icons';
import { useLocale, useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function ApplyPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;

  const { data: job, isLoading: isLoadingJob, error: jobError } = useJob(jobId);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
          toast.success(t('common.linkCopied'));
        }
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          try {
            await navigator.clipboard.writeText(url);
            toast.success(t('common.linkCopied'));
          } catch {
            toast.error(t('common.shareError'));
          }
        }
      }
    }
  };

  const handleSubmit = async (data: { name: string; email: string; phone: string; cv: File }) => {
    setIsSubmitting(true);

    try {
      await applyToJob(jobId, {
        name: data.name,
        email: data.email,
        phone: data.phone,
        language: locale,
        cv: data.cv,
      });

      toast.success(t('jobs.applicationSubmitted', { title: job?.title || '' }));
      router.push(`/${locale}`);
    } catch {
      toast.error(t('jobs.applicationError'));
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
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 max-w-4xl">
      <div className="mb-4 sm:mb-6 flex flex-row items-center justify-between gap-2 sm:gap-0">
        <Button
          variant="outline"
          onClick={() => router.push(`/${locale}`)}
          className="flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('common.goBack')}
        </Button>
        <Button
          variant="outline"
          onClick={handleShare}
          className="flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <Share2 className="h-4 w-4" />
          {t('common.share')}
        </Button>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 overflow-hidden">
        <JobOpportunityInfo job={job} />
        <ApplicationForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          onValidationError={(message) => {
            toast.error(message);
          }}
        />
      </div>
    </div>
  );
}
