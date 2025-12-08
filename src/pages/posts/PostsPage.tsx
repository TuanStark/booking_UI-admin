import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from '@/components/ui/tabs';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Eye
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import CategoriesPage from '../categories/CategoriesPage';
import { usePosts, useDeletePost } from '@/hooks/queries';
import { useToast } from '@/components/ui/use-toast';
import ConfirmDialog from '@/components/ui/confirm-dialog';

const PostsPage = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');

    // TanStack Query hooks
    const { data: posts = [], isLoading, refetch } = usePosts({ search: searchTerm });
    const deletePostMutation = useDeletePost();

    // Confirm dialog state
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const handleDelete = (id: string) => {
        setSelectedId(id);
        setIsConfirmOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedId) return;

        deletePostMutation.mutate(selectedId, {
            onSuccess: () => {
                toast({
                    title: "Thành công",
                    description: "Đã xóa bài viết.",
                });
                setIsConfirmOpen(false);
                setSelectedId(null);
            },
            onError: (error) => {
                console.error('Failed to delete post:', error);
                toast({
                    title: "Lỗi",
                    description: "Không thể xóa bài viết.",
                    variant: "destructive",
                });
                refetch();
                setIsConfirmOpen(false);
                setSelectedId(null);
            },
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PUBLISHED':
                return <Badge className="bg-green-500 hover:bg-green-600">Đã xuất bản</Badge>;
            case 'DRAFT':
                return <Badge variant="secondary">Bản nháp</Badge>;
            case 'ARCHIVED':
                return <Badge variant="outline">Đã lưu trữ</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Quản lý bài viết</h1>
                    <p className="text-muted-foreground">
                        Quản lý các bài viết, thông báo và danh mục của hệ thống.
                    </p>
                </div>
            </div>

            <Tabs defaultValue="posts" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="posts">Danh sách bài viết</TabsTrigger>
                    <TabsTrigger value="categories">Danh mục</TabsTrigger>
                </TabsList>

                <TabsContent value="posts" className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 flex-1">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Tìm kiếm bài viết..."
                                    className="pl-8"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <Button onClick={() => navigate('/posts/create')}>
                            <Plus className="mr-2 h-4 w-4" />
                            Tạo bài viết
                        </Button>
                    </div>

                    <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[400px]">Tiêu đề</TableHead>
                                    <TableHead>Danh mục</TableHead>
                                    <TableHead>Tác giả</TableHead>
                                    <TableHead>Trạng thái</TableHead>
                                    <TableHead>Ngày tạo</TableHead>
                                    <TableHead className="text-right">Hành động</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-10">
                                            Đang tải...
                                        </TableCell>
                                    </TableRow>
                                ) : posts.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-10">
                                            Không có bài viết nào.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    posts.map((post) => (
                                        <TableRow key={post.id}>
                                            <TableCell className="font-medium" onClick={() => navigate(`/posts/${post.id}`)} >
                                                <div className="flex flex-col">
                                                    <span className="truncate max-w-[380px] cursor-pointer hover:underline hover:text-blue-500" title={post.title}>{post.title}</span>
                                                    <span className="text-xs text-muted-foreground truncate max-w-[380px]">
                                                        {post.summary}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{post.category?.name || 'Chưa phân loại'}</TableCell>
                                            <TableCell>{post.author?.name || 'Admin'}</TableCell>
                                            <TableCell>{getStatusBadge(post.status)}</TableCell>
                                            <TableCell>{formatDate(post.createdAt)}</TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex flex-row justify-end items-center">
                                                    <button
                                                        className="text-green-500"
                                                        onClick={() => navigate(`/posts/${post.id}`)}>
                                                        <Eye className="mr-5 h-4 w-4" />
                                                    </button>
                                                    <button onClick={() => navigate(`/posts/${post.id}/edit`)}>
                                                        <Edit className="mr-5 h-4 w-4" />
                                                    </button>
                                                    <button
                                                        className="text-red-600"
                                                        onClick={() => handleDelete(post.id)}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                    </button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>

                <TabsContent value="categories">
                    <CategoriesPage />
                </TabsContent>
            </Tabs>

            {/* Confirm dialog */}
            <ConfirmDialog
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Xoá mục này?"
                description="Hành động này không thể hoàn tác."
                confirmText="Xoá"
                cancelText="Hủy"
                variant="destructive"
                isLoading={deletePostMutation.isPending}
            />
        </div>
    );
};

export default PostsPage;
