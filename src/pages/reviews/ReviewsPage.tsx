import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Star, Eye, EyeOff, MessageSquare, Trash2, Loader2, Filter } from 'lucide-react';
import { Review } from '@/types';
import { reviewService } from '@/services/reviewService';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import ConfirmDialog from '@/components/ui/confirm-dialog';

const ReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'VISIBLE' | 'HIDDEN' | 'DELETED'>('ALL');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });

  // Delete confirmation state
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { toast } = useToast();

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewService.getAll({
        page: pagination.page,
        limit: pagination.limit,
        status: selectedStatus,
        search: searchTerm,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });

      setReviews(response.data);
      setPagination(prev => ({
        ...prev,
        total: response.meta.total,
        totalPages: response.meta.totalPages
      }));
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Không thể tải danh sách đánh giá',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      fetchReviews();
    }, 500);
    return () => clearTimeout(timer);
  }, [pagination.page, selectedStatus, searchTerm]);

  const handleToggleVisibility = async (review: Review) => {
    try {
      const newStatus = review.status === 'VISIBLE' ? 'HIDDEN' : 'VISIBLE';
      await reviewService.update(review.id, { status: newStatus });

      setReviews(reviews.map(r =>
        r.id === review.id ? { ...r, status: newStatus } : r
      ));

      toast({
        title: 'Thành công',
        description: `Đã ${newStatus === 'VISIBLE' ? 'hiện' : 'ẩn'} đánh giá`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Không thể cập nhật trạng thái',
      });
    }
  };

  const confirmDelete = (reviewId: string) => {
    setDeleteId(reviewId);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await reviewService.delete(deleteId);
      setReviews(reviews.filter(r => r.id !== deleteId));
      toast({
        title: 'Thành công',
        description: 'Đã xóa đánh giá',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Không thể xóa đánh giá',
      });
    } finally {
      setDeleteId(null);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[...Array(5)].map((_, index) => (
          <Star
            key={index}
            className={`h-4 w-4 ${index < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
              }`}
          />
        ))}
      </div>
    );
  };

  // Safe average calculation
  const safeAverage = pagination.total > 0
    ? (reviews.reduce((sum, r) => sum + r.ratingOverall, 0) / (reviews.length || 1)).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Đánh giá & phản hồi</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Quản lý đánh giá và phản hồi của sinh viên
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tổng số đánh giá</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{pagination.total}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Điểm trung bình (Trang này)</p>
                <p className="text-2xl font-bold text-yellow-600">{safeAverage}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-600 fill-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Trạng thái</p>
                <div className="flex gap-2 mt-1">
                  <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">
                    Visible
                  </Badge>
                  <Badge variant="outline" className="text-gray-600 bg-gray-50 border-gray-200">
                    Hidden
                  </Badge>
                </div>
              </div>
              <Filter className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm theo nội dung, ID phòng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-800"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="VISIBLE">Hiển thị</option>
              <option value="HIDDEN">Ẩn</option>
              <option value="DELETED">Đã xóa</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Danh sách đánh giá</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                disabled={pagination.page <= 1 || loading}
              >
                Trước
              </Button>
              <div className="flex items-center px-2 text-sm">
                Trang {pagination.page} / {pagination.totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                disabled={pagination.page >= pagination.totalPages || loading}
              >
                Sau
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Không tìm thấy đánh giá nào.
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {review.user?.avatar ? (
                          <img src={review.user.avatar} alt={review.user.name} className="h-10 w-10 rounded-full object-cover" />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 font-semibold">
                              {review.user?.name ? review.user.name.charAt(0).toUpperCase() : 'U'}
                            </span>
                          </div>
                        )}

                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {review.user?.name || `User #${review.userId.substring(0, 8)}`}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {review.buildingName && review.roomNumber
                              ? `${review.buildingName} - Phòng ${review.roomNumber}`
                              : `Phòng ID: ${review.roomId}`
                            }
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 mb-2">
                        {renderStars(review.ratingOverall)}
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {review.ratingOverall} / 5
                        </span>
                        {review.status === 'HIDDEN' && (
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Đang ẩn</Badge>
                        )}
                        {review.status === 'DELETED' && (
                          <Badge variant="destructive">Đã xóa</Badge>
                        )}
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 mb-2">{review.comment}</p>
                      <div className="flex gap-4 text-xs text-gray-400">
                        <span>Sạch sẽ: {review.ratingClean || '-'}</span>
                        <span>Vị trí: {review.ratingLocation || '-'}</span>
                        <span>Dịch vụ: {review.ratingService || '-'}</span>
                        <span>Giá cả: {review.ratingPrice || '-'}</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleVisibility(review)}
                        className={review.status === 'VISIBLE' ? 'text-green-600 hover:text-green-700' : 'text-gray-600 hover:text-gray-700'}
                        disabled={review.status === 'DELETED'}
                      >
                        {review.status === 'VISIBLE' ? (
                          <><Eye className="h-4 w-4 mr-2" /> Hiển thị</>
                        ) : (
                          <><EyeOff className="h-4 w-4 mr-2" /> Ẩn</>
                        )}
                      </Button>

                      <Button variant="ghost" size="icon"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => confirmDelete(review.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Xóa đánh giá?"
        description="Hành động này sẽ xóa đánh giá vĩnh viễn. Bạn có chắc chắn không?"
        confirmText="Xóa"
        variant="destructive"
      />
    </div>
  );
};

export default ReviewsPage;
