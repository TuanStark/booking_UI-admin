import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';

interface ImageUploadProps {
  initialImage?: string;
  onImageSelect: (imageData: string | File) => void;
  className?: string;
  label?: string;
  folder?: string;
  maxSize?: number;
  accept?: string;
  disabled?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  initialImage,
  onImageSelect,
  className = '',
  label = 'Tải ảnh lên',
  // folder = 'movieTix',
  maxSize = 3000000,
  accept = 'image/*',
  disabled = false
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialImage || null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update preview when initialImage changes
  useEffect(() => {
    setPreviewUrl(initialImage || null);
  }, [initialImage]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (disabled) return;

    // Validate file type
    if (!file.type.match('image.*')) {
      setError('Vui lòng chọn một tệp hình ảnh');
      return;
    }

    // Validate file size
    if (file.size > maxSize) {
      setError(`Kích thước file không được vượt quá ${(maxSize/1000000).toFixed(1)}MB`);
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      // Create a local preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        setPreviewUrl(imageData);
        setIsUploading(false);
      };
      reader.onerror = () => {
        setError('Có lỗi xảy ra khi đọc file');
        setIsUploading(false);
      };
      reader.readAsDataURL(file);

      // Pass the actual File object to the parent component
      onImageSelect(file);
    } catch (err: any) {
      console.error('File processing error:', err);
      setError(err.message || 'Có lỗi xảy ra khi xử lý file');
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (disabled) return;
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    if (disabled) return;
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (disabled) return;
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleClick = () => {
    if (disabled || isUploading) return;
    fileInputRef.current?.click();
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    if (disabled) return;
    e.stopPropagation();
    setPreviewUrl(null);
    onImageSelect('');  // Send empty string when removing image
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className={className}>
      <div className="block text-sm font-medium mb-2">
        {label}
        {!disabled && <span className="text-red-500 ml-1">*</span>}
      </div>
      
      {previewUrl ? (
        <div className={`relative rounded-lg overflow-hidden group ${disabled ? 'opacity-60' : ''}`}>
          <img 
            src={previewUrl} 
            alt="Preview" 
            className="w-full h-48 object-cover"
          />
          {!disabled && (
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={handleClick}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                title="Thay đổi ảnh"
                disabled={isUploading}
              >
                <Upload size={20} />
              </button>
              <button
                type="button"
                onClick={handleRemoveImage}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                title="Xóa ảnh"
                disabled={isUploading}
              >
                <X size={20} />
              </button>
            </div>
          )}
          {isUploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="text-center text-white">
                <Loader2 size={24} className="animate-spin mx-auto mb-2" />
                <p className="text-sm">Đang xử lý...</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center h-48 transition-colors ${
            disabled 
              ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 cursor-not-allowed opacity-60'
              : isDragging 
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 cursor-pointer' 
                : isUploading
                  ? 'border-blue-400 bg-blue-50/30 dark:bg-blue-900/10 cursor-wait'
                  : error
                    ? 'border-error-400 bg-error-50/30 dark:bg-error-900/10 cursor-pointer'
                    : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          {isUploading ? (
            <>
              <Loader2 size={36} className="text-blue-500 animate-spin mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                Đang xử lý ảnh...
              </p>
            </>
          ) : (
            <>
              <ImageIcon 
                size={36} 
                className={`${
                  disabled 
                    ? 'text-gray-300 dark:text-gray-600'
                    : error 
                      ? 'text-error-400' 
                      : 'text-gray-400 dark:text-gray-500'
                } mb-2`} 
              />
              <p className={`text-sm text-center mb-1 ${
                disabled ? 'text-gray-400 dark:text-gray-500' : 'text-gray-600 dark:text-gray-400'
              }`}>
                {disabled ? 'Upload bị vô hiệu hóa' : (
                  <>
                    Kéo thả ảnh vào đây hoặc{' '}
                    <span className="text-primary-600 dark:text-primary-400 font-medium">
                      chọn từ máy
                    </span>
                  </>
                )}
              </p>
              {!disabled && (
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  PNG, JPG, GIF (tối đa {formatFileSize(maxSize)})
                </p>
              )}
              {error && (
                <p className="text-xs text-error-500 mt-2 text-center">
                  {error}
                </p>
              )}
            </>
          )}
        </div>
      )}
      
      <input
        type="file"
        name="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
        className="hidden"
        disabled={disabled || isUploading}
      />
    </div>
  );
};

export default ImageUpload;