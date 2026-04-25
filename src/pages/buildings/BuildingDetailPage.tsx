import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  BedDouble,
  Building2,
  CalendarClock,
  CheckSquare,
  Clock3,
  ClipboardList,
  MapPin,
  Users,
  Wrench,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useBuilding } from '@/hooks/queries/useBuildingsQuery';
import { useRooms, useBulkUpdateRoomStatus } from '@/hooks/queries/useRoomsQuery';
import { useAuditLogs } from '@/hooks/queries/useAuditLogsQuery';
import { formatNumberVi, formatVND } from '@/utils/formatCurrency';
import type { Room } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';

type RoomStatus = Room['status'];

function getDaysSince(dateValue?: string): number {
  if (!dateValue) return 0;
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return 0;
  const diff = Date.now() - parsed.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

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
  const { toast } = useToast();

  const [selectedRoomIds, setSelectedRoomIds] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState<RoomStatus>('MAINTENANCE');

  const { data: building, isLoading: isLoadingBuilding, isError: isBuildingError } = useBuilding(id);
  const {
    data: roomsResponse,
    isLoading: isLoadingRooms,
    refetch: refetchRooms,
  } = useRooms({
    page: 1,
    limit: 200,
    buildingId: id,
  });

  // Fetch recent audit logs for this building (resource + resourceId filter)
  const { data: auditData, isLoading: isLoadingAudit } = useAuditLogs({
    resource: 'building',
    limit: 50,
  });

  const bulkUpdateStatusMutation = useBulkUpdateRoomStatus();

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

  const longVacantRooms = useMemo(() => {
    return rooms.filter((room) => {
      const isAvailable = room.status === 'AVAILABLE';
      const isEmpty = (room.countCapacity ?? 0) === 0;
      const idleDays = getDaysSince(room.updatedAt || room.createdAt);
      return isAvailable && isEmpty && idleDays >= 30;
    });
  }, [rooms]);

  const maintenanceOverdueRooms = useMemo(() => {
    return rooms.filter((room) => {
      if (room.status !== 'MAINTENANCE') return false;
      const maintenanceDays = getDaysSince(room.updatedAt || room.createdAt);
      return maintenanceDays >= 14;
    });
  }, [rooms]);

  const alerts = useMemo(() => {
    const results: Array<{ level: 'warning' | 'critical'; title: string; detail: string }> = [];
    const maintenanceRate = stats.total > 0 ? (stats.maintenance / stats.total) * 100 : 0;
    const disabledRate = stats.total > 0 ? (stats.disabled / stats.total) * 100 : 0;

    if (stats.total >= 5 && stats.occupancyRate < 50) {
      results.push({
        level: 'warning',
        title: 'Tỷ lệ lấp đầy thấp',
        detail: `Lấp đầy hiện tại ${stats.occupancyRate}%, cần rà soát chính sách giá và phân bổ phòng.`,
      });
    }

    if (maintenanceRate >= 20) {
      results.push({
        level: 'critical',
        title: 'Tỷ lệ phòng bảo trì cao',
        detail: `${Math.round(maintenanceRate)}% phòng đang bảo trì, có thể ảnh hưởng khả năng tiếp nhận sinh viên mới.`,
      });
    }

    if (disabledRate >= 15) {
      results.push({
        level: 'warning',
        title: 'Nhiều phòng bị vô hiệu hóa',
        detail: `${Math.round(disabledRate)}% phòng đang ở trạng thái vô hiệu hóa.`,
      });
    }

    if (longVacantRooms.length >= 3) {
      results.push({
        level: 'warning',
        title: 'Nhiều phòng trống kéo dài',
        detail: `${longVacantRooms.length} phòng trống hơn 30 ngày.`,
      });
    }

    if (maintenanceOverdueRooms.length >= 2) {
      results.push({
        level: 'critical',
        title: 'Bảo trì quá hạn',
        detail: `${maintenanceOverdueRooms.length} phòng bảo trì quá 14 ngày, cần xử lý gấp.`,
      });
    }

    return results;
  }, [stats, longVacantRooms.length, maintenanceOverdueRooms.length]);

  const toggleRoomSelection = (roomId: string, checked: boolean) => {
    setSelectedRoomIds((prev) => {
      if (checked) {
        if (prev.includes(roomId)) return prev;
        return [...prev, roomId];
      }
      return prev.filter((idItem) => idItem !== roomId);
    });
  };

  const toggleSelectAll = (checked: boolean) => {
    if (!checked) {
      setSelectedRoomIds([]);
      return;
    }
    setSelectedRoomIds(rooms.map((room) => room.id));
  };

  const handleBulkStatusApply = async () => {
    if (!selectedRoomIds.length) {
      toast({
        title: 'Chưa chọn phòng',
        description: 'Vui lòng chọn ít nhất một phòng để cập nhật trạng thái.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const result = await bulkUpdateStatusMutation.mutateAsync({
        ids: selectedRoomIds,
        status: bulkStatus,
      });

      await refetchRooms();
      setSelectedRoomIds([]);

      toast({
        title: 'Cập nhật trạng thái thành công',
        description: `Đã cập nhật ${result.updated} phòng sang ${getStatusLabel(bulkStatus)}.`,
      });
    } catch {
      toast({
        title: 'Cập nhật thất bại',
        description: 'Không thể cập nhật trạng thái phòng, vui lòng thử lại.',
        variant: 'destructive',
      });
    }
  };

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
            Quản trị theo tòa nhà
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Tổng quan phòng</TabsTrigger>
              <TabsTrigger value="operations">Vận hành</TabsTrigger>
              <TabsTrigger value="audit">Audit Log</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="pt-4">
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
            </TabsContent>

            <TabsContent value="operations" className="pt-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <AlertTriangle className="h-4 w-4" />
                    Cảnh báo ngưỡng vận hành
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {alerts.length === 0 ? (
                    <p className="text-sm text-emerald-700 dark:text-emerald-400">
                      Không có cảnh báo nghiêm trọng. Tòa nhà đang vận hành ổn định.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {alerts.map((alert, idx) => (
                        <div
                          key={`${alert.title}-${idx}`}
                          className={`rounded-md border p-3 ${
                            alert.level === 'critical'
                              ? 'border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-900/10'
                              : 'border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-900/10'
                          }`}
                        >
                          <p className="text-sm font-semibold text-foreground">{alert.title}</p>
                          <p className="text-sm text-muted-foreground mt-1">{alert.detail}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Clock3 className="h-4 w-4" />
                      Phòng trống kéo dài (&gt;= 30 ngày)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {longVacantRooms.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Không có phòng trống kéo dài.</p>
                    ) : (
                      <div className="space-y-2">
                        {longVacantRooms.map((room) => (
                          <div key={room.id} className="rounded-md border border-border p-3">
                            <p className="font-medium text-sm">{room.name}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Trống khoảng {getDaysSince(room.updatedAt || room.createdAt)} ngày
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <CalendarClock className="h-4 w-4" />
                      Bảo trì quá hạn (&gt;= 14 ngày)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {maintenanceOverdueRooms.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Không có phòng bảo trì quá hạn.</p>
                    ) : (
                      <div className="space-y-2">
                        {maintenanceOverdueRooms.map((room) => (
                          <div key={room.id} className="rounded-md border border-border p-3">
                            <p className="font-medium text-sm">{room.name}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Bảo trì {getDaysSince(room.updatedAt || room.createdAt)} ngày
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <CheckSquare className="h-4 w-4" />
                    Bulk Action: Cập nhật trạng thái phòng
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="select-all-rooms"
                        checked={rooms.length > 0 && selectedRoomIds.length === rooms.length}
                        onCheckedChange={(checked) => toggleSelectAll(Boolean(checked))}
                      />
                      <label htmlFor="select-all-rooms" className="text-sm cursor-pointer">
                        Chọn tất cả ({selectedRoomIds.length}/{rooms.length})
                      </label>
                    </div>

                    <Select
                      value={bulkStatus}
                      onValueChange={(value) => setBulkStatus(value as RoomStatus)}
                    >
                      <SelectTrigger className="w-[220px]">
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AVAILABLE">Còn trống</SelectItem>
                        <SelectItem value="BOOKED">Đã đặt</SelectItem>
                        <SelectItem value="MAINTENANCE">Bảo trì</SelectItem>
                        <SelectItem value="DISABLED">Vô hiệu hóa</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      onClick={handleBulkStatusApply}
                      disabled={bulkUpdateStatusMutation.isPending || selectedRoomIds.length === 0}
                    >
                      {bulkUpdateStatusMutation.isPending ? 'Đang cập nhật...' : 'Áp dụng hàng loạt'}
                    </Button>
                  </div>

                  <div className="max-h-[320px] overflow-y-auto rounded-md border border-border">
                    {rooms.length === 0 ? (
                      <p className="text-sm text-muted-foreground p-4">Không có phòng để thao tác.</p>
                    ) : (
                      <div className="divide-y divide-border">
                        {rooms.map((room) => (
                          <div key={room.id} className="flex items-center justify-between gap-3 p-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <Checkbox
                                id={`room-select-${room.id}`}
                                checked={selectedRoomIds.includes(room.id)}
                                onCheckedChange={(checked) => toggleRoomSelection(room.id, Boolean(checked))}
                              />
                              <label htmlFor={`room-select-${room.id}`} className="text-sm font-medium truncate cursor-pointer">
                                {room.name}
                              </label>
                            </div>
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getStatusClass(room.status)}`}>
                              {getStatusLabel(room.status)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="audit" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Lịch sử thao tác quản trị</span>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/audit-logs">
                        <ClipboardList className="h-4 w-4 mr-2" />
                        Xem toàn bộ
                      </Link>
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingAudit ? (
                    <div className="flex items-center justify-center py-6">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                    </div>
                  ) : !auditData?.data?.length ? (
                    <p className="text-sm text-muted-foreground">Chưa có bản ghi audit nào.</p>
                  ) : (
                    <div className="space-y-2">
                      {auditData.data.map((entry) => (
                        <div key={entry.id} className="rounded-md border border-border p-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  entry.action === 'DELETE'
                                    ? 'destructive'
                                    : entry.action === 'CREATE'
                                      ? 'default'
                                      : 'outline'
                                }
                              >
                                {entry.action}
                              </Badge>
                              <span className="text-sm font-medium capitalize">{entry.resource}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(entry.createdAt).toLocaleString('vi-VN')}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1.5">
                            {entry.adminEmail ?? entry.adminId} — {entry.method} {entry.path}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default BuildingDetailPage;
