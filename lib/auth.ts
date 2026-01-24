import { User, UserRole } from './types';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') {
    return null;
  }
  const stored = localStorage.getItem('auth_user');
  if (!stored) {
    return null;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function setCurrentUser(user: User): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_user', JSON.stringify(user));
  }
}

export function clearAuth(): void {
  if (typeof window !== 'undefined') {
    const localeKeys = ['NEXT_LOCALE', 'locale', 'next-intl-locale'];
    const savedLocale: Record<string, string> = {};
    localeKeys.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        savedLocale[key] = value;
      }
    });

    localStorage.clear();

    Object.entries(savedLocale).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });

    window.dispatchEvent(new Event('auth-user-removed'));
  }
}

export function isAuthorized(user: User | null, requiredRole?: UserRole[]): boolean {
  if (!user || !user.active) {
    return false;
  }
  if (!requiredRole) {
    return true;
  }
  return requiredRole.includes(user.role);
}
