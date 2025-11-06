import { Building } from '@/types';
import { ResponseData, PaginationMeta, PaginatedResponse } from '@/types/globalClass';
import { BuildingFormData } from '@/lib/validations';

export interface GetBuildingsParams {
  page?: number;
  limit?: number;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

class BuildingService {
  private baseURL: string;

  constructor() {
    this.baseURL = `${API_BASE_URL}/buildings`;
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
   * Get all buildings with pagination
   */
  async getAll(params?: GetBuildingsParams): Promise<PaginatedResponse<Building>> {
    const queryParams = new URLSearchParams();
    if (params?.page) {
      queryParams.append('page', params.page.toString());
    }
    if (params?.limit) {
      queryParams.append('limit', params.limit.toString());
    }
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/?${queryString}` : '/';
    const response = await this.authenticatedRequest<any>(endpoint);
    
    // Handle nested response structure: { data: { data: [...], meta: {...} }, statusCode, message }
    let buildingsData: any[] = [];
    let meta: PaginationMeta = {
      total: 0,
      pageNumber: 1,
      limitNumber: 10,
      totalPages: 1,
    };
    
    if (response?.data?.data && Array.isArray(response.data.data)) {
      // Nested structure: { data: { data: [...], meta: {...} }, statusCode, message }
      buildingsData = response.data.data;
      if (response.data.meta) {
        meta = response.data.meta;
      }
    } else if (response?.data && Array.isArray(response.data)) {
      // Handle case: { data: [...], statusCode, message }
      buildingsData = response.data;
    } else if (Array.isArray(response)) {
      // Handle case: response is directly an array
      buildingsData = response;
    } else {
      console.warn('Unexpected response format from getAll:', response);
    }
    
    // Transform buildings data to match Building type
    const transformed = buildingsData.map((building: any) => this.transformBuilding(building));
    
    return {
      data: transformed,
      meta: meta,
    };
  }

  /**
   * Transform building data from API to Building type
   */
  private transformBuilding(building: any): Building {
    return {
      id: building.id,
      name: building.name,
      address: building.address,
      images: building.images 
        ? (Array.isArray(building.images) ? building.images : [building.images])
        : [],
    };
  }

  /**
   * Extract building data from nested response
   */
  private extractBuildingData(response: any): any {
    if (response?.data?.data) {
      return response.data.data;
    }
    if (response?.data) {
      return response.data;
    }
    return response;
  }

  /**
   * Get building by ID
   */
  async getById(id: string): Promise<Building> {
    const response = await this.authenticatedRequest<any>(`/${id}`);
    const buildingData = this.extractBuildingData(response);
    return this.transformBuilding(buildingData);
  }

  /**
   * Create a new building with FormData (to support file upload)
   */
  async create(data: BuildingFormData & { imageFiles?: File[] }): Promise<Building> {
    const formData = new FormData();
    
    // Add text fields
    formData.append('name', data.name);
    formData.append('address', data.address);
    
    // Add image files (if provided)
    if (data.imageFiles && data.imageFiles.length > 0) {
      // Only send the first file if API expects single file
      // Or send all files if API supports multiple
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
      name: formData.get('name'),
      address: formData.get('address'),
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
      console.error('Create building error:', errorMessage, errorData);
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('Create building success:', result);
    const buildingData = this.extractBuildingData(result);
    return this.transformBuilding(buildingData);
  }

  /**
   * Update an existing building with FormData (to support file upload)
   */
  async update(id: string, data: BuildingFormData & { imageFiles?: File[] }): Promise<Building> {
    const formData = new FormData();
    
    // Add text fields
    formData.append('name', data.name);
    formData.append('address', data.address);
    
    // Add image files if provided
    if (data.imageFiles && data.imageFiles.length > 0) {
      data.imageFiles.forEach((file) => {
        formData.append('file', file);
      });
    }
    
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${this.baseURL}/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        // Don't set Content-Type, let browser set it with boundary for FormData
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    const buildingData = this.extractBuildingData(result);
    return this.transformBuilding(buildingData);
  }

  /**
   * Delete a building
   */
  async delete(id: string): Promise<void> {
    await this.authenticatedRequest<void>(`/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Upload images for a building
   * @param buildingId - ID of the building
   * @param images - Array of File objects
   */
  async uploadImages(buildingId: string, images: File[]): Promise<string[]> {
    const formData = new FormData();
    
    images.forEach((image) => {
      formData.append(`images`, image);
    });

    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${this.baseURL}/${buildingId}/images`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return (result as unknown as ResponseData<string[]>).data as string[];
  }

  /**
   * Delete an image from a building
   */
  async deleteImage(buildingId: string, imageUrl: string): Promise<void> {
    await this.authenticatedRequest<void>(`/${buildingId}/images`, {
      method: 'DELETE',
      body: JSON.stringify({ imageUrl }),
    });
  }
}

export const buildingService = new BuildingService();

