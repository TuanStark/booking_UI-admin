
import { Review } from '@/types';
import { PaginatedResponse } from '@/types/globalClass';

export interface GetReviewsParams {
    page?: number;
    limit?: number;
    status?: 'VISIBLE' | 'HIDDEN' | 'DELETED' | 'ALL';
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

class ReviewService {
    private baseURL: string;

    constructor() {
        this.baseURL = `${API_BASE_URL}/reviews`;
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
     * Get all reviews with pagination and filters
     */
    async getAll(params?: GetReviewsParams): Promise<PaginatedResponse<Review>> {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.status && params.status !== 'ALL') queryParams.append('status', params.status);
        if (params?.search) queryParams.append('search', params.search);
        if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
        if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

        const queryString = queryParams.toString();
        const endpoint = queryString ? `?${queryString}` : '';

        // Response format is { data: { data: [], meta: {} }, ... } based on globalClass ResponseData
        const response = await this.authenticatedRequest<any>(endpoint);

        // Handle nested response structure
        const reviews = response?.data?.data || [];
        const meta = response?.data?.meta || {
            total: 0,
            pageNumber: params?.page || 1,
            limitNumber: params?.limit || 10,
            totalPages: 1
        };

        return {
            data: reviews,
            meta: meta
        };
    }

    /**
     * Get review by ID
     */
    async getById(id: string): Promise<Review> {
        const response = await this.authenticatedRequest<any>(`/${id}`);
        return response.data;
    }

    /**
     * Update review (e.g. status)
     */
    async update(id: string, data: Partial<Review>): Promise<Review> {
        const response = await this.authenticatedRequest<any>(`/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
        return response.data;
    }

    /**
     * Delete review (soft delete)
     */
    async delete(id: string): Promise<void> {
        await this.authenticatedRequest<void>(`/${id}`, {
            method: 'DELETE',
        });
    }
}

export const reviewService = new ReviewService();
