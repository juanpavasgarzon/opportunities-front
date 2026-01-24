'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { LoadingState } from '@/components/common/LoadingState';
import { CompanyConfigurationForm } from '@/components/settings/CompanyConfigurationForm';
import { EmailConfigurationForm } from '@/components/settings/EmailConfigurationForm';
import { EmailTestSection } from '@/components/settings/EmailTestSection';
import { useConfiguration, useUpdateCompanyConfiguration, useUpdateEmailConfiguration } from '@/hooks/useConfiguration';
import { testEmailConnection } from '@/lib/api/email';
import { getCurrentUser } from '@/lib/auth';
import { Settings as SettingsIcon } from '@/components/icons';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const { data: configuration, isLoading: isLoadingConfig } = useConfiguration();
  const updateCompanyMutation = useUpdateCompanyConfiguration();
  const updateEmailMutation = useUpdateEmailConfiguration();

  const [logo, setLogo] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [emailConfig, setEmailConfig] = useState({
    recipients: '',
    cc: '',
    bcc: ''
  });
  const [mounted, setMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ role: string } | null>(null);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean } | null>(null);

  useEffect(() => {
    const user = getCurrentUser();

    if (user?.role !== 'owner') {
      router.push(`/${locale}/admin/opportunities`);
      return;
    }

    setTimeout(() => {
      setCurrentUser(user);
      setMounted(true);
    }, 0);
  }, [router, locale]);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    if (configuration) {
      if (configuration.company_name) {
        setCompanyName(configuration.company_name);
        localStorage.setItem('app_company_name', configuration.company_name);
        window.dispatchEvent(new Event('company-name-updated'));
      }

      if (configuration.company_logo) {
        setLogo(configuration.company_logo);
        localStorage.setItem('app_logo', configuration.company_logo);
        window.dispatchEvent(new Event('logo-updated'));
      }

      setEmailConfig({
        recipients: configuration.recipient_emails || '',
        cc: configuration.copy_emails || '',
        bcc: configuration.blind_copy_emails || '',
      });

      localStorage.setItem('email_config', JSON.stringify({
        recipients: configuration.recipient_emails || '',
        cc: configuration.copy_emails || '',
        bcc: configuration.blind_copy_emails || '',
      }));
    } else {
      try {
        const savedLogo = localStorage.getItem('app_logo');
        const savedCompanyName = localStorage.getItem('app_company_name');
        const savedEmail = localStorage.getItem('email_config');

        if (savedLogo) {
          setTimeout(() => {
            setLogo(savedLogo);
          }, 0);
        }

        if (savedCompanyName) {
          setTimeout(() => {
            setCompanyName(savedCompanyName);
          }, 0);
        }

        if (savedEmail) {
          try {
            const parsed = JSON.parse(savedEmail);
            setTimeout(() => {
              setEmailConfig(parsed);
            }, 0);
          } catch (e) {
            console.error('Error parsing email config:', e);
          }
        }
      } catch (e) {
        console.error('Error loading settings:', e);
      }
    }
  }, [mounted, configuration]);

  if (!mounted || !currentUser || currentUser?.role !== 'owner') {
    return null;
  }

  if (isLoadingConfig) {
    return (
      <ProtectedRoute requiredRole={['owner']}>
        <LoadingState />
      </ProtectedRoute>
    );
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const result = reader.result as string;
          setLogo(result);
          localStorage.setItem('app_logo', result);

          await updateCompanyMutation.mutateAsync({
            company_name: companyName.trim() || null,
            company_logo: result,
          });

          window.dispatchEvent(new Event('logo-updated'));
          toast.success(t('settings.logoUploaded'));
        } catch (error) {
          console.error('Error uploading logo:', error);
          toast.error(t('settings.logoUploadError'));
        }
      };
      reader.onerror = () => {
        console.error('Error reading file');
        toast.error(t('settings.logoUploadError'));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCompanySave = async () => {
    if (!companyName.trim()) {
      toast.error(t('settings.companyNameRequired'));
      return;
    }

    try {
      await updateCompanyMutation.mutateAsync({
        company_name: companyName.trim(),
        company_logo: logo || null,
      });

      localStorage.setItem('app_company_name', companyName.trim());
      if (logo) {
        localStorage.setItem('app_logo', logo);
      }

      window.dispatchEvent(new Event('logo-updated'));
      window.dispatchEvent(new Event('company-name-updated'));

      toast.success(t('settings.companySaved'));
    } catch (error) {
      console.error('Error saving company configuration:', error);
      const errorMessage = error instanceof Error ? error.message : t('settings.companySaveError');
      toast.error(errorMessage);
    }
  };

  const handleEmailSave = async () => {
    try {
      await updateEmailMutation.mutateAsync({
        recipient_emails: emailConfig.recipients || null,
        copy_emails: emailConfig.cc || null,
        blind_copy_emails: emailConfig.bcc || null,
      });

      localStorage.setItem('email_config', JSON.stringify(emailConfig));

      toast.success(t('settings.emailSaved'));
    } catch (error) {
      console.error('Error saving email configuration:', error);
      const errorMessage = error instanceof Error ? error.message : t('settings.emailSaveError');
      toast.error(errorMessage);
    }
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);

    try {
      const result = await testEmailConnection();
      setTestResult(result);
    } catch (error) {
      console.error('Error testing email connection:', error);
      setTestResult({ success: false });
    } finally {
      setTestingConnection(false);
    }
  };

  return (
    <ProtectedRoute requiredRole={['owner']}>
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
          <SettingsIcon className="h-6 w-6 sm:h-8 sm:w-8" />
          {t('settings.title')}
        </h1>

        <div className="space-y-6 sm:space-y-8">
          <CompanyConfigurationForm
            companyName={companyName}
            logo={logo}
            isLoading={updateCompanyMutation.isPending}
            onCompanyNameChange={setCompanyName}
            onLogoUpload={handleLogoUpload}
            onSave={handleCompanySave}
          />

          <EmailConfigurationForm
            recipients={emailConfig.recipients}
            cc={emailConfig.cc}
            bcc={emailConfig.bcc}
            isLoading={updateEmailMutation.isPending}
            onRecipientsChange={(value) => setEmailConfig({ ...emailConfig, recipients: value })}
            onCcChange={(value) => setEmailConfig({ ...emailConfig, cc: value })}
            onBccChange={(value) => setEmailConfig({ ...emailConfig, bcc: value })}
            onSave={handleEmailSave}
          />

          <EmailTestSection
            testingConnection={testingConnection}
            testResult={testResult}
            onTest={handleTestConnection}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}
