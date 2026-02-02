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
