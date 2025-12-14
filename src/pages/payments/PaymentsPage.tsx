import React, { useState, useMemo } from 'react';

import PaymentStatsCards from './PaymentStatsCards';
import RevenueChart from './RevenueChart';
import PaymentFilters from './PaymentFilters';
import PaymentTable from './PaymentTable';
import { usePayments, useMonthlyRevenue } from '@/hooks/queries/usePaymentsQuery';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Card, CardContent } from '@/components/ui/card';

import Pagination from '@/components/ui/pagination';

const PaymentsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<'all' | 'MOMO' | 'VNPay' | 'Bank Transfer' | 'Cash'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'completed' | 'failed' | 'refunded'>('all');

  const [currentPage, setCurrentPage] = useState(1);

  // Use TanStack Query for Payments
  const { data: response, isLoading, isError } = usePayments({
    page: currentPage,
    limit: 10,
    method: selectedMethod !== 'all' ? selectedMethod : undefined,
    status: selectedStatus !== 'all' ? selectedStatus : undefined,
    search: searchTerm || undefined,
  });

  const payments = response?.data || [];
  const paginationMeta = response?.meta || {
    total: 0,
    pageNumber: 1,
    limitNumber: 10,
    totalPages: 1,
  };

  // Use TanStack Query for Monthly Revenue
  const currentYear = new Date().getFullYear();
  const {
    data: revenueData,
    isLoading: isLoadingRevenue,
    error: revenueError,
    refetch: refetchRevenue
  } = useMonthlyRevenue({
    year: currentYear,
  });

  // Process revenue data
  const monthlyRevenueData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    if (revenueData && revenueData.length > 0) {
      const revenueMap = new Map(revenueData.map(item => [item.month, item.amount]));
      return months.map(month => ({
        month,
        amount: revenueMap.get(month) || 0,
      }));
    }

    return months.map(month => ({ month, amount: 0 }));
  }, [revenueData]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = () => {
    setCurrentPage(1);
    // Search is handled by query params
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
        error={revenueError ? (revenueError instanceof Error ? revenueError.message : 'Error loading revenue') : null}
        onRetry={() => refetchRevenue()}
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

      {isError && (
        <Card>
          <CardContent className="pt-6">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
              <p className="text-sm text-red-600 dark:text-red-400">Error loading payments</p>
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
