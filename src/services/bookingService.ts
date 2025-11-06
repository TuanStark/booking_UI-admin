import { Booking } from '@/types';
import { PaginationMeta, PaginatedResponse } from '@/types/globalClass';

export interface GetBookingsParams {
  page?: number;
  limit?: number;
  status?: string;
  paymentStatus?: string;
  search?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

class BookingService {
  private baseURL: string;

  constructor() {
    // Base URL: /bookings
    this.baseURL = `${API_BASE_URL}/bookings`;
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
   * Get all bookings with pagination and filters
   */
  async getAll(params?: GetBookingsParams): Promise<PaginatedResponse<Booking>> {
    const token = localStorage.getItem('auth_token');
    const queryParams = new URLSearchParams();
    if (params?.page) {
      queryParams.append('page', params.page.toString());
    }
    if (params?.limit) {
      queryParams.append('limit', params.limit.toString());
    }
    if (params?.status) {
      queryParams.append('status', params.status);
    }
    if (params?.paymentStatus) {
      queryParams.append('paymentStatus', params.paymentStatus);
    }
    if (params?.search) {
      queryParams.append('search', params.search);
    }
    if (token) {
      queryParams.append('accessToken', token);
    }
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/?${queryString}` : '/';
    const response = await this.authenticatedRequest<any>(endpoint);
    
    // Handle nested response structure
    let bookingsData: any[] = [];
    let meta: PaginationMeta = {
      total: 0,
      pageNumber: 1,
      limitNumber: 10,
      totalPages: 1,
    };
    
    if (response?.data?.data && Array.isArray(response.data.data)) {
      bookingsData = response.data.data;
      if (response.data.meta) {
        meta = response.data.meta;
      }
    } else if (response?.data) {
      if (Array.isArray(response.data)) {
        bookingsData = response.data;
        if (response.meta) {
          meta = response.meta;
        }
      } else if (typeof response.data === 'object' && response.data.data) {
        if (Array.isArray(response.data.data)) {
          bookingsData = response.data.data;
          if (response.data.meta) {
            meta = response.data.meta;
          }
        } else {
          bookingsData = [response.data.data];
          if (response.data.meta) {
            meta = response.data.meta;
          }
        }
      }
    } else if (Array.isArray(response)) {
      bookingsData = response;
    } else {
      console.warn('Unexpected response format from getAll:', response);
    }

    const transformed = bookingsData.map((booking: any) => this.transformBooking(booking));
    
    return {
      data: transformed,
      meta: meta,
    };
  }

  /**
   * Get a single booking by ID
   */
  async getById(id: string): Promise<Booking> {
    const token = localStorage.getItem('auth_token');
    const endpoint = token ? `/${id}?accessToken=${encodeURIComponent(token)}` : `/${id}`;
    const response = await this.authenticatedRequest<any>(endpoint);
    const bookingData = this.extractBookingData(response);
    return this.transformBooking(bookingData);
  }

  /**
   * Update booking status (approve/reject)
   * Backend expects: { status: 'CONFIRMED' | 'CANCELED' }
   */
  async update(id: string, status: 'CONFIRMED' | 'CANCELED'): Promise<Booking> {
    // Backend only accepts status field, not bookingStatus or paymentStatus
    const requestData = {
      status: status,
    };
    
    const response = await this.authenticatedRequest<any>(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(requestData),
    });
    console.log('Update booking response:', response);
    const bookingData = this.extractBookingData(response);
    return this.transformBooking(bookingData);
  }

  /**
   * Approve a booking
   * Sets status to CONFIRMED
   */
  async approve(id: string): Promise<Booking> {
    return this.update(id, 'CONFIRMED');
  }

  /**
   * Reject a booking
   * Sets status to CANCELED (note: CANCELED not CANCELLED as per backend enum)
   */
  async reject(id: string): Promise<Booking> {
    return this.update(id, 'CANCELED');
  }

  /**
   * Delete a booking
   */
  async delete(id: string): Promise<void> {
    const token = localStorage.getItem('auth_token');
    const endpoint = token ? `/${id}?accessToken=${encodeURIComponent(token)}` : `/${id}`;
    await this.authenticatedRequest<void>(endpoint, {
      method: 'DELETE',
    });
  }

  /**
   * Transform booking data from API to Booking type
   */
  private transformBooking(booking: any): Booking {
    // Map booking status - API might return uppercase
    let bookingStatus: 'pending' | 'confirmed' | 'cancelled' | 'completed' = 'pending';
    if (booking.bookingStatus || booking.status) {
      const status = (booking.bookingStatus || booking.status).toLowerCase();
      if (status === 'confirmed') {
        bookingStatus = 'confirmed';
      } else if (status === 'cancelled' || status === 'canceled') {
        bookingStatus = 'cancelled';
      } else if (status === 'completed') {
        bookingStatus = 'completed';
      } else {
        bookingStatus = 'pending';
      }
    }
    
    // Map payment status - API might return uppercase
    // Note: payment status might not be in the booking object directly
    // It might be in details or inferred from booking status
    let paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded' = 'pending';
    if (booking.paymentStatus) {
      const status = booking.paymentStatus.toLowerCase();
      if (status === 'paid') {
        paymentStatus = 'paid';
      } else if (status === 'failed') {
        paymentStatus = 'failed';
      } else if (status === 'refunded') {
        paymentStatus = 'refunded';
      } else {
        paymentStatus = 'pending';
      }
    } else if (bookingStatus === 'confirmed') {
      // If booking is confirmed, assume payment is paid
      paymentStatus = 'paid';
    }
    
    // Extract user info - might be nested or null
    const user = booking.user || {};
    const userName = booking.userName || user.name || user.userName || '';
    const userEmail = booking.userEmail || user.email || user.userEmail || '';
    const userId = booking.userId || user.id || booking.user?.id || '';
    
    // Extract room and building info from details array
    let roomNumber = '';
    let roomId = '';
    let buildingName = '';
    let totalAmount = 0;
    let notes = '';
    
    // Handle new structure with details array
    if (booking.details && Array.isArray(booking.details) && booking.details.length > 0) {
      // Get first detail (assuming single room booking for now)
      const firstDetail = booking.details[0];
      const room = firstDetail.room || {};
      
      roomId = firstDetail.roomId || room.id || '';
      roomNumber = room.name || room.roomNumber || '';
      
      // Extract building info from room
      if (room.building) {
        buildingName = room.building.name || '';
      } else if (room.buildingId) {
        // If only buildingId is present, we might need to fetch building name separately
        // For now, we'll try to get it from any nested structure
        buildingName = booking.buildingName || '';
      }
      
      // Calculate total amount from all details
      totalAmount = booking.details.reduce((sum: number, detail: any) => {
        return sum + (detail.price || 0);
      }, 0);
      
      // Extract notes from details
      notes = firstDetail.note || booking.note || booking.notes || undefined;
    } else {
      // Fallback to old structure
      const room = booking.room || booking.roomId || {};
      roomNumber = booking.roomNumber || room.roomNumber || room.name || '';
      roomId = booking.roomId || room.id || booking.room?.id || '';
      
      const building = room.building || booking.building || {};
      buildingName = booking.buildingName || building.name || room.buildingName || '';
      
      totalAmount = booking.totalAmount || booking.totalPrice || booking.amount || 0;
      notes = booking.notes || booking.note || undefined;
    }
    
    // Map date fields - handle both old and new API formats
    const checkInDate = booking.checkInDate || booking.checkinDate || booking.startDate || '';
    const checkOutDate = booking.checkOutDate || booking.checkoutDate || booking.endDate || '';
    
    return {
      id: booking.id,
      userId: userId,
      userName: userName,
      userEmail: userEmail,
      roomId: roomId,
      roomNumber: roomNumber,
      buildingName: buildingName,
      checkInDate: checkInDate,
      checkOutDate: checkOutDate,
      totalAmount: totalAmount,
      paymentStatus: paymentStatus,
      bookingStatus: bookingStatus,
      createdAt: booking.createdAt || booking.created_at || new Date().toISOString(),
      notes: notes,
    };
  }

  /**
   * Extract booking data from API response
   */
  private extractBookingData(response: any): any {
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

export const bookingService = new BookingService();

