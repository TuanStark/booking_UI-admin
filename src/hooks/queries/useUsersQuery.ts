import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService, GetUsersParams } from '@/services/userService';
import { queryKeys } from '@/lib/queryClient';
import { User } from '@/types';
import { UserFormData } from '@/lib/validations';

// ============ QUERIES ============

/**
 * Hook để fetch danh sách users với pagination và filters
 */
export const useUsers = (params?: GetUsersParams) => {
    return useQuery({
        queryKey: queryKeys.users.list(params || {}),
        queryFn: async () => {
            const response = await userService.getAll(params);
            return {
                data: response.data as User[],
                meta: response.meta,
            };
        },
    });
};

/**
 * Hook để fetch chi tiết một user
 */
export const useUser = (id: string | undefined) => {
    return useQuery({
        queryKey: queryKeys.users.detail(id || ''),
        queryFn: async () => {
            if (!id) throw new Error('User ID is required');
            return await userService.getById(id);
        },
        enabled: !!id,
    });
};

// ============ MUTATIONS ============

/**
 * Hook để tạo user mới
 */
export const useCreateUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: UserFormData) => userService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
        },
    });
};

/**
 * Hook để update user
 */
export const useUpdateUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UserFormData }) =>
            userService.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
        },
    });
};

/**
 * Hook để xóa user (soft delete)
 */
export const useDeleteUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => userService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
        },
    });
};
