import { Room } from '@/types';
import { PaginationMeta, PaginatedResponse } from '@/types/globalClass';
import { RoomFormData } from '@/lib/validations';

export interface GetRoomsParams {
  page?: number;
  limit?: number;
  buildingId?: string;
  status?: string;
  search?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

class RoomService {
  private baseURL: string;

  constructor() {
    // Base URL: /rooms
    this.baseURL = `${API_BASE_URL}/rooms`;
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
   * Get all rooms with pagination
   */
  async getAll(params?: GetRoomsParams): Promise<PaginatedResponse<Room>> {
    const queryParams = new URLSearchParams();
    if (params?.page) {
      queryParams.append('page', params.page.toString());
    }
    if (params?.limit) {
      queryParams.append('limit', params.limit.toString());
    }
    if (params?.buildingId) {
      queryParams.append('buildingId', params.buildingId);
    }
    if (params?.status) {
      queryParams.append('status', params.status);
    }
    if (params?.search) {
      queryParams.append('search', params.search);
    }
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/?${queryString}` : '/';
    const response = await this.authenticatedRequest<any>(endpoint);
    
    // Handle nested response structure: { data: { data: [...], meta: {...} }, statusCode, message }
    let roomsData: any[] = [];
    let meta: PaginationMeta = {
      total: 0,
      pageNumber: 1,
      limitNumber: 10,
      totalPages: 1,
    };
    
    if (response?.data?.data && Array.isArray(response.data.data)) {
      // Nested structure: { data: { data: [...], meta: {...} }, statusCode, message }
      roomsData = response.data.data;
      if (response.data.meta) {
        meta = response.data.meta;
      }
    } else if (response?.data) {
      if (Array.isArray(response.data)) {
        roomsData = response.data;
        if (response.meta) {
          meta = response.meta;
        }
      } else if (typeof response.data === 'object' && response.data.data) {
        if (Array.isArray(response.data.data)) {
          roomsData = response.data.data;
          if (response.data.meta) {
            meta = response.data.meta;
          }
        } else {
          roomsData = [response.data.data];
          if (response.data.meta) {
            meta = response.data.meta;
          }
        }
      }
    } else if (Array.isArray(response)) {
      roomsData = response;
    } else {
      console.warn('Unexpected response format from getAll:', response);
    }

    const transformed = roomsData.map((room: any) => this.transformRoom(room));
    console.log('Transformed rooms:', transformed.length);
    
    return {
      data: transformed,
      meta: meta,
    };
  }

  /**
   * Get a single room by ID
   */
  async getById(id: string): Promise<Room> {
    const response = await this.authenticatedRequest<any>(`/${id}`);
    const roomData = this.extractRoomData(response);
    return this.transformRoom(roomData);
  }

  /**
   * Create a new room
   */
  async create(data: RoomFormData & { imageFiles?: File[] }): Promise<Room> {
    const formData = new FormData();
    
    // Add text fields
    formData.append('roomNumber', data.roomNumber);
    formData.append('type', data.type);
    formData.append('capacity', data.capacity.toString());
    formData.append('price', data.price.toString());
    formData.append('buildingId', data.buildingId);
    if (data.description) {
      formData.append('description', data.description);
    }
    if (data.amenities && data.amenities.length > 0) {
      formData.append('amenities', JSON.stringify(data.amenities));
    }
    
    // Add image files (if provided)
    if (data.imageFiles && data.imageFiles.length > 0) {
      data.imageFiles.forEach((file) => {
        formData.append('file', file);
      });
      console.log(`Sending ${data.imageFiles.length} file(s) with create request`);
    } else {
      console.log('No files to upload with create request');
    }
    
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('No authentication token found');
    }
  
    console.log('FormData entries:', {
      roomNumber: formData.get('roomNumber'),
      type: formData.get('type'),
      buildingId: formData.get('buildingId'),
      hasFile: formData.has('file'),
    });
  
    const response = await fetch(`${this.baseURL}/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        // Don't set Content-Type, let browser set it with boundary for FormData
      },
      body: formData,
    });
  
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || `HTTP error! status: ${response.status}`;
      console.error('Create room error:', errorMessage, errorData);
      throw new Error(errorMessage);
    }
  
    const result = await response.json();
    console.log('Create room success:', result);
    const roomData = this.extractRoomData(result);
    return this.transformRoom(roomData);
  }

  /**
   * Update an existing room
   */
  async update(id: string, data: RoomFormData & { imageFiles?: File[] }): Promise<Room> {
    const formData = new FormData();
    
    // Add text fields
    formData.append('roomNumber', data.roomNumber);
    formData.append('type', data.type);
    formData.append('capacity', data.capacity.toString());
    formData.append('price', data.price.toString());
    formData.append('buildingId', data.buildingId);
    if (data.description) {
      formData.append('description', data.description);
    }
    if (data.amenities && data.amenities.length > 0) {
      formData.append('amenities', JSON.stringify(data.amenities));
    }
    
    // Add image files (if provided)
    if (data.imageFiles && data.imageFiles.length > 0) {
      data.imageFiles.forEach((file) => {
        formData.append('file', file);
      });
      console.log(`Sending ${data.imageFiles.length} file(s) with update request`);
    } else {
      console.log('No files to upload with update request');
    }
    
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('No authentication token found');
    }
  
    console.log('FormData entries for update:', {
      roomNumber: formData.get('roomNumber'),
      type: formData.get('type'),
      buildingId: formData.get('buildingId'),
      hasFile: formData.has('file'),
    });
  
    const response = await fetch(`${this.baseURL}/${id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        // Don't set Content-Type, let browser set it with boundary for FormData
      },
      body: formData,
    });
  
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || `HTTP error! status: ${response.status}`;
      console.error('Update room error:', errorMessage, errorData);
      throw new Error(errorMessage);
    }
  
    const result = await response.json();
    console.log('Update room success:', result);
    const roomData = this.extractRoomData(result);
    return this.transformRoom(roomData);
  }

  /**
   * Delete a room (soft delete using PATCH or hard delete with DELETE)
   */
  async delete(id: string): Promise<void> {
    await this.authenticatedRequest<void>(`/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Transform room data from API to Room type
   */
  private transformRoom(room: any): Room {
    // Handle images - could be string, array of strings, or array of objects with imageUrl
    let images: string[] = [];
    if (room.images) {
      if (typeof room.images === 'string') {
        // Single image string
        images = [room.images];
      } else if (Array.isArray(room.images)) {
        // Check if it's array of objects with imageUrl field
        if (room.images.length > 0 && typeof room.images[0] === 'object' && room.images[0].imageUrl) {
          images = room.images.map((img: any) => img.imageUrl);
        } else if (typeof room.images[0] === 'string') {
          // Array of strings
          images = room.images;
        }
      }
    }
    
    // Handle amenities - could be string (JSON), array, or array of objects with name field
    let amenities: string[] = [];
    if (room.amenities) {
      if (typeof room.amenities === 'string') {
        try {
          amenities = JSON.parse(room.amenities);
        } catch (e) {
          amenities = [room.amenities];
        }
      } else if (Array.isArray(room.amenities)) {
        // Check if it's array of objects with name field
        if (room.amenities.length > 0 && typeof room.amenities[0] === 'object' && room.amenities[0].name) {
          amenities = room.amenities.map((amenity: any) => amenity.name);
        } else if (typeof room.amenities[0] === 'string') {
          // Array of strings
          amenities = room.amenities;
        }
      }
    }
    
    // Map status from uppercase (AVAILABLE, BOOKED, MAINTENANCE) to lowercase
    let roomStatus: 'available' | 'booked' | 'maintenance' = 'available';
    if (room.status) {
      const statusLower = room.status.toLowerCase();
      if (statusLower === 'available') {
        roomStatus = 'available';
      } else if (statusLower === 'booked') {
        roomStatus = 'booked';
      } else if (statusLower === 'maintenance') {
        roomStatus = 'maintenance';
      }
    }
    
    // Map name to roomNumber (API uses 'name' field)
    const roomNumber = room.roomNumber || room.name || '';
    
    // Map type - default to 'shared' if capacity > 1, 'single' otherwise
    let roomType: 'single' | 'shared' = 'shared';
    if (room.type) {
      roomType = room.type;
    } else if (room.capacity === 1) {
      roomType = 'single';
    }
    
    return {
      id: room.id,
      roomNumber: roomNumber,
      type: roomType,
      capacity: room.capacity || 1,
      price: room.price || 0,
      status: roomStatus,
      buildingId: room.buildingId || '',
      buildingName: room.buildingName || room.building?.name || '',
      images: images,
      amenities: amenities,
      description: room.description || undefined,
    };
  }

  /**
   * Extract room data from API response
   */
  private extractRoomData(response: any): any {
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

export const roomService = new RoomService();

