import React, { useState, useEffect, useMemo } from 'react';
import { Payment } from '@/types';
import { PaginationMeta } from '@/types/globalClass';
import PaymentStatsCards from './PaymentStatsCards';
import RevenueChart from './RevenueChart';
import PaymentFilters from './PaymentFilters';
import PaymentTable from './PaymentTable';
import { paymentService } from '@/services/paymentService';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Pagination from '@/components/ui/pagination';

const PaymentsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<'all' | 'MOMO' | 'VNPay' | 'Bank Transfer' | 'Cash'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'completed' | 'failed' | 'refunded'>('all');

  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta>({
    total: 0,
    pageNumber: 1,
    limitNumber: 10,
    totalPages: 1,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [monthlyRevenueData, setMonthlyRevenueData] = useState<Array<{ month: string; amount: number }>>([]);
  const [isLoadingRevenue, setIsLoadingRevenue] = useState(false);
  const [revenueError, setRevenueError] = useState<string | null>(null);

  // Fetch payments on component mount or filters/page change
  useEffect(() => {
    fetchPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, selectedMethod, selectedStatus]);

  // Fetch monthly revenue on component mount
  useEffect(() => {
    fetchMonthlyRevenue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await paymentService.getAll({
        page: currentPage,
        limit: 10,
        method: selectedMethod !== 'all' ? selectedMethod : undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        search: searchTerm || undefined,
      });
      
      setPayments(response.data);
      setPaginationMeta(response.meta);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể tải danh sách thanh toán';
      setError(errorMessage);
      console.error('Error fetching payments:', err);
      setPayments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMonthlyRevenue = async () => {
    try {
      setIsLoadingRevenue(true);
      setRevenueError(null);
      
      const currentYear = new Date().getFullYear();
      
      const revenueData = await paymentService.getMonthlyRevenue({
        year: currentYear,
        // Có thể filter theo method nếu muốn
        // method: selectedMethod !== 'all' ? selectedMethod : undefined,
      });
      
      console.log('Fetched monthly revenue data:', revenueData);
      
      // Ensure we have data for all 12 months
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      if (revenueData && revenueData.length > 0) {
        // Merge với default months để đảm bảo có đủ 12 tháng
        const revenueMap = new Map(revenueData.map(item => [item.month, item.amount]));
        const completeData = months.map(month => ({
          month,
          amount: revenueMap.get(month) || 0,
        }));
        setMonthlyRevenueData(completeData);
      } else {
        // Fallback to empty data
        setMonthlyRevenueData(months.map(month => ({ month, amount: 0 })));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể tải dữ liệu doanh thu';
      setRevenueError(errorMessage);
      console.error('Error fetching monthly revenue:', err);
      
      // Fallback to empty data
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      setMonthlyRevenueData(months.map(month => ({ month, amount: 0 })));
    } finally {
      setIsLoadingRevenue(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchPayments();
  };

  // Filter payments client-side for display (if needed)
  const filteredPayments = useMemo(() => {
    if (!searchTerm) return payments;
    
    return payments.filter(payment => {
      const matchesSearch = payment.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           payment.bookingId.includes(searchTerm) ||
                           payment.id.includes(searchTerm);
      return matchesSearch;
    });
  }, [payments, searchTerm]);

  const handleViewPayment = (paymentId: string) => {
    // TODO: Implement view payment details modal/page
    console.log('View payment:', paymentId);
  };

  if (isLoading && payments.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Quản lý thanh toán</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Theo dõi và quản lý tất cả giao dịch thanh toán
        </p>
      </div>

      <PaymentStatsCards payments={payments} />

      <RevenueChart 
        monthlyRevenueData={monthlyRevenueData}
        isLoading={isLoadingRevenue}
        error={revenueError}
        onRetry={fetchMonthlyRevenue}
      />

      <PaymentFilters
        searchTerm={searchTerm}
        selectedMethod={selectedMethod}
        selectedStatus={selectedStatus}
        onSearchChange={setSearchTerm}
        onMethodChange={(method) => {
          setSelectedMethod(method);
          setCurrentPage(1);
        }}
        onStatusChange={(status) => {
          setSelectedStatus(status);
          setCurrentPage(1);
        }}
        onSearch={handleSearch}
      />

      {error && (
        <Card>
          <CardContent className="pt-6">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => fetchPayments()}
              >
                Thử lại
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <PaymentTable 
        payments={filteredPayments} 
        onViewPayment={handleViewPayment}
      />

      {paginationMeta.totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={paginationMeta.pageNumber}
            totalPages={paginationMeta.totalPages}
            onPageChange={handlePageChange}
              />
            </div>
      )}
    </div>
  );
};

export default PaymentsPage;
