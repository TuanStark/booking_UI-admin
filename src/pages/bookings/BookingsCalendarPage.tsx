import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { addMonths, format, startOfMonth } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BookingCalendarMonthGrid } from '@/components/bookings/BookingCalendarMonthGrid';
import { useBookings, useBookingsByRoomId, useRooms } from '@/hooks/queries';
import type { Booking } from '@/types';
import { bookingIntersectsDateRange, parseDateInputLocal } from '@/lib/bookingCalendarGrid';
import { CalendarRange, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

const CALENDAR_FETCH_LIMIT = 500;

type StatusFilter = 'all' | Booking['bookingStatus'];

const BookingsCalendarPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(new Date()));
  const [roomFilter, setRoomFilter] = useState<string | null>(() => searchParams.get('roomId'));
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [quickSearch, setQuickSearch] = useState('');
  const [dateFromStr, setDateFromStr] = useState('');
  const [dateToStr, setDateToStr] = useState('');

  const { rangeFrom, rangeTo, hasDateFilter, dateOrderSwapped } = useMemo(() => {
    const rawA = parseDateInputLocal(dateFromStr);
    const rawB = parseDateInputLocal(dateToStr);
    const swapped = !!(rawA && rawB && rawA.getTime() > rawB.getTime());
    let a = rawA;
    let b = rawB;
    if (swapped) {
      a = rawB;
      b = rawA;
    }
    const has = !!(dateFromStr.trim() || dateToStr.trim());
    return { rangeFrom: a, rangeTo: b, hasDateFilter: has, dateOrderSwapped: swapped };
  }, [dateFromStr, dateToStr]);

  useEffect(() => {
    const id = searchParams.get('roomId');
    setRoomFilter(id || null);
  }, [searchParams]);

  const setRoomAndUrl = useCallback(
    (roomId: string | null) => {
      setRoomFilter(roomId);
      setSearchParams(
        (prev) => {
          const p = new URLSearchParams(prev);
          if (roomId) p.set('roomId', roomId);
          else p.delete('roomId');
          return p;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const listQuery = useBookings(
    {
      page: 1,
      limit: CALENDAR_FETCH_LIMIT,
      ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
    },
    { enabled: !roomFilter }
  );

  const roomQuery = useBookingsByRoomId(roomFilter ?? undefined, { enabled: !!roomFilter });

  const rawBookings: Booking[] = roomFilter ? (roomQuery.data ?? []) : (listQuery.data?.data ?? []);
  const isLoading = roomFilter ? roomQuery.isLoading : listQuery.isLoading;
  const fetchError = roomFilter ? roomQuery.isError : listQuery.isError;

  const bookings = useMemo(() => {
    let list = rawBookings;
    if (statusFilter !== 'all') {
      list = list.filter((b) => b.bookingStatus === statusFilter);
    } else {
      list = list.filter((b) => b.bookingStatus !== 'cancelled');
    }
    const q = quickSearch.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (b) =>
          (b.userName || '').toLowerCase().includes(q) ||
          (b.userEmail || '').toLowerCase().includes(q) ||
          (b.roomNumber || '').toLowerCase().includes(q) ||
          (b.buildingName || '').toLowerCase().includes(q)
      );
    }
    if (hasDateFilter && (rangeFrom || rangeTo)) {
      list = list.filter((b) => bookingIntersectsDateRange(b, rangeFrom, rangeTo));
    }
    return list;
  }, [rawBookings, statusFilter, quickSearch, hasDateFilter, rangeFrom, rangeTo]);

  const totalHint = !roomFilter ? listQuery.data?.meta?.total : undefined;
  const showLimitWarning = !roomFilter && typeof totalHint === 'number' && totalHint > CALENDAR_FETCH_LIMIT;

  const { data: roomsData } = useRooms({ page: 1, limit: 200 });
  const rooms = roomsData?.data ?? [];

  const goPrevMonth = () => setViewMonth((m) => startOfMonth(addMonths(m, -1)));
  const goNextMonth = () => setViewMonth((m) => startOfMonth(addMonths(m, 1)));
  const goThisMonth = () => setViewMonth(startOfMonth(new Date()));

  const clearDateRange = () => {
    setDateFromStr('');
    setDateToStr('');
  };

  const jumpToMonthFromDateFilter = useCallback(() => {
    const anchor = rangeFrom ?? rangeTo;
    if (anchor) setViewMonth(startOfMonth(anchor));
  }, [rangeFrom, rangeTo]);

  const canJumpToDateMonth = !!(rangeFrom || rangeTo);

  const triggerSm = 'h-8 text-xs gap-1';

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-2 rounded-lg border border-border/70 bg-background/80 px-2 py-2 sm:px-2.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="flex items-center gap-0.5 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={goPrevMonth}
              aria-label="Tháng trước"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={goNextMonth}
              aria-label="Tháng sau"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button type="button" variant="secondary" size="sm" className="h-8 px-2 text-xs" onClick={goThisMonth}>
              Tháng này
            </Button>
          </div>

          <div className="hidden sm:block h-5 w-px bg-border shrink-0" aria-hidden />

          <Select value={roomFilter ?? 'all'} onValueChange={(v) => setRoomAndUrl(v === 'all' ? null : v)}>
            <SelectTrigger className={cn('w-[min(100%,11rem)] sm:w-44', triggerSm)}>
              <SelectValue placeholder="Phòng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả phòng</SelectItem>
              {rooms.map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  {r.name}
                  {r.buildingName ? ` · ${r.buildingName}` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
            <SelectTrigger className={cn('w-[min(100%,9.5rem)] sm:w-36', triggerSm)}>
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Mọi trạng thái</SelectItem>
              <SelectItem value="pending">Chờ duyệt</SelectItem>
              <SelectItem value="queued">Đặt trước</SelectItem>
              <SelectItem value="confirmed">Đã xác nhận</SelectItem>
              <SelectItem value="active">Đang thuê</SelectItem>
              <SelectItem value="expiring_soon">Sắp hết hạn</SelectItem>
              <SelectItem value="completed">Hoàn tất</SelectItem>
              <SelectItem value="cancelled">Đã hủy</SelectItem>
            </SelectContent>
          </Select>

          <div className="relative flex-1 min-w-[8rem] max-w-xs">
            <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-8 pl-8 text-xs"
              placeholder="Tìm tên, phòng…"
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value)}
              aria-label="Lọc nhanh"
            />
          </div>

          <details className="group w-full min-[480px]:w-auto min-[480px]:max-w-[20rem]">
            <summary
              className={cn(
                'flex h-8 cursor-pointer list-none items-center justify-center gap-1.5 rounded-md border border-input bg-background px-2.5 text-xs font-medium text-muted-foreground hover:bg-accent/40',
                '[&::-webkit-details-marker]:hidden'
              )}
            >
              <CalendarRange className="h-3.5 w-3.5 shrink-0" />
              <span>Khoảng ngày</span>
              {(dateFromStr || dateToStr) && (
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                  title="Đang lọc khoảng ngày"
                  aria-hidden
                />
              )}
            </summary>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5 border-l-2 border-primary/25 pl-2 py-1 sm:py-0">
              <Input
                id="cal-date-from"
                type="date"
                value={dateFromStr}
                onChange={(e) => setDateFromStr(e.target.value)}
                className="h-8 w-[132px] font-mono text-[11px] sm:text-xs"
                aria-label="Từ ngày"
              />
              <span className="text-[10px] text-muted-foreground">→</span>
              <Input
                id="cal-date-to"
                type="date"
                value={dateToStr}
                onChange={(e) => setDateToStr(e.target.value)}
                className="h-8 w-[132px] font-mono text-[11px] sm:text-xs"
                aria-label="Đến ngày"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-8 px-2 text-xs"
                onClick={jumpToMonthFromDateFilter}
                disabled={!canJumpToDateMonth}
              >
                Tới tháng
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs"
                onClick={clearDateRange}
                disabled={!dateFromStr && !dateToStr}
              >
                Xóa
              </Button>
            </div>
            {hasDateFilter && (rangeFrom || rangeTo) && (
              <p className="mt-1 text-[10px] leading-tight text-muted-foreground">
                <span className="font-medium text-foreground tabular-nums">
                  {rangeFrom ? format(rangeFrom, 'dd/MM/yy') : '…'} — {rangeTo ? format(rangeTo, 'dd/MM/yy') : '…'}
                </span>
                {dateOrderSwapped && (
                  <span className="text-amber-600 dark:text-amber-400"> · đã đổi từ/đến</span>
                )}
              </p>
            )}
          </details>
        </div>

        {(showLimitWarning || fetchError) && (
          <div className="flex flex-wrap gap-x-3 gap-y-1 border-t border-border/50 pt-1.5 text-[11px] leading-snug">
            {showLimitWarning && (
              <p className="text-amber-800 dark:text-amber-200">
                Tối đa {CALENDAR_FETCH_LIMIT} bản ghi/lần; hệ thống ~<strong>{totalHint}</strong> — chọn phòng hoặc tab Danh sách.
              </p>
            )}
            {fetchError && <p className="text-destructive">Không tải được dữ liệu lịch.</p>}
          </div>
        )}
      </div>

      <BookingCalendarMonthGrid viewMonth={viewMonth} bookings={bookings} isLoading={isLoading} />

      <div className="flex flex-col gap-2 rounded-lg border border-border/70 bg-background/80 px-2 py-2 sm:px-2.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="flex items-center gap-0.5 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={goPrevMonth}
              aria-label="Tháng trước"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={goNextMonth}
              aria-label="Tháng sau"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button type="button" variant="secondary" size="sm" className="h-8 px-2 text-xs" onClick={goThisMonth}>
              Tháng này
            </Button>
          </div>

          <div className="hidden sm:block h-5 w-px bg-border shrink-0" aria-hidden />

          <Select value={roomFilter ?? 'all'} onValueChange={(v) => setRoomAndUrl(v === 'all' ? null : v)}>
            <SelectTrigger className={cn('w-[min(100%,11rem)] sm:w-44', triggerSm)}>
              <SelectValue placeholder="Phòng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả phòng</SelectItem>
              {rooms.map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  {r.name}
                  {r.buildingName ? ` · ${r.buildingName}` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
            <SelectTrigger className={cn('w-[min(100%,9.5rem)] sm:w-36', triggerSm)}>
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Mọi trạng thái</SelectItem>
              <SelectItem value="pending">Chờ duyệt</SelectItem>
              <SelectItem value="queued">Đặt trước</SelectItem>
              <SelectItem value="confirmed">Đã xác nhận</SelectItem>
              <SelectItem value="active">Đang thuê</SelectItem>
              <SelectItem value="expiring_soon">Sắp hết hạn</SelectItem>
              <SelectItem value="completed">Hoàn tất</SelectItem>
              <SelectItem value="cancelled">Đã hủy</SelectItem>
            </SelectContent>
          </Select>

          <div className="relative flex-1 min-w-[8rem] max-w-xs">
            <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-8 pl-8 text-xs"
              placeholder="Tìm tên, phòng…"
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value)}
              aria-label="Lọc nhanh"
            />
          </div>

          <details className="group w-full min-[480px]:w-auto min-[480px]:max-w-[20rem]">
            <summary
              className={cn(
                'flex h-8 cursor-pointer list-none items-center justify-center gap-1.5 rounded-md border border-input bg-background px-2.5 text-xs font-medium text-muted-foreground hover:bg-accent/40',
                '[&::-webkit-details-marker]:hidden'
              )}
            >
              <CalendarRange className="h-3.5 w-3.5 shrink-0" />
              <span>Khoảng ngày</span>
              {(dateFromStr || dateToStr) && (
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                  title="Đang lọc khoảng ngày"
                  aria-hidden
                />
              )}
            </summary>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5 border-l-2 border-primary/25 pl-2 py-1 sm:py-0">
              <Input
                id="cal-date-from"
                type="date"
                value={dateFromStr}
                onChange={(e) => setDateFromStr(e.target.value)}
                className="h-8 w-[132px] font-mono text-[11px] sm:text-xs"
                aria-label="Từ ngày"
              />
              <span className="text-[10px] text-muted-foreground">→</span>
              <Input
                id="cal-date-to"
                type="date"
                value={dateToStr}
                onChange={(e) => setDateToStr(e.target.value)}
                className="h-8 w-[132px] font-mono text-[11px] sm:text-xs"
                aria-label="Đến ngày"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-8 px-2 text-xs"
                onClick={jumpToMonthFromDateFilter}
                disabled={!canJumpToDateMonth}
              >
                Tới tháng
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs"
                onClick={clearDateRange}
                disabled={!dateFromStr && !dateToStr}
              >
                Xóa
              </Button>
            </div>
            {hasDateFilter && (rangeFrom || rangeTo) && (
              <p className="mt-1 text-[10px] leading-tight text-muted-foreground">
                <span className="font-medium text-foreground tabular-nums">
                  {rangeFrom ? format(rangeFrom, 'dd/MM/yy') : '…'} — {rangeTo ? format(rangeTo, 'dd/MM/yy') : '…'}
                </span>
                {dateOrderSwapped && (
                  <span className="text-amber-600 dark:text-amber-400"> · đã đổi từ/đến</span>
                )}
              </p>
            )}
          </details>
        </div>

        {(showLimitWarning || fetchError) && (
          <div className="flex flex-wrap gap-x-3 gap-y-1 border-t border-border/50 pt-1.5 text-[11px] leading-snug">
            {showLimitWarning && (
              <p className="text-amber-800 dark:text-amber-200">
                Tối đa {CALENDAR_FETCH_LIMIT} bản ghi/lần; hệ thống ~<strong>{totalHint}</strong> — chọn phòng hoặc tab Danh sách.
              </p>
            )}
            {fetchError && <p className="text-destructive">Không tải được dữ liệu lịch.</p>}
          </div>
        )}
      </div>
      
    </div>
  );
};

export default BookingsCalendarPage;
