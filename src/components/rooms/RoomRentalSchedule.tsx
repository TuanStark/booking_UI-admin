import React, { useMemo } from 'react';
import { format } from 'date-fns';
import { CalendarRange, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  assignLanesAndLayout,
  bookingStatusLabelVi,
  computeTimelineRange,
  monthTicks,
  parseBookingSpans,
  segmentToneClass,
  todayMarkerPercent,
  type BookingLike,
} from '@/lib/bookingTimeline';

const LANE_ROW_PX = 40;
const RULER_H = 28;

function formatSpanRange(startMs: number, endMs: number): string {
  try {
    return `${format(startMs, 'dd/MM/yyyy')} → ${format(endMs, 'dd/MM/yyyy')}`;
  } catch {
    return '—';
  }
}

export interface RoomRentalScheduleProps {
  bookings: BookingLike[];
  /** True while optional API fetch for room bookings is in flight */
  isLoading?: boolean;
}

const LEGEND_ITEMS: { status: string; label: string }[] = [
  { status: 'active', label: 'Đang thuê / đã xác nhận' },
  { status: 'expiring_soon', label: 'Sắp hết hạn' },
  { status: 'pending', label: 'Chờ duyệt / xếp hàng' },
  { status: 'completed', label: 'Đã kết thúc' },
];

export const RoomRentalSchedule: React.FC<RoomRentalScheduleProps> = ({
  bookings,
  isLoading = false,
}) => {
  const { spans, range, segments, laneCount, ticks, todayPct } = useMemo(() => {
    const now = new Date();
    const s = parseBookingSpans(bookings);
    const r = computeTimelineRange(s, now);
    const layout = assignLanesAndLayout(s, r);
    const t = monthTicks(r);
    const tp = todayMarkerPercent(now, r);
    return { spans: s, range: r, ...layout, ticks: t, todayPct: tp };
  }, [bookings]);

  const trackHeight = Math.max(LANE_ROW_PX, laneCount * LANE_ROW_PX);

  return (
    <Card>
      <CardHeader className="py-3 px-4 border-b space-y-1">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <CalendarRange className="h-4 w-4 text-muted-foreground shrink-0" />
            Thời biểu thuê phòng
          </CardTitle>
          {isLoading && (
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Đang tải lịch…
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground font-normal">
          Mỗi thanh là một kỳ ở (nhận phòng → trả phòng). Các kỳ trùng thời gian xếp thành nhiều hàng.
        </p>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 space-y-4">
        <p className="text-xs text-muted-foreground">
          Khung nhìn:{' '}
          <span className="text-foreground font-medium tabular-nums">
            {formatSpanRange(range.startMs, range.endMs)}
          </span>
        </p>

        <div className="overflow-x-auto rounded-lg border border-border bg-muted/15 -mx-0.5 sm:mx-0">
          <div className="min-w-[520px] px-2 pb-2 pt-1">
            {/* Month ruler */}
            <div
              className="relative border-b border-border/80 text-[10px] sm:text-xs text-muted-foreground"
              style={{ height: RULER_H }}
            >
              {ticks.map((tick, i) => (
                <span
                  key={`${tick.label}-${i}`}
                  className="absolute top-0.5 whitespace-nowrap tabular-nums"
                  style={{ left: `${Math.min(99, Math.max(0, tick.percent))}%`, transform: 'translateX(-50%)' }}
                >
                  {tick.label}
                </span>
              ))}
              {ticks.map((tick, i) => (
                <div
                  key={`grid-${tick.label}-${i}`}
                  className="absolute bottom-0 w-px h-2 bg-border/70"
                  style={{ left: `${tick.percent}%` }}
                />
              ))}
            </div>

            {/* Swimlanes */}
            <div
              className="relative mt-1 rounded-md bg-background/80"
              style={{ height: trackHeight }}
              role="region"
              aria-label={`Biểu đồ thời gian, ${spans.length} kỳ thuê`}
            >
              {spans.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground px-4 text-center">
                  Chưa có kỳ thuê hợp lệ để hiển thị (hoặc đều đã hủy).
                </div>
              ) : (
                <>
                  {ticks.map((tick, i) => (
                    <div
                      key={`vline-${i}`}
                      className="absolute top-0 bottom-0 w-px bg-border/40 pointer-events-none"
                      style={{ left: `${tick.percent}%` }}
                    />
                  ))}
                  {todayPct != null && (
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-rose-500/90 z-10 pointer-events-none"
                      style={{ left: `${todayPct}%`, boxShadow: '0 0 0 1px rgba(255,255,255,0.35)' }}
                      title="Hôm nay"
                      aria-hidden
                    />
                  )}
                  {segments.map((seg) => (
                    <div
                      key={seg.id}
                      className={`absolute rounded-md px-1.5 py-0.5 text-[10px] sm:text-xs font-medium leading-tight overflow-hidden text-ellipsis whitespace-nowrap transition-opacity hover:opacity-95 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1 ${segmentToneClass(seg.bookingStatus)}`}
                      style={{
                        left: `${seg.leftPct}%`,
                        width: `${seg.widthPct}%`,
                        top: seg.lane * LANE_ROW_PX + 4,
                        height: LANE_ROW_PX - 8,
                        minWidth: 4,
                      }}
                      title={`${seg.userName} · ${bookingStatusLabelVi(seg.bookingStatus)} · ${formatSpanRange(seg.startMs, seg.endMs)}`}
                    >
                      <span className="block truncate">{seg.userName}</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-2 text-[10px] sm:text-xs text-muted-foreground border-t border-border/60 pt-3">
          {LEGEND_ITEMS.map(({ status, label }) => (
            <span key={status} className="inline-flex items-center gap-1.5">
              <span
                className={`h-2.5 w-2.5 rounded-sm shrink-0 ${segmentToneClass(status)}`}
                aria-hidden
              />
              {label}
            </span>
          ))}
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-0.5 rounded-sm bg-rose-500 shrink-0" aria-hidden />
            Vạch đỏ: hôm nay
          </span>
        </div>

        {spans.length > 0 && (
          <ul className="space-y-1.5 text-xs border-t border-border/60 pt-3">
            <li className="text-muted-foreground font-medium mb-1">Theo thời gian nhận phòng</li>
            {[...spans].map((s) => (
              <li
                key={s.id}
                className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5 rounded-md bg-muted/25 px-2 py-1.5"
              >
                <span className="font-medium text-foreground truncate min-w-0">{s.userName}</span>
                <span className="text-muted-foreground tabular-nums shrink-0">
                  {formatSpanRange(s.startMs, s.endMs)}
                </span>
                <span className="w-full sm:w-auto sm:ml-auto text-[10px] sm:text-xs text-muted-foreground">
                  {bookingStatusLabelVi(s.bookingStatus)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};
