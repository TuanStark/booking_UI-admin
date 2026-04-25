import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roomService, GetRoomsParams } from '@/services/roomService';
import { queryKeys } from '@/lib/queryClient';
import { Room } from '@/types';
import { RoomFormData } from '@/lib/validations';

// ============ QUERIES ============

/**
 * Hook để fetch danh sách rooms với pagination và filters
 */
export const useRooms = (params?: GetRoomsParams) => {
    return useQuery({
        queryKey: queryKeys.rooms.list(params || {}),
        queryFn: async () => {
            const response = await roomService.getAll(params);
            return {
                data: response.data as Room[],
                meta: response.meta,
            };
        },
    });
};

/**
 * Hook để fetch chi tiết một room
 */
export const useRoom = (id: string | undefined) => {
    return useQuery({
        queryKey: queryKeys.rooms.detail(id || ''),
        queryFn: async () => {
            if (!id) throw new Error('Room ID is required');
            return await roomService.getById(id);
        },
        enabled: !!id,
    });
};

// ============ MUTATIONS ============

/**
 * Hook để tạo room mới
 */
export const useCreateRoom = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: RoomFormData & { imageFiles?: File[] }) =>
            roomService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.rooms.lists() });
        },
    });
};

/**
 * Hook để update room
 */
export const useUpdateRoom = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: RoomFormData & { imageFiles?: File[]; deletedImageIds?: string[] } }) =>
            roomService.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.rooms.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: queryKeys.rooms.lists() });
        },
    });
};

/**
 * Hook để xóa room
 */
export const useDeleteRoom = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => roomService.delete(id),
        onSuccess: () => {
            // Invalidate all room queries to refresh the list
            queryClient.invalidateQueries({ queryKey: queryKeys.rooms.all });
        },
        onError: (error) => {
            console.error('Delete room mutation error:', error);
        },
    });
};

/**
 * Hook để cập nhật nhanh trạng thái phòng (partial update)
 */
export const useUpdateRoomStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: 'AVAILABLE' | 'BOOKED' | 'MAINTENANCE' | 'DISABLED' }) =>
            roomService.updateStatus(id, status),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.rooms.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: queryKeys.rooms.lists() });
        },
    });
};

/**
 * Hook để cập nhật trạng thái nhiều phòng cùng lúc (single DB round-trip)
 */
export const useBulkUpdateRoomStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (dto: { ids: string[]; status: 'AVAILABLE' | 'BOOKED' | 'MAINTENANCE' | 'DISABLED' }) =>
            roomService.bulkUpdateStatus(dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.rooms.lists() });
        },
    });
};
