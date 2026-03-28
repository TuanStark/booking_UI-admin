import {
  addMonths,
  eachMonthOfInterval,
  endOfDay,
  format,
  isValid,
  startOfDay,
  startOfMonth,
} from 'date-fns';

/** Minimal shape for timeline math — works with `Booking` or room `activeBookings` items */
export interface BookingLike {
  id: string;
  userName?: string;
  checkInDate: string;
  checkOutDate: string;
  bookingStatus?: string;
}

export interface ParsedBookingSpan {
  id: string;
  userName: string;
  startMs: number;
  endMs: number;
  bookingStatus: string;
}

export interface TimelineRange {
  startMs: number;
  endMs: number;
}

export interface LaneSegment extends ParsedBookingSpan {
  lane: number;
  leftPct: number;
  widthPct: number;
}

function parseStartMs(value: unknown): number | null {
  if (value == null || value === '') return null;
  const d = new Date(value as string);
  return isValid(d) ? startOfDay(d).getTime() : null;
}

function parseEndMs(value: unknown): number | null {
  if (value == null || value === '') return null;
  const d = new Date(value as string);
  return isValid(d) ? endOfDay(d).getTime() : null;
}

export function parseBookingSpans(bookings: BookingLike[]): ParsedBookingSpan[] {
  const out: ParsedBookingSpan[] = [];
  for (const b of bookings) {
    if (!b?.id) continue;
    const st = b.bookingStatus?.toLowerCase?.();
    if (st === 'cancelled') continue;

    const startMs = parseStartMs(b.checkInDate);
    const endMs = parseEndMs(b.checkOutDate);
    if (startMs == null || endMs == null || endMs <= startMs) continue;

    out.push({
      id: b.id,
      userName: (b.userName && b.userName.trim()) || 'Khách',
      startMs,
      endMs,
      bookingStatus: b.bookingStatus || 'unknown',
    });
  }
  return out.sort((a, b) => a.startMs - b.startMs);
}

export function computeTimelineRange(
  spans: ParsedBookingSpan[],
  now: Date,
  opts?: { padPastMonths?: number; padFutureMonths?: number }
): TimelineRange {
  const padPast = opts?.padPastMonths ?? 1;
  const padFuture = opts?.padFutureMonths ?? 3;

  if (spans.length === 0) {
    return {
      startMs: addMonths(now, -padPast).getTime(),
      endMs: addMonths(now, padFuture).getTime(),
    };
  }

  let startMs = spans[0].startMs;
  let endMs = spans[0].endMs;
  for (const s of spans) {
    startMs = Math.min(startMs, s.startMs);
    endMs = Math.max(endMs, s.endMs);
  }

  const padStart = addMonths(new Date(startMs), -padPast).getTime();
  const padEnd = addMonths(new Date(endMs), padFuture).getTime();

  return {
    startMs: Math.min(padStart, addMonths(now, -1).getTime()),
    endMs: Math.max(padEnd, addMonths(now, 2).getTime()),
  };
}

export function barPosition(
  startMs: number,
  endMs: number,
  range: TimelineRange
): { leftPct: number; widthPct: number } {
  const total = range.endMs - range.startMs;
  if (total <= 0) return { leftPct: 0, widthPct: 100 };
  const left = ((startMs - range.startMs) / total) * 100;
  const width = ((endMs - startMs) / total) * 100;
  const clampedLeft = Math.max(0, Math.min(100, left));
  const maxW = 100 - clampedLeft;
  return {
    leftPct: clampedLeft,
    widthPct: Math.max(0.6, Math.min(maxW, width)),
  };
}

export function todayMarkerPercent(now: Date, range: TimelineRange): number | null {
  const nowMs = startOfDay(now).getTime();
  if (nowMs < range.startMs || nowMs > range.endMs) return null;
  const total = range.endMs - range.startMs;
  if (total <= 0) return null;
  return ((nowMs - range.startMs) / total) * 100;
}

/**
 * Pack overlapping stays into horizontal lanes (like a resource Gantt chart).
 */
export function assignLanesAndLayout(
  spans: ParsedBookingSpan[],
  range: TimelineRange
): { segments: LaneSegment[]; laneCount: number } {
  if (spans.length === 0) {
    return { segments: [], laneCount: 1 };
  }

  const sorted = [...spans].sort((a, b) => a.startMs - b.startMs);
  const laneEnds: number[] = [];
  const segments: LaneSegment[] = [];

  for (const span of sorted) {
    let lane = -1;
    for (let i = 0; i < laneEnds.length; i++) {
      if (laneEnds[i] <= span.startMs) {
        lane = i;
        break;
      }
    }
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(span.endMs);
    } else {
      laneEnds[lane] = span.endMs;
    }
    const { leftPct, widthPct } = barPosition(span.startMs, span.endMs, range);
    segments.push({ ...span, lane, leftPct, widthPct });
  }

  return { segments, laneCount: Math.max(1, laneEnds.length) };
}

export function monthTicks(range: TimelineRange): { percent: number; label: string }[] {
  const start = new Date(range.startMs);
  const end = new Date(range.endMs);
  if (!isValid(start) || !isValid(end)) return [];
  const total = range.endMs - range.startMs;
  if (total <= 0) return [];

  const months = eachMonthOfInterval({
    start: startOfMonth(start),
    end: startOfMonth(end),
  });

  return months.map((m) => ({
    percent: ((startOfDay(m).getTime() - range.startMs) / total) * 100,
    label: format(m, 'MM/yyyy'),
  }));
}

export function bookingStatusLabelVi(status: string): string {
  const s = status.toLowerCase();
  switch (s) {
    case 'active':
      return 'Đang thuê';
    case 'confirmed':
      return 'Đã xác nhận';
    case 'expiring_soon':
      return 'Sắp hết hạn';
    case 'pending':
      return 'Chờ duyệt';
    case 'queued':
      return 'Xếp hàng / đặt trước';
    case 'completed':
      return 'Đã kết thúc';
    case 'cancelled':
      return 'Đã hủy';
    default:
      return status || '—';
  }
}

export function segmentToneClass(status: string): string {
  const s = status.toLowerCase();
  switch (s) {
    case 'active':
    case 'confirmed':
      return 'bg-primary text-primary-foreground shadow-sm';
    case 'expiring_soon':
      return 'bg-orange-500 text-white shadow-sm dark:bg-orange-600';
    case 'pending':
    case 'queued':
      return 'bg-sky-600 text-white shadow-sm dark:bg-sky-500';
    case 'completed':
      return 'bg-muted text-muted-foreground border border-border';
    default:
      return 'bg-primary/80 text-primary-foreground';
  }
}
