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
import { useBooking } from '@/hooks/queries';
import { formatVND } from '@/utils/formatCurrency';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Booking } from '@/types';
import { cn } from '@/lib/utils';
import {
  Building2,
  CalendarRange,
  Check,
  Copy,
  FileText,
  Fingerprint,
  Hash,
  Loader2,
  Mail,
  MapPin,
  User,
  Wallet,
} from 'lucide-react';

type Props = {
  bookingId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function formatDateTime(dateString: string) {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    return d.toLocaleString('vi-VN', {
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

function formatDateOnly(dateString: string) {
  if (!dateString) return '—';
  try {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

function BookingStatusBadge({ status }: { status: Booking['bookingStatus'] }) {
  const colors: Record<string, string> = {
    confirmed: 'bg-blue-100 text-blue-800 ring-blue-500/20 dark:bg-blue-950/50 dark:text-blue-300 dark:ring-blue-400/20',
    pending: 'bg-amber-100 text-amber-900 ring-amber-500/25 dark:bg-amber-950/40 dark:text-amber-200 dark:ring-amber-400/20',
    completed: 'bg-slate-100 text-slate-800 ring-slate-500/15 dark:bg-slate-800/60 dark:text-slate-200 dark:ring-slate-400/15',
    cancelled: 'bg-rose-100 text-rose-800 ring-rose-500/20 dark:bg-rose-950/50 dark:text-rose-200 dark:ring-rose-400/20',
    active: 'bg-emerald-100 text-emerald-900 ring-emerald-500/25 dark:bg-emerald-950/50 dark:text-emerald-200 dark:ring-emerald-400/20',
    expiring_soon:
      'bg-orange-100 text-orange-900 ring-orange-500/25 dark:bg-orange-950/40 dark:text-orange-200 dark:ring-orange-400/20',
    queued: 'bg-purple-100 text-purple-900 ring-purple-500/20 dark:bg-purple-950/50 dark:text-purple-200 dark:ring-purple-400/20',
  };
  const labels: Record<string, string> = {
    confirmed: 'Đã xác nhận',
    pending: 'Chờ duyệt',
    completed: 'Hoàn tất',
    cancelled: 'Đã hủy',
    active: 'Đang thuê',
    expiring_soon: 'Sắp hết hạn',
    queued: 'Đặt trước',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset',
        colors[status] ?? colors.pending
      )}
    >
      {labels[status] ?? status}
    </span>
  );
}

function PaymentStatusBadge({ status }: { status: Booking['paymentStatus'] }) {
  const colors: Record<string, string> = {
    paid: 'bg-green-100 text-green-800 ring-green-500/20 dark:bg-green-950/50 dark:text-green-300 dark:ring-green-400/20',
    pending: 'bg-orange-100 text-orange-900 ring-orange-500/25 dark:bg-orange-950/40 dark:text-orange-200 dark:ring-orange-400/20',
    failed: 'bg-red-100 text-red-800 ring-red-500/20 dark:bg-red-950/50 dark:text-red-200 dark:ring-red-400/20',
    refunded: 'bg-zinc-200 text-zinc-800 ring-zinc-500/15 dark:bg-zinc-800 dark:text-zinc-200 dark:ring-zinc-400/15',
  };
  const labels: Record<string, string> = {
    paid: 'Đã thanh toán',
    pending: 'Chờ thanh toán',
    failed: 'Thất bại',
    refunded: 'Hoàn tiền',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset',
        colors[status] ?? colors.pending
      )}
    >
      {labels[status] ?? status}
    </span>
  );
}

function SectionCard({
  icon: Icon,
  title,
  children,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card
      className={cn(
        'overflow-hidden border-border/80 bg-gradient-to-b from-card to-muted/20 shadow-sm',
        className
      )}
    >
      <div className="flex items-center gap-2 border-b border-border/60 bg-muted/30 px-4 py-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </span>
        <h3 className="text-sm font-semibold tracking-tight text-foreground">{title}</h3>
      </div>
      <CardContent className="p-0">{children}</CardContent>
    </Card>
  );
}

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-0.5 px-4 py-2.5 sm:grid-cols-[minmax(0,140px)_1fr] sm:items-start sm:gap-4 sm:py-3 [&:not(:last-child)]:border-b [&:not(:last-child)]:border-border/50">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground sm:pt-0.5">{label}</dt>
      <dd className="text-sm text-foreground break-words">{children}</dd>
    </div>
  );
}

function CopyIdButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
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
      className="h-7 shrink-0 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground"
      onClick={handleCopy}
      title={`Sao chép ${label}`}
    >
      {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? 'Đã chép' : 'Sao chép'}
    </Button>
  );
}

function IdLine({ id, label }: { id: string; label: string }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
      <span className="break-all font-mono text-[13px] leading-relaxed text-foreground">{id}</span>
      <CopyIdButton value={id} label={label} />
    </div>
  );
}

export function BookingDetailDialog({ bookingId, open, onOpenChange }: Props) {
  const {
    data: booking,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useBooking(bookingId ?? undefined, {
    enabled: open && !!bookingId,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg gap-0 overflow-hidden p-0 sm:max-w-3xl max-h-[min(92vh,800px)] sm:max-h-[90vh]">
        <div className="relative overflow-y-auto max-h-[inherit] px-1 pb-1 sm:px-0 sm:pb-0">
          <div className="relative border-b border-primary/10 bg-gradient-to-br from-primary/12 via-primary/5 to-transparent px-6 pb-5 pt-6 dark:from-primary/20 dark:via-primary/10">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_100%_-20%,hsl(var(--primary)/0.18),transparent)] dark:bg-[radial-gradient(ellipse_80%_60%_at_100%_-20%,hsl(var(--primary)/0.25),transparent)] pointer-events-none" />
            <DialogHeader className="relative space-y-2 text-left">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-background/80 px-2 py-1 text-xs font-medium text-muted-foreground shadow-sm ring-1 ring-border/60 backdrop-blur-sm dark:bg-background/40">
                  <Hash className="h-3.5 w-3.5" />
                  Đặt phòng
                </span>
                {isFetching && booking ? (
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Đang cập nhật
                  </span>
                ) : null}
              </div>
              <DialogTitle className="text-xl font-bold tracking-tight sm:text-2xl">
                Chi tiết đặt phòng
              </DialogTitle>
              <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
                Xem đầy đủ thông tin hợp đồng đặt chỗ, sinh viên và phòng. Dữ liệu được tải mới khi bạn mở cửa sổ này.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="space-y-4 p-4 sm:p-6 sm:pt-5">
            {!bookingId ? null : isLoading || (isFetching && !booking) ? (
              <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border bg-muted/20 py-16">
                <LoadingSpinner size="lg" />
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">Đang tải chi tiết…</p>
                  <p className="mt-1 text-xs text-muted-foreground">Vui lòng đợi trong giây lát</p>
                </div>
              </div>
            ) : isError ? (
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5 shadow-sm">
                <p className="text-sm font-medium text-destructive">
                  {error instanceof Error ? error.message : 'Không tải được chi tiết đặt phòng.'}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Kiểm tra kết nối hoặc thử lại. Nếu lỗi tiếp diễn, liên hệ quản trị hệ thống.
                </p>
                <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => refetch()}>
                  Thử lại
                </Button>
              </div>
            ) : booking ? (
              <>
                <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-muted/30 shadow-md ring-1 ring-primary/10">
                  <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Tổng giá trị
                      </p>
                      <p className="text-3xl font-bold tabular-nums tracking-tight text-foreground sm:text-4xl">
                        {formatVND(booking.totalAmount)}
                      </p>
                      <p className="text-xs text-muted-foreground">Theo hợp đồng / chi tiết phòng trên hệ thống</p>
                    </div>
                    <div className="flex flex-wrap gap-2 sm:flex-col sm:items-end">
                      <BookingStatusBadge status={booking.bookingStatus} />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/80 shadow-sm">
                  <CardContent className="space-y-3 p-4 sm:p-5">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Fingerprint className="h-4 w-4 shrink-0" />
                      <span className="text-xs font-semibold uppercase tracking-wide">Định danh</span>
                    </div>
                    <div className="space-y-3 rounded-lg bg-muted/40 p-3 ring-1 ring-border/50">
                      <div>
                        <p className="mb-1 text-xs font-medium text-muted-foreground">Mã đặt</p>
                        <IdLine id={booking.id} label="mã đặt" />
                      </div>
                      <div className="border-t border-border/50 pt-3">
                        <p className="mb-1 text-xs font-medium text-muted-foreground">Ngày tạo</p>
                        <p className="text-sm font-medium text-foreground">{formatDateTime(booking.createdAt)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid gap-4 lg:grid-cols-2">
                  <SectionCard icon={User} title="Sinh viên">
                    <DetailRow label="Họ tên">{booking.userName || '—'}</DetailRow>
                    <DetailRow label="Email">
                      {booking.userEmail ? (
                        <span className="inline-flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          {booking.userEmail}
                        </span>
                      ) : (
                        '—'
                      )}
                    </DetailRow>
                    <DetailRow label="Mã sinh viên">
                      {booking.studentId ? (
                        <IdLine id={booking.studentId} label="mã sinh viên" />
                      ) : (
                        '—'
                      )}
                    </DetailRow>
                  </SectionCard>

                  <SectionCard icon={Building2} title="Phòng & khu nhà">
                    <DetailRow label="Phòng">
                      <span className="inline-flex items-center gap-2 font-medium">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        {booking.roomNumber || '—'}
                      </span>
                    </DetailRow>
                    <DetailRow label="Tòa / khu">{booking.buildingName || '—'}</DetailRow>
                   
                  </SectionCard>
                </div>

                <SectionCard icon={CalendarRange} title="Thời hạn thuê">
                  <div className="grid gap-0 sm:grid-cols-2">
                    <div className="border-b border-border/50 p-4 sm:border-b-0 sm:border-r">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Nhận phòng</p>
                      <p className="mt-2 text-lg font-semibold text-foreground">
                        {formatDateOnly(booking.checkInDate)}
                      </p>
                    </div>
                    <div className="p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Trả phòng</p>
                      <p className="mt-2 text-lg font-semibold text-foreground">
                        {formatDateOnly(booking.checkOutDate)}
                      </p>
                    </div>
                  </div>
                  <div className="border-t border-border/50 px-4 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-medium text-muted-foreground">Đặt cọc</span>
                      <span className="rounded-md bg-muted px-2.5 py-1 text-sm font-semibold tabular-nums">
                        {booking.durationMonths != null ? `${booking.durationMonths} tháng` : '—'}
                      </span>
                    </div>
                  </div>
                </SectionCard>

                <SectionCard icon={Wallet} title="Thanh toán & trạng thái">
                  <DetailRow label="Tổng tiền">
                    <span className="font-semibold tabular-nums text-foreground">{formatVND(booking.totalAmount)}</span>
                  </DetailRow>
                  <DetailRow label="Thanh toán">
                    <PaymentStatusBadge status={booking.paymentStatus} />
                  </DetailRow>
                  <DetailRow label="Đặt phòng">
                    <BookingStatusBadge status={booking.bookingStatus} />
                  </DetailRow>
                </SectionCard>

                {booking.notes ? (
                  <SectionCard icon={FileText} title="Ghi chú">
                    <div className="px-4 py-4">
                      <p className="whitespace-pre-wrap rounded-lg bg-muted/50 p-4 text-sm leading-relaxed text-foreground ring-1 ring-border/40">
                        {booking.notes}
                      </p>
                    </div>
                  </SectionCard>
                ) : null}
              </>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
