import React from 'react';
import { useDashboardStats } from '@/hooks/queries/useDashboardQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  Home,
  Calendar,
  DollarSign,
  TrendingUp,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

import { Skeleton } from '@/components/ui/skeleton';

// Loading skeleton component
const DashboardSkeleton: React.FC = () => (
  <div className="space-y-6">
    <div>
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-5 w-96 mt-2" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-4 w-20 mt-2" />
          </CardContent>
        </Card>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    </div>
  </div>
);

// Error component
const DashboardError: React.FC<{ onRetry: () => void }> = ({ onRetry }) => (
  <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
    <AlertCircle className="h-16 w-16 text-red-500" />
    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
      Không thể tải dữ liệu Dashboard
    </h2>
    <p className="text-gray-600 dark:text-gray-400">
      Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại.
    </p>
    <Button onClick={onRetry} variant="outline">
      <RefreshCw className="mr-2 h-4 w-4" />
      Thử lại
    </Button>
  </div>
);

const DashboardPage: React.FC = () => {
  // Fetch dashboard stats using TanStack Query
  const {
    data: stats,
    isLoading,
    isError,
    refetch,
  } = useDashboardStats();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (isError || !stats) {
    return <DashboardError onRetry={() => refetch()} />;
  }

  // Helper to safely extract nested stats (handles empty string from API)
  const safeStats = <T,>(data: T | null | undefined | string): T | null => {
    if (!data || data === '' || typeof data !== 'object') return null;
    return data;
  };

  // Extract data with fallbacks (safely handle empty string responses)
  const users = safeStats(stats.users);
  const rooms = safeStats(stats.rooms);
  const bookings = safeStats(stats.bookings);
  const payments = safeStats(stats.payments);

  const totalUsers = users?.totalUsers ?? 0;
  const userGrowth = users?.userGrowth ?? 0;
  const totalRooms = rooms?.totalRooms ?? 0;
  const availableRooms = rooms?.availableRooms ?? 0;
  const occupancyRate = rooms?.occupancyRate ?? 0;
  const totalBookings = bookings?.totalBookings ?? 0;
  const bookingGrowth = bookings?.bookingGrowth ?? 0;
  const totalRevenue = payments?.totalRevenue ?? 0;
  const revenueGrowth = payments?.revenueGrowth ?? 0;
  const monthlyBookings = bookings?.monthlyBookings ?? [];
  const monthlyRevenue = payments?.monthlyRevenue ?? [];

  const occupancyData = [
    { name: 'Occupied', value: occupancyRate },
    { name: 'Available', value: 100 - occupancyRate },
  ];

  const COLORS = ['#3b82f6', '#e5e7eb'];

  const formatGrowth = (value: number) => {
    if (value > 0) return `+${value.toFixed(1)}%`;
    if (value < 0) return `${value.toFixed(1)}%`;
    return '0%';
  };

  const statCards = [
    {
      title: 'Tổng số người dùng',
      value: totalUsers.toLocaleString(),
      icon: Users,
      color: 'bg-blue-100 text-blue-600',
      change: formatGrowth(userGrowth),
      trend: userGrowth >= 0 ? 'up' : 'down',
    },
    {
      title: 'Tổng số phòng',
      value: totalRooms.toLocaleString(),
      icon: Home,
      color: 'bg-green-100 text-green-600',
      change: '—',
      trend: 'neutral',
    },
    {
      title: 'Phòng còn trống',
      value: availableRooms.toLocaleString(),
      icon: Home,
      color: 'bg-orange-100 text-orange-600',
      change: `${occupancyRate.toFixed(1)}% lấp đầy`,
      trend: availableRooms > 0 ? 'up' : 'down',
    },
    {
      title: 'Tổng số đặt phòng',
      value: totalBookings.toLocaleString(),
      icon: Calendar,
      color: 'bg-purple-100 text-purple-600',
      change: formatGrowth(bookingGrowth),
      trend: bookingGrowth >= 0 ? 'up' : 'down',
    },
    {
      title: 'Doanh thu',
      value: `${totalRevenue.toLocaleString()}₫`,
      icon: DollarSign,
      color: 'bg-emerald-100 text-emerald-600',
      change: formatGrowth(revenueGrowth),
      trend: revenueGrowth >= 0 ? 'up' : 'down',
    },
    {
      title: 'Thanh toán thành công',
      value: (payments?.successPayments ?? 0).toLocaleString(),
      icon: TrendingUp,
      color: 'bg-pink-100 text-pink-600',
      change: `${payments?.pendingPayments ?? 0} đang chờ`,
      trend: 'neutral',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Tiêu đề trang */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Tổng quan hệ thống
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Chào mừng bạn trở lại! Dưới đây là tình hình hệ thống ký túc xá của
            bạn.
          </p>
          {stats.lastUpdated && (
            <p className="text-xs text-gray-400 mt-1">
              Cập nhật lúc: {new Date(stats.lastUpdated).toLocaleString('vi-VN')}
            </p>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Làm mới
        </Button>
      </div>

      {/* Thống kê nhanh */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={index}
              className="hover:shadow-lg transition-shadow duration-200"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </div>
                <div className="flex items-center pt-1">
                  <span
                    className={`text-xs font-medium ${stat.trend === 'up'
                      ? 'text-green-600'
                      : stat.trend === 'down'
                        ? 'text-red-600'
                        : 'text-gray-500'
                      }`}
                  >
                    {stat.change}
                  </span>
                  {stat.trend !== 'neutral' && (
                    <span className="text-xs text-gray-600 dark:text-gray-400 ml-2">
                      so với tháng trước
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Khu vực biểu đồ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Biểu đồ đặt phòng theo tháng */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Đặt phòng theo tháng
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Số lượt đặt phòng mỗi tháng
            </p>
          </CardHeader>
          <CardContent>
            {monthlyBookings.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyBookings}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400">
                Chưa có dữ liệu
              </div>
            )}
          </CardContent>
        </Card>

        {/* Biểu đồ doanh thu theo tháng */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Doanh thu theo tháng
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Doanh thu mỗi tháng
            </p>
          </CardHeader>
          <CardContent>
            {monthlyRevenue.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) =>
                      `${value.toLocaleString()}₫`
                    }
                  />
                  <Bar dataKey="amount" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400">
                Chưa có dữ liệu
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tỉ lệ lấp đầy */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Tỉ lệ lấp đầy</CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Tình trạng đã ở so với còn trống hiện tại
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={occupancyData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name === 'Occupied' ? 'Đã ở' : 'Còn trống'} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {occupancyData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col justify-center space-y-6">
              <div className="flex items-center space-x-4">
                <div className="h-4 w-4 bg-blue-500 rounded"></div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {occupancyData[0].value.toFixed(1)}% Đã ở
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {Math.round((totalRooms * occupancyData[0].value) / 100)}{' '}
                    phòng
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="h-4 w-4 bg-gray-300 rounded"></div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {occupancyData[1].value.toFixed(1)}% Còn trống
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {availableRooms} phòng
                  </p>
                </div>
              </div>
              <Button className="w-fit">
                <TrendingUp className="mr-2 h-4 w-4" />
                Xem báo cáo chi tiết
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;
