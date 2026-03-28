import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Home,
  Users,
  DollarSign,
  Wifi,
  Tv,
  Wind,
  BedDouble,
  Bath,
  Layers,
  Ruler,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
} from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useRoom } from '@/hooks/queries/useRoomsQuery';
import { useBookingsByRoomId } from '@/hooks/queries/useBookingsQuery';
import { RoomRentalSchedule } from '@/components/rooms/RoomRentalSchedule';
import type { BookingLike } from '@/lib/bookingTimeline';
import type { Booking } from '@/types';
import { formatVND } from '@/utils/formatCurrency';
import { format, differenceInDays, isValid } from 'date-fns';

function parseBookingDate(value: unknown): Date | null {
  if (value == null || value === '') return null;
  const d = new Date(value as string | number | Date);
  return isValid(d) ? d : null;
}

function formatBookingDate(value: unknown, pattern = 'dd/MM/yyyy'): string {
  const d = parseBookingDate(value);
  if (!d) return '—';
  try {
    return format(d, pattern);
  } catch {
    return '—';
  }
}

function statusBadgeClass(status: string) {
  switch (status) {
    case 'AVAILABLE':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300';
    case 'BOOKED':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300';
    case 'MAINTENANCE':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300';
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
  }
}

function statusLabel(status: string) {
  switch (status) {
    case 'AVAILABLE':
      return 'Còn trống';
    case 'BOOKED':
      return 'Hết phòng';
    case 'MAINTENANCE':
      return 'Bảo trì';
    default:
      return 'Vô hiệu hóa';
  }
}

const RoomDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: room, isLoading, isError } = useRoom(id);
  const activeBookings = room?.activeBookings || [];
  const { data: bookingsByRoom, isLoading: scheduleQueryLoading, isError: scheduleByRoomError } =
    useBookingsByRoomId(room?.id);

  const scheduleBookings = useMemo((): BookingLike[] => {
    const map = new Map<string, BookingLike>();
    for (const b of activeBookings as Booking[]) {
      if (b?.id) map.set(b.id, b);
    }
    if (!scheduleByRoomError && bookingsByRoom?.length) {
      for (const b of bookingsByRoom) {
        if (b?.id) map.set(b.id, b);
      }
    }
    return Array.from(map.values());
  }, [activeBookings, bookingsByRoom, scheduleByRoomError]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const thumbStripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [id]);

  useEffect(() => {
    const len = room?.images?.filter(Boolean).length ?? 0;
    if (len === 0) return;
    setActiveImageIndex((i) => Math.min(i, len - 1));
  }, [room?.images?.length]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[280px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isError || !room) {
    return (
      <div className="space-y-3 max-w-2xl">
        <Button variant="outline" size="sm" onClick={() => navigate('/rooms')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Danh sách phòng
        </Button>
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Không tìm thấy phòng
          </CardContent>
        </Card>
      </div>
    );
  }

  const getAmenityIcon = (amenity: string) => {
    const lower = amenity.toLowerCase();
    if (lower.includes('wifi')) return <Wifi className="h-3.5 w-3.5 shrink-0" />;
    if (lower.includes('tv') || lower.includes('television'))
      return <Tv className="h-3.5 w-3.5 shrink-0" />;
    if (lower.includes('air') || lower.includes('ac') || lower.includes('conditioning'))
      return <Wind className="h-3.5 w-3.5 shrink-0" />;
    return null;
  };

  const calculateElapsed = (startDate: unknown, endDate: unknown) => {
    const start = parseBookingDate(startDate);
    const end = parseBookingDate(endDate);
    if (!start || !end) return 'Không xác định';

    const now = new Date();
    if (now < start) return 'Chưa nhận phòng';

    const totalDays = differenceInDays(end, start);
    const elapsedDays = differenceInDays(now, start);
    if (now > end) return `Quá hạn ${differenceInDays(now, end)} ngày`;
    return `${elapsedDays}/${totalDays} ngày`;
  };

  const images = room.images?.filter(Boolean) ?? [];
  const displayImage = images[activeImageIndex] ?? images[0];
  const hasMultipleImages = images.length > 1;

  const scrollThumbIntoView = (index: number) => {
    const strip = thumbStripRef.current;
    if (!strip) return;
    const el = strip.children[index] as HTMLElement | undefined;
    el?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  };

  const goPrevImage = () => {
    if (images.length === 0) return;
    const next = (activeImageIndex - 1 + images.length) % images.length;
    setActiveImageIndex(next);
    scrollThumbIntoView(next);
  };

  const goNextImage = () => {
    if (images.length === 0) return;
    const next = (activeImageIndex + 1) % images.length;
    setActiveImageIndex(next);
    scrollThumbIntoView(next);
  };

  const statItems: { label: string; value: React.ReactNode; icon: React.ReactNode }[] = [];

  if (room.squareMeter > 0) {
    statItems.push({
      label: 'Diện tích',
      value: `${room.squareMeter} m²`,
      icon: <Ruler className="h-4 w-4 text-muted-foreground" />,
    });
  }
  if (room.bedCount > 0) {
    statItems.push({
      label: 'Giường',
      value: room.bedCount,
      icon: <BedDouble className="h-4 w-4 text-muted-foreground" />,
    });
  }
  if (room.bathroomCount > 0) {
    statItems.push({
      label: 'WC',
      value: room.bathroomCount,
      icon: <Bath className="h-4 w-4 text-muted-foreground" />,
    });
  }
  if (room.floor > 0) {
    statItems.push({
      label: 'Tầng',
      value: room.floor,
      icon: <Layers className="h-4 w-4 text-muted-foreground" />,
    });
  }
  statItems.push({
    label: 'Giá',
    value: `${formatVND(room.price)}/tháng`,
    icon: <DollarSign className="h-4 w-4 text-muted-foreground" />,
  });
  statItems.push({
    label: 'Đang ở',
    value: (
      <span
        className={
          activeBookings.length >= room.capacity
            ? 'text-destructive font-medium'
            : undefined
        }
      >
        {activeBookings.length}/{room.capacity}
      </span>
    ),
    icon: <Users className="h-4 w-4 text-muted-foreground" />,
  });

  return (
    <div className="space-y-4 pb-6">
      {/* Header: một hàng, không chiếm chiều cao */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-3">
        <div className="flex items-start gap-2 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 h-9 w-9"
            onClick={() => navigate('/rooms')}
            aria-label="Quay lại danh sách"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-xl font-semibold tracking-tight text-foreground truncate">
              {room.name}
            </h1>
            {room.buildingName && (
              <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5 truncate">
                <Home className="h-3.5 w-3.5 shrink-0" />
                {room.buildingName}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadgeClass(room.status)}`}
          >
            {statusLabel(room.status)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Cột chính: ảnh + mô tả + bảng thuê */}
        <div className="xl:col-span-2 space-y-4">
          <Card className="overflow-hidden">
            <CardContent className="p-3 sm:p-4 space-y-3">
              {displayImage ? (
                <>
                  <div className="relative rounded-lg overflow-hidden bg-muted border border-border group">
                    <img
                      src={displayImage}
                      alt={`${room.name} — ảnh ${activeImageIndex + 1}`}
                      className="w-full min-h-[120px] max-h-[min(220px,30vh)] sm:min-h-[160px] sm:max-h-[min(260px,28vh)] object-cover"
                    />
                    {hasMultipleImages && (
                      <>
                        <button
                          type="button"
                          onClick={goPrevImage}
                          className="absolute left-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-background/90 text-foreground shadow border border-border opacity-0 transition-opacity hover:bg-background group-hover:opacity-100 focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          aria-label="Ảnh trước"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                          type="button"
                          onClick={goNextImage}
                          className="absolute right-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-background/90 text-foreground shadow border border-border opacity-0 transition-opacity hover:bg-background group-hover:opacity-100 focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          aria-label="Ảnh sau"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-background/85 px-2 py-0.5 text-xs font-medium text-muted-foreground border border-border/80">
                          {activeImageIndex + 1} / {images.length}
                        </div>
                      </>
                    )}
                  </div>

                  {hasMultipleImages && (
                    <div className="relative">
                      <div
                        ref={thumbStripRef}
                        className="flex gap-2 overflow-x-auto pb-1 pt-0.5 scroll-smooth snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:thin]"
                        style={{ WebkitOverflowScrolling: 'touch' }}
                      >
                        {images.map((img, idx) => (
                          <button
                            key={`${img}-${idx}`}
                            type="button"
                            onClick={() => {
                              setActiveImageIndex(idx);
                              scrollThumbIntoView(idx);
                            }}
                            className={`relative shrink-0 snap-start rounded-md overflow-hidden border-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                              idx === activeImageIndex
                                ? 'border-primary ring-2 ring-primary/20'
                                : 'border-border opacity-80 hover:opacity-100'
                            }`}
                            aria-label={`Xem ảnh ${idx + 1}`}
                            aria-current={idx === activeImageIndex ? 'true' : undefined}
                          >
                            <img
                              src={img}
                              alt=""
                              className="h-16 w-24 sm:h-[72px] sm:w-[108px] object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-3 py-6 px-1 text-sm text-muted-foreground">
                  <Home className="h-8 w-8 opacity-40 shrink-0" />
                  Chưa có ảnh
                </div>
              )}
            </CardContent>
          </Card>

          {room.description && (
            <Card>
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-base font-medium">Mô tả</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-0">
                <p className="text-sm text-muted-foreground leading-relaxed">{room.description}</p>
              </CardContent>
            </Card>
          )}

          <div className="space-y-2">
            <div className="flex justify-end">
              <Button variant="outline" size="sm" asChild>
                <Link
                  to={`/bookings/calendar?roomId=${encodeURIComponent(room.id)}`}
                  className="inline-flex items-center gap-2"
                >
                  <CalendarDays className="h-4 w-4" />
                  Lịch tháng toàn màn hình
                </Link>
              </Button>
            </div>
            <RoomRentalSchedule bookings={scheduleBookings} isLoading={scheduleQueryLoading} />
          </div>

          <Card>
            <CardHeader className="py-3 px-4 border-b">
              <CardTitle className="text-base font-medium">
                Người đang thuê
                <span className="ml-2 text-muted-foreground font-normal">
                  ({activeBookings.length})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {activeBookings.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50 text-left text-xs font-medium text-muted-foreground">
                        <th className="px-3 py-2">Khách</th>
                        <th className="px-3 py-2 hidden sm:table-cell">Hợp đồng</th>
                        <th className="px-3 py-2">Tiến độ</th>
                        <th className="px-3 py-2 text-right w-[100px]">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {activeBookings.map((booking) => (
                        <tr key={booking.id} className="hover:bg-muted/30">
                          <td className="px-3 py-2 align-top">
                            <p className="font-medium leading-tight">{booking.userName || '—'}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {booking.userEmail}
                            </p>
                            <p className="text-xs text-muted-foreground sm:hidden mt-1">
                              {booking.durationMonths != null ? `${booking.durationMonths} tháng · ` : ''}
                              {formatBookingDate(booking.checkInDate)} →{' '}
                              {formatBookingDate(booking.checkOutDate)}
                            </p>
                          </td>
                          <td className="px-3 py-2 align-top hidden sm:table-cell">
                            <div className="text-foreground">
                              {booking.durationMonths != null ? `${booking.durationMonths} tháng` : '—'}
                            </div>
                            <div className="text-xs text-muted-foreground whitespace-nowrap">
                              {formatBookingDate(booking.checkInDate)} →{' '}
                              {formatBookingDate(booking.checkOutDate)}
                            </div>
                          </td>
                          <td className="px-3 py-2 align-top text-xs text-muted-foreground">
                            {calculateElapsed(booking.checkInDate, booking.checkOutDate)}
                          </td>
                          <td className="px-3 py-2 text-right align-top">
                            <span
                              className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${
                                booking.bookingStatus === 'expiring_soon'
                                  ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300'
                                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                              }`}
                            >
                              {booking.bookingStatus === 'expiring_soon'
                                ? 'Sắp hết hạn'
                                : 'Đang thuê'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground px-4 py-6 text-center">
                  Chưa có người thuê
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: thống kê dạng lưới + tiện nghi chip */}
        <div className="space-y-4 xl:sticky xl:top-4 xl:self-start">
          <Card>
            <CardHeader className="py-3 px-4 border-b">
              <CardTitle className="text-base font-medium">Thông tin nhanh</CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <ul className="grid gap-2">
                {statItems.map((row) => (
                  <li
                    key={row.label}
                    className="flex items-center gap-3 rounded-md border border-border/60 bg-muted/20 px-3 py-2 text-sm"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-md bg-background border border-border shrink-0">
                      {row.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground leading-none">{row.label}</p>
                      <p className="font-medium leading-snug mt-0.5 break-words">{row.value}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="py-3 px-4 border-b">
              <CardTitle className="text-base font-medium">Tiện nghi</CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              {room.amenities && room.amenities.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {room.amenities.map((a) => (
                    <span
                      key={a}
                      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1 text-xs font-medium text-foreground"
                    >
                      {getAmenityIcon(a)}
                      {a}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-1">Chưa khai báo</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RoomDetailPage;
