import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingService, GetBookingsParams } from '@/services/bookingService';
import { queryKeys } from '@/lib/queryClient';
import { Booking } from '@/types';

// ============ QUERIES ============

/**
 * Hook để fetch danh sách bookings với filters và pagination
 */
export const useBookings = (
    params?: GetBookingsParams,
    queryOptions?: { enabled?: boolean }
) => {
    return useQuery({
        queryKey: queryKeys.bookings.list(params || {}),
        queryFn: async () => {
            const response = await bookingService.getAll(params);
            return {
                data: response.data as Booking[],
                meta: response.meta,
            };
        },
        enabled: queryOptions?.enabled !== false,
    });
};

/**
 * Hook để fetch chi tiết một booking
 */
export const useBooking = (
    id: string | undefined,
    queryOptions?: { enabled?: boolean }
) => {
    return useQuery({
        queryKey: queryKeys.bookings.detail(id || ''),
        queryFn: async () => {
            if (!id) throw new Error('Booking ID is required');
            return await bookingService.getById(id);
        },
        enabled: (queryOptions?.enabled !== false) && !!id,
    });
};

/**
 * Đặt phòng gắn với một phòng (dùng cho thời biểu / lịch ở trang chi tiết phòng).
 * Nếu API lỗi, UI có thể fallback sang `activeBookings` từ chi tiết phòng.
 */
export const useBookingsByRoomId = (
    roomId: string | undefined,
    queryOptions?: { enabled?: boolean }
) => {
    return useQuery({
        queryKey: queryKeys.bookings.byRoom(roomId || ''),
        queryFn: async () => {
            if (!roomId) throw new Error('Room ID is required');
            return await bookingService.getByRoomId(roomId);
        },
        enabled: (queryOptions?.enabled !== false) && !!roomId,
        staleTime: 60 * 1000,
    });
};

// ============ MUTATIONS ============

/**
 * Hook để approve booking
 */
export const useApproveBooking = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => bookingService.approve(id),
        onSuccess: (_, id) => {
            // Invalidate specific booking and all lists
            queryClient.invalidateQueries({ queryKey: queryKeys.bookings.detail(id) });
            queryClient.invalidateQueries({ queryKey: queryKeys.bookings.lists() });
            queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
        },
    });
};

/**
 * Hook để reject booking
 */
export const useRejectBooking = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => bookingService.reject(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.bookings.detail(id) });
            queryClient.invalidateQueries({ queryKey: queryKeys.bookings.lists() });
            queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
        },
    });
};

/**
 * Hook để delete booking
 */
export const useDeleteBooking = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => bookingService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.bookings.lists() });
            queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
        },
    });
};
