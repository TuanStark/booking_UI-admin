import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle } from 'lucide-react';
import { Booking } from '@/types';
import ConfirmDialog from '@/components/ui/confirm-dialog';

interface BookingTableRowProps {
  booking: Booking;
  onApprove: (bookingId: string) => void;
  onReject: (bookingId: string) => void;
}

const BookingTableRow: React.FC<BookingTableRowProps> = ({
  booking,
  onApprove,
  onReject,
}) => {
  const [rejectConfirmOpen, setRejectConfirmOpen] = useState(false);
  const [approveConfirmOpen, setApproveConfirmOpen] = useState(false);

  const handleRejectClick = () => {
    setRejectConfirmOpen(true);
  };

  const handleApproveClick = () => {
    setApproveConfirmOpen(true);
  };

  const confirmReject = () => {
    onReject(booking.id);
    setRejectConfirmOpen(false);
  };

  const confirmApprove = () => {
    onApprove(booking.id);
    setApproveConfirmOpen(false);
  };

  const getPaymentStatusBadge = (status: string) => {
    const colors = {
      paid: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      pending: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      refunded: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    };
    
    const labels = {
      paid: 'Đã thanh toán',
      pending: 'Chờ thanh toán',
      failed: 'Thất bại',
      refunded: 'Hoàn tiền',
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status as keyof typeof colors] || colors.pending}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const getBookingStatusBadge = (status: string) => {
    const colors = {
      confirmed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      pending: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      cancelled: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    };
    
    const labels = {
      confirmed: 'Đã xác nhận',
      pending: 'Chờ duyệt',
      completed: 'Hoàn tất',
      cancelled: 'Đã hủy',
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status as keyof typeof colors] || colors.pending}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
      });
    } catch {
      return dateString;
    }
  };

  return (
    <>
      <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
        <td className="py-3 px-4">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{booking.userName || 'N/A'}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{booking.userEmail || ''}</p>
          </div>
        </td>
        <td className="py-3 px-4">
          <div>
            <span className="font-medium text-gray-900 dark:text-white">{booking.roomNumber || 'N/A'}</span>
            <p className="text-sm text-gray-600 dark:text-gray-400">{booking.buildingName || ''}</p>
          </div>
        </td>
        <td className="py-3 px-4 text-gray-600 dark:text-gray-400 text-sm">
          {formatDate(booking.checkInDate)}
        </td>
        <td className="py-3 px-4 text-gray-600 dark:text-gray-400 text-sm">
          {formatDate(booking.checkOutDate)}
        </td>
        <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
          ${booking.totalAmount.toLocaleString()}
        </td>
        <td className="py-3 px-4">
          {getPaymentStatusBadge(booking.paymentStatus)}
        </td>
        <td className="py-3 px-4">
          {getBookingStatusBadge(booking.bookingStatus)}
        </td>
        <td className="py-3 px-4">
          {booking.bookingStatus === 'pending' && (
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                onClick={handleApproveClick}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Duyệt
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleRejectClick}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Từ chối
              </Button>
            </div>
          )}
          {booking.bookingStatus === 'confirmed' && (
            <span className="text-sm text-gray-600 dark:text-gray-400">Đã xác nhận</span>
          )}
          {booking.bookingStatus === 'cancelled' && (
            <span className="text-sm text-gray-600 dark:text-gray-400">Đã hủy</span>
          )}
          {booking.bookingStatus === 'completed' && (
            <span className="text-sm text-gray-600 dark:text-gray-400">Hoàn tất</span>
          )}
        </td>
      </tr>

      {/* Approve Confirmation Dialog */}
      <ConfirmDialog
        isOpen={approveConfirmOpen}
        onClose={() => setApproveConfirmOpen(false)}
        onConfirm={confirmApprove}
        title="Duyệt đặt phòng"
        description={`Bạn có chắc chắn muốn duyệt đặt phòng của ${booking.userName}?`}
        confirmText="Duyệt"
        cancelText="Hủy"
        variant="default"
      />

      {/* Reject Confirmation Dialog */}
      <ConfirmDialog
        isOpen={rejectConfirmOpen}
        onClose={() => setRejectConfirmOpen(false)}
        onConfirm={confirmReject}
        title="Từ chối đặt phòng"
        description={`Bạn có chắc chắn muốn từ chối đặt phòng của ${booking.userName}? Hành động này không thể hoàn tác.`}
        confirmText="Từ chối"
        cancelText="Hủy"
        variant="destructive"
      />
    </>
  );
};

export default BookingTableRow;

