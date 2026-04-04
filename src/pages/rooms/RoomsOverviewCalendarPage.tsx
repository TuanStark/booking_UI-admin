import { useCallback, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { addMonths, startOfMonth, endOfMonth, format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RoomOverviewCalendarGrid } from '@/components/bookings/RoomOverviewCalendarGrid';
import { useBuildings } from '@/hooks/queries/useBuildingsQuery';
import { useCalendar } from '@/hooks/queries/useDashboardQuery';
import { useRooms } from '@/hooks/queries/useRoomsQuery';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

const RoomsOverviewCalendarPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(new Date()));
  const [buildingFilter, setBuildingFilter] = useState<string | null>(() => searchParams.get('buildingId'));
  const [roomFilter, setRoomFilter] = useState<string | null>(() => searchParams.get('roomId'));
  const [quickSearch, setQuickSearch] = useState('');
  const debouncedSearch = useDebouncedValue(quickSearch.trim(), 400);

  // Fetch buildings for filter
  const { data: buildingsData } = useBuildings({ limit: 100 });
  const buildings = buildingsData?.data ?? [];

  // Fetch rooms for room dropdown based on selected building
  const { data: roomsData, isLoading: isLoadingRooms } = useRooms({ 
    limit: 1000, 
    buildingId: buildingFilter || undefined 
  });
  const filterRoomsList = roomsData?.data ?? [];

  const setBuildingAndUrl = useCallback(
    (buildingId: string | null) => {
      setBuildingFilter(buildingId);
      setRoomFilter(null); // Clear room filter when building changes
      setSearchParams(
        (prev) => {
          const p = new URLSearchParams(prev);
          if (buildingId) p.set('buildingId', buildingId);
          else p.delete('buildingId');
          p.delete('roomId');
          return p;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

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

  // Use the BFF API to fetch calendar payload
  const { data: calendarData, isLoading: isLoadingCalendar, isError: fetchCalendarError } = useCalendar(
    startOfMonth(viewMonth).toISOString(),
    endOfMonth(viewMonth).toISOString(),
    buildingFilter,
    roomFilter
  );

  const allRooms = calendarData?.rooms ?? [];
  
  // Client-side quick search filtering
  const rooms = useMemo(() => {
    if (!debouncedSearch) return allRooms;
    const lowerSearch = debouncedSearch.toLowerCase();
    return allRooms.filter((r: any) => 
      r.name?.toLowerCase().includes(lowerSearch) || 
      r.roomNumber?.toLowerCase().includes(lowerSearch)
    );
  }, [allRooms, debouncedSearch]);

  const isLoading = isLoadingCalendar;
  const fetchError = fetchCalendarError;

  const goPrevMonth = () => setViewMonth((m) => startOfMonth(addMonths(m, -1)));
  const goNextMonth = () => setViewMonth((m) => startOfMonth(addMonths(m, 1)));
  const goThisMonth = () => setViewMonth(startOfMonth(new Date()));

  const triggerSm = 'h-8 text-xs gap-1';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Sơ đồ Công suất Tòa nhà</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Quản lý và theo dõi tình trạng lấp đầy của các phòng theo từng ngày.
          </p>
        </div>
      </div>

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
            <div className="h-5 w-px bg-border mx-1 shrink-0" aria-hidden />
            <Input 
              type="month" 
              value={format(viewMonth, 'yyyy-MM')} 
              onChange={(e) => {
                if (e.target.value) {
                  const [year, month] = e.target.value.split('-');
                  setViewMonth(new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1));
                }
              }}
              className="h-8 w-36 text-xs cursor-pointer focus-visible:ring-1"
              aria-label="Chọn tháng"
            />
          </div>

          <div className="hidden sm:block h-5 w-px bg-border shrink-0" aria-hidden />

          <Select value={buildingFilter ?? '_all'} onValueChange={(v) => setBuildingAndUrl(v === '_all' ? null : v)}>
            <SelectTrigger className={cn('w-[min(100%,12rem)] sm:w-48', triggerSm)}>
              <SelectValue placeholder="Tất cả Tòa nhà" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all" className="font-semibold text-blue-500">
                Tất cả Tòa nhà
              </SelectItem>
              {buildings.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={roomFilter ?? '_all'} onValueChange={(v) => setRoomAndUrl(v === '_all' ? null : v)} disabled={isLoadingRooms || filterRoomsList.length === 0}>
            <SelectTrigger className={cn('w-[min(100%,12rem)] sm:w-48', triggerSm)}>
              <SelectValue placeholder="Tất cả Phòng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all" className="font-semibold text-blue-500">
                Tất cả Phòng
              </SelectItem>
              {filterRoomsList.map((r: any) => (
               <SelectItem key={r.id} value={r.id}>
                 Phòng {r.name}
               </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative flex-1 min-w-[12rem] max-w-xs">
            <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-8 pl-8 text-xs"
              placeholder="Tìm tên mã phòng..."
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value)}
              aria-label="Lọc nhanh"
            />
          </div>
        </div>

        {fetchError && (
          <div className="flex flex-wrap gap-x-3 gap-y-1 border-t border-border/50 pt-1.5 text-[11px] leading-snug">
            <p className="text-destructive">Không tải được dữ liệu sơ đồ phòng.</p>
          </div>
        )}
      </div>

      <RoomOverviewCalendarGrid
        viewMonth={viewMonth}
        rooms={rooms}
        isLoading={isLoading}
      />
    </div>
  );
};

export default RoomsOverviewCalendarPage;
