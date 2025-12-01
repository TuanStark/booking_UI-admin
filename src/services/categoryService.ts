import { CreateCategoryDto, PostCategory, UpdateCategoryDto } from '@/types';
import { ResponseData } from '@/types/globalClass';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

class CategoryService {
    private baseURL: string;

    constructor() {
        this.baseURL = `${API_BASE_URL}/post-categories`;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${this.baseURL}${endpoint}`;
        const token = localStorage.getItem('auth_token');

        const defaultHeaders: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        if (token) {
            defaultHeaders['Authorization'] = `Bearer ${token}`;
        }

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

    async findAll(): Promise<ResponseData<PostCategory[]>> {
        return this.request<ResponseData<PostCategory[]>>('');
    }

    async findOne(idOrSlug: string): Promise<ResponseData<PostCategory>> {
        return this.request<ResponseData<PostCategory>>(`/${idOrSlug}`);
    }

    async create(data: CreateCategoryDto): Promise<ResponseData<PostCategory>> {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            throw new Error('No authentication token found');
        }
        return this.request<ResponseData<PostCategory>>('', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });
    }

    async update(id: string, data: UpdateCategoryDto): Promise<ResponseData<PostCategory>> {
        return this.request<ResponseData<PostCategory>>(`/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    async delete(id: string): Promise<ResponseData<void>> {
        return this.request<ResponseData<void>>(`/${id}`, {
            method: 'DELETE',
        });
    }
}

export const categoryService = new CategoryService();
