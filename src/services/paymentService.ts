import { Payment } from '@/types';
import { PaginationMeta, PaginatedResponse } from '@/types/globalClass';

export interface GetPaymentsParams {
  page?: number;
  limit?: number;
  method?: 'MOMO' | 'VNPay' | 'Bank Transfer' | 'Cash';
  status?: 'pending' | 'completed' | 'failed' | 'refunded';
  search?: string;
  bookingId?: string;
  userId?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

class PaymentService {
  private baseURL: string;

  constructor() {
    // Base URL: /payments
    this.baseURL = `${API_BASE_URL}/payment`;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  }

  private async authenticatedRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    return this.request<T>(endpoint, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    });
  }

  /**
   * Get all payments with pagination and filters
   */
  async getAll(params?: GetPaymentsParams): Promise<PaginatedResponse<Payment>> {
    const token = localStorage.getItem('auth_token');
    const queryParams = new URLSearchParams();
    
    if (params?.page) {
      queryParams.append('page', params.page.toString());
    }
    if (params?.limit) {
      queryParams.append('limit', params.limit.toString());
    }
    if (params?.method) {
      queryParams.append('method', params.method);
    }
    if (params?.status) {
      queryParams.append('status', params.status);
    }
    if (params?.search) {
      queryParams.append('search', params.search);
    }
    if (params?.bookingId) {
      queryParams.append('bookingId', params.bookingId);
    }
    if (params?.userId) {
      queryParams.append('userId', params.userId);
    }
    if (token) {
      queryParams.append('accessToken', token);
    }
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/?${queryString}` : '/';
    const response = await this.authenticatedRequest<any>(endpoint);
    console.log('response', response);
    
    // Handle nested response structure
    let paymentsData: any[] = [];
    let meta: PaginationMeta = {
      total: 0,
      pageNumber: 1,
      limitNumber: 10,
      totalPages: 1,
    };
    
    if (response?.data?.data && Array.isArray(response.data.data)) {
      paymentsData = response.data.data;
      if (response.data.meta) {
        meta = response.data.meta;
      }
    } else if (response?.data) {
      if (Array.isArray(response.data)) {
        paymentsData = response.data;
        if (response.meta) {
          meta = response.meta;
        }
      } else if (typeof response.data === 'object' && response.data.data) {
        if (Array.isArray(response.data.data)) {
          paymentsData = response.data.data;
          if (response.data.meta) {
            meta = response.data.meta;
          }
        } else {
          paymentsData = [response.data.data];
          if (response.data.meta) {
            meta = response.data.meta;
          }
        }
      }
    } else if (Array.isArray(response)) {
      paymentsData = response;
    } else {
      console.warn('Unexpected response format from getAll:', response);
    }

    const transformed = paymentsData.map((payment: any) => this.transformPayment(payment));
    
    return {
      data: transformed,
      meta: meta,
    };
  }

  /**
   * Get a single payment by ID
   */
  async getById(id: string): Promise<Payment> {
    const token = localStorage.getItem('auth_token');
    const endpoint = token ? `/${id}?accessToken=${encodeURIComponent(token)}` : `/${id}`;
    const response = await this.authenticatedRequest<any>(endpoint);
    const paymentData = this.extractPaymentData(response);
    return this.transformPayment(paymentData);
  }

  /**
   * Update payment status
   */
  async updateStatus(
    id: string, 
    status: 'pending' | 'completed' | 'failed' | 'refunded'
  ): Promise<Payment> {
    const requestData = {
      status: status,
    };
    
    const response = await this.authenticatedRequest<any>(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(requestData),
    });
    
    const paymentData = this.extractPaymentData(response);
    return this.transformPayment(paymentData);
  }

  /**
   * Mark payment as completed
   */
  async markAsCompleted(id: string): Promise<Payment> {
    return this.updateStatus(id, 'completed');
  }

  /**
   * Mark payment as failed
   */
  async markAsFailed(id: string): Promise<Payment> {
    return this.updateStatus(id, 'failed');
  }

  /**
   * Refund a payment
   */
  async refund(id: string): Promise<Payment> {
    return this.updateStatus(id, 'refunded');
  }

  /**
   * Delete a payment
   */
  async delete(id: string): Promise<void> {
    const token = localStorage.getItem('auth_token');
    const endpoint = token ? `/${id}?accessToken=${encodeURIComponent(token)}` : `/${id}`;
    await this.authenticatedRequest<void>(endpoint, {
      method: 'DELETE',
    });
  }

  /**
   * Get payment statistics
   */
  async getStats(): Promise<{
    totalRevenue: number;
    totalTransactions: number;
    pendingPayments: number;
    successRate: number;
    monthlyRevenue: Array<{ month: string; amount: number }>;
  }> {
    const token = localStorage.getItem('auth_token');
    const endpoint = token ? `/stats?accessToken=${encodeURIComponent(token)}` : '/stats';
    return this.authenticatedRequest<any>(endpoint);
  }

  /**
   * Get monthly revenue data for chart
   */
  async getMonthlyRevenue(params?: {
    year?: number;
    startDate?: string;
    endDate?: string;
    method?: 'MOMO' | 'VNPay' | 'Bank Transfer' | 'Cash';
  }): Promise<Array<{ month: string; amount: number }>> {
    const token = localStorage.getItem('auth_token');
    const queryParams = new URLSearchParams();
    
    if (params?.year) {
      queryParams.append('year', params.year.toString());
    }
    if (params?.startDate) {
      queryParams.append('startDate', params.startDate);
    }
    if (params?.endDate) {
      queryParams.append('endDate', params.endDate);
    }
    if (params?.method) {
      queryParams.append('method', params.method);
    }
    if (token) {
      queryParams.append('accessToken', token);
    }
    
    const queryString = queryParams.toString();
    const endpoint = `/revenue/monthly${queryString ? `?${queryString}` : ''}`;
    
    const response = await this.authenticatedRequest<any>(endpoint);
    
    // Handle ResponseData structure - response.data.data
    if (response?.data?.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    
    // Handle ResponseData structure - response.data
    if (response?.data && Array.isArray(response.data)) {
      return response.data;
    }
    
    // Fallback if response is directly an array
    if (Array.isArray(response)) {
      return response;
    }
    
    // Return default empty data for all 12 months
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map(month => ({ month, amount: 0 }));
  }

  /**
   * Transform payment data from API to Payment type
   */
  private transformPayment(payment: any): Payment {
    // Map payment method
    let method: 'MOMO' | 'VNPay' | 'Bank Transfer' | 'Cash' = 'Cash';
    if (payment.method) {
      const methodStr = payment.method.toUpperCase();
      if (methodStr === 'MOMO') {
        method = 'MOMO';
      } else if (methodStr === 'VNPAY') {
        method = 'VNPay';
      } else if (methodStr === 'BANK TRANSFER' || methodStr === 'BANKTRANSFER') {
        method = 'Bank Transfer';
      } else {
        method = 'Cash';
      }
    }
    
    // Map payment status - API might return uppercase
    let status: 'pending' | 'completed' | 'failed' | 'refunded' = 'pending';
    if (payment.status) {
      const statusStr = payment.status.toLowerCase();
      if (statusStr === 'completed' || statusStr === 'success') {
        status = 'completed';
      } else if (statusStr === 'failed' || statusStr === 'failure') {
        status = 'failed';
      } else if (statusStr === 'refunded' || statusStr === 'refund') {
        status = 'refunded';
      } else {
        status = 'pending';
      }
    }
    
    // Extract user info - might be nested
    const user = payment.user || {};
    const userName = payment.userName || user.name || user.userName || '';
    const userId = payment.userId || user.id || payment.user?.id || '';
    
    // Extract booking info
    const bookingId = payment.bookingId || payment.booking?.id || payment.bookingId || '';
    
    return {
      id: payment.id,
      bookingId: bookingId,
      userId: userId,
      userName: userName,
      amount: payment.amount || payment.totalAmount || 0,
      method: method,
      status: status,
      transactionId: payment.transactionId || payment.transaction_id || payment.id,
      createdAt: payment.createdAt || payment.created_at || new Date().toISOString(),
      processedAt: payment.processedAt || payment.processed_at || payment.updatedAt || payment.updated_at,
    };
  }

  /**
   * Extract payment data from API response
   */
  private extractPaymentData(response: any): any {
    // Handle various response structures
    if (response?.data?.data) {
      return response.data.data;
    }
    if (response?.data) {
      return response.data;
    }
    return response;
  }
}

export const paymentService = new PaymentService();

