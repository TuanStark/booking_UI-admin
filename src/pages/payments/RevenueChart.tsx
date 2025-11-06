import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface RevenueChartProps {
  monthlyRevenueData: { month: string; amount: number }[];
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

const RevenueChart: React.FC<RevenueChartProps> = ({ 
  monthlyRevenueData, 
  isLoading = false,
  error = null,
  onRetry 
}) => {

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Doanh thu theo tháng</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px]">
            <LoadingSpinner size="md" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Doanh thu theo tháng</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-[300px]">
            <p className="text-sm text-red-600 dark:text-red-400 mb-2">{error}</p>
            {onRetry && (
              <Button onClick={onRetry} variant="outline" size="sm">
                Thử lại
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Doanh thu theo tháng</CardTitle>
      </CardHeader>
      <CardContent>
        {!monthlyRevenueData || monthlyRevenueData.length === 0 ? (
          <div className="flex items-center justify-center h-[300px] text-gray-500 dark:text-gray-400">
            <p>Chưa có dữ liệu doanh thu</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyRevenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis domain={[0, 'auto']} />
              <Tooltip 
                formatter={(value: number) => `$${value.toLocaleString()}`}
                labelFormatter={(label) => `Tháng: ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="amount" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ fill: '#10b981', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default RevenueChart;

