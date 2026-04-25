const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

export interface AuditLog {
  id: string;
  adminId: string;
  adminEmail?: string;
  action: string;
  resource: string;
  resourceId?: string;
  method: string;
  path: string;
  statusCode: number;
  metadata?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
  createdAt: string;
}

export interface AuditLogQuery {
  page?: number;
  limit?: number;
  adminId?: string;
  resource?: string;
  action?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface AuditLogMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AuditLogResponse {
  data: AuditLog[];
  meta: AuditLogMeta;
}

class AuditLogService {
  private readonly baseURL = `${API_BASE_URL}/auth/audit-logs`;

  private getToken(): string {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error('No authentication token found');
    return token;
  }

  async findAll(query?: AuditLogQuery): Promise<AuditLogResponse> {
    const params = new URLSearchParams();

    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, String(value));
        }
      });
    }

    const url = params.toString() ? `${this.baseURL}?${params}` : this.baseURL;

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.getToken()}`,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error((error as any).message || `HTTP ${response.status}`);
    }

    const result = await response.json();

    // Unwrap nested envelope: { data: { data: [...], meta: {...} }, ... }
    if (result?.data?.data && Array.isArray(result.data.data)) {
      return result.data as AuditLogResponse;
    }
    if (result?.data && Array.isArray(result.data)) {
      return { data: result.data, meta: result.meta ?? { total: result.data.length, page: 1, limit: 20, totalPages: 1 } };
    }
    return result as AuditLogResponse;
  }
}

export const auditLogService = new AuditLogService();
