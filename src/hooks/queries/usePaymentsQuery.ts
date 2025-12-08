import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentService, GetPaymentsParams } from '@/services/paymentService';
import { queryKeys } from '@/lib/queryClient';
import { Payment } from '@/types';

// ============ QUERIES ============

/**
 * Hook để fetch danh sách payments với pagination và filters
 */
export const usePayments = (params?: GetPaymentsParams) => {
    return useQuery({
        queryKey: queryKeys.payments.list(params || {}),
        queryFn: async () => {
            const response = await paymentService.getAll(params);
            return {
                data: response.data as Payment[],
                meta: response.meta,
            };
        },
    });
};

/**
 * Hook để fetch chi tiết một payment
 */
export const usePayment = (id: string | undefined) => {
    return useQuery({
        queryKey: queryKeys.payments.detail(id || ''),
        queryFn: async () => {
            if (!id) throw new Error('Payment ID is required');
            return await paymentService.getById(id);
        },
        enabled: !!id,
    });
};

/**
 * Hook để fetch payment statistics
 */
export const usePaymentStats = () => {
    return useQuery({
        queryKey: ['payments', 'stats'],
        queryFn: () => paymentService.getStats(),
    });
};

/**
 * Hook để fetch monthly revenue data
 */
export const useMonthlyRevenue = (params?: {
    year?: number;
    startDate?: string;
    endDate?: string;
    method?: 'MOMO' | 'VNPay' | 'Bank Transfer' | 'Cash';
}) => {
    return useQuery({
        queryKey: ['payments', 'revenue', 'monthly', params],
        queryFn: () => paymentService.getMonthlyRevenue(params),
    });
};

// ============ MUTATIONS ============

/**
 * Hook để update payment status
 */
export const useUpdatePaymentStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: 'pending' | 'completed' | 'failed' | 'refunded' }) =>
            paymentService.updateStatus(id, status),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.payments.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: queryKeys.payments.lists() });
            queryClient.invalidateQueries({ queryKey: ['payments', 'stats'] });
        },
    });
};

/**
 * Hook để mark payment as completed
 */
export const useMarkPaymentCompleted = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => paymentService.markAsCompleted(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.payments.detail(id) });
            queryClient.invalidateQueries({ queryKey: queryKeys.payments.lists() });
            queryClient.invalidateQueries({ queryKey: ['payments', 'stats'] });
        },
    });
};

/**
 * Hook để refund payment
 */
export const useRefundPayment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => paymentService.refund(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.payments.detail(id) });
            queryClient.invalidateQueries({ queryKey: queryKeys.payments.lists() });
            queryClient.invalidateQueries({ queryKey: ['payments', 'stats'] });
        },
    });
};

/**
 * Hook để delete payment
 */
export const useDeletePayment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => paymentService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.payments.lists() });
            queryClient.invalidateQueries({ queryKey: ['payments', 'stats'] });
        },
    });
};
