/**
 * Formats a date string to a consistent format that works in both server and client
 * Uses YYYY-MM-DD format to avoid locale/timezone differences
 */
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) {
    return '';
  }

  try {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return '';
    }

    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  } catch {
    return '';
  }
}

/**
 * Formats a date string to a locale-aware format
 * Always uses consistent format to prevent hydration mismatches
 * Uses YYYY-MM-DD format which is consistent across server and client
 */
export function formatDateLocale(dateString: string | null | undefined): string {
  if (!dateString) {
    return '';
  }

  try {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return '';
    }

    return formatDate(dateString);
  } catch {
    return '';
  }
}
