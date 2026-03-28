import React, { useMemo } from 'react';
import { format, isToday } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  buildMonthGrid,
  mapBookingsToGridDays,
  dayPhaseForBooking,
  dayPhaseLabelVi,
  calendarCardSurfaceClass,
  type BookingCalendarInput,
} from '@/lib/bookingCalendarGrid';
import { bookingStatusLabelVi } from '@/lib/bookingTimeline';
import { Loader2 } from 'lucide-react';

const WEEKDAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

export interface BookingCalendarMonthGridProps {
  viewMonth: Date;
  bookings: BookingCalendarInput[];
  isLoading?: boolean;
  className?: string;
}

function shortRange(b: BookingCalendarInput): string {
  try {
    const a = format(new Date(b.checkInDate), 'dd/MM', { locale: vi });
    const c = format(new Date(b.checkOutDate), 'dd/MM', { locale: vi });
    return `${a} → ${c}`;
  } catch {
    return '—';
  }
}

export const BookingCalendarMonthGrid: React.FC<BookingCalendarMonthGridProps> = ({
  viewMonth,
  bookings,
  isLoading = false,
  className,
}) => {
  const grid = useMemo(() => buildMonthGrid(viewMonth, 1), [viewMonth]);
  const byDay = useMemo(() => mapBookingsToGridDays(bookings, grid), [bookings, grid]);

  const monthTitle = format(viewMonth, "MMMM yyyy", { locale: vi });

  return (
    <div className={cn('rounded-xl border border-border bg-card shadow-sm overflow-hidden', className)}>
      <div className="flex items-center justify-between gap-3 border-b border-border bg-muted/30 px-4 py-3">
        <h2 className="text-sm font-semibold capitalize text-foreground tracking-tight">{monthTitle}</h2>
        {isLoading && (
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Đang tải…
          </span>
        )}
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[720px]">
          <div
            className="grid grid-cols-7 border-b border-border bg-muted/40 text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
            role="row"
          >
            {WEEKDAY_LABELS.map((d) => (
              <div key={d} className="px-1 py-2 border-r border-border/60 last:border-r-0" role="columnheader">
                {d}
              </div>
            ))}
          </div>

          {grid.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7 border-b border-border last:border-b-0" role="row">
              {week.map((cell) => {
                const key = format(cell.date, 'yyyy-MM-dd');
                const dayBookings = byDay.get(key) ?? [];
                const muted = !cell.isCurrentMonth;

                return (
                  <div
                    key={key}
                    className={cn(
                      'min-h-[132px] border-r border-border/70 last:border-r-0 flex flex-col',
                      muted && 'bg-muted/20',
                      isToday(cell.date) && 'bg-primary/[0.04] ring-inset ring-1 ring-primary/15'
                    )}
                  >
                    <div
                      className={cn(
                        'flex shrink-0 items-center justify-between px-1.5 py-1 text-[11px] tabular-nums',
                        muted ? 'text-muted-foreground/60' : 'text-muted-foreground',
                        isToday(cell.date) && 'font-semibold text-primary'
                      )}
                    >
                      <span>{format(cell.date, 'd')}</span>
                      {dayBookings.length > 0 && (
                        <span className="rounded-full bg-muted px-1.5 py-px text-[10px] font-medium text-foreground/80">
                          {dayBookings.length}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 overflow-y-auto overflow-x-hidden px-1 pb-1 space-y-1 max-h-[200px] [scrollbar-width:thin]">
                      {dayBookings.map((b) => {
                        const phase = dayPhaseForBooking(b, cell.date);
                        const phaseLabel = phase ? dayPhaseLabelVi(phase) : '';

                        return (
                          <div
                            key={`${b.id}-${key}`}
                            className={cn(
                              'rounded-md border border-border/60 border-l-[3px] px-1.5 py-1 text-[10px] leading-snug shadow-sm transition-colors',
                              calendarCardSurfaceClass(b.bookingStatus)
                            )}
                            title={`${b.userName || 'Khách'} · ${b.roomNumber || 'Phòng'} · ${shortRange(b)} · ${bookingStatusLabelVi(b.bookingStatus)}${phaseLabel ? ` · ${phaseLabel}` : ''}`}
                          >
                            <div className="font-semibold text-foreground/95 truncate">
                              {b.roomNumber || 'Phòng'}
                              {b.buildingName ? (
                                <span className="font-normal text-muted-foreground"> · {b.buildingName}</span>
                              ) : null}
                            </div>
                            <div className="truncate text-foreground/90">{b.userName || '—'}</div>
                            <div className="text-muted-foreground truncate tabular-nums">{shortRange(b)}</div>
                            {phase && phase !== 'stay' && (
                              <div className="mt-0.5 text-[9px] font-medium text-amber-700 dark:text-amber-400">
                                {phaseLabel}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
