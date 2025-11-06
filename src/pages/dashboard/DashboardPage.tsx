import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Home, Calendar, DollarSign, MessageSquare, TrendingUp } from 'lucide-react';
import { DashboardStats } from '@/types';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const DashboardPage: React.FC = () => {
  // Mock data - in production this would come from API
  const stats: DashboardStats = {
    totalUsers: 1250,
    totalRooms: 320,
    availableRooms: 45,
    totalBookings: 892,
    totalRevenue: 125000,
    totalReviews: 156,
    occupancyRate: 85.9,
    monthlyBookings: [
      { month: 'Jan', count: 45 },
      { month: 'Feb', count: 52 },
      { month: 'Mar', count: 48 },
      { month: 'Apr', count: 61 },
      { month: 'May', count: 55 },
      { month: 'Jun', count: 67 },
    ],
    monthlyRevenue: [
      { month: 'Jan', amount: 12000 },
      { month: 'Feb', amount: 15000 },
      { month: 'Mar', amount: 14000 },
      { month: 'Apr', amount: 18000 },
      { month: 'May', amount: 16000 },
      { month: 'Jun', amount: 20000 },
    ],
  };

  const occupancyData = [
    { name: 'Occupied', value: stats.occupancyRate },
    { name: 'Available', value: 100 - stats.occupancyRate },
  ];

  const COLORS = ['#3b82f6', '#e5e7eb'];

  const statCards = [
    {
      title: 'Tổng số người dùng',
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: 'bg-blue-100 text-blue-600',
      change: '+12.5%',
      trend: 'up'
    },
    {
      title: 'Tổng số phòng',
      value: stats.totalRooms.toLocaleString(),
      icon: Home,
      color: 'bg-green-100 text-green-600',
      change: '+5.2%',
      trend: 'up'
    },
    {
      title: 'Phòng còn trống',
      value: stats.availableRooms.toLocaleString(),
      icon: Home,
      color: 'bg-orange-100 text-orange-600',
      change: '-8.1%',
      trend: 'down'
    },
    {
      title: 'Tổng số đặt phòng',
      value: stats.totalBookings.toLocaleString(),
      icon: Calendar,
      color: 'bg-purple-100 text-purple-600',
      change: '+18.3%',
      trend: 'up'
    },
    {
      title: 'Doanh thu',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-emerald-100 text-emerald-600',
      change: '+24.7%',
      trend: 'up'
    },
    {
      title: 'Đánh giá',
      value: stats.totalReviews.toLocaleString(),
      icon: MessageSquare,
      color: 'bg-pink-100 text-pink-600',
      change: '+9.2%',
      trend: 'up'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Tiêu đề trang */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Tổng quan hệ thống
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Chào mừng bạn trở lại! Dưới đây là tình hình hệ thống ký túc xá của bạn.
        </p>
      </div>

      {/* Thống kê nhanh */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
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
                  <span className={`text-xs font-medium ${
                    stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </span>
                  <span className="text-xs text-gray-600 dark:text-gray-400 ml-2">
                    so với tháng trước
                  </span>
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
            <CardTitle className="text-lg font-semibold">Đặt phòng theo tháng</CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Số lượt đặt phòng mỗi tháng
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.monthlyBookings}>
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
          </CardContent>
        </Card>

        {/* Biểu đồ doanh thu theo tháng */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Doanh thu theo tháng</CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Doanh thu mỗi tháng
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                <Bar dataKey="amount" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
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
                    label={({ name, percent }) => `${name === 'Occupied' ? 'Đã ở' : 'Còn trống'} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {occupancyData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
                    {Math.round((stats.totalRooms * occupancyData[0].value) / 100)} phòng
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
                    {stats.availableRooms} phòng
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
