import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { Payment } from '@/types';

interface PaymentTableRowProps {
  payment: Payment;
  onView?: (paymentId: string) => void;
}

const PaymentTableRow: React.FC<PaymentTableRowProps> = ({ payment, onView }) => {
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

  const getMethodStyle = (method: string) => {
    switch (method) {
      case 'VNPay':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'MOMO':
        return 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400';
      case 'Bank Transfer':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'pending':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      case 'failed':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'refunded':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
      <td className="py-3 px-4 text-gray-600 dark:text-gray-400 text-sm">{payment.id}</td>
      <td className="py-3 px-4">
        <p className="font-medium text-gray-900 dark:text-white">{payment.userName}</p>
      </td>
      <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">${payment.amount.toLocaleString()}</td>
      <td className="py-3 px-4">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMethodStyle(payment.method)}`}>
          {payment.method}
        </span>
      </td>
      <td className="py-3 px-4">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(payment.status)}`}>
          {payment.status}
        </span>
      </td>
      <td className="py-3 px-4 text-gray-600 dark:text-gray-400 text-sm">
        {formatDate(payment.createdAt)}
      </td>
      <td className="py-3 px-4">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => onView?.(payment.id)}
        >
          <Eye className="h-4 w-4" />
        </Button>
      </td>
    </tr>
  );
};

export default PaymentTableRow;

