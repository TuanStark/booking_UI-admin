import { CreatePostDto, Post, PostQuery, UpdatePostDto } from '@/types';
import { ResponseData } from '@/types/globalClass';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';



class PostService {
    private baseURL: string;

    constructor() {
        this.baseURL = `${API_BASE_URL}/posts`;
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

    async findAll(query: PostQuery = {}): Promise<ResponseData<Post[]>> {
        const queryString = new URLSearchParams(query as any).toString();
        return this.request<ResponseData<Post[]>>(`?${queryString}`);
    }

    async findOne(idOrSlug: string): Promise<ResponseData<Post>> {
        return this.request<ResponseData<Post>>(`/${idOrSlug}`);
    }

    async create(data: CreatePostDto): Promise<ResponseData<Post>> {
        return this.request<ResponseData<Post>>('', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async update(id: string, data: UpdatePostDto): Promise<ResponseData<Post>> {
        return this.request<ResponseData<Post>>(`/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    async delete(id: string): Promise<ResponseData<void>> {
        return this.request<ResponseData<void>>(`/${id}`, {
            method: 'DELETE',
        });
    }

    async publish(id: string): Promise<ResponseData<Post>> {
        return this.request<ResponseData<Post>>(`/${id}/publish`, {
            method: 'POST',
        });
    }

    async draft(id: string): Promise<ResponseData<Post>> {
        return this.request<ResponseData<Post>>(`/${id}/draft`, {
            method: 'POST',
        });
    }
}

export const postService = new PostService();
