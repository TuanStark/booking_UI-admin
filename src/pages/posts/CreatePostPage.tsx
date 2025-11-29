import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { ArrowLeft, Save, Image as ImageIcon } from 'lucide-react';

const CreatePostPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            navigate('/posts');
        }, 1000);
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/posts')}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Tạo bài viết mới</h1>
                    <p className="text-muted-foreground">
                        Điền thông tin để tạo bài viết mới.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Thông tin chi tiết</CardTitle>
                                <CardDescription>
                                    Tiêu đề và nội dung chính của bài viết.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Tiêu đề bài viết</Label>
                                    <Input id="title" placeholder="Nhập tiêu đề bài viết..." required />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="content">Nội dung</Label>
                                    <Textarea
                                        id="content"
                                        placeholder="Nhập nội dung bài viết..."
                                        className="min-h-[400px]"
                                        required
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Hỗ trợ định dạng Markdown cơ bản.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Phân loại & Trạng thái</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="status">Trạng thái</Label>
                                    <Select defaultValue="draft">
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn trạng thái" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="draft">Bản nháp</SelectItem>
                                            <SelectItem value="published">Công khai</SelectItem>
                                            <SelectItem value="archived">Lưu trữ</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="category">Danh mục</Label>
                                    <Select>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn danh mục" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="news">Tin tức</SelectItem>
                                            <SelectItem value="notification">Thông báo</SelectItem>
                                            <SelectItem value="guide">Hướng dẫn</SelectItem>
                                            <SelectItem value="activity">Hoạt động</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Hình ảnh</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="thumbnail">Ảnh thu nhỏ (URL)</Label>
                                    <div className="flex gap-2">
                                        <Input id="thumbnail" placeholder="https://..." />
                                        <Button type="button" variant="outline" size="icon">
                                            <ImageIcon className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="border-2 border-dashed rounded-lg p-4 flex items-center justify-center h-40 bg-muted/50">
                                    <div className="text-center">
                                        <ImageIcon className="mx-auto h-8 w-8 text-muted-foreground" />
                                        <span className="mt-2 block text-sm text-muted-foreground">
                                            Xem trước ảnh
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex gap-2">
                            <Button variant="outline" className="w-full" type="button" onClick={() => navigate('/posts')}>
                                Hủy
                            </Button>
                            <Button className="w-full" type="submit" disabled={loading}>
                                {loading ? 'Đang lưu...' : 'Lưu bài viết'}
                                <Save className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default CreatePostPage;
