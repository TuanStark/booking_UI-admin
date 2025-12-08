import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingService, GetBookingsParams } from '@/services/bookingService';
import { queryKeys } from '@/lib/queryClient';
import { Booking } from '@/types';

// ============ QUERIES ============

/**
 * Hook để fetch danh sách bookings với filters và pagination
 */
export const useBookings = (params?: GetBookingsParams) => {
    return useQuery({
        queryKey: queryKeys.bookings.list(params || {}),
        queryFn: async () => {
            const response = await bookingService.getAll(params);
            return {
                data: response.data as Booking[],
                meta: response.meta,
            };
        },
    });
};

/**
 * Hook để fetch chi tiết một booking
 */
export const useBooking = (id: string | undefined) => {
    return useQuery({
        queryKey: queryKeys.bookings.detail(id || ''),
        queryFn: async () => {
            if (!id) throw new Error('Booking ID is required');
            return await bookingService.getById(id);
        },
        enabled: !!id,
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
        },
    });
};
