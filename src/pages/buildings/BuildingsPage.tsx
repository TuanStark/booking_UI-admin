import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Plus, Home } from 'lucide-react';
import { Building } from '@/types';
import { BuildingFormData } from '@/lib/validations';

import BuildingFormDialog from './BuildingFormDialog';
import BuildingCard from './BuildingCard';
import Pagination from '@/components/ui/pagination';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import { useBuildings, useCreateBuilding, useUpdateBuilding, useDeleteBuilding } from '@/hooks/queries/useBuildingsQuery';

import { useToast } from '@/components/ui/use-toast';

const BuildingsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [buildingToDelete, setBuildingToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  // Mutations
  const createBuildingMutation = useCreateBuilding();
  const updateBuildingMutation = useUpdateBuilding();
  const deleteBuildingMutation = useDeleteBuilding();

  // Use TanStack Query
  const { data: response, isLoading, isError } = useBuildings({
    page: currentPage,
    limit: 10,
  });

  const buildings = response?.data || [];
  const paginationMeta = response?.meta || {
    total: 0,
    pageNumber: 1,
    limitNumber: 10,
    totalPages: 1,
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle form submit from BuildingFormDialog
  const handleFormSubmit = async (formData: BuildingFormData & { imageFiles?: File[] }) => {
    try {
      if (editingBuilding) {
        await updateBuildingMutation.mutateAsync({ id: editingBuilding.id, data: formData });
        toast({
          title: "Thành công",
          description: "Đã cập nhật tòa nhà.",
        });
      } else {
        await createBuildingMutation.mutateAsync(formData);
        toast({
          title: "Thành công",
          description: "Đã tạo tòa nhà mới.",
        });
      }

      setEditingBuilding(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Failed to save building:', error);
      toast({
        title: "Lỗi",
        description: "Không thể lưu thông tin tòa nhà.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleEditBuilding = (building: Building) => {
    setEditingBuilding(building);
    setIsDialogOpen(true);
  };

  const handleDeleteBuilding = (buildingId: string) => {
    setBuildingToDelete(buildingId);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteBuilding = async () => {
    if (!buildingToDelete) return;

    try {
      await deleteBuildingMutation.mutateAsync(buildingToDelete);
      toast({
        title: "Thành công",
        description: "Đã xóa tòa nhà.",
      });
      setDeleteConfirmOpen(false);
      setBuildingToDelete(null);
    } catch (err) {
      console.error('Error deleting building:', err);
      toast({
        title: "Lỗi",
        description: "Không thể xóa tòa nhà.",
        variant: "destructive",
      });
      setDeleteConfirmOpen(false);
      setBuildingToDelete(null);
    }
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingBuilding(null);
    }
  };

  // Quản lý phòng ở trang Rooms

  const filteredBuildings = Array.isArray(buildings)
    ? buildings.filter(building =>
      building.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      building.address.toLowerCase().includes(searchTerm.toLowerCase())
    )
    : [];

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-red-500">Error loading buildings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Quản lý tòa nhà & phòng</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Quản lý tòa nhà và phòng ký túc xá
          </p>
        </div>
        <BuildingFormDialog
          isOpen={isDialogOpen}
          onOpenChange={handleDialogOpenChange}
          building={editingBuilding}
          onSubmit={handleFormSubmit}
          triggerButton={
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Thêm tòa nhà
            </Button>
          }
        />
      </div>



      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tổng tòa nhà</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{paginationMeta.total}</p>
              </div>
              <Home className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        {/* Thống kê phòng được hiển thị ở trang Rooms */}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tìm tòa nhà</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm theo tên hoặc địa chỉ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : filteredBuildings.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Home className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Chưa có tòa nhà nào</p>
              <p className="text-sm mt-2">Nhấn "Thêm tòa nhà" để bắt đầu</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBuildings.map((building) => (
            <BuildingCard
              key={building.id}
              building={building}
              onEdit={handleEditBuilding}
              onDelete={handleDeleteBuilding}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {paginationMeta.totalPages > 1 && (
        <div className="flex justify-center pt-6">
          <Pagination
            currentPage={paginationMeta.pageNumber}
            totalPages={paginationMeta.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setBuildingToDelete(null);
        }}
        onConfirm={confirmDeleteBuilding}
        title="Xóa tòa nhà"
        description="Bạn có chắc chắn muốn xóa tòa nhà này? Hành động này không thể hoàn tác."
        confirmText="Xóa"
        cancelText="Hủy"
        variant="destructive"
        isLoading={deleteBuildingMutation.isPending}
      />

    </div>
  );
};

export default BuildingsPage;
