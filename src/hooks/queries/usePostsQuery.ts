import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postService } from '@/services/postService';
import { queryKeys } from '@/lib/queryClient';
import { Post, PostQuery, CreatePostDto, UpdatePostDto } from '@/types';

// ============ QUERIES ============

/**
 * Hook để fetch danh sách posts với filters
 */
export const usePosts = (query?: PostQuery) => {
    return useQuery({
        queryKey: queryKeys.posts.list(query || {}),
        queryFn: async () => {
            const response = await postService.findAll(query);
            // Handle paginated response structure
            if (response.data) {
                const responseData = response.data as any;
                if (responseData.data && Array.isArray(responseData.data)) {
                    return responseData.data as Post[];
                } else if (Array.isArray(response.data)) {
                    return response.data as Post[];
                }
            }
            return [] as Post[];
        },
    });
};

/**
 * Hook để fetch chi tiết một post
 */
export const usePost = (id: string | undefined) => {
    return useQuery({
        queryKey: queryKeys.posts.detail(id || ''),
        queryFn: async () => {
            if (!id) throw new Error('Post ID is required');
            const response = await postService.findOne(id);
            return response.data as Post;
        },
        enabled: !!id,
    });
};

// ============ MUTATIONS ============

/**
 * Hook để tạo post mới
 */
export const useCreatePost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreatePostDto & { file?: File }) => postService.create(data),
        onSuccess: () => {
            // Invalidate all post lists to refetch
            queryClient.invalidateQueries({ queryKey: queryKeys.posts.lists() });
        },
    });
};

/**
 * Hook để update post
 */
export const useUpdatePost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdatePostDto & { file?: File } }) =>
            postService.update(id, data),
        onSuccess: (_, variables) => {
            // Invalidate specific post detail and all lists
            queryClient.invalidateQueries({ queryKey: queryKeys.posts.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: queryKeys.posts.lists() });
        },
    });
};

/**
 * Hook để xóa post
 */
export const useDeletePost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => postService.delete(id),
        onSuccess: () => {
            // Invalidate all post lists
            queryClient.invalidateQueries({ queryKey: queryKeys.posts.lists() });
        },
    });
};

/**
 * Hook để publish post
 */
export const usePublishPost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => postService.publish(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.posts.detail(id) });
            queryClient.invalidateQueries({ queryKey: queryKeys.posts.lists() });
        },
    });
};

/**
 * Hook để draft post
 */
export const useDraftPost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => postService.draft(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.posts.detail(id) });
            queryClient.invalidateQueries({ queryKey: queryKeys.posts.lists() });
        },
    });
};
