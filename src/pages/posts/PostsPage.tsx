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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from '@/components/ui/tabs';
import {
    Plus,
    Search,
    MoreHorizontal,
    Edit,
    Trash2,
    Eye
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import CategoriesPage from '../categories/CategoriesPage';

// Mock data
const MOCK_POSTS = [
    {
        id: '1',
        title: 'Thông báo về việc đăng ký KTX học kỳ 1 năm học 2024-2025',
        category: 'Thông báo',
        author: 'Admin',
        status: 'published',
        createdAt: '2024-05-15T08:00:00Z',
        views: 1250
    },
    {
        id: '2',
        title: 'Hướng dẫn thanh toán phí nội trú qua ứng dụng ngân hàng',
        category: 'Hướng dẫn',
        author: 'Admin',
        status: 'published',
        createdAt: '2024-05-10T14:30:00Z',
        views: 890
    },
    {
        id: '3',
        title: 'Quy định mới về giờ giấc ra vào KTX',
        category: 'Quy định',
        author: 'Ban quản lý',
        status: 'draft',
        createdAt: '2024-05-20T09:15:00Z',
        views: 0
    }
];

const PostsPage = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'published':
                return <Badge className="bg-green-500 hover:bg-green-600">Đã xuất bản</Badge>;
            case 'draft':
                return <Badge variant="secondary">Bản nháp</Badge>;
            case 'archived':
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
                                {MOCK_POSTS.map((post) => (
                                    <TableRow key={post.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex flex-col">
                                                <span className="truncate max-w-[380px]" title={post.title}>{post.title}</span>
                                                <span className="text-xs text-muted-foreground flex items-center mt-1">
                                                    <Eye className="h-3 w-3 mr-1" /> {post.views} lượt xem
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{post.category}</TableCell>
                                        <TableCell>{post.author}</TableCell>
                                        <TableCell>{getStatusBadge(post.status)}</TableCell>
                                        <TableCell>{formatDate(post.createdAt)}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => navigate(`/posts/${post.id}`)}>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Chỉnh sửa
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-red-600">
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Xóa
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>

                <TabsContent value="categories">
                    <CategoriesPage />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default PostsPage;
