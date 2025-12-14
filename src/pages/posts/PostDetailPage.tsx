import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { Post } from "@/types";
import { postService } from "@/services/postService";
import { useToast } from '@/components/ui/use-toast';
import ConfirmDialog from "@/components/ui/confirm-dialog";

export default function PostDetailPage() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [post, setPost] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    //confirm for remove post
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await postService.findOne(id as string);
                console.log(response);
                if (response.data) {
                    const postData = (response.data as any).data || response.data;
                    const post = postData as Post;
                    setPost(post);
                    setLoading(false);
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
    }, [id]);

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

    const handleDelete = async (id: string) => {
        setSelectedId(id);        // Lưu ID cần xoá
        setIsConfirmOpen(true);   // Mở confirm dialog
    };

    const handleConfirmDelete = async () => {
        if (!selectedId) return;

        setIsLoading(true);

        try {
            console.log("Deleting:", selectedId);
            try {
                await postService.delete(id as string);
                console.log("Deleted:", selectedId);
                toast({
                    title: "Thành công",
                    description: "Đã xóa bài viết.",
                });
                navigate('/posts');
            } catch (error) {
                console.error('Failed to delete post:', error);
                toast({
                    title: "Lỗi",
                    description: "Không thể xóa bài viết.",
                    variant: "destructive",
                });
                navigate('/posts');
            }
        } finally {
            setIsLoading(false);
            setIsConfirmOpen(false);
            setSelectedId(null);
        }
    };


    if (loading) return <p className="text-center py-10">Đang tải dữ liệu...</p>;
    if (!post) return <p className="text-center py-10">Không tìm thấy bài viết.</p>;

    return (
        <div className="space-y-6 max-w-8xl mx-auto">
            {/* Header */}
            <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/posts')}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Chi tiết bài viết</h1>
                    <p className="text-muted-foreground">Xem thông tin chi tiết của bài viết.</p>
                </div>
            </div>

            {/* Main content */}
            <Card>
                <CardHeader>
                    <CardTitle>{post.title}</CardTitle>
                    <CardDescription>
                        Được đăng bởi <strong>{post.author?.name ?? "Admin"}</strong>
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Thumbnail */}
                    {post.thumbnailUrl ? (
                        <img
                            src={post.thumbnailUrl}
                            className="w-full max-h-[400px] rounded-lg object-cover"
                        />
                    ) : (
                        <div className="w-full h-40 bg-muted rounded-lg flex items-center justify-center text-sm text-muted-foreground">
                            Không có ảnh thumbnail
                        </div>
                    )}

                    {/* Meta */}
                    <div className="flex items-center gap-3 text-sm">
                        <Badge variant="secondary">{post.category?.name ?? "Không có danh mục"}</Badge>
                        <Badge>{getStatusBadge(post.status)}</Badge>
                    </div>

                    {/* Content */}
                    <div>
                        <h2 className="font-semibold text-lg mb-3">Nội dung</h2>
                        <div
                            className="prose max-w-none dark:prose-invert"
                            dangerouslySetInnerHTML={{ __html: post.content }}
                        />
                    </div>

                    {/* Dates */}
                    <div className="text-sm text-muted-foreground pt-4 border-t flex justify-between">
                        <div>
                            <p><strong>Tạo lúc:</strong> {new Date(post.createdAt).toLocaleString()}</p>
                            <p><strong>Cập nhật:</strong> {new Date(post.updatedAt).toLocaleString()}</p>
                            {post.publishedAt && (
                                <p><strong>Đăng công khai:</strong> {new Date(post.publishedAt).toLocaleString()}</p>
                            )}
                        </div>
                        <div className="flex gap-4">
                            <Button variant="default" onClick={() => navigate(`/posts/${post.id}/edit`)}>
                                Sửa
                            </Button>
                            <Button variant="destructive" onClick={() => handleDelete(post.id)}>
                                Xóa
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <ConfirmDialog
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Xoá mục này?"
                description="Hành động này không thể hoàn tác."
                confirmText="Xoá"
                cancelText="Hủy"
                variant="destructive"
                isLoading={isLoading}
            />
        </div>
    );
}
