'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from './Button';

interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (value: unknown, row: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  pageSize?: number;
  currentPage?: number;
  totalCount?: number;
  onPageChange?: (page: number) => void;
  onSortChange?: (key: keyof T | string, direction: 'asc' | 'desc' | null) => void;
  sortConfig?: { key: keyof T | string; direction: 'asc' | 'desc' } | null;
  onRowClick?: (row: T) => void;
  actions?: (row: T) => React.ReactNode;
  actionsLabel?: string;
  serverSide?: boolean;
}

export function DataTable<T extends { id: string | number }>({
  data,
  columns,
  pageSize = 10,
  currentPage: controlledCurrentPage,
  totalCount: controlledTotalCount,
  onPageChange,
  onSortChange,
  sortConfig: controlledSortConfig,
  onRowClick,
  actions,
  actionsLabel,
  serverSide = false
}: DataTableProps<T>) {
  const t = useTranslations();
  const [internalCurrentPage, setInternalCurrentPage] = useState(1);
  const [internalSortConfig, setInternalSortConfig] = useState<{ key: keyof T | string; direction: 'asc' | 'desc' } | null>(null);
  const prevDataLengthRef = useRef(data.length);

  const currentPage = controlledCurrentPage ?? internalCurrentPage;
  const sortConfig = controlledSortConfig ?? internalSortConfig;
  const totalCount = controlledTotalCount ?? data.length;
  const totalPages = Math.ceil(totalCount / pageSize);

  const sortedData = useMemo(() => {
    if (serverSide || !sortConfig) {
      return data;
    }
    
    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key as keyof T];
      const bValue = b[sortConfig.key as keyof T];
      
      if (aValue === bValue) {
        return 0;
      }
      
      const comparison = aValue < bValue ? -1 : 1;
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [data, sortConfig, serverSide]);

  const paginatedData = useMemo(() => {
    if (serverSide) {
      return data;
    }
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize, serverSide, data]);

  useEffect(() => {
    if (!serverSide && prevDataLengthRef.current !== data.length) {
      prevDataLengthRef.current = data.length;
      setTimeout(() => {
        if (!controlledCurrentPage) {
          setInternalCurrentPage(1);
        } else if (onPageChange) {
          onPageChange(1);
        }
      }, 0);
    }
  }, [data.length, serverSide, controlledCurrentPage, onPageChange]);

  const handleSort = (key: keyof T | string) => {
    if (serverSide && onSortChange) {
      const newDirection = sortConfig?.key === key 
        ? (sortConfig.direction === 'asc' ? 'desc' : null)
        : 'asc';
      onSortChange(key, newDirection);
    } else {
      setInternalSortConfig(prev => {
        if (prev?.key === key) {
          return prev.direction === 'asc' 
            ? { key, direction: 'desc' }
            : null;
        }
        return { key, direction: 'asc' };
      });
    }
  };

  const handlePageChange = (newPage: number) => {
    if (serverSide && onPageChange) {
      onPageChange(newPage);
    } else if (!controlledCurrentPage) {
      setInternalCurrentPage(newPage);
    } else if (onPageChange) {
      onPageChange(newPage);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="overflow-x-auto overflow-y-visible">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-800">
            <tr>
              {actions && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-24 whitespace-nowrap">
                  <span className="whitespace-nowrap">{actionsLabel ?? t('common.actions')}</span>
                </th>
              )}
              {columns.map((column) => {
                const isDateColumn = column.key === 'created_at' || column.key === 'updated_at';
                return (
                  <th
                    key={String(column.key)}
                    className={`px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider ${
                      column.sortable ? 'cursor-pointer hover:bg-gray-700' : ''
                    } ${isDateColumn ? 'min-w-[140px]' : ''}`}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    {column.label}
                    {column.sortable && sortConfig?.key === column.key && (
                      <span className="ml-1">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="bg-gray-900 divide-y divide-gray-700">
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="px-6 py-4 text-center text-gray-400"
                >
                  {t('common.noDataAvailable')}
                </td>
              </tr>
            ) : (
              paginatedData.map((row) => (
                <tr
                  key={row.id}
                  className={`hover:bg-gray-800 ${onRowClick ? 'cursor-pointer' : ''}`}
                  onClick={() => onRowClick?.(row)}
                >
                  {actions && (
                    <td
                      className="px-6 py-4 whitespace-nowrap text-sm w-24"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {actions(row)}
                    </td>
                  )}
                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-100"
                    >
                      {column.render
                        ? column.render(row[column.key as keyof T], row)
                        : String(row[column.key as keyof T] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 bg-gray-900 border-t border-gray-700">
          <div className="text-sm text-gray-300">
            {t('common.showingResults', {
              start: (currentPage - 1) * pageSize + 1,
              end: Math.min(currentPage * pageSize, totalCount),
              total: totalCount,
            })}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={16} />
            </Button>
            <div className="text-sm text-gray-300">
              {t('common.pageOf', {
                current: currentPage,
                total: totalPages,
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
