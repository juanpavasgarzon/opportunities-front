'use client';

import { Button } from '@/components/ui/Button';
import { JobOpportunity } from '@/lib/types';
import { Edit, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface OpportunitiesTableActionsProps {
  job: JobOpportunity;
  onEdit: (job: JobOpportunity) => void;
  onDelete: (job: JobOpportunity) => void;
}

export function OpportunitiesTableActions({ job, onEdit, onDelete }: OpportunitiesTableActionsProps) {
  const t = useTranslations();

  return (
    <div className="flex gap-2">
      <Button
        variant="secondary"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onEdit(job);
        }}
        className="flex items-center justify-center p-1.5"
        title={t('common.edit')}
      >
        <Edit size={16} />
      </Button>
      <Button
        variant="danger"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(job);
        }}
        className="flex items-center justify-center p-1.5"
        title={t('common.delete')}
      >
        <Trash2 size={16} />
      </Button>
    </div>
  );
}
