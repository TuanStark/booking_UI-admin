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

    async findOne(id: string): Promise<ResponseData<Post>> {
        return this.request<ResponseData<Post>>(`/${id}`);
    }

    async create(data: CreatePostDto & { file?: File }): Promise<ResponseData<Post>> {
        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('content', data.content);
        formData.append('categoryId', data.categoryId);
        if (data.status) {
            formData.append('status', data.status);
        }
        if (data.file) {
            formData.append('file', data.file);
        }

        const token = localStorage.getItem('auth_token');
        const headers: Record<string, string> = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${this.baseURL}`, {
            method: 'POST',
            headers,
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        return await response.json();
    }

    async update(id: string, data: UpdatePostDto & { file?: File }): Promise<ResponseData<Post>> {
        const formData = new FormData();
        if (data.title) formData.append('title', data.title);
        if (data.content) formData.append('content', data.content);
        if (data.category) formData.append('categoryId', data.category);
        if (data.status) formData.append('status', data.status);
        if (data.file) formData.append('file', data.file);

        const token = localStorage.getItem('auth_token');
        const headers: Record<string, string> = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${this.baseURL}/${id}`, {
            method: 'PATCH',
            headers,
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        return await response.json();
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
