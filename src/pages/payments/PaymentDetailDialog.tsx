import type { ReactNode } from 'react';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { usePayment } from '@/hooks/queries/usePaymentsQuery';
import { formatVND } from '@/utils/formatCurrency';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Payment } from '@/types';
import { cn } from '@/lib/utils';
import {
  Calendar,
  Check,
  Copy,
  CreditCard,
  Hash,
  Loader2,
  Mail,
  User,
  Wallet,
} from 'lucide-react';

type Props = {
  paymentId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function formatDateTime(dateString: string) {
  if (!dateString) return '—';
  try {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

function statusBadge(status: Payment['status']) {
  const map: Record<string, string> = {
    completed: 'bg-emerald-100 text-emerald-900 ring-emerald-500/25 dark:bg-emerald-950/50 dark:text-emerald-200',
    pending: 'bg-amber-100 text-amber-900 ring-amber-500/25 dark:bg-amber-950/40 dark:text-amber-200',
    failed: 'bg-rose-100 text-rose-900 ring-rose-500/20 dark:bg-rose-950/50 dark:text-rose-200',
    refunded: 'bg-zinc-200 text-zinc-800 ring-zinc-500/15 dark:bg-zinc-800 dark:text-zinc-200',
  };
  return map[status] ?? map.pending;
}

function CopyIdButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="h-7 shrink-0 gap-1 px-2 text-xs text-muted-foreground"
      onClick={copy}
      title={`Sao chép ${label}`}
    >
      {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? 'Đã chép' : 'Sao chép'}
    </Button>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-1 px-4 py-2.5 sm:grid-cols-[140px_1fr] sm:items-center [&:not(:last-child)]:border-b [&:not(:last-child)]:border-border/50">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
      <div className="text-sm text-foreground break-words">{children}</div>
    </div>
  );
}

export function PaymentDetailDialog({ paymentId, open, onOpenChange }: Props) {
  const { data: payment, isLoading, isError, error, refetch, isFetching } = usePayment(
    paymentId ?? undefined,
    { enabled: open && !!paymentId },
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg gap-0 overflow-hidden p-0 sm:max-w-xl max-h-[min(90vh,720px)]">
        <div className="max-h-[inherit] overflow-y-auto">
          <div className="border-b border-primary/10 bg-gradient-to-br from-primary/10 via-transparent to-muted/20 px-6 pb-4 pt-5">
            <DialogHeader className="space-y-2 text-left">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-md bg-background/80 px-2 py-1 text-xs font-medium text-muted-foreground ring-1 ring-border/60">
                  <Wallet className="h-3.5 w-3.5" />
                  Giao dịch
                </span>
                {payment && (
                  <span
                    className={cn(
                      'inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset',
                      statusBadge(payment.status),
                    )}
                  >
                    {payment.status}
                  </span>
                )}
                {isFetching && payment ? (
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Đang tải
                  </span>
                ) : null}
              </div>
              <DialogTitle className="text-xl font-bold">Chi tiết thanh toán</DialogTitle>
              <DialogDescription>
                Thông tin giao dịch và người dùng (đồng bộ từ auth-service qua gateway).
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="space-y-4 p-4 sm:p-5">
            {!paymentId ? null : isLoading || (isFetching && !payment) ? (
              <div className="flex flex-col items-center justify-center gap-3 py-14">
                <LoadingSpinner size="md" />
                <p className="text-sm text-muted-foreground">Đang tải chi tiết…</p>
              </div>
            ) : isError ? (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                <p className="text-sm text-destructive">
                  {error instanceof Error ? error.message : 'Không tải được giao dịch.'}
                </p>
                <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>
                  Thử lại
                </Button>
              </div>
            ) : payment ? (
              <>
                <Card className="border-border/80 shadow-sm">
                  <CardContent className="p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Số tiền</p>
                    <p className="mt-1 text-2xl font-bold tabular-nums">{formatVND(payment.amount)}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-0">
                    <div className="flex items-center gap-2 border-b border-border/60 bg-muted/30 px-4 py-2.5">
                      <Hash className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-semibold">Giao dịch</span>
                    </div>
                    <Row label="Mã">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <span className="break-all font-mono text-xs">{payment.id}</span>
                        <CopyIdButton value={payment.id} label="mã giao dịch" />
                      </div>
                    </Row>
                    <Row label="Phương thức">
                      <span className="inline-flex items-center gap-2 font-medium">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        {payment.method}
                      </span>
                    </Row>
                    <Row label="Mã tham chiếu">{payment.transactionId || '—'}</Row>
                    <Row label="Booking">
                      <div className="flex items-center justify-between gap-2">
                        <span className="break-all font-mono text-xs">{payment.bookingId || '—'}</span>
                        {payment.bookingId ? (
                          <CopyIdButton value={payment.bookingId} label="booking" />
                        ) : null}
                      </div>
                    </Row>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-0">
                    <div className="flex items-center gap-2 border-b border-border/60 bg-muted/30 px-4 py-2.5">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-semibold">Người thanh toán</span>
                    </div>
                    <Row label="Họ tên">{payment.userName || '—'}</Row>
                    <Row label="Email">
                      {payment.userEmail ? (
                        <span className="inline-flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          {payment.userEmail}
                        </span>
                      ) : (
                        '—'
                      )}
                    </Row>
                    <Row label="Mã sinh viên">{payment.studentId || '—'}</Row>
                    <Row label="User ID">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <span className="break-all font-mono text-xs">{payment.userId || '—'}</span>
                        {payment.userId ? <CopyIdButton value={payment.userId} label="User ID" /> : null}
                      </div>
                    </Row>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-0">
                    <div className="flex items-center gap-2 border-b border-border/60 bg-muted/30 px-4 py-2.5">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-semibold">Thời gian</span>
                    </div>
                    <Row label="Tạo lúc">{formatDateTime(payment.createdAt)}</Row>
                    <Row label="Xử lý">{payment.processedAt ? formatDateTime(payment.processedAt) : '—'}</Row>
                  </CardContent>
                </Card>
              </>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
