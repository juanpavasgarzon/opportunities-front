'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useConfiguration, useUpdateCompanyConfiguration, useUpdateEmailConfiguration } from '@/hooks/useConfiguration';
import { testEmailConnection } from '@/lib/api/email';
import { getCurrentUser } from '@/lib/auth';
import { Loader2, Mail, Save, Settings as SettingsIcon } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

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
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null);
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
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
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
          setAlert({
            type: 'success',
            message: t('settings.logoUploaded')
          });
          setTimeout(() => setAlert(null), 3000);
        } catch (error) {
          console.error('Error uploading logo:', error);
          setAlert({
            type: 'error',
            message: t('settings.logoUploadError')
          });
          setTimeout(() => setAlert(null), 3000);
        }
      };
      reader.onerror = () => {
        console.error('Error reading file');
        setAlert({
          type: 'error',
          message: t('settings.logoUploadError')
        });
        setTimeout(() => setAlert(null), 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCompanySave = async () => {
    if (!companyName.trim()) {
      setAlert({
        type: 'warning',
        message: t('settings.companyNameRequired')
      });
      setTimeout(() => setAlert(null), 3000);
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

      setAlert({
        type: 'success',
        message: t('settings.companySaved')
      });
      setTimeout(() => setAlert(null), 3000);
    } catch (error) {
      console.error('Error saving company configuration:', error);
      const errorMessage = error instanceof Error ? error.message : t('settings.companySaveError');
      setAlert({
        type: 'error',
        message: errorMessage
      });
      setTimeout(() => setAlert(null), 3000);
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

      setAlert({
        type: 'success',
        message: t('settings.emailSaved')
      });
      setTimeout(() => setAlert(null), 3000);
    } catch (error) {
      console.error('Error saving email configuration:', error);
      const errorMessage = error instanceof Error ? error.message : t('settings.emailSaveError');
      setAlert({
        type: 'error',
        message: errorMessage
      });
      setTimeout(() => setAlert(null), 3000);
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
        <h1 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
          <SettingsIcon className="h-8 w-8" />
          {t('settings.title')}
        </h1>

        {alert && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
            autoClose
          />
        )}

        <div className="space-y-8">
          <div className="bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              {t('settings.company')}
            </h2>
            <div className="space-y-6">
              <div>
                <Input
                  label={t('settings.companyName')}
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
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
                  onChange={handleLogoUpload}
                  className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-900 file:text-blue-200 hover:file:bg-blue-800"
                />
              </div>

              <Button
                variant="primary"
                onClick={handleCompanySave}
                disabled={updateCompanyMutation.isPending}
                className="flex items-center gap-2"
              >
                {updateCompanyMutation.isPending ? (
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

          <div className="bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              {t('settings.email')}
            </h2>
            <div className="space-y-4">
              <Input
                label={t('settings.recipients')}
                type="email"
                value={emailConfig.recipients}
                onChange={(e) => setEmailConfig({ ...emailConfig, recipients: e.target.value })}
                placeholder="recipient1@example.com, recipient2@example.com"
              />
              <Input
                label={t('settings.cc')}
                type="email"
                value={emailConfig.cc}
                onChange={(e) => setEmailConfig({ ...emailConfig, cc: e.target.value })}
                placeholder="cc1@example.com, cc2@example.com"
              />
              <Input
                label={t('settings.bcc')}
                type="email"
                value={emailConfig.bcc}
                onChange={(e) => setEmailConfig({ ...emailConfig, bcc: e.target.value })}
                placeholder="bcc1@example.com, bcc2@example.com"
              />
              <Button
                variant="primary"
                onClick={handleEmailSave}
                disabled={updateEmailMutation.isPending}
                className="flex items-center gap-2"
              >
                {updateEmailMutation.isPending ? (
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

          <div className="bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Mail className="h-5 w-5" />
              {t('settings.emailTest')}
            </h2>
            <div className="space-y-4">
              <p className="text-sm text-gray-400">
                {t('settings.emailTestDescription')}
              </p>
              <Button
                variant="outline"
                onClick={handleTestConnection}
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
        </div>
      </div>
    </ProtectedRoute>
  );
}
