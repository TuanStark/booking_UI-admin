import { jwtDecode } from 'jwt-decode';

/** JWT access-token claims from auth-service (RS256). */
export interface DecodedAccessToken {
  sub: string;
  email: string;
  roleName?: string;
  role?: string | { name?: string; id?: string; createdAt?: string; updatedAt?: string };
  roleId?: string;
}

export const ADMIN_ACCESS_DENIED_MESSAGE =
  'Tài khoản của bạn không có quyền truy cập trang quản trị. Chỉ tài khoản Admin mới được phép đăng nhập.';

export const LOGIN_SUCCESS_MESSAGE = 'Đăng nhập thành công. Đang chuyển đến trang quản trị...';

export type LoginErrorKind =
  | 'access_denied'
  | 'invalid_credentials'
  | 'email_not_verified'
  | 'network'
  | 'unknown';

export function getLoginErrorKind(error: unknown): LoginErrorKind {
  const message = getErrorMessage(error).toLowerCase();

  if (
    message.includes('không có quyền') ||
    message.includes('admin mới được phép') ||
    message === ADMIN_ACCESS_DENIED_MESSAGE.toLowerCase()
  ) {
    return 'access_denied';
  }

  if (
    message.includes('invalid credentials') ||
    message.includes('email hoặc mật khẩu') ||
    message.includes('sai mật khẩu') ||
    message.includes('unauthorized')
  ) {
    return 'invalid_credentials';
  }

  if (message.includes('xác thực email') || message.includes('email_not_verified')) {
    return 'email_not_verified';
  }

  if (
    message.includes('network') ||
    message.includes('failed to fetch') ||
    message.includes('kết nối')
  ) {
    return 'network';
  }

  return 'unknown';
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return '';
}

export function getLoginErrorMessage(error: unknown, kind?: LoginErrorKind): string {
  const resolvedKind = kind ?? getLoginErrorKind(error);

  switch (resolvedKind) {
    case 'access_denied':
      return ADMIN_ACCESS_DENIED_MESSAGE;
    case 'invalid_credentials':
      return 'Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại.';
    case 'email_not_verified':
      return getErrorMessage(error) || 'Vui lòng xác thực email trước khi đăng nhập.';
    case 'network':
      return 'Không thể kết nối máy chủ. Vui lòng thử lại sau.';
    default:
      return getErrorMessage(error) || 'Đăng nhập thất bại. Vui lòng thử lại.';
  }
}

export function getLoginErrorTitle(kind: LoginErrorKind): string {
  switch (kind) {
    case 'access_denied':
      return 'Không có quyền truy cập';
    case 'invalid_credentials':
      return 'Đăng nhập thất bại';
    case 'email_not_verified':
      return 'Email chưa xác thực';
    case 'network':
      return 'Lỗi kết nối';
    default:
      return 'Đăng nhập thất bại';
  }
}

/** Normalize role to uppercase enum-style name (ADMIN, USER, …). */
export function normalizeRole(roleValue: unknown): string | null {
  if (roleValue == null || roleValue === '') return null;
  if (typeof roleValue === 'string') return roleValue.trim().toUpperCase();
  if (typeof roleValue === 'object' && 'name' in roleValue) {
    const name = (roleValue as { name?: string }).name;
    return name ? name.trim().toUpperCase() : null;
  }
  return null;
}

/** Read role from JWT — supports roleName, role string, and legacy role object. */
export function extractRoleFromDecodedToken(decoded: DecodedAccessToken): string | null {
  return normalizeRole(decoded.roleName) ?? normalizeRole(decoded.role);
}

export function isAdminRole(role: unknown): boolean {
  return normalizeRole(role) === 'ADMIN';
}

export interface ParsedAuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'inactive';
}

export function parseAuthUserFromToken(accessToken: string): ParsedAuthUser {
  const decoded = jwtDecode<DecodedAccessToken>(accessToken);
  const roleName = extractRoleFromDecodedToken(decoded);
  const roleObject =
    decoded.role && typeof decoded.role === 'object' ? decoded.role : null;

  return {
    id: decoded.sub,
    email: decoded.email,
    name: roleName ?? '',
    role: roleName?.toLowerCase() ?? '',
    avatar: '',
    createdAt: roleObject?.createdAt ?? '',
    updatedAt: roleObject?.updatedAt ?? '',
    status: 'active',
  };
}

export function assertAdminAccess(role: unknown): void {
  if (!isAdminRole(role)) {
    throw new Error(ADMIN_ACCESS_DENIED_MESSAGE);
  }
}

// Auth utilities
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const formatRole = (role: string): string => {
  return role.charAt(0).toUpperCase() + role.slice(1);
};

export const getRoleColor = (role: string): string => {
  switch (role) {
    case 'admin':
      return 'text-red-600 bg-red-100';
    case 'manager':
      return 'text-blue-600 bg-blue-100';
    case 'staff':
      return 'text-green-600 bg-green-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

// Token utilities
export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch {
    return true;
  }
};

export const getTokenExpirationTime = (token: string): number | null => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000; // Convert to milliseconds
  } catch {
    return null;
  }
};

// Storage utilities
export const storage = {
  get: (key: string) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },
  
  set: (key: string, value: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  },
  
  remove: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove from localStorage:', error);
    }
  },
  
  clear: () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }
};
