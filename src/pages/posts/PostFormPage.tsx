import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { postService } from '@/services/postService';
import { categoryService } from '@/services/categoryService';
import { useToast } from '@/components/ui/use-toast';
import { PostCategory, Post } from '@/types';

const PostFormPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<PostCategory[]>([]);
    const isEditing = !!id;

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category: '',
        status: 'draft',
        thumbnail: ''
    });

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await categoryService.findAll();
                if (response.data) {
                    setCategories(response.data as PostCategory[]);
                }
            } catch (error) {
                console.error('Failed to fetch categories:', error);
                toast({
                    title: "Lỗi",
                    description: "Không thể tải danh sách danh mục.",
                    variant: "destructive",
                });
            }
        };

        fetchCategories();
    }, []);

    useEffect(() => {
        if (isEditing && id) {
            const fetchPost = async () => {
                try {
                    const response = await postService.findOne(id);
                    console.log(response);
                    if (response.data) {
                        const post = response.data as Post;
                        setFormData({
                            title: post.title,
                            content: post.content,
                            category: post.category?.id || '',
                            status: post.status,
                            thumbnail: post.thumbnail || ''
                        });
                    }
                } catch (error) {
                    console.error('Failed to fetch post:', error);
                    toast({
                        title: "Lỗi",
                        description: "Không thể tải thông tin bài viết.",
                        variant: "destructive",
                    });
                    navigate('/posts');
                }
            };
            fetchPost();
        }
    }, [id, isEditing, navigate, toast]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = {
                title: formData.title,
                content: formData.content,
                category: formData.category,
                status: formData.status as 'draft' | 'published' | 'archived',
                thumbnail: formData.thumbnail
            };

            if (isEditing && id) {
                await postService.update(id, data);
                toast({
                    title: "Thành công",
                    description: "Đã cập nhật bài viết.",
                });
            } else {
                await postService.create(data);
                toast({
                    title: "Thành công",
                    description: "Đã tạo bài viết mới.",
                });
            }
            navigate('/posts');
        } catch (error) {
            console.error('Failed to save post:', error);
            toast({
                title: "Lỗi",
                description: `Không thể ${isEditing ? 'cập nhật' : 'tạo'} bài viết. Vui lòng thử lại.`,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-8xl mx-auto">
            <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/posts')}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {isEditing ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}
                    </h1>
                    <p className="text-muted-foreground">
                        {isEditing ? 'Cập nhật thông tin bài viết.' : 'Điền thông tin để tạo bài viết mới.'}
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
                                    <Input
                                        id="title"
                                        placeholder="Nhập tiêu đề bài viết..."
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="content">Nội dung</Label>
                                    <Textarea
                                        id="content"
                                        placeholder="Nhập nội dung bài viết..."
                                        className="min-h-[400px]"
                                        required
                                        value={formData.content}
                                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
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
                                    <Select
                                        value={formData.status}
                                        onValueChange={(value) => setFormData({ ...formData, status: value })}
                                    >
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
                                    <Select
                                        value={formData.category}
                                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn danh mục" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectItem key={category.id} value={category.id}>
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="thumbnail">Ảnh thu nhỏ (URL)</Label>
                                    <Input
                                        id="thumbnail"
                                        placeholder="https://example.com/image.jpg"
                                        value={formData.thumbnail}
                                        onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex items-center gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                onClick={() => navigate('/posts')}
                            >
                                Hủy
                            </Button>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isEditing ? 'Cập nhật' : 'Tạo bài viết'}
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default PostFormPage;
