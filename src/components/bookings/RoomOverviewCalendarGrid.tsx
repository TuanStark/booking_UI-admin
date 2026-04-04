import React, { useMemo, useState, useRef } from 'react';
import { format, isToday, startOfDay } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  buildMonthGrid,
} from '@/lib/bookingCalendarGrid';
import { Room } from '@/types';
import { createPortal } from 'react-dom';
import { Loader2, Users, Calendar as CalendarIcon, User, CheckCircle2, BarChart3, Building } from 'lucide-react';

const WEEKDAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

export interface RoomOverviewCalendarGridProps {
  viewMonth: Date;
  rooms: any[]; // Extended room with nested bookings
  isLoading?: boolean;
  className?: string;
}

export const RoomOverviewCalendarGrid: React.FC<RoomOverviewCalendarGridProps> = ({
  viewMonth,
  rooms,
  isLoading = false,
  className,
}) => {
  const grid = useMemo(() => buildMonthGrid(viewMonth, 1), [viewMonth]);

  const [hoveredCell, setHoveredCell] = useState<{ date: Date; room: Room; activeBookings: any[]; x: number; y: number; direction?: 'up' | 'down' } | null>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnterTooltip = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  };

  const handleMouseLeaveTooltip = () => {
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }
    hideTimeoutRef.current = setTimeout(() => {
      setHoveredCell(null);
    }, 250); // 250ms delay before hiding
  };

  const monthTitle = format(viewMonth, "MMMM yyyy", { locale: vi });

  return (
    <>
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
                <div key={d} className="px-1 py-2 border-r border-border/60 last:border-r-0 font-bold text-black" role="columnheader">
                  {d}
                </div>
              ))}
            </div>

            {grid.map((week, wi) => (
              <div key={wi} className="grid grid-cols-7 border-b border-border last:border-b-0" role="row">
                {week.map((cell) => {
                  const key = format(cell.date, 'yyyy-MM-dd');
                  const muted = !cell.isCurrentMonth;
                  const currentCellDate = startOfDay(cell.date);

                  // Tính toán dữ liệu phòng cho ngày này
                  const roomCards = rooms.map(room => {
                    const validStatuses = ['pending', 'queued', 'confirmed', 'active', 'expiring_soon'];
                    const roomBookings = (room.bookings || []).filter((b: any) => {
                      const status = b.bookingStatus?.toLowerCase() || b.status?.toLowerCase() || '';
                      if (!validStatuses.includes(status)) return false;
                      const checkIn = startOfDay(new Date(b.checkInDate || b.startDate));
                      const checkOut = startOfDay(new Date(b.checkOutDate || b.endDate));
                      return currentCellDate >= checkIn && currentCellDate <= checkOut;
                    });

                    const occupancy = roomBookings.length;
                    const capacity = room.capacity || 0;
                    const isFull = occupancy >= capacity && capacity > 0;
                    const isEmpty = occupancy === 0;

                    let bgClass = 'bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 border-l-slate-400 text-slate-700';
                    let textClass = 'text-slate-600 dark:text-slate-400';

                    if (isFull) {
                      bgClass = 'bg-red-50 dark:bg-red-500/10 border-l-red-500 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20';
                    } else if (isEmpty) {
                      bgClass = 'bg-emerald-50 dark:bg-emerald-500/10 border-l-emerald-500 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20';
                    } else {
                      bgClass = 'bg-amber-50 dark:bg-amber-500/10 border-l-amber-500 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/20';
                    }

                    return { room, roomBookings, occupancy, capacity, isFull, bgClass, textClass };
                  });

                  // Sắp xếp: Tên phòng
                  roomCards.sort((a, b) => a.room.name.localeCompare(b.room.name));

                  return (
                    <div
                      key={key}
                      className={cn(
                        'h-[140px] border-r border-border/70 last:border-r-0 flex flex-col',
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
                      </div>

                      <div className="flex-1 overflow-y-auto overflow-x-hidden px-1 pb-1 space-y-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 hover:[&::-webkit-scrollbar-thumb]:bg-slate-300 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700 dark:hover:[&::-webkit-scrollbar-thumb]:bg-slate-600 [&::-webkit-scrollbar-thumb]:rounded-full [scrollbar-width:thin]">
                        {roomCards.map(({ room, roomBookings, occupancy, capacity, bgClass, textClass }) => (
                          <div
                            key={room.id}
                            onMouseEnter={(e) => {
                              handleMouseEnterTooltip();
                              if (showTimeoutRef.current) {
                                clearTimeout(showTimeoutRef.current);
                              }
                              const rect = e.currentTarget.getBoundingClientRect();
                              showTimeoutRef.current = setTimeout(() => {
                                setHoveredCell({
                                  room,
                                  activeBookings: roomBookings,
                                  date: cell.date,
                                  x: rect.left + rect.width / 2,
                                  y: rect.top,
                                  direction: rect.top < 350 ? 'down' : 'up'
                                });
                              }, 400); // 400ms show delay
                            }}
                            onMouseLeave={handleMouseLeaveTooltip}
                            className={cn(
                              'cursor-default rounded border-l-[3px] px-1.5 py-1 text-[10px] leading-snug shadow-sm transition-colors flex justify-between items-center',
                              bgClass
                            )}
                          >
                            <span className="font-semibold truncate max-w-[60%]">{room.name}</span>
                            <span className={cn("text-[9px] whitespace-nowrap", textClass)}>
                              {occupancy}/{capacity}
                            </span>
                          </div>
                        ))}
                        {rooms.length === 0 && !isLoading && (
                          <div className="text-center text-[10px] text-muted-foreground mt-2">
                            Không có phòng
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {hoveredCell && createPortal(
        <div
          className="fixed z-[9999] pointer-events-none delay-500"
          style={{
            left: hoveredCell.x,
            top: hoveredCell.direction === 'down' ? hoveredCell.y + 24 : hoveredCell.y - 8,
            transform: hoveredCell.direction === 'down' ? 'translate(-50%, 0)' : 'translate(-50%, -100%)'
          }}
        >
          <div
            className="w-[320px] bg-slate-900 border border-slate-700 text-slate-50 shadow-2xl rounded-xl overflow-hidden pointer-events-auto"
            onMouseEnter={handleMouseEnterTooltip}
            onMouseLeave={handleMouseLeaveTooltip}
          >
            {/* Header Section */}
            <div className="p-4 pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                <Building className="w-4 h-4 text-blue-400" />
                {hoveredCell.room.name.includes('Phòng') ? hoveredCell.room.name : `Phòng ${hoveredCell.room.name}`}
              </h3>
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>{format(hoveredCell.date, "EEEE, dd MMMM yyyy", { locale: vi })}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                <Users className="w-3.5 h-3.5" />
                <span>{hoveredCell.activeBookings.length} sinh viên đang thuê</span>
              </div>
            </div>

            {/* Indicators Section */}
            <div className="px-4 py-3 bg-slate-800/50">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-widest mb-3">
                <BarChart3 className="w-3.5 h-3.5" />
                Sức chứa
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">ĐÃ THUÊ / TỐI ĐA</span>
                  <div className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono text-[10px]">
                    {hoveredCell.activeBookings.length} / {hoveredCell.room.capacity || 0}
                  </div>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      (hoveredCell.room.capacity || 0) === 0 ? "bg-slate-600" :
                        hoveredCell.activeBookings.length >= (hoveredCell.room.capacity || 0) ? "bg-red-500" :
                          hoveredCell.activeBookings.length >= (hoveredCell.room.capacity || 0) * 0.8 ? "bg-amber-500" : "bg-emerald-500"
                    )}
                    style={{ width: `${(hoveredCell.room.capacity || 0) > 0 ? Math.min((hoveredCell.activeBookings.length / (hoveredCell.room.capacity || 0)) * 100, 100) : 0}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Bookings List Section */}
            <div className="p-4 pt-3 max-h-[220px] overflow-y-auto [scrollbar-width:thin]">
              {hoveredCell.activeBookings.length === 0 ? (
                <div className="text-center py-4 text-xs text-slate-500 italic">
                  Không có dữ liệu thuê phòng
                </div>
              ) : (
                <div className="space-y-3">
                  {hoveredCell.activeBookings.map(b => (
                    <div key={b.id} className="relative pl-3 border-l-2 border-slate-700">
                      <div className="font-medium text-sm text-slate-200 flex items-center gap-1.5 mb-0.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {b.user?.fullName || b.user?.email || b.userName || 'Không có tên'}
                      </div>
                      <div className="text-[11px] text-slate-400 mb-1 flex items-center gap-1.5">
                        <CalendarIcon className="w-3 h-3 opacity-70" />
                        {b.checkInDate || b.startDate ? format(new Date(b.checkInDate || b.startDate), "dd/MM/yy") : 'N/A'} → {b.checkOutDate || b.endDate ? format(new Date(b.checkOutDate || b.endDate), "dd/MM/yy") : 'N/A'}
                      </div>
                      <div className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">{b.bookingStatus || b.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Vệt mũi tên (Pointer) */}
            {hoveredCell.direction === 'up' ? (
              <>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 border-[8px] border-transparent border-t-slate-700 pointer-events-none" />
                <div className="absolute -bottom-[7px] left-1/2 -translate-x-1/2 border-[8px] border-transparent border-t-slate-900 pointer-events-none" />
              </>
            ) : (
              <>
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 border-[8px] border-transparent border-b-slate-700 pointer-events-none" />
                <div className="absolute -top-[7px] left-1/2 -translate-x-1/2 border-[8px] border-transparent border-b-slate-900 pointer-events-none" />
              </>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
