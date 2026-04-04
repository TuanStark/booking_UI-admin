import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { authService } from '../services/authService';
import { jwtDecode } from 'jwt-decode';
import { AuthResponse, AuthState, LoginCredentials, RegisterData, User } from '@/types';
import { ResponseData } from '@/types/globalClass';
import { getTokenExpirationTime, isTokenExpired } from '@/utils/authUtils';



interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshAuthToken: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    setAuthState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
    authService.logout().catch(console.error);
  }, []);

  const refreshAuthToken = useCallback(async () => {
    const storedRefresh = localStorage.getItem('refresh_token');
    if (!storedRefresh) {
      logout();
      throw new Error('No refresh token available');
    }
    try {
      const { accessToken, refreshToken } =
        await authService.refreshToken(storedRefresh);
      localStorage.setItem('auth_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
      setAuthState(prev => ({
        ...prev,
        accessToken,
        refreshToken,
        isAuthenticated: true,
      }));
    } catch (error) {
      logout();
      throw error;
    }
  }, [logout]);

  // Initialize auth state from localStorage (refresh if access JWT expired)
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        let refreshToken = localStorage.getItem('refresh_token');
        const userData = localStorage.getItem('user_data');

        if (token && userData) {
          let accessToken = token;
          if (isTokenExpired(token)) {
            if (!refreshToken) {
              localStorage.removeItem('auth_token');
              localStorage.removeItem('user_data');
              setAuthState(prev => ({ ...prev, isLoading: false }));
              return;
            }
            try {
              const refreshed = await authService.refreshToken(refreshToken);
              accessToken = refreshed.accessToken;
              refreshToken = refreshed.refreshToken;
              localStorage.setItem('auth_token', accessToken);
              localStorage.setItem('refresh_token', refreshToken);
            } catch {
              localStorage.removeItem('auth_token');
              localStorage.removeItem('refresh_token');
              localStorage.removeItem('user_data');
              setAuthState(prev => ({ ...prev, isLoading: false }));
              return;
            }
          }

          const user = JSON.parse(userData);
          setAuthState({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          setAuthState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    };

    initializeAuth();
  }, []);

  // Proactive refresh when access token is close to expiry
  useEffect(() => {
    if (!authState.accessToken) return;

    const tick = async () => {
      const token = localStorage.getItem('auth_token');
      const exp = token ? getTokenExpirationTime(token) : null;
      if (!exp) return;
      if (exp - Date.now() < 120_000) {
        try {
          await refreshAuthToken();
        } catch {
          /* refreshAuthToken already called logout */
        }
      }
    };

    tick();
    const id = setInterval(tick, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [authState.accessToken, refreshAuthToken]);

  const login = async (credentials: LoginCredentials) => {
    try {
        setAuthState(prev => ({ ...prev, isLoading: true }));
        
      const response = await authService.login(credentials) as ResponseData<AuthResponse>;
      const { accessToken, refreshToken } = response.data as unknown as AuthResponse;

      // Decode accessToken to extract user info
      const decoded: any = jwtDecode(accessToken);
      const user = {
        id: decoded.sub,
        email: decoded.email,
        name: decoded?.role?.name || '',
        role: decoded?.role?.name?.toLowerCase() as User['role'],
        avatar: '', // Optional: update if available
        createdAt: decoded?.role?.createdAt || '',
        updatedAt: decoded?.role?.updatedAt || '',
        status: 'active'
      };

      // Store in localStorage
      localStorage.setItem('auth_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
      localStorage.setItem('user_data', JSON.stringify(user));

      setAuthState({
        user: user as User,
        accessToken,
        refreshToken,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      const response = await authService.register(data);
      const { accessToken, refreshToken } = response as unknown as AuthResponse;
      const decoded: any = jwtDecode(accessToken);
      const user = {
        id: decoded.sub,
        email: decoded.email,
        name: decoded?.role?.name || '',
        role: decoded?.role?.name?.toLowerCase() as User['role'],
        avatar: '',
        createdAt: decoded?.role?.createdAt || '',
        updatedAt: decoded?.role?.updatedAt || '',
        status: 'active'
      };

      // Store in localStorage
      localStorage.setItem('auth_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
      localStorage.setItem('user_data', JSON.stringify(user));

      setAuthState({
        user: user as User,
        accessToken,
        refreshToken,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (!authState.user) return;

    const updatedUser = { ...authState.user, ...userData };
    localStorage.setItem('user_data', JSON.stringify(updatedUser));
    
    setAuthState(prev => ({
      ...prev,
      user: updatedUser,
    }));
  };

  const contextValue: AuthContextType = {
    ...authState,
    login,
    register,
    logout,
    refreshAuthToken,
    updateUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
