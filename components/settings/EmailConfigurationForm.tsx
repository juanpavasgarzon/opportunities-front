'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Loader2, Save } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface EmailConfigurationFormProps {
  recipients: string;
  cc: string;
  bcc: string;
  isLoading: boolean;
  onRecipientsChange: (value: string) => void;
  onCcChange: (value: string) => void;
  onBccChange: (value: string) => void;
  onSave: () => void;
}

export function EmailConfigurationForm({
  recipients,
  cc,
  bcc,
  isLoading,
  onRecipientsChange,
  onCcChange,
  onBccChange,
  onSave
}: EmailConfigurationFormProps) {
  const t = useTranslations();

  return (
    <div className="bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-white mb-4">
        {t('settings.email')}
      </h2>
      <div className="space-y-4">
        <Input
          label={t('settings.recipients')}
          type="email"
          value={recipients}
          onChange={(e) => onRecipientsChange(e.target.value)}
          placeholder="recipient1@example.com, recipient2@example.com"
        />
        <Input
          label={t('settings.cc')}
          type="email"
          value={cc}
          onChange={(e) => onCcChange(e.target.value)}
          placeholder="cc1@example.com, cc2@example.com"
        />
        <Input
          label={t('settings.bcc')}
          type="email"
          value={bcc}
          onChange={(e) => onBccChange(e.target.value)}
          placeholder="bcc1@example.com, bcc2@example.com"
        />
        <Button
          variant="primary"
          onClick={onSave}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t('common.loading')}
            </>
          ) : (
            <>
              <Save size={20} />
              {t('common.save')}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
