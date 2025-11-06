import { Role, User } from '@/types';
import { PaginationMeta, PaginatedResponse } from '@/types/globalClass';
import { UserFormData } from '@/lib/validations';

export interface GetUsersParams {
  page?: number;
  limit?: number;
  role?: 'student' | 'admin' | 'all';
  status?: 'active' | 'inactive' | 'all';
  search?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

class UserService {
  private baseURL: string;

  constructor() {
    // Base URL: /auth/user (not just /user)
    this.baseURL = `${API_BASE_URL}/auth/user`;
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
   * Get all users with pagination and filters
   */
  async getAll(params?: GetUsersParams): Promise<PaginatedResponse<User>> {
    const queryParams = new URLSearchParams();
    if (params?.page) {
      queryParams.append('page', params.page.toString());
    }
    if (params?.limit) {
      queryParams.append('limit', params.limit.toString());
    }
    if (params?.role && params.role !== 'all') {
      queryParams.append('role', params.role);
    }
    if (params?.status && params.status !== 'all') {
      queryParams.append('status', params.status);
    }
    if (params?.search) {
      queryParams.append('search', params.search);
    }
    
    const queryString = queryParams.toString();
    // Endpoint: GET /user/all?page=1&limit=10
    const endpoint = queryString ? `/all?${queryString}` : '/all';
    const response = await this.authenticatedRequest<any>(endpoint);
    
    let usersData: any[] = [];
    let meta: PaginationMeta = {
      total: 0,
      pageNumber: 1,
      limitNumber: 10,
      totalPages: 1,
    };
    
    // Handle deeply nested response structure: response.data.data.data
    if (response?.data?.data?.data && Array.isArray(response.data.data.data)) {
      // Triple nested structure: response.data.data.data
      usersData = response.data.data.data;
      if (response.data.data.meta) {
        meta = response.data.data.meta;
      }
    } else if (response?.data?.data) {
      if (Array.isArray(response.data.data)) {
        // Double nested: response.data.data (array)
        usersData = response.data.data;
        if (response.data.meta) {
          meta = response.data.meta;
        }
      } else if (typeof response.data.data === 'object' && response.data.data.data) {
        // Triple nested: response.data.data.data (object with data property)
        if (Array.isArray(response.data.data.data)) {
          usersData = response.data.data.data;
          if (response.data.data.meta) {
            meta = response.data.data.meta;
          }
        } else {
          // Single user object
          usersData = [response.data.data.data];
          if (response.data.data.meta) {
            meta = response.data.data.meta;
          }
        }
      } else if (typeof response.data.data === 'object') {
        // Single user object - convert to array
        usersData = [response.data.data];
        if (response.data.meta) {
          meta = response.data.meta;
        }
      }
    } else if (response?.data) {
      // Handle case where data is directly an array
      if (Array.isArray(response.data)) {
        usersData = response.data;
        if (response.meta) {
          meta = response.meta;
        }
      } else if (typeof response.data === 'object' && !response.data.data) {
        // Single user object at response.data level
        usersData = [response.data];
      }
    } else if (Array.isArray(response)) {
      // Response is directly an array
      usersData = response;
    } else {
      console.warn('Unexpected response format from getAll:', response);
    }
    
    // Known role IDs mapping (you might want to fetch this from an API endpoint)
    // Based on the response, roleId "b86dd951-4a46-4295-97f1-82015d02f672" seems to be ADMIN
    // and "cb8d828d-c0b9-460f-8b30-f7de4152e84f" seems to be STUDENT
    const roleIdMapping: { [key: string]: { id: string; name: string } } = {
      'b86dd951-4a46-4295-97f1-82015d02f672': { id: 'b86dd951-4a46-4295-97f1-82015d02f672', name: 'ADMIN' },
      'cb8d828d-c0b9-460f-8b30-f7de4152e84f': { id: 'cb8d828d-c0b9-460f-8b30-f7de4152e84f', name: 'STUDENT' },
    };
    
    // Transform users data, handling role object or roleId
    const transformed = usersData.map((user: any) => {
      // Handle role field - it could be an object, a string, or we need to map from roleId
      let userRole: Role = { id: '', name: '' };
      
      if (user.role) {
        // Role object exists
        if (typeof user.role === 'string') {
          userRole = { id: user.role, name: user.role.toUpperCase() };
        } else if (user.role.name) {
          // Role is an object with name property
          userRole = { 
            id: user.role.id || user.roleId || '', 
            name: user.role.name.toUpperCase() 
          };
        } else if (user.role.id) {
          // Role object without name, use mapping if available
          const mapped = roleIdMapping[user.role.id];
          userRole = mapped || { id: user.role.id, name: 'STUDENT' };
        }
      } else if (user.roleId) {
        // Only roleId available, try to map it
        const mapped = roleIdMapping[user.roleId];
        userRole = mapped || { id: user.roleId, name: 'STUDENT' };
      } else {
        // Default to STUDENT if no role info
        userRole = { id: '', name: 'STUDENT' };
      }
      
      // Map status: API might return "unactive" instead of "inactive"
      let userStatus: 'active' | 'inactive' = 'active';
      if (user.status) {
        const statusLower = user.status.toLowerCase();
        userStatus = statusLower === 'active' ? 'active' : 'inactive';
      }
      
      return {
        id: user.id,
        name: user.name || '',
        email: user.email || '',
        role: userRole,
        status: userStatus,
        createdAt: user.createdAt || user.created_at || new Date().toISOString(),
        avatar: user.avatar || undefined,
      };
    });
    
    return {
      data: transformed,
      meta: meta,
    };
  }

  /**
   * Get user by ID
   */
  async getById(id: string): Promise<User> {
    const response = await this.authenticatedRequest<any>(`/${id}`);
    const userData = this.extractUserData(response);
    return this.transformUser(userData);
  }

  /**
   * Create a new user
   */
  async create(data: UserFormData): Promise<User> {
    // Map role string to roleId for backend
    const roleIdMapping: { [key: string]: string } = {
      'admin': 'b86dd951-4a46-4295-97f1-82015d02f672',
      'student': 'cb8d828d-c0b9-460f-8b30-f7de4152e84f',
    };
    
    // Convert role string to roleId
    const roleId = roleIdMapping[data.role] || roleIdMapping['student'];
    
    // Prepare payload: backend expects roleId, not role string
    const payload = {
      name: data.name,
      email: data.email,
      roleId: roleId,
      status: data.status || 'active',
    };
    
    // Endpoint: POST /auth/user/create
    const response = await this.authenticatedRequest<any>('/create', {
      method: 'POST',
      body: JSON.stringify(payload),
    }); 
    const userData = this.extractUserData(response);
    return this.transformUser(userData);
  }

  /**
   * Update an existing user
   */
  async update(id: string, data: UserFormData): Promise<User> {
    // Map role string to roleId for backend
    const roleIdMapping: { [key: string]: string } = {
      'admin': 'b86dd951-4a46-4295-97f1-82015d02f672',
      'student': 'cb8d828d-c0b9-460f-8b30-f7de4152e84f',
    };
    
    // Convert role string to roleId
    const roleId = roleIdMapping[data.role] || roleIdMapping['student'];
    
    // Prepare payload: backend expects roleId, not role string
    const payload = {
      name: data.name,
      email: data.email,
      roleId: roleId,
      status: data.status || 'active',
    };
    
    const response = await this.authenticatedRequest<any>(`/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    const userData = this.extractUserData(response);
    return this.transformUser(userData);
  }

  /**
   * Delete a user (soft delete using PATCH)
   */
  async delete(id: string): Promise<void> {
    // Endpoint: PATCH /user/delete/:id (not DELETE method)
    await this.authenticatedRequest<void>(`/delete/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({}), // May need to send empty body or status update
    });
  }

  /**
   * Transform user data from API to User type
   */
  private transformUser(user: any): User {
    // Known role IDs mapping
    const roleIdMapping: { [key: string]: { id: string; name: string } } = {
      'b86dd951-4a46-4295-97f1-82015d02f672': { id: 'b86dd951-4a46-4295-97f1-82015d02f672', name: 'ADMIN' },
      'cb8d828d-c0b9-460f-8b30-f7de4152e84f': { id: 'cb8d828d-c0b9-460f-8b30-f7de4152e84f', name: 'STUDENT' },
    };
    
    // Handle role field - it could be an object, a string, or we need to map from roleId
    let userRole: Role = { id: '', name: '' };
    
    if (user.role) {
      // Role object exists
      if (typeof user.role === 'string') {
        userRole = { id: user.role, name: user.role.toUpperCase() };
      } else if (user.role.name) {
        // Role is an object with name property
        userRole = { 
          id: user.role.id || user.roleId || '', 
          name: user.role.name.toUpperCase() 
        };
      } else if (user.role.id) {
        // Role object without name, use mapping if available
        const mapped = roleIdMapping[user.role.id];
        userRole = mapped || { id: user.role.id, name: 'STUDENT' };
      }
    } else if (user.roleId) {
      // Only roleId available, try to map it
      const mapped = roleIdMapping[user.roleId];
      userRole = mapped || { id: user.roleId, name: 'STUDENT' };
    } else {
      // Default to STUDENT if no role info
      userRole = { id: '', name: 'STUDENT' };
    }
    
    // Map status: API might return "unactive" instead of "inactive"
    let userStatus: 'active' | 'inactive' = 'active';
    if (user.status) {
      const statusLower = user.status.toLowerCase();
      userStatus = statusLower === 'active' ? 'active' : 'inactive';
    }
    
    return {
      id: user.id,
      name: user.name || '',
      email: user.email || '',
      role: userRole,
      status: userStatus,
      createdAt: user.createdAt || user.created_at || new Date().toISOString(),
      avatar: user.avatar || undefined,
    };
  }

  /**
   * Extract user data from nested response
   */
  private extractUserData(response: any): any {
    if (response?.data?.data) {
      return response.data.data;
    }
    if (response?.data) {
      return response.data;
    }
    return response;
  }
}

export const userService = new UserService();

