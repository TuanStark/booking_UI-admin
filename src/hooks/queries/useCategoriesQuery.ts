import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService } from '@/services/categoryService';
import { queryKeys } from '@/lib/queryClient';
import { PostCategory, CreateCategoryDto, UpdateCategoryDto } from '@/types';

// ============ QUERIES ============

/**
 * Hook để fetch danh sách categories
 */
export const useCategories = () => {
    return useQuery({
        queryKey: queryKeys.categories.list(),
        queryFn: async () => {
            const response = await categoryService.findAll();
            // Handle response structure
            if (response.data) {
                const responseData = response.data as any;
                if (responseData.data && Array.isArray(responseData.data)) {
                    return responseData.data as PostCategory[];
                } else if (Array.isArray(response.data)) {
                    return response.data as PostCategory[];
                }
            }
            return [] as PostCategory[];
        },
    });
};

/**
 * Hook để fetch chi tiết một category
 */
export const useCategory = (id: string | undefined) => {
    return useQuery({
        queryKey: queryKeys.categories.detail(id || ''),
        queryFn: async () => {
            if (!id) throw new Error('Category ID is required');
            const response = await categoryService.findOne(id);
            return response.data as PostCategory;
        },
        enabled: !!id,
    });
};

// ============ MUTATIONS ============

/**
 * Hook để tạo category mới
 */
export const useCreateCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateCategoryDto) => categoryService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.categories.lists() });
        },
    });
};

/**
 * Hook để update category
 */
export const useUpdateCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateCategoryDto }) =>
            categoryService.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.categories.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: queryKeys.categories.lists() });
        },
    });
};

/**
 * Hook để xóa category
 */
export const useDeleteCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => categoryService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.categories.lists() });
        },
    });
};
