'use client';

import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({ message, className = '' }: LoadingStateProps) {
  return (
    <div className={`flex items-center justify-center min-h-screen ${className}`}>
      <div className="flex items-center gap-2 text-gray-400">
        <Loader2 className="h-8 w-8 animate-spin" />
        {message && <span>{message}</span>}
      </div>
    </div>
  );
}
