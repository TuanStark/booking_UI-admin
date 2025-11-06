import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home, Users, DollarSign, Calendar, Wifi, Tv, Wind } from 'lucide-react';
import { Room } from '@/types';
import { roomService } from '@/services/roomService';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const RoomDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [room, setRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoom = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        setError(null);
        const roomData = await roomService.getById(id);
        setRoom(roomData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Không thể tải thông tin phòng';
        setError(errorMessage);
        console.error('Error fetching room:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoom();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => navigate('/rooms')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Danh sách phòng
        </Button>
        <Card>
          <CardContent className="py-10 text-center text-gray-600 dark:text-gray-400">
            {error || 'Không tìm thấy phòng'}
          </CardContent>
        </Card>
      </div>
    );
  }

  const getAmenityIcon = (amenity: string) => {
    const lower = amenity.toLowerCase();
    if (lower.includes('wifi')) return <Wifi className="h-4 w-4" />;
    if (lower.includes('tv') || lower.includes('television')) return <Tv className="h-4 w-4" />;
    if (lower.includes('air') || lower.includes('ac') || lower.includes('conditioning')) return <Wind className="h-4 w-4" />;
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/rooms')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Phòng {room.roomNumber}</h1>
            {room.buildingName && (
              <p className="text-gray-600 dark:text-gray-400 mt-1 flex items-center">
                <Home className="h-4 w-4 mr-2" /> {room.buildingName}
              </p>
            )}
          </div>
        </div>
        <span className={`px-4 py-2 rounded-full text-sm font-medium ${room.status === 'available' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
          room.status === 'booked' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
          'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
        }`}>
          {room.status === 'available' ? 'Còn trống' : room.status === 'booked' ? 'Đã đặt' : 'Bảo trì'}
        </span>
      </div>

      {/* Gallery ảnh */}
      <Card>
        <CardContent className="p-0">
          {room.images && room.images.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
              <div className="md:col-span-2">
                <div className="aspect-video w-full overflow-hidden rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-lg">
                  <img src={room.images[0]} alt="room" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                </div>
              </div>
              <div className="grid grid-rows-2 gap-4">
                {(room.images.slice(1, 3).length ? room.images.slice(1, 3) : room.images).map((img, idx) => (
                  <div key={idx} className="aspect-video overflow-hidden rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-shadow">
                    <img src={img} alt={`room-thumb-${idx}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="aspect-video w-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 mx-4 my-4 flex items-center justify-center">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <Home className="h-20 w-20 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">Chưa có ảnh</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Thông tin phòng */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main info card */}
        <Card className="lg:col-span-2">
          <CardHeader className="border-b border-gray-200 dark:border-gray-700">
            <CardTitle className="text-xl">Thông tin chi tiết</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Loại phòng</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{room.type === 'single' ? 'Phòng đơn' : 'Phòng chung'}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/50">
                <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Giá thuê</p>
                  <p className="font-semibold text-gray-900 dark:text-white">${room.price.toLocaleString()}/tháng</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-900/50">
                <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Sức chứa</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{room.capacity} người</p>
                </div>
              </div>

              {room.description && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mô tả</p>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{room.description}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Amenities card */}
        <Card>
          <CardHeader className="border-b border-gray-200 dark:border-gray-700">
            <CardTitle className="text-xl">Tiện nghi</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {room.amenities && room.amenities.length > 0 ? (
              <div className="flex flex-col gap-3">
                {room.amenities.map((a) => (
                  <div key={a} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700">
                    <div className="text-gray-600 dark:text-gray-400">
                      {getAmenityIcon(a)}
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">{a}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                <p className="text-sm text-gray-500 dark:text-gray-400">Chưa có tiện ích nào</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RoomDetailPage;


