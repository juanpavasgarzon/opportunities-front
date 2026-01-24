'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Save } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

interface CompanyConfigurationFormProps {
  companyName: string;
  logo: string | null;
  isLoading: boolean;
  onCompanyNameChange: (value: string) => void;
  onLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: () => void;
}

export function CompanyConfigurationForm({
  companyName,
  logo,
  isLoading,
  onCompanyNameChange,
  onLogoUpload,
  onSave
}: CompanyConfigurationFormProps) {
  const t = useTranslations();

  return (
    <div className="bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-white mb-4">
        {t('settings.company')}
      </h2>
      <div className="space-y-6">
        <div>
          <Input
            label={t('settings.companyName')}
            value={companyName}
            onChange={(e) => onCompanyNameChange(e.target.value)}
            placeholder={t('settings.companyNamePlaceholder')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-300">
            {t('settings.logo')}
          </label>
          {logo && (
            <div className="mb-4">
              <p className="text-sm text-gray-400 mb-2">
                {t('settings.currentLogo')}:
              </p>
              <div className="relative h-20 w-auto">
                <Image
                  src={logo}
                  alt="Logo"
                  width={80}
                  height={80}
                  className="object-contain"
                  unoptimized
                />
              </div>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={onLogoUpload}
            className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-900 file:text-blue-200 hover:file:bg-blue-800"
          />
        </div>

        <Button
          variant="primary"
          onClick={onSave}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          {isLoading ? (
            <>
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
