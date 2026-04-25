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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Building } from '@/types';
import { BuildingFormData } from '@/lib/validations';
import { useFormValidation } from '@/hooks/useFormValidation';
import { buildingSchema } from '@/lib/validations';
import ImageUpload from '@/components/ImageUpload';

interface BuildingFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  building?: Building | null;
  onSubmit: (data: BuildingFormData & { imageFile?: File }) => Promise<void>;
  triggerButton?: React.ReactNode;
}

const BuildingFormDialog: React.FC<BuildingFormDialogProps> = ({
  isOpen,
  onOpenChange,
  building,
  onSubmit,
  triggerButton,
}) => {
  const [formData, setFormData] = useState<BuildingFormData>({
    name: '',
    address: '',
    city: '' as BuildingFormData['city'],
    country: '',
    description: '',
    images: [],
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | undefined>(undefined);

  const { errors, validate, clearErrors, clearFieldError } = useFormValidation(buildingSchema);
  const CITIES = ['Đà Nẵng', 'TP HCM', 'Hà Nội'];

  // Load building data when editing
  useEffect(() => {
    if (building) {
      const existingImage = building.images?.[0] || null;
      setFormData({
        name: building.name,
        address: building.address,
        city: building.city as BuildingFormData['city'],
        country: building.country,
        description: building.description || '',
        images: existingImage ? [existingImage] : [],
      });
      setImagePreview(existingImage);
      setImageFile(undefined);
    } else {
      setFormData({
        name: '',
        address: '',
        city: '' as BuildingFormData['city'],
        country: 'Việt Nam',
        description: '',
        images: [],
      });
      setImagePreview(null);
      setImageFile(undefined);
    }
    clearErrors();
  }, [building]);

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      clearFieldError(name);
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate(formData)) return;

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      // Validate: creating a new building requires a selected image file
      if (!building && !imageFile) {
        setSubmitError('Vui lòng chọn ít nhất một ảnh cho tòa nhà');
        setIsSubmitting(false);
        return;
      }

      const submitData = {
        name: formData.name,
        address: formData.address,
        city: formData.city,
        country: formData.country,
        description: formData.description,
        images: imagePreview ? [imagePreview] : [],
        imageFile,
      };

      await onSubmit(submitData);

      // Reset form and close dialog on success
      if (!building) {
        setFormData({ name: '', address: '', city: '' as BuildingFormData['city'], country: 'Việt Nam', description: '', images: [] });
        setImagePreview(null);
        setImageFile(undefined);
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
      setFormData({ name: '', address: '', city: '' as BuildingFormData['city'], country: 'Việt Nam', description: '', images: [] });
      setImagePreview(null);
      setImageFile(undefined);
      clearErrors();
    }
  };

  const handleImageSelect = (imageData: string | File) => {
    if (imageData === '') {
      setImagePreview(null);
      setImageFile(undefined);
      setFormData(prev => ({ ...prev, images: [] }));
      return;
    }

    if (typeof imageData === 'string') {
      setImagePreview(imageData);
      setImageFile(undefined);
      setFormData(prev => ({ ...prev, images: [imageData] }));
      return;
    }

    const localPreview = URL.createObjectURL(imageData);
    setImagePreview(localPreview);
    setImageFile(imageData);
    setFormData(prev => ({ ...prev, images: [localPreview] }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
      {triggerButton && <DialogTrigger asChild>{triggerButton}</DialogTrigger>}
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{building ? 'Chỉnh sửa tòa nhà' : 'Thêm tòa nhà mới'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Tên tòa nhà</Label>
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
            <Label htmlFor="address">Địa chỉ</Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className={errors.address ? 'border-red-500 focus:border-red-500' : ''}
            />
            {errors.address && (
              <p className="text-sm text-red-600">{errors.address}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="city">Thành phố</Label>
              <Select
                value={formData.city}
                onValueChange={(value) => {
                  setFormData(prev => ({ ...prev, city: value as BuildingFormData['city'] }));
                  if (errors.city) clearFieldError('city');
                }}
              >
                <SelectTrigger className={errors.city ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Chọn thành phố" />
                </SelectTrigger>
                <SelectContent>
                  {CITIES.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.city && (
                <p className="text-sm text-red-600">{errors.city}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="country">Quốc gia</Label>
              <Input
                id="country"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                className={errors.country ? 'border-red-500 focus:border-red-500' : ''}
              />
              {errors.country && (
                <p className="text-sm text-red-600">{errors.country}</p>
              )}
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description || ''}
              onChange={handleInputChange}
              className={errors.description ? 'border-red-500 focus:border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description}</p>
            )}
          </div>
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <Label>Ảnh đại diện tòa nhà</Label>
            </div>
            <div className="space-y-4">
              <ImageUpload
                initialImage={imagePreview || undefined}
                onImageSelect={handleImageSelect}
                label="Ảnh tòa nhà"
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Hệ thống hiện hỗ trợ 1 ảnh đại diện cho mỗi tòa nhà.
              </p>
            </div>
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

export default BuildingFormDialog;

