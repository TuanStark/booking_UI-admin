import { useAuth } from '../contexts/AuthContext';

export const useAuthGuard = () => {
  const { isAuthenticated, user, isLoading } = useAuth();

  const hasRole = (requiredRole: 'admin' | 'manager' | 'staff') => {
    if (!user) return false;
    
    const roleHierarchy = {
      admin: 3,
      manager: 2,
      staff: 1,
    };

    return roleHierarchy[user.role as keyof typeof roleHierarchy] >= roleHierarchy[requiredRole as keyof typeof roleHierarchy];
  };

  const isAdmin = () => hasRole('admin');
  const isManager = () => hasRole('manager');
  const isStaff = () => hasRole('staff');

  return {
    isAuthenticated,
    user,
    isLoading,
    hasRole,
    isAdmin,
    isManager,
    isStaff,
  };
};
