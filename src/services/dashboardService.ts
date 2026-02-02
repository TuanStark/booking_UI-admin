/**
 * Dashboard Service - Fetches aggregated stats from API Gateway
 */

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

// Types matching the backend response
export interface UserStats {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    newUsersThisMonth: number;
    newUsersLastMonth: number;
    userGrowth: number;
}

export interface RoomStats {
    totalRooms: number;
    availableRooms: number;
    bookedRooms: number;
    maintenanceRooms: number;
    disabledRooms: number;
    occupancyRate: number;
}

export interface BookingStats {
    totalBookings: number;
    pendingBookings: number;
    confirmedBookings: number;
    cancelledBookings: number;
    completedBookings: number;
    bookingsThisMonth: number;
    bookingsLastMonth: number;
    bookingGrowth: number;
    monthlyBookings: Array<{ month: string; count: number }>;
}

export interface PaymentStats {
    totalPayments: number;
    pendingPayments: number;
    successPayments: number;
    failedPayments: number;
    totalRevenue: number;
    revenueThisMonth: number;
    revenueLastMonth: number;
    revenueGrowth: number;
    monthlyRevenue: Array<{ month: string; amount: number }>;
}

export interface DashboardStats {
    users: UserStats | null;
    rooms: RoomStats | null;
    bookings: BookingStats | null;
    payments: PaymentStats | null;
    lastUpdated: string;
}

export interface DashboardResponse {
    statusCode: number;
    message: string;
    data: DashboardStats;
}

class DashboardService {
    private baseURL: string;

    constructor() {
        this.baseURL = `${API_BASE_URL}/dashboard`;
    }

    private getToken(): string | null {
        return localStorage.getItem('auth_token');
    }

    /**
     * Fetch aggregated dashboard statistics
     * Single API call to get all stats from all microservices
     */
    async getStats(): Promise<DashboardStats> {
        const token = this.getToken();
        const url = `${this.baseURL}/stats`;

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                    errorData.message || `HTTP error! status: ${response.status}`
                );
            }

            const result: DashboardResponse = await response.json();
            return result.data;
        } catch (error) {
            console.error('[DashboardService] Failed to fetch:', error);
            throw error;
        }
    }
}

export const dashboardService = new DashboardService();
