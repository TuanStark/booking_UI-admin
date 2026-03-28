import {
  eachDayOfInterval,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isValid,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import type { Booking } from '@/types';

/** Dữ liệu tối thiểu để đặt booking lên ô ngày — giữ tách biệt khỏi UI */
export type BookingCalendarInput = Pick<
  Booking,
  'id' | 'userName' | 'roomNumber' | 'buildingName' | 'checkInDate' | 'checkOutDate' | 'bookingStatus'
>;

export interface CalendarCell {
  date: Date;
  isCurrentMonth: boolean;
}

/** Lưới tháng: tuần bắt đầu Thứ Hai (ISO) */
export function buildMonthGrid(viewMonth: Date, weekStartsOn: 0 | 1 = 1): CalendarCell[][] {
  const monthStart = startOfMonth(viewMonth);
  const monthEnd = endOfMonth(viewMonth);
  const gridStart = startOfWeek(monthStart, { weekStartsOn });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const weeks: CalendarCell[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(
      days.slice(i, i + 7).map((date) => ({
        date,
        isCurrentMonth: isSameMonth(date, viewMonth),
      }))
    );
  }
  return weeks;
}

function bookingTimeBounds(b: BookingCalendarInput): { start: number; end: number } | null {
  if (!b.checkInDate || !b.checkOutDate) return null;
  const s = startOfDay(new Date(b.checkInDate));
  const e = endOfDay(new Date(b.checkOutDate));
  if (!isValid(s) || !isValid(e) || e.getTime() < s.getTime()) return null;
  return { start: s.getTime(), end: e.getTime() };
}

/**
 * Booking có giao với khoảng ngày [from, to] hay không (cận đoạn inclusive theo ngày local).
 * `from` hoặc `to` null = không giới hạn phía đó.
 */
export function bookingIntersectsDateRange(
  b: BookingCalendarInput,
  from: Date | null,
  to: Date | null
): boolean {
  if (!from && !to) return true;
  const bounds = bookingTimeBounds(b);
  if (!bounds) return false;
  const fromMs = from ? startOfDay(from).getTime() : -Infinity;
  const toMs = to ? endOfDay(to).getTime() : Infinity;
  return !(bounds.end < fromMs || bounds.start > toMs);
}

/** Parse chuỗi yyyy-MM-dd từ input[type=date] → startOfDay local, hoặc null */
export function parseDateInputLocal(value: string): Date | null {
  if (!value?.trim()) return null;
  const d = parseISO(value.trim());
  if (!isValid(d)) return null;
  return startOfDay(d);
}

/** Booking có phủ lên ngày `day` (theo lịch local) hay không */
export function bookingTouchesCalendarDay(b: BookingCalendarInput, day: Date): boolean {
  const bounds = bookingTimeBounds(b);
  if (!bounds) return false;
  const d0 = startOfDay(day).getTime();
  const d1 = endOfDay(day).getTime();
  return !(d1 < bounds.start || d0 > bounds.end);
}

const dayKey = (d: Date) => format(d, 'yyyy-MM-dd');

/**
 * Mỗi ngày trong lưới → danh sách booking chạm ngày đó (đã lọc cancelled).
 * Gồm cả ô tháng trước/sau để hiện booking kéo dài qua ranh giới tháng.
 */
export function mapBookingsToGridDays(
  bookings: BookingCalendarInput[],
  grid: CalendarCell[][]
): Map<string, BookingCalendarInput[]> {
  const flat = grid.flat();
  const result = new Map<string, BookingCalendarInput[]>();
  for (const cell of flat) {
    result.set(dayKey(cell.date), []);
  }

  const visible = bookings.filter((b) => bookingTimeBounds(b) != null);

  for (const b of visible) {
    for (const cell of flat) {
      if (!bookingTouchesCalendarDay(b, cell.date)) continue;
      const k = dayKey(cell.date);
      const arr = result.get(k);
      if (arr) arr.push(b);
    }
  }

  for (const [, arr] of result) {
    arr.sort((a, b) => {
      const ta = new Date(a.checkInDate).getTime();
      const tb = new Date(b.checkInDate).getTime();
      if (ta !== tb) return ta - tb;
      return (a.userName || '').localeCompare(b.userName || '', 'vi');
    });
  }

  return result;
}

export type DayPhase = 'check_in' | 'check_out' | 'stay';

/** Gợi ý nhãn theo vai trò của ngày trong kỳ thuê (tư vấn nhanh) */
export function dayPhaseForBooking(b: BookingCalendarInput, day: Date): DayPhase | null {
  const bounds = bookingTimeBounds(b);
  if (!bounds) return null;
  if (!bookingTouchesCalendarDay(b, day)) return null;

  const ci = startOfDay(new Date(b.checkInDate));
  const co = startOfDay(new Date(b.checkOutDate));
  if (!isValid(ci) || !isValid(co)) return 'stay';

  if (isSameDay(day, ci)) return 'check_in';
  if (isSameDay(day, co)) return 'check_out';
  return 'stay';
}

export function dayPhaseLabelVi(phase: DayPhase): string {
  switch (phase) {
    case 'check_in':
      return 'Nhận phòng';
    case 'check_out':
      return 'Trả phòng';
    default:
      return 'Trong kỳ';
  }
}

/** Viền trái + nền nhẹ cho thẻ trong ô lịch */
export function calendarCardSurfaceClass(status: string): string {
  const s = status.toLowerCase();
  switch (s) {
    case 'active':
    case 'confirmed':
      return 'border-l-primary bg-primary/8 dark:bg-primary/15 hover:bg-primary/12';
    case 'expiring_soon':
      return 'border-l-orange-500 bg-orange-50/90 dark:bg-orange-950/35 hover:bg-orange-50 dark:hover:bg-orange-950/45';
    case 'pending':
    case 'queued':
      return 'border-l-sky-600 bg-sky-50/90 dark:bg-sky-950/35 hover:bg-sky-50 dark:hover:bg-sky-950/45';
    case 'completed':
      return 'border-l-muted-foreground bg-muted/50 hover:bg-muted/70';
    case 'cancelled':
      return 'border-l-red-400 bg-red-50/70 dark:bg-red-950/25 opacity-80 hover:opacity-100';
    default:
      return 'border-l-primary/70 bg-muted/30 hover:bg-muted/45';
  }
}
