import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Star, Eye, EyeOff, MessageSquare } from 'lucide-react';
import { Review } from '@/types';

const ReviewsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRating, setSelectedRating] = useState<'all' | '5' | '4' | '3' | '2' | '1'>('all');
  const [selectedVisibility, setSelectedVisibility] = useState<'all' | 'visible' | 'hidden'>('all');

  const [reviews, setReviews] = useState<Review[]>([
    {
      id: '1',
      userId: '1',
      userName: 'John Doe',
      roomId: '101',
      roomNumber: '101',
      buildingName: 'Block A',
      rating: 5,
      comment: 'Great room with excellent facilities!',
      createdAt: '2024-06-10',
      isVisible: true,
    },
    {
      id: '2',
      userId: '2',
      userName: 'Jane Smith',
      roomId: '205',
      roomNumber: '205',
      buildingName: 'Block B',
      rating: 4,
      comment: 'Nice room, could be cleaner.',
      createdAt: '2024-06-15',
      isVisible: true,
    },
    {
      id: '3',
      userId: '3',
      userName: 'Bob Wilson',
      roomId: '301',
      roomNumber: '301',
      buildingName: 'Block C',
      rating: 2,
      comment: 'Room needs maintenance.',
      createdAt: '2024-06-20',
      isVisible: false,
    },
  ]);

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.roomNumber.includes(searchTerm) ||
                         review.comment.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRating = selectedRating === 'all' || review.rating === parseInt(selectedRating);
    const matchesVisibility = selectedVisibility === 'all' || 
                             (selectedVisibility === 'visible' && review.isVisible) ||
                             (selectedVisibility === 'hidden' && !review.isVisible);
    
    return matchesSearch && matchesRating && matchesVisibility;
  });

  const handleToggleVisibility = (reviewId: string) => {
    setReviews(reviews.map(r => 
      r.id === reviewId ? { ...r, isVisible: !r.isVisible } : r
    ));
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[...Array(5)].map((_, index) => (
          <Star
            key={index}
            className={`h-4 w-4 ${
              index < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Đánh giá & phản hồi</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Quản lý đánh giá và phản hồi của sinh viên
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tổng số đánh giá</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{reviews.length}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Điểm trung bình</p>
                <p className="text-2xl font-bold text-yellow-600">{averageRating}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-600 fill-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Đang hiển thị</p>
                <p className="text-2xl font-bold text-green-600">
                  {reviews.filter(r => r.isVisible).length}
                </p>
              </div>
              <Eye className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Bị ẩn</p>
                <p className="text-2xl font-bold text-red-600">
                  {reviews.filter(r => !r.isVisible).length}
                </p>
              </div>
              <EyeOff className="h-8 w-8 text-red-600" />
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
                placeholder="Tìm kiếm đánh giá..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedRating}
              onChange={(e) => setSelectedRating(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">Tất cả điểm</option>
              <option value="5">5 sao</option>
              <option value="4">4 sao</option>
              <option value="3">3 sao</option>
              <option value="2">2 sao</option>
              <option value="1">1 sao</option>
            </select>
            <select
              value={selectedVisibility}
              onChange={(e) => setSelectedVisibility(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">Tất cả</option>
              <option value="visible">Hiển thị</option>
              <option value="hidden">Ẩn</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Đánh giá ({filteredReviews.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <div
                key={review.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">
                          {review.userName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{review.userName}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {review.buildingName} - Phòng {review.roomNumber}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 mb-2">
                      {renderStars(review.rating)}
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {review.rating} / 5
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mb-2">{review.comment}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {review.createdAt}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleVisibility(review.id)}
                      className={review.isVisible ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
                    >
                      {review.isVisible ? (
                        <><EyeOff className="h-4 w-4 mr-2" /> Ẩn</>
                      ) : (
                        <><Eye className="h-4 w-4 mr-2" /> Hiển thị</>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReviewsPage;
