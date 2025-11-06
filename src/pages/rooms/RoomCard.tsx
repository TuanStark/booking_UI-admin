import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Edit, Trash2, Bed, DollarSign, Users as UsersIcon } from 'lucide-react';
import { Room } from '@/types';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import { useNavigate } from 'react-router-dom';

interface RoomCardProps {
  room: Room;
  onEdit: (room: Room) => void;
  onDelete: (roomId: string) => void;
}

const RoomCard: React.FC<RoomCardProps> = ({
  room,
  onEdit,
  onDelete,
}) => {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const navigate = useNavigate();

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation when clicking delete
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    onDelete(room.id);
    setDeleteConfirmOpen(false);
  };

  const hasImages = room.images && room.images.length > 0;
  const firstImage = hasImages ? room.images[0] : null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'booked':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      case 'maintenance':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Còn trống';
      case 'booked':
        return 'Đã đặt';
      case 'maintenance':
        return 'Bảo trì';
      default:
        return status;
    }
  };

  const handleCardClick = () => {
    navigate(`/rooms/${room.id}`);
  };

  return (
    <Card className="overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-blue-300 dark:hover:border-blue-700 group" onClick={handleCardClick}>
      {/* Show first image as cover if available, otherwise show icon */}
      {firstImage ? (
        <div className="relative aspect-video w-full overflow-hidden">
          <img 
            src={firstImage} 
            alt={room.roomNumber}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <CardTitle className="text-white mb-1 text-lg font-bold">Phòng {room.roomNumber}</CardTitle>
            <p className="text-sm text-white/90 line-clamp-1">{room.buildingName}</p>
          </div>
          <div className="absolute top-3 right-3">
            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg backdrop-blur-sm ${getStatusColor(room.status)}`}>
              {getStatusText(room.status)}
            </span>
          </div>
          <div className="absolute top-3 left-3 flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(room);
              }}
              title="Chỉnh sửa phòng"
              className="bg-white/90 hover:bg-white text-gray-900 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              title="Xóa phòng"
              className="bg-white/90 hover:bg-white text-red-600 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="aspect-video w-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center relative border-b border-gray-200 dark:border-gray-700">
          <Bed className="h-20 w-20 text-gray-300 dark:text-gray-700" />
          <div className="absolute top-3 right-3">
            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg ${getStatusColor(room.status)}`}>
              {getStatusText(room.status)}
            </span>
          </div>
        </div>
      )}

      <CardContent className="p-5">
        <div className="mb-4">
          {!firstImage && (
            <>
              <CardTitle className="text-xl mb-1 font-bold">Phòng {room.roomNumber}</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{room.buildingName}</p>
            </>
          )}
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-sm">
              <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
                <UsersIcon className="h-4 w-4" />
                <span className="text-gray-600 dark:text-gray-400">Loại:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{room.type === 'single' ? 'Phòng đơn' : 'Phòng chung'}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-sm">
              <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-gray-600 dark:text-gray-400">Giá:</span>
              <span className="font-semibold text-gray-900 dark:text-white">${room.price.toLocaleString()}/tháng</span>
            </div>
            
            <div className="flex items-center space-x-2 text-sm">
              <UsersIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span className="text-gray-600 dark:text-gray-400">Sức chứa:</span>
              <span className="font-semibold text-gray-900 dark:text-white">{room.capacity} người</span>
            </div>
          </div>
        </div>
        
        {!firstImage && (
          <div className="mt-4 flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                onEdit(room);
              }}
              className="flex-1 hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-900/20 dark:hover:border-blue-700"
            >
              <Edit className="h-4 w-4 mr-1" /> Sửa
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDelete}
              className="flex-1 hover:bg-red-50 hover:border-red-300 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:border-red-700"
            >
              <Trash2 className="h-4 w-4 mr-1" /> Xóa
            </Button>
          </div>
        )}
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Xóa phòng"
        description={`Bạn có chắc chắn muốn xóa phòng "${room.roomNumber}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
        variant="destructive"
      />
    </Card>
  );
};

export default RoomCard;

