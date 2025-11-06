import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { User } from '@/types';
import { Role } from '@/types/enum';

interface UserTableRowProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
}

const UserTableRow: React.FC<UserTableRowProps> = ({
  user,
  onEdit,
  onDelete,
}) => {
  return (
    <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
      <td className="py-3 px-4">
        <div className="flex items-center space-x-3">
          {user.avatar ? (
            <img 
              src={user.avatar} 
              alt={user.name}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <span className="text-blue-600 dark:text-blue-300 font-semibold">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <span className="font-medium text-gray-900 dark:text-white">{user.name}</span>
        </div>
      </td>
      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{user.email}</td>
      <td className="py-3 px-4">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          user.role?.name === Role.ADMIN 
            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
            : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
        }`}>
          {user.role?.name === Role.ADMIN ? 'Quản trị' : 'Sinh viên'}
        </span>
      </td>
      <td className="py-3 px-4">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          user.status === 'active' 
            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
        }`}>
          {user.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
        </span>
      </td>
      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
        {new Date(user.createdAt).toLocaleDateString('vi-VN')}
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(user)}
            className="hover:bg-blue-50 dark:hover:bg-blue-900/20"
            title="Chỉnh sửa người dùng"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(user.id)}
            className="hover:bg-red-50 dark:hover:bg-red-900/20"
            title="Xóa người dùng"
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      </td>
    </tr>
  );
};

export default UserTableRow;

