import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search } from 'lucide-react';
import { Booking } from '@/types';
import { PaginationMeta } from '@/types/globalClass';
import BookingTableRow from './BookingTableRow';
import Pagination from '@/components/ui/pagination';
import { bookingService } from '@/services/bookingService';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const BookingsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'confirmed' | 'cancelled' | 'completed'>('all');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<'all' | 'pending' | 'paid' | 'failed' | 'refunded'>('all');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta>({
    total: 0,
    pageNumber: 1,
    limitNumber: 10,
    totalPages: 1,
  });
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch bookings on component mount or filters/page change
  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, selectedStatus, selectedPaymentStatus]);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await bookingService.getAll({
        page: currentPage,
        limit: 10,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        paymentStatus: selectedPaymentStatus !== 'all' ? selectedPaymentStatus : undefined,
        search: searchTerm || undefined,
      });
      
      setBookings(response.data);
      setPaginationMeta(response.meta);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể tải danh sách đặt phòng';
      setError(errorMessage);
      console.error('Error fetching bookings:', err);
      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchBookings();
  };

  const handleApproveBooking = async (bookingId: string) => {
    try {
      setError(null);
      await bookingService.approve(bookingId);
      // Refresh the list
      await fetchBookings();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể duyệt đặt phòng';
      setError(errorMessage);
      await fetchBookings();
      console.error('Error approving booking:', err);
    }
  };

  const handleRejectBooking = async (bookingId: string) => {
    try {
      setError(null);
      await bookingService.reject(bookingId);
      // Refresh the list
      await fetchBookings();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể từ chối đặt phòng';
      setError(errorMessage);
      await fetchBookings();
      console.error('Error rejecting booking:', err);
    }
  };

  // Calculate stats
  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter(b => b.bookingStatus === 'pending').length;
  const confirmedBookings = bookings.filter(b => b.bookingStatus === 'confirmed').length;
  const totalRevenue = bookings.filter(b => b.paymentStatus === 'paid').reduce((sum, b) => sum + b.totalAmount, 0);

  if (isLoading && bookings.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Quản lý đặt phòng</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Quản lý và theo dõi tất cả lượt đặt phòng
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tổng lượt đặt</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalBookings}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Chờ duyệt</p>
            <p className="text-2xl font-bold text-orange-600">{pendingBookings}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Đã xác nhận</p>
            <p className="text-2xl font-bold text-green-600">{confirmedBookings}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Doanh thu</p>
            <p className="text-2xl font-bold text-blue-600">
              ${totalRevenue.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm đặt phòng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value as any);
                setCurrentPage(1);
              }}
              className="h-10 rounded-md border border-input bg-background px-3 py-2"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ duyệt</option>
              <option value="confirmed">Đã xác nhận</option>
              <option value="cancelled">Đã hủy</option>
              <option value="completed">Hoàn tất</option>
            </select>
            <select
              value={selectedPaymentStatus}
              onChange={(e) => {
                setSelectedPaymentStatus(e.target.value as any);
                setCurrentPage(1);
              }}
              className="h-10 rounded-md border border-input bg-background px-3 py-2"
            >
              <option value="all">Tất cả thanh toán</option>
              <option value="pending">Chờ thanh toán</option>
              <option value="paid">Đã thanh toán</option>
              <option value="failed">Thất bại</option>
              <option value="refunded">Hoàn tiền</option>
            </select>
            <Button onClick={handleSearch} variant="outline">
              Tìm
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card>
          <CardContent className="pt-6">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => fetchBookings()}
              >
                Thử lại
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Đặt phòng ({bookings.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <div className="text-center py-10 text-gray-500 dark:text-gray-400">
              <p>Chưa có đặt phòng nào</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Sinh viên</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Phòng</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Nhận phòng</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Trả phòng</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Số tiền</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Thanh toán</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Trạng thái</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <BookingTableRow
                        key={booking.id || `booking-${booking.id}`}
                        booking={booking}
                        onApprove={handleApproveBooking}
                        onReject={handleRejectBooking}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
              {paginationMeta.totalPages > 1 && (
                <div className="mt-4">
                  <Pagination
                    currentPage={paginationMeta.pageNumber}
                    totalPages={paginationMeta.totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingsPage;
