import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Payment } from '@/types';
import PaymentTableRow from './PaymentTableRow';

interface PaymentTableProps {
  payments: Payment[];
  onViewPayment?: (paymentId: string) => void;
}

const PaymentTable: React.FC<PaymentTableProps> = ({ payments, onViewPayment }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Giao dịch ({payments.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-semibold">Mã giao dịch</th>
                <th className="text-left py-3 px-4 text-sm font-semibold">Người dùng</th>
                <th className="text-left py-3 px-4 text-sm font-semibold">Số tiền</th>
                <th className="text-left py-3 px-4 text-sm font-semibold">Phương thức</th>
                <th className="text-left py-3 px-4 text-sm font-semibold">Trạng thái</th>
                <th className="text-left py-3 px-4 text-sm font-semibold">Tạo lúc</th>
                <th className="text-left py-3 px-4 text-sm font-semibold">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-gray-500 dark:text-gray-400">
                    Không có giao dịch nào
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <PaymentTableRow
                    key={payment.id}
                    payment={payment}
                    onView={onViewPayment}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentTable;

