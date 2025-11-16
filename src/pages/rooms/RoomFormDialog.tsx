import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, X } from 'lucide-react';
import { Room } from '@/types';
import { RoomFormData } from '@/lib/validations';
import { useFormValidation } from '@/hooks/useFormValidation';
import { roomSchema } from '@/lib/validations';
import ImageUpload from '@/components/ImageUpload';
import { buildingService } from '@/services/buildingService';
import { Building } from '@/types';

interface RoomFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  room?: Room | null;
  onSubmit: (data: RoomFormData & { imageFiles?: File[] }) => Promise<void>;
  triggerButton?: React.ReactNode;
}

const RoomFormDialog: React.FC<RoomFormDialogProps> = ({
  isOpen,
  onOpenChange,
  room,
  onSubmit,
  triggerButton,
}) => {
  const [formData, setFormData] = useState<RoomFormData & { images?: string[] }>({
    name: '',
    capacity: 1,
    price: 0,
    squareMeter: 0,
    bedCount: 1,
    bathroomCount: 1,
    floor: 1,
    countCapacity: 0,
    status: 'AVAILABLE',
    buildingId: '',
    description: '',
    amenities: [],
    images: [],
  });
  // Store File objects separately for FormData submission
  const [imageFiles, setImageFiles] = useState<(File | string | null)[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [isLoadingBuildings, setIsLoadingBuildings] = useState(false);
  
  const { errors, validate, clearErrors, clearFieldError } = useFormValidation(roomSchema);

  // Load buildings for dropdown
  useEffect(() => {
    const loadBuildings = async () => {
      try {
        setIsLoadingBuildings(true);
        const response = await buildingService.getAll();
        setBuildings(response.data);
      } catch (err) {
        console.error('Error loading buildings:', err);
      } finally {
        setIsLoadingBuildings(false);
      }
    };
    loadBuildings();
  }, []);

  // Load room data when editing
  useEffect(() => {
    if (room) {
      const roomImages = room.images || [];
      setFormData({
        name: room.name,
        capacity: room.capacity,
        price: room.price,
        squareMeter: room.squareMeter || 0,
        bedCount: room.bedCount || 1,
        bathroomCount: room.bathroomCount || 1,
        floor: room.floor || 1,
        countCapacity: room.countCapacity || 0,
        status: room.status || 'AVAILABLE',
        buildingId: room.buildingId,
        description: room.description || '',
        amenities: room.amenities || [],
      });
      // For existing rooms, images are URLs (strings)
      setImageFiles(roomImages);
    } else {
      setFormData({
        name: '',
        capacity: 1,
        price: 0,
        squareMeter: 0,
        bedCount: 1,
        bathroomCount: 1,
        floor: 1,
        countCapacity: 0,
        status: 'AVAILABLE',
        buildingId: '',
        description: '',
        amenities: [],
      });
      setImageFiles([]);
    }
    clearErrors();
     
  }, [room]);

  // Sync imageFiles array length with formData.images length
  useEffect(() => {
    const imagesLength = formData.images?.length || 0;
    const filesLength = imageFiles.length;
    
    if (imagesLength !== filesLength) {
      console.log('Syncing imageFiles array:', {
        imagesLength,
        filesLength,
        needSync: imagesLength !== filesLength
      });
      
      const newFiles = [...imageFiles];
      // Extend array if needed
      while (newFiles.length < imagesLength) {
        newFiles.push(null);
      }
      // Trim array if needed
      if (newFiles.length > imagesLength) {
        newFiles.splice(imagesLength);
      }
      setImageFiles(newFiles);
    }
  }, [formData.images?.length]); // Only sync when length changes

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      clearFieldError(name);
    }
  };

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      amenities: checked
        ? [...(prev.amenities || []), amenity]
        : (prev.amenities || []).filter(a => a !== amenity)
    }));
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate(formData)) return;
    
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      
      // Prepare data with File objects instead of preview URLs
      // Filter out null values and keep only File objects
      const filesToUpload = imageFiles.filter((file): file is File => file instanceof File);
      
      console.log('Current imageFiles state:', imageFiles);
      console.log('Filtered files to upload:', filesToUpload);
      
      const submitData = {
        name: formData.name,
        capacity: formData.capacity,
        price: formData.price,
        squareMeter: formData.squareMeter || 0,
        bedCount: formData.bedCount || 1,
        bathroomCount: formData.bathroomCount || 1,
        floor: formData.floor || 1,
        countCapacity: formData.countCapacity || 0,
        status: formData.status || 'AVAILABLE',
        buildingId: formData.buildingId,
        description: formData.description || '',
        amenities: formData.amenities || [],
        imageFiles: filesToUpload,
      };
      
      console.log('Submitting data:', {
        name: submitData.name,
        buildingId: submitData.buildingId,
        imageFilesCount: filesToUpload.length,
        imageFiles: filesToUpload.map(f => ({ name: f.name, size: f.size, type: f.type }))
      });
      
      await onSubmit(submitData);
      
      // Reset form and close dialog on success
      if (!room) {
        setFormData({ 
          name: '', 
          capacity: 1, 
          price: 0, 
          squareMeter: 0,
          bedCount: 1,
          bathroomCount: 1,
          floor: 1,
          countCapacity: 0,
          status: 'AVAILABLE',
          buildingId: '', 
          description: '', 
          amenities: [] 
        });
        setImageFiles([]);
      }
      onOpenChange(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi lưu';
      setSubmitError(errorMessage);
      console.error('Form submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDialogOpenChange = (open: boolean) => {
    onOpenChange(open);
    if (!open) {
      setFormData({ 
        name: '', 
        capacity: 1, 
        price: 0, 
        squareMeter: 0,
        bedCount: 1,
        bathroomCount: 1,
        floor: 1,
        countCapacity: 0,
        status: 'AVAILABLE',
        buildingId: '', 
        description: '', 
        amenities: [] 
      });
      setImageFiles([]);
      clearErrors();
    }
  };

  // Handle image upload for multiple images
  const handleImageSelect = (index: number) => (imageData: string | File) => {
    console.log(`handleImageSelect called for index ${index}:`, {
      type: typeof imageData,
      isFile: imageData instanceof File,
      currentImageFilesLength: imageFiles.length,
      currentImagesLength: formData.images?.length || 0,
      imageData: imageData instanceof File ? { name: imageData.name, size: imageData.size } : imageData
    });
    
    const currentImages = formData.images || [];
    // Ensure imageFiles array is large enough
    let currentFiles = [...imageFiles];
    while (currentFiles.length < currentImages.length) {
      currentFiles.push(null);
    }
    
    if (imageData === '') {
      // Remove image
      const newImages = currentImages.filter((_, i) => i !== index);
      const newFiles = currentFiles.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, images: newImages }));
      setImageFiles(newFiles);
      console.log('Removed image at index', index);
    } else if (typeof imageData === 'string') {
      // String URL (existing image from server)
      const newImages = [...currentImages];
      newImages[index] = imageData;
      const newFiles = [...currentFiles];
      newFiles[index] = imageData; // Keep URL string for existing images
      setFormData(prev => ({ ...prev, images: newImages }));
      setImageFiles(newFiles);
      console.log('Set URL string at index', index, imageData);
    } else {
      // File object - store File for FormData, create preview URL
      const newFiles = [...currentFiles];
      newFiles[index] = imageData; // Store File object
      console.log(`Storing File at index ${index}:`, {
        name: imageData.name,
        size: imageData.size,
        type: imageData.type,
        currentFilesLength: currentFiles.length,
        newFilesLength: newFiles.length,
        updatedFiles: newFiles.map((f, i) => ({
          index: i,
          type: f instanceof File ? 'File' : typeof f,
          name: f instanceof File ? f.name : 'N/A'
        }))
      });
      setImageFiles(newFiles); // Update state immediately
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const previewUrl = e.target?.result as string;
        const newImages = [...currentImages];
        newImages[index] = previewUrl; // Use data URL for preview only
        setFormData(prev => ({ ...prev, images: newImages }));
        console.log('Preview URL set at index', index);
      };
      reader.onerror = () => {
        console.error('FileReader error at index', index);
      };
      reader.readAsDataURL(imageData);
    }
  };

  const handleAddImageSlot = () => {
    const currentImages = formData.images || [];
    const currentFiles = imageFiles.length > 0 ? [...imageFiles] : new Array(currentImages.length).fill(null);
    
    console.log('Adding image slot:', {
      currentImagesLength: currentImages.length,
      currentFilesLength: currentFiles.length,
      currentFiles: currentFiles
    });
    
    setFormData(prev => ({
      ...prev,
      images: [...currentImages, '']
    }));
    setImageFiles([...currentFiles, null]);
  };

  // Handle multiple file selection at once
  const handleMultipleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const currentImages = formData.images || [];
    const currentFiles = [...imageFiles];
    
    // Extend arrays to accommodate new files
    const newImages = [...currentImages];
    const newFiles = [...currentFiles];
    
    const fileArray = Array.from(files).filter(file => file.type.match('image.*'));
    const startIndex = newImages.length;
    
    // Add placeholders for all files first
    fileArray.forEach(() => {
      newImages.push('');
      newFiles.push(null);
    });
    
    // Update state with placeholders first
    setFormData(prev => ({
      ...prev,
      images: newImages
    }));
    setImageFiles(newFiles);
    
    // Then process each file and update preview
    fileArray.forEach((file, fileIndex) => {
      const actualIndex = startIndex + fileIndex;
      newFiles[actualIndex] = file;
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const previewUrl = e.target?.result as string;
        setFormData(prev => {
          const updatedImages = [...(prev.images || [])];
          updatedImages[actualIndex] = previewUrl;
          return { ...prev, images: updatedImages };
        });
      };
      reader.readAsDataURL(file);
    });
    
    // Update files array
    setImageFiles(newFiles);
    
    // Reset input
    e.target.value = '';
  };

  const handleRemoveImageSlot = (index: number) => {
    const currentImages = formData.images || [];
    const newImages = currentImages.filter((_, i) => i !== index);
    const currentFiles = [...imageFiles];
    const newFiles = currentFiles.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, images: newImages }));
    setImageFiles(newFiles);
  };

  const availableAmenities = ['WiFi', 'AC', 'TV', 'Private Bathroom', 'Kitchen', 'Parking', 'Gym', 'Laundry'];

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
      {triggerButton && <DialogTrigger asChild>{triggerButton}</DialogTrigger>}
      <DialogContent className="sm:max-w-[900px] lg:max-w-[1000px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{room ? 'Chỉnh sửa phòng' : 'Thêm phòng mới'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Section 1: Thông tin cơ bản */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">Thông tin cơ bản</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Tên phòng *</Label>
                <Input 
                  id="name" 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={errors.name ? 'border-red-500 focus:border-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="buildingId">Tòa nhà *</Label>
                <select
                  id="buildingId"
                  name="buildingId"
                  value={formData.buildingId}
                  onChange={handleInputChange}
                  className={`h-10 rounded-md border border-input bg-background px-3 py-2 ${errors.buildingId ? 'border-red-500 focus:border-red-500' : ''}`}
                  disabled={isLoadingBuildings}
                >
                  <option value="">Chọn tòa nhà</option>
                  {buildings.map((building) => (
                    <option key={building.id} value={building.id}>
                      {building.name}
                    </option>
                  ))}
                </select>
                {errors.buildingId && (
                  <p className="text-sm text-red-600">{errors.buildingId}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Trạng thái</Label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className={`h-10 rounded-md border border-input bg-background px-3 py-2 ${errors.status ? 'border-red-500 focus:border-red-500' : ''}`}
                >
                  <option value="AVAILABLE">Có sẵn</option>
                  <option value="BOOKED">Đã đặt</option>
                  <option value="MAINTENANCE">Bảo trì</option>
                  <option value="DISABLED">Vô hiệu hóa</option>
                </select>
                {errors.status && (
                  <p className="text-sm text-red-600">{errors.status}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Giá và sức chứa */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">Giá và sức chứa</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">Giá (USD/tháng) *</Label>
                <Input 
                  id="price" 
                  name="price"
                  type="number" 
                  value={formData.price}
                  onChange={handleInputChange}
                  className={errors.price ? 'border-red-500 focus:border-red-500' : ''}
                />
                {errors.price && (
                  <p className="text-sm text-red-600">{errors.price}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="capacity">Sức chứa *</Label>
                <Input 
                  id="capacity" 
                  name="capacity"
                  type="number" 
                  value={formData.capacity}
                  onChange={handleInputChange}
                  className={errors.capacity ? 'border-red-500 focus:border-red-500' : ''}
                />
                {errors.capacity && (
                  <p className="text-sm text-red-600">{errors.capacity}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="countCapacity">Số lượng hiện tại</Label>
                <Input 
                  id="countCapacity" 
                  name="countCapacity"
                  type="number" 
                  value={formData.countCapacity}
                  onChange={handleInputChange}
                  className={errors.countCapacity ? 'border-red-500 focus:border-red-500' : ''}
                />
                {errors.countCapacity && (
                  <p className="text-sm text-red-600">{errors.countCapacity}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Thông tin chi tiết */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">Thông tin chi tiết</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="squareMeter">Diện tích (m²)</Label>
                <Input 
                  id="squareMeter" 
                  name="squareMeter"
                  type="number" 
                  step="0.01"
                  value={formData.squareMeter}
                  onChange={handleInputChange}
                  className={errors.squareMeter ? 'border-red-500 focus:border-red-500' : ''}
                />
                {errors.squareMeter && (
                  <p className="text-sm text-red-600">{errors.squareMeter}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="bedCount">Số giường</Label>
                <Input 
                  id="bedCount" 
                  name="bedCount"
                  type="number" 
                  value={formData.bedCount}
                  onChange={handleInputChange}
                  className={errors.bedCount ? 'border-red-500 focus:border-red-500' : ''}
                />
                {errors.bedCount && (
                  <p className="text-sm text-red-600">{errors.bedCount}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="bathroomCount">Số phòng tắm</Label>
                <Input 
                  id="bathroomCount" 
                  name="bathroomCount"
                  type="number" 
                  value={formData.bathroomCount}
                  onChange={handleInputChange}
                  className={errors.bathroomCount ? 'border-red-500 focus:border-red-500' : ''}
                />
                {errors.bathroomCount && (
                  <p className="text-sm text-red-600">{errors.bathroomCount}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="floor">Tầng</Label>
                <Input 
                  id="floor" 
                  name="floor"
                  type="number" 
                  value={formData.floor}
                  onChange={handleInputChange}
                  className={errors.floor ? 'border-red-500 focus:border-red-500' : ''}
                />
                {errors.floor && (
                  <p className="text-sm text-red-600">{errors.floor}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 4: Mô tả và tiện ích */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">Mô tả và tiện ích</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="description">Mô tả</Label>
                <textarea
                  id="description"
                  name="description"
                  className={`min-h-[100px] px-3 py-2 rounded-md border border-input bg-background resize-none ${errors.description ? 'border-red-500 focus:border-red-500' : ''}`}
                  value={formData.description}
                  onChange={handleInputChange}
                />
                {errors.description && (
                  <p className="text-sm text-red-600">{errors.description}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label>Tiện ích</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900/50">
                  {availableAmenities.map((amenity) => (
                    <div key={amenity} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`amenity-${amenity}`}
                        checked={formData.amenities?.includes(amenity) || false}
                        onChange={(e) => handleAmenityChange(amenity, e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <label htmlFor={`amenity-${amenity}`} className="text-sm cursor-pointer">
                        {amenity}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* Section 5: Ảnh phòng */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Ảnh phòng</h3>
              <div className="flex gap-2">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleMultipleImageSelect}
                  className="hidden"
                  id="multiple-image-input"
                />
                <label htmlFor="multiple-image-input">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    asChild
                  >
                    <span>
                      <Plus className="mr-2 h-4 w-4" />
                      Chọn nhiều ảnh
                    </span>
                  </Button>
                </label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={handleAddImageSlot}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Thêm 1 ảnh
                </Button>
              </div>
            </div>
            {(formData.images && formData.images.length > 0) ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {(formData.images || []).map((image, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-video w-full rounded-lg border-2 border-gray-200 dark:border-gray-700 overflow-hidden bg-gray-50 dark:bg-gray-800">
                      {image ? (
                        <img 
                          src={image} 
                          alt={`Room image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center p-2">
                          <ImageUpload
                            initialImage={undefined}
                            onImageSelect={handleImageSelect(index)}
                            label={`Ảnh ${index + 1}`}
                            className="w-full h-full"
                          />
                        </div>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 bg-white/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                      onClick={() => handleRemoveImageSlot(index)}
                      title="Xóa ảnh"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <p className="text-sm text-gray-500 mb-4">Chưa có ảnh nào. Bạn có thể:</p>
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleMultipleImageSelect}
                    className="hidden"
                    id="multiple-image-input-empty"
                  />
                  <label htmlFor="multiple-image-input-empty">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      asChild
                    >
                      <span>
                        <Plus className="mr-2 h-4 w-4" />
                        Chọn nhiều ảnh
                      </span>
                    </Button>
                  </label>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={handleAddImageSlot}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm 1 ảnh
                  </Button>
                </div>
              </div>
            )}
          </div>
          {submitError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
              <p className="text-sm text-red-600 dark:text-red-400">{submitError}</p>
            </div>
          )}
          <div className="flex justify-end space-x-2 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => handleDialogOpenChange(false)}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Đang lưu...' : 'Lưu'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RoomFormDialog;

