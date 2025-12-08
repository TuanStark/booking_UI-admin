import { useState } from 'react';
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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Plus,
    Search,
    Trash2,
    Loader2
} from 'lucide-react';
import { useCategories, useCreateCategory, useDeleteCategory } from '@/hooks/queries';
import { useToast } from '@/components/ui/use-toast';

const CategoriesPage = () => {
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    // TanStack Query hooks
    const { data: categories = [], isLoading } = useCategories();
    const createCategoryMutation = useCreateCategory();
    const deleteCategoryMutation = useDeleteCategory();

    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });

    const handleCreate = async () => {
        if (!formData.name) {
            toast({
                title: "Lỗi",
                description: "Vui lòng nhập tên danh mục.",
                variant: "destructive",
            });
            return;
        }

        createCategoryMutation.mutate(formData, {
            onSuccess: () => {
                toast({
                    title: "Thành công",
                    description: "Đã tạo danh mục mới.",
                });
                setIsCreateDialogOpen(false);
                setFormData({ name: '', description: '' });
            },
            onError: (error) => {
                console.error('Failed to create category:', error);
                toast({
                    title: "Lỗi",
                    description: "Không thể tạo danh mục.",
                    variant: "destructive",
                });
            },
        });
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa danh mục này?')) return;

        deleteCategoryMutation.mutate(id, {
            onSuccess: () => {
                toast({
                    title: "Thành công",
                    description: "Đã xóa danh mục.",
                });
            },
            onError: (error) => {
                console.error('Failed to delete category:', error);
                toast({
                    title: "Lỗi",
                    description: "Không thể xóa danh mục.",
                    variant: "destructive",
                });
            },
        });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 flex-1">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Tìm kiếm danh mục..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Thêm danh mục
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Thêm danh mục mới</DialogTitle>
                            <DialogDescription>
                                Tạo danh mục mới để phân loại bài viết.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">
                                    Tên danh mục
                                </Label>
                                <Input
                                    id="name"
                                    placeholder="Ví dụ: Tin tức"
                                    className="col-span-3"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="description" className="text-right">
                                    Mô tả
                                </Label>
                                <Textarea
                                    id="description"
                                    placeholder="Mô tả ngắn về danh mục..."
                                    className="col-span-3"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Hủy</Button>
                            <Button onClick={handleCreate} disabled={createCategoryMutation.isPending}>
                                {createCategoryMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Tạo danh mục
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[250px]">Tên danh mục</TableHead>
                            <TableHead>Mô tả</TableHead>
                            <TableHead>Ngày tạo</TableHead>
                            <TableHead className="text-right">Hành động</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-10">
                                    Đang tải...
                                </TableCell>
                            </TableRow>
                        ) : filteredCategories.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-10">
                                    Không có danh mục nào.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredCategories.map((category) => (
                                <TableRow key={category.id}>
                                    <TableCell className="font-medium">{category.name}</TableCell>
                                    <TableCell className="max-w-[400px] truncate" title={category.description}>
                                        {category.description}
                                    </TableCell>
                                    <TableCell>{formatDate(category.createdAt)}</TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => handleDelete(category.id)}
                                            disabled={deleteCategoryMutation.isPending}
                                        >
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default CategoriesPage;
