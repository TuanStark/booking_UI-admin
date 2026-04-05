import React, { useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BedDouble, Building2, MapPin, Users, Wrench } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useBuilding } from '@/hooks/queries/useBuildingsQuery';
import { useRooms } from '@/hooks/queries/useRoomsQuery';
import { formatNumberVi, formatVND } from '@/utils/formatCurrency';
import type { Room } from '@/types';

type RoomStatus = Room['status'];

function getStatusLabel(status: RoomStatus): string {
  switch (status) {
    case 'AVAILABLE':
      return 'Còn trống';
    case 'BOOKED':
      return 'Đã đặt';
    case 'MAINTENANCE':
      return 'Bảo trì';
    case 'DISABLED':
    default:
      return 'Vô hiệu hóa';
  }
}

function getStatusClass(status: RoomStatus): string {
  switch (status) {
    case 'AVAILABLE':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300';
    case 'BOOKED':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300';
    case 'MAINTENANCE':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300';
    case 'DISABLED':
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
  }
}

const BuildingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: building, isLoading: isLoadingBuilding, isError: isBuildingError } = useBuilding(id);
  const { data: roomsResponse, isLoading: isLoadingRooms } = useRooms({
    page: 1,
    limit: 200,
    buildingId: id,
  });

  const rooms = useMemo(() => roomsResponse?.data ?? [], [roomsResponse?.data]);

  const stats = useMemo(() => {
    const total = rooms.length;
    const available = rooms.filter((room) => room.status === 'AVAILABLE').length;
    const booked = rooms.filter((room) => room.status === 'BOOKED').length;
    const maintenance = rooms.filter((room) => room.status === 'MAINTENANCE').length;
    const disabled = rooms.filter((room) => room.status === 'DISABLED').length;

    const totalCapacity = rooms.reduce((sum, room) => sum + (room.capacity || 0), 0);
    const totalPrice = rooms.reduce((sum, room) => sum + (room.price || 0), 0);
    const avgPrice = total > 0 ? Math.round(totalPrice / total) : 0;
    const occupancyRate = total > 0 ? Math.round(((total - available) / total) * 100) : 0;

    return {
      total,
      available,
      booked,
      maintenance,
      disabled,
      totalCapacity,
      avgPrice,
      occupancyRate,
    };
  }, [rooms]);

  if (isLoadingBuilding) {
    return (
      <div className="flex items-center justify-center min-h-[320px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (isBuildingError || !building) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => navigate('/buildings')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại danh sách tòa nhà
        </Button>
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Không tìm thấy tòa nhà hoặc bạn không có quyền truy cập.
          </CardContent>
        </Card>
      </div>
    );
  }

  const coverImage = building.images?.[0];

  return (
    <div className="space-y-6 pb-6">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-3">
        <div className="flex items-start gap-2 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 h-9 w-9"
            onClick={() => navigate('/buildings')}
            aria-label="Quay lại"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground truncate">
              {building.name}
            </h1>
            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5 truncate">
              <MapPin className="h-4 w-4 shrink-0" />
              {building.address}, {building.city}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link to="/buildings">Danh sách tòa nhà</Link>
          </Button>
          <Button asChild>
            <Link to="/rooms">Quản lý phòng</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="overflow-hidden">
            {coverImage ? (
              <img
                src={coverImage}
                alt={building.name}
                className="w-full h-[280px] object-cover"
              />
            ) : (
              <div className="h-[280px] flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center text-muted-foreground">
                  <Building2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  Chưa có ảnh đại diện cho tòa nhà
                </div>
              </div>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Thông tin tòa nhà</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground">Tên tòa nhà</p>
                  <p className="font-medium text-foreground">{building.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Địa chỉ</p>
                  <p className="font-medium text-foreground">{building.address}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Thành phố</p>
                  <p className="font-medium text-foreground">{building.city}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Quốc gia</p>
                  <p className="font-medium text-foreground">{building.country}</p>
                </div>
              </div>
              {building.description ? (
                <div className="pt-1">
                  <p className="text-muted-foreground mb-1">Mô tả</p>
                  <p className="text-foreground leading-relaxed">{building.description}</p>
                </div>
              ) : (
                <p className="text-muted-foreground">Chưa có mô tả cho tòa nhà này.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tổng quan phòng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Tổng số phòng</span>
                <span className="font-semibold">{formatNumberVi(stats.total)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Tổng sức chứa</span>
                <span className="font-semibold">{formatNumberVi(stats.totalCapacity)} người</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Giá trung bình</span>
                <span className="font-semibold">{formatVND(stats.avgPrice)}/tháng</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Tỷ lệ lấp đầy</span>
                <span className="font-semibold">{stats.occupancyRate}%</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Trạng thái phòng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Còn trống</span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400">{stats.available}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Đã đặt</span>
                <span className="font-medium text-orange-600 dark:text-orange-400">{stats.booked}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Bảo trì</span>
                <span className="font-medium text-amber-600 dark:text-amber-400">{stats.maintenance}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Vô hiệu hóa</span>
                <span className="font-medium text-gray-600 dark:text-gray-300">{stats.disabled}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BedDouble className="h-5 w-5" />
            Danh sách phòng thuộc tòa nhà
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingRooms ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-primary" />
            </div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <Wrench className="h-10 w-10 mx-auto mb-2 opacity-50" />
              Chưa có phòng nào trong tòa nhà này.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {rooms.map((room) => (
                <Link key={room.id} to={`/rooms/${room.id}`}>
                  <div className="rounded-lg border border-border p-4 hover:border-primary/50 hover:shadow-sm transition-all h-full">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-foreground line-clamp-1">{room.name}</h3>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getStatusClass(room.status)}`}>
                        {getStatusLabel(room.status)}
                      </span>
                    </div>
                    <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                      <p className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Sức chứa: <span className="text-foreground font-medium">{room.capacity}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Diện tích: <span className="text-foreground font-medium">{room.squareMeter} m²</span>
                      </p>
                      <p>
                        Giá: <span className="text-foreground font-medium">{formatVND(room.price)}/tháng</span>
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BuildingDetailPage;
