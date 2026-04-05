import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Trash2, Home } from 'lucide-react';
import { Building } from '@/types';
import { useNavigate } from 'react-router-dom';

interface BuildingCardProps {
  building: Building;
  onEdit: (building: Building) => void;
  onDelete: (buildingId: string) => void;
}

const BuildingCard: React.FC<BuildingCardProps> = ({
  building,
  onEdit,
  onDelete,
}) => {
  const navigate = useNavigate();

  const hasImages = building.images && building.images.length > 0;
  const firstImage = hasImages ? building.images[0] : null;

  const handleOpenDetail = () => {
    navigate(`/buildings/${building.id}`);
  };

  return (
    <Card
      className="overflow-hidden h-[400px] flex flex-col cursor-pointer hover:shadow-md transition-shadow"
      onClick={handleOpenDetail}
    >
      {/* Show first image as cover if available, otherwise show icon */}
      {firstImage ? (
        <div className="relative h-full w-full flex-1 overflow-hidden">
          <img 
            src={firstImage} 
            alt={building.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <CardTitle className="text-white mb-1 text-lg">{building.name}</CardTitle>
            <p className="text-sm text-white/90 line-clamp-2">{building.address}</p>
          </div>
          <div className="absolute top-2 right-2 flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(building);
              }}
              title="Chỉnh sửa tòa nhà"
              className="bg-white/90 hover:bg-white text-gray-900 backdrop-blur-sm"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(building.id);
              }}
              title="Xóa tòa nhà"
              className="bg-white/90 hover:bg-white text-red-600 backdrop-blur-sm"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <>
          <CardHeader className="flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Home className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle>{building.name}</CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{building.address}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(building);
                  }}
                  title="Chỉnh sửa tòa nhà"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(building.id);
                  }}
                  title="Xóa tòa nhà"
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <Home className="h-16 w-16 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Chưa có ảnh nào</p>
            </div>
          </CardContent>
        </>
      )}

    </Card>
  );
};

export default BuildingCard;

