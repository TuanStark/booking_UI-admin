import { useQuery } from '@tanstack/react-query';
import { dashboardService, DashboardStats } from '@/services/dashboardService';

export const useDashboardStats = () => {
    return useQuery<DashboardStats>({
        queryKey: ['dashboard-stats'],
        queryFn: () => dashboardService.getStats(),
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
    });
};

export const useCalendar = (
    startDate?: string,
    endDate?: string,
    buildingId?: string | null,
    roomId?: string | null,
    options?: { enabled?: boolean }
) => {
    return useQuery({
        queryKey: ['calendar', startDate, endDate, buildingId, roomId],
        queryFn: () => {
            if (!startDate || !endDate) throw new Error('Missing params');
            return dashboardService.getCalendar(startDate, endDate, buildingId, roomId);
        },
        enabled: options?.enabled !== false && !!startDate && !!endDate,
    });
};
