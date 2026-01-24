'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CheckCircle2, FileText, Loader2, Upload } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { useRef, useState } from 'react';

interface ApplicationFormProps {
  onSubmit: (data: {
    name: string;
    email: string;
    phone: string;
    cv: File;
  }) => Promise<void>;
  isSubmitting: boolean;
  onValidationError?: (message: string) => void;
}

export function ApplicationForm({ onSubmit, isSubmitting, onValidationError }: ApplicationFormProps) {
  const t = useTranslations();
  const locale = useLocale();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvFileName, setCvFileName] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const validateFile = (file: File): boolean => {
    const validTypes = ['.pdf', '.doc', '.docx'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    return validTypes.includes(fileExtension);
  };

  const handleFileSelect = (file: File) => {
    if (validateFile(file)) {
      setCvFile(file);
      setCvFileName(file.name);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const isFormValid = () => {
    return (
      name.trim() !== '' &&
      email.trim() !== '' &&
      phone.trim() !== '' &&
      cvFile !== null &&
      acceptedTerms &&
      acceptedPrivacy
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid() || !cvFile) {
      if (onValidationError) {
        onValidationError(t('jobs.allFieldsRequired'));
      }
      return;
    }

    await onSubmit({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      cv: cvFile,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-6">
          {t('common.application')}
        </h3>

        <div className="space-y-6">
          {/* Personal Information */}
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

          {/* Legal Agreements */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="terms-checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
              />
              <label htmlFor="terms-checkbox" className="text-sm text-gray-300 cursor-pointer">
                {t('legal.acceptTerms')}{' '}
                <a
                  href={`/${locale}/legal/terms-and-conditions`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  {t('footer.termsAndConditions')}
                </a>
              </label>
            </div>
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="privacy-checkbox"
                checked={acceptedPrivacy}
                onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
              />
              <label htmlFor="privacy-checkbox" className="text-sm text-gray-300 cursor-pointer">
                {t('legal.acceptPrivacy')}{' '}
                <a
                  href={`/${locale}/legal/privacy-policy`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  {t('footer.privacyPolicy')}
                </a>
              </label>
            </div>
          </div>

          {/* File Upload with Drag and Drop - Centered */}
          <div className="flex justify-center">
            <div className="w-full max-w-md">
              <label className="block text-sm font-medium mb-2 text-gray-300 text-center">
                {t('common.cv')} <span className="text-gray-500">(PDF, DOC, DOCX)</span>
              </label>
              <div
                ref={dropZoneRef}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`
                  relative border-2 border-dashed rounded-lg p-8 transition-all duration-200 cursor-pointer
                  ${isDragging
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-gray-600 hover:border-gray-500 bg-gray-800/50'
                  }
                  ${cvFile ? 'border-green-500 bg-green-500/10' : ''}
                `}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {cvFile ? (
                  <div className="flex flex-col items-center justify-center gap-2">
                    <CheckCircle2 className="h-8 w-8 text-green-500" />
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <FileText className="h-4 w-4" />
                      <span className="font-medium">{cvFileName}</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCvFile(null);
                        setCvFileName('');
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                      className="text-xs text-gray-400 hover:text-gray-300 mt-1"
                    >
                      {t('common.delete')}
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="p-3 rounded-full bg-gray-700">
                      <Upload className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-300 mb-1">
                        {isDragging ? t('common.dropFile') : t('common.dragDropFile')}
                      </p>
                      <p className="text-xs text-gray-500 mb-3">
                        {t('common.or')}
                      </p>
                      <span className="text-sm text-blue-400 hover:text-blue-300 underline">
                        {t('common.browseFiles')}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-700">
        <Button
          variant="primary"
          type="submit"
          disabled={isSubmitting || !isFormValid()}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
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
  );
}
