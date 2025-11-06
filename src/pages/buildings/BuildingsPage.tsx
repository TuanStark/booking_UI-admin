import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Plus, Home, AlertCircle } from 'lucide-react';
import { Building } from '@/types';
import { BuildingFormData } from '@/lib/validations';
import { PaginationMeta } from '@/types/globalClass';
import BuildingFormDialog from './BuildingFormDialog';
import BuildingCard from './BuildingCard';
import Pagination from '@/components/ui/pagination';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import { buildingService } from '@/services/buildingService';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const BuildingsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null);
  const [buildings, setBuildings] = useState<Building[]>([]);
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
  const [buildingToDelete, setBuildingToDelete] = useState<string | null>(null);

  // Fetch buildings on component mount or page change
  useEffect(() => {
    fetchBuildings(currentPage);
  }, [currentPage]);

  const fetchBuildings = async (page: number = 1) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await buildingService.getAll({ page, limit: 10 });
      
      setBuildings(response.data);
      setPaginationMeta(response.meta);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể tải danh sách tòa nhà';
      setError(errorMessage);
      console.error('Error fetching buildings:', err);
      setBuildings([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle form submit from BuildingFormDialog
  const handleFormSubmit = async (formData: BuildingFormData & { imageFiles?: File[] }) => {
    setError(null);

    try {
      if (editingBuilding) {
        // Update existing building
        const updatedBuilding = await buildingService.update(editingBuilding.id, formData);
        setBuildings(buildings.map(b => 
          b.id === editingBuilding.id ? updatedBuilding : b
        ));
      } else {
        // Create new building
        await buildingService.create(formData);
        // Refresh the list to get updated data with pagination
        await fetchBuildings(currentPage);
      }
      
      setEditingBuilding(null);
      setIsDialogOpen(false);
    } catch (error) {
      // Error is already handled in BuildingFormDialog
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
      setError(null);
      await buildingService.delete(buildingToDelete);
      // Refresh the list to get updated data with pagination
      await fetchBuildings(currentPage);
      setDeleteConfirmOpen(false);
      setBuildingToDelete(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể xóa tòa nhà';
      setError(errorMessage);
      console.error('Error deleting building:', err);
      setDeleteConfirmOpen(false);
      setBuildingToDelete(null);
    }
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingBuilding(null);
      setError(null);
    }
  };

  // Quản lý phòng ở trang Rooms

  const filteredBuildings = Array.isArray(buildings) 
    ? buildings.filter(building =>
        building.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        building.address.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-gray-600 dark:text-gray-400">Đang tải danh sách tòa nhà...</p>
        </div>
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

      {error && (
        <Card className="border-red-500 bg-red-50 dark:bg-red-900/20">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
              <AlertCircle className="h-5 w-5" />
              <p className="font-medium">{error}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fetchBuildings(currentPage)}
                className="ml-auto"
              >
                Thử lại
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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

      {filteredBuildings.length === 0 ? (
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
      />
    </div>
  );
};

export default BuildingsPage;
