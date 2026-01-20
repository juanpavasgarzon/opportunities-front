'use client';

import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface AlertProps {
  type?: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onClose?: () => void;
  autoClose?: boolean;
  duration?: number;
}

export function Alert({ type = 'info', message, onClose, autoClose = false, duration = 5000 }: AlertProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (autoClose && visible) {
      const timer = setTimeout(() => {
        setVisible(false);
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose, visible]);

  if (!visible) {
    return null;
  }

  const styles = {
    success: 'bg-green-500 border-green-600 text-white dark:bg-green-600 dark:border-green-700 dark:text-white',
    error: 'bg-red-500 border-red-600 text-white dark:bg-red-600 dark:border-red-700 dark:text-white',
    warning: 'bg-yellow-500 border-yellow-600 text-white dark:bg-yellow-600 dark:border-yellow-700 dark:text-white',
    info: 'bg-blue-500 border-blue-600 text-white dark:bg-blue-600 dark:border-blue-700 dark:text-white'
  };

  return (
    <div className={`fixed bottom-4 right-4 z-[100] p-4 rounded-lg border ${styles[type]} shadow-lg max-w-md`}>
      <div className="flex items-start justify-between gap-4">
        <p className="flex-1">{message}</p>
        {onClose && (
          <button
            onClick={() => {
              setVisible(false);
              onClose();
            }}
            className="flex-shrink-0 text-current opacity-70 hover:opacity-100"
          >
            <X size={20} />
          </button>
        )}
      </div>
    </div>
  );
}

