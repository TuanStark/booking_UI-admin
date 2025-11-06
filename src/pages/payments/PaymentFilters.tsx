import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface PaymentFiltersProps {
  searchTerm: string;
  selectedMethod: 'all' | 'MOMO' | 'VNPay' | 'Bank Transfer' | 'Cash';
  selectedStatus: 'all' | 'pending' | 'completed' | 'failed' | 'refunded';
  onSearchChange: (value: string) => void;
  onMethodChange: (value: 'all' | 'MOMO' | 'VNPay' | 'Bank Transfer' | 'Cash') => void;
  onStatusChange: (value: 'all' | 'pending' | 'completed' | 'failed' | 'refunded') => void;
  onSearch?: () => void;
}

const PaymentFilters: React.FC<PaymentFiltersProps> = ({
  searchTerm,
  selectedMethod,
  selectedStatus,
  onSearchChange,
  onMethodChange,
  onStatusChange,
  onSearch,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Bộ lọc</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm giao dịch..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSearch?.()}
              className="pl-10"
            />
          </div>
          <select
            value={selectedMethod}
            onChange={(e) => onMethodChange(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-md"
          >
            <option value="all">Tất cả phương thức</option>
            <option value="MOMO">MOMO</option>
            <option value="VNPay">VNPay</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Cash">Cash</option>
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-md"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Đang chờ</option>
            <option value="completed">Hoàn tất</option>
            <option value="failed">Thất bại</option>
            <option value="refunded">Hoàn tiền</option>
          </select>
          {onSearch && (
            <Button onClick={onSearch} variant="outline">
              Tìm
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentFilters;

