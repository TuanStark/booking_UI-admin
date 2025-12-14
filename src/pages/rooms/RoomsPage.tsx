import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Plus } from 'lucide-react';
import { Room } from '@/types';
import { RoomFormData } from '@/lib/validations';

import RoomFormDialog from './RoomFormDialog';
import RoomCard from './RoomCard';
import Pagination from '@/components/ui/pagination';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import { useRooms, useCreateRoom, useUpdateRoom, useDeleteRoom } from '@/hooks/queries/useRoomsQuery';
import { useToast } from '@/components/ui/use-toast';


const RoomsPage = () => {

  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [buildingFilter, setBuildingFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<string | null>(null);

  // Mutations
  const createRoomMutation = useCreateRoom();
  const updateRoomMutation = useUpdateRoom();
  const deleteRoomMutation = useDeleteRoom();

  // Use TanStack Query
  const { data: response, isLoading, isError, refetch } = useRooms({
    page: currentPage,
    limit: itemsPerPage,
    search: searchTerm || undefined,
  });

  const rooms = response?.data || [];
  const paginationMeta = response?.meta || {
    total: 0,
    pageNumber: 1,
    limitNumber: itemsPerPage,
    totalPages: 1,
  };

  const filteredRooms = rooms.filter(room => {
    const matchesStatus = statusFilter === 'all' || room.status === statusFilter;
    const matchesBuilding = buildingFilter === 'all' || room.buildingId === buildingFilter;
    return matchesStatus && matchesBuilding;
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFormSubmit = async (formData: RoomFormData & { imageFiles?: File[] }) => {
    try {
      if (editingRoom) {
        await updateRoomMutation.mutateAsync({ id: editingRoom.id, data: formData });
        toast({
          title: "Thành công",
          description: "Đã cập nhật phòng.",
          duration: 3000,
        });
      } else {
        await createRoomMutation.mutateAsync(formData);
        toast({
          title: "Thành công",
          description: "Đã tạo phòng mới.",
          duration: 3000,
        });
      }

      setEditingRoom(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Failed to save room:', error);
      toast({
        title: "Lỗi",
        description: "Không thể lưu thông tin phòng.",
        variant: "destructive",
        duration: 3000,
      }); 
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
      await deleteRoomMutation.mutateAsync(roomToDelete);
      
      await refetch();
      
      toast({
        title: "Thành công",
        description: "Đã xóa phòng.",
      });
      setDeleteConfirmOpen(false);
      setRoomToDelete(null);
    } catch (err: any) {
      console.error('Error deleting room:', err);
      const errorMessage = err?.message || err?.response?.data?.message || 'Không thể xóa phòng';
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });
      setDeleteConfirmOpen(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
  };

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-red-500">Error loading rooms.</p>
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

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
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
        onClose={() => {
          setDeleteConfirmOpen(false);
        }}
        onConfirm={() => {
          confirmDeleteRoom();
        }}
        title="Xóa phòng"
        description={`Bạn có chắc chắn muốn xóa phòng này? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
        variant="destructive"
        isLoading={deleteRoomMutation.isPending}
      />

    </div>
  );
};

export default RoomsPage;
