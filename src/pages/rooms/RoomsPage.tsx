import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Plus } from 'lucide-react';
import { Room } from '@/types';
import { RoomFormData } from '@/lib/validations';
import { PaginationMeta } from '@/types/globalClass';
import RoomFormDialog from './RoomFormDialog';
import RoomCard from './RoomCard';
import Pagination from '@/components/ui/pagination';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import { roomService } from '@/services/roomService';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const RoomsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta>({
    total: 0,
    pageNumber: 1,
    limitNumber: 10,
    totalPages: 1,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<string | null>(null);

  // Fetch rooms on component mount or page changes
  useEffect(() => {
    fetchRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const fetchRooms = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await roomService.getAll({
        page: currentPage,
        limit: 10,
        search: searchTerm || undefined,
      });
      
      setRooms(response.data);
      setPaginationMeta(response.meta);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể tải danh sách phòng';
      setError(errorMessage);
      console.error('Error fetching rooms:', err);
      setRooms([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle form submit from RoomFormDialog
  const handleFormSubmit = async (formData: RoomFormData & { imageFiles?: File[] }) => {
    setError(null);

    try {
      if (editingRoom) {
        // Update existing room
        await roomService.update(editingRoom.id, formData);
      } else {
        // Create new room
        await roomService.create(formData);
      }
      
      // Refresh the list to get updated data with pagination
      await fetchRooms();
      
      setEditingRoom(null);
      setIsDialogOpen(false);
    } catch (error) {
      // Error is already handled in RoomFormDialog
      throw error;
    }
  };

  const handleEditRoom = (room: Room) => {
    setEditingRoom(room);
    setIsDialogOpen(true);
  };

  const handleDeleteRoom = (roomId: string) => {
    setRoomToDelete(roomId);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteRoom = async () => {
    if (!roomToDelete) return;

    try {
      setError(null);
      await roomService.delete(roomToDelete);
      // Refresh the list to get updated data with pagination
      await fetchRooms();
      setDeleteConfirmOpen(false);
      setRoomToDelete(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể xóa phòng';
      setError(errorMessage);
      console.error('Error deleting room:', err);
      setDeleteConfirmOpen(false);
      setRoomToDelete(null);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchRooms();
  };

  // Filter rooms locally by search term (client-side filtering for better UX)
  const filteredRooms = rooms.filter(room =>
    room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.buildingName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading && rooms.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Quản lý phòng</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Quản lý phòng ký túc xá và hình ảnh</p>
        </div>
        <RoomFormDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          room={editingRoom}
          onSubmit={handleFormSubmit}
          triggerButton={
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Thêm phòng
            </Button>
          }
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tìm phòng</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm theo số phòng hoặc tên tòa nhà..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} variant="outline">
              Tìm
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card>
          <CardContent className="pt-6">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => fetchRooms()}
              >
                Thử lại
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {filteredRooms.length === 0 && !isLoading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p className="text-lg font-medium">Chưa có phòng nào</p>
              <p className="text-sm mt-2">Nhấn "Thêm phòng" để bắt đầu</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                onEdit={handleEditRoom}
                onDelete={handleDeleteRoom}
              />
            ))}
          </div>
          {paginationMeta.totalPages > 1 && (
            <Pagination
              currentPage={paginationMeta.pageNumber}
              totalPages={paginationMeta.totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={confirmDeleteRoom}
        title="Xóa phòng"
        description={`Bạn có chắc chắn muốn xóa phòng này? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
        variant="destructive"
      />
    </div>
  );
};

export default RoomsPage;
