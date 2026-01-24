'use client';

import { Button } from '@/components/ui/Button';
import { Loader2, Mail } from '@/components/icons';
import { useTranslations } from 'next-intl';

interface EmailTestSectionProps {
  testingConnection: boolean;
  testResult: { success: boolean } | null;
  onTest: () => void;
}

export function EmailTestSection({ testingConnection, testResult, onTest }: EmailTestSectionProps) {
  const t = useTranslations();

  return (
    <div className="bg-gray-800 rounded-lg shadow p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-semibold text-white mb-4 flex items-center gap-2">
        <Mail className="h-4 w-4 sm:h-5 sm:w-5" />
        {t('settings.emailTest')}
      </h2>
      <div className="space-y-4">
        <p className="text-sm text-gray-400">
          {t('settings.emailTestDescription')}
        </p>
        <Button
          variant="outline"
          onClick={onTest}
          disabled={testingConnection}
          className="flex items-center gap-2"
        >
          {testingConnection ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t('settings.testingConnection')}
            </>
          ) : (
            <>
              <Mail size={20} />
              {t('settings.testConnection')}
            </>
          )}
        </Button>
        {testResult && (
          <div className={`p-4 rounded-lg border ${testResult.success
            ? 'bg-green-500/10 border-green-500/50'
            : 'bg-red-500/10 border-red-500/50'
            }`}>
            <div className="flex items-start gap-3">
              <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${testResult.success ? 'bg-green-500' : 'bg-red-500'
                }`}>
                {testResult.success ? (
                  <span className="text-white text-xs">✓</span>
                ) : (
                  <span className="text-white text-xs">✕</span>
                )}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${testResult.success ? 'text-green-400' : 'text-red-400'
                  }`}>
                  {testResult.success ? t('settings.testSuccess') : t('settings.testFailed')}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
