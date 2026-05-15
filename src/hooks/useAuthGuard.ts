import { useAuth } from '../contexts/AuthContext';
import { isAdminRole } from '@/utils/authUtils';

export const useAuthGuard = () => {
  const { isAuthenticated, user, isLoading } = useAuth();

  const isAdmin = () => isAdminRole(user?.role);

  return {
    isAuthenticated,
    user,
    isLoading,
    isAdmin,
  };
};
