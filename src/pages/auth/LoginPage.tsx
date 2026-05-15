import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ADMIN_ACCESS_DENIED_MESSAGE,
  getLoginErrorKind,
  getLoginErrorMessage,
  getLoginErrorTitle,
  LOGIN_SUCCESS_MESSAGE,
  LoginErrorKind,
} from '@/utils/authUtils';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Home, Mail, Lock, Eye, EyeOff, AlertCircle, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { loginSchema, LoginFormData } from '@/lib/validations';
import { useFormValidation } from '@/hooks/useFormValidation';

const loginAlertStyles: Record<
  LoginErrorKind | 'success',
  { container: string; icon: string; text: string }
> = {
  success: {
    container: 'bg-green-50 border-green-200',
    icon: 'text-green-600',
    text: 'text-green-700',
  },
  access_denied: {
    container: 'bg-amber-50 border-amber-200',
    icon: 'text-amber-600',
    text: 'text-amber-800',
  },
  invalid_credentials: {
    container: 'bg-red-50 border-red-200',
    icon: 'text-red-600',
    text: 'text-red-600',
  },
  email_not_verified: {
    container: 'bg-amber-50 border-amber-200',
    icon: 'text-amber-600',
    text: 'text-amber-800',
  },
  network: {
    container: 'bg-red-50 border-red-200',
    icon: 'text-red-600',
    text: 'text-red-600',
  },
  unknown: {
    container: 'bg-red-50 border-red-200',
    icon: 'text-red-600',
    text: 'text-red-600',
  },
};

const LoginPage: React.FC = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [errorKind, setErrorKind] = useState<LoginErrorKind | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  const { errors, validate, clearFieldError } = useFormValidation(loginSchema);

  const showLoginError = (error: unknown, kind?: LoginErrorKind) => {
    const resolvedKind = kind ?? getLoginErrorKind(error);
    const message = getLoginErrorMessage(error, resolvedKind);
    const title = getLoginErrorTitle(resolvedKind);

    setSuccessMessage('');
    setSubmitError(message);
    setErrorKind(resolvedKind);

    toast({
      title,
      description: message,
      variant: 'destructive',
    });
  };

  useEffect(() => {
    const state = location.state as { accessDenied?: boolean } | null;
    if (!state?.accessDenied) return;

    setSubmitError(ADMIN_ACCESS_DENIED_MESSAGE);
    setErrorKind('access_denied');

    toast({
      title: 'Không có quyền truy cập',
      description: ADMIN_ACCESS_DENIED_MESSAGE,
      variant: 'destructive',
    });

    navigate(location.pathname, { replace: true, state: {} });
  }, [location.pathname, location.state, navigate, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name]) {
      clearFieldError(name);
    }
    if (submitError || successMessage) {
      setSubmitError('');
      setErrorKind(null);
      setSuccessMessage('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate(formData)) return;

    setSubmitError('');
    setErrorKind(null);
    setSuccessMessage('');

    try {
      await login({
        email: formData.email,
        password: formData.password,
      });

      setSuccessMessage(LOGIN_SUCCESS_MESSAGE);

      toast({
        title: 'Đăng nhập thành công',
        description: LOGIN_SUCCESS_MESSAGE,
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      showLoginError(error);
    }
  };

  const alertStyle = errorKind
    ? loginAlertStyles[errorKind]
    : successMessage
      ? loginAlertStyles.success
      : null;

  const statusMessage = successMessage || submitError;
  const StatusIcon = successMessage
    ? CheckCircle2
    : errorKind === 'access_denied'
      ? ShieldAlert
      : AlertCircle;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 rounded-full opacity-20" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gray-100 rounded-full opacity-20" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-50 rounded-full opacity-10" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-blue-100 rounded-2xl">
                <Home className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Chào mừng trở lại
            </CardTitle>
            <CardDescription className="text-gray-600">
              Đăng nhập vào trang quản trị
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Địa chỉ Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="admin@ktx.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`pl-10 ${errors.email ? 'border-red-500 focus:border-red-500' : ''}`}
                    disabled={isLoading}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Mật khẩu
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Nhập mật khẩu của bạn"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`pl-10 pr-10 ${errors.password ? 'border-red-500 focus:border-red-500' : ''}`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              {statusMessage && alertStyle && (
                <div
                  className={`flex items-start gap-2 p-3 border rounded-lg ${alertStyle.container}`}
                  role="alert"
                >
                  <StatusIcon className={`h-4 w-4 mt-0.5 shrink-0 ${alertStyle.icon}`} />
                  <p className={`text-sm ${alertStyle.text}`}>{statusMessage}</p>
                </div>
              )}

              <div className="flex items-center justify-between">
                {/* <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rememberMe"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onCheckedChange={(checked) =>
                      setFormData(prev => ({ ...prev, rememberMe: checked as boolean }))
                    }
                    disabled={isLoading}
                  />
                  <Label htmlFor="rememberMe" className="text-sm text-gray-600">
                    Ghi nhớ đăng nhập
                  </Label>
                </div> */}
                {/* <Link
                  to="/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Quên mật khẩu?
                </Link> */}
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Đang đăng nhập...</span>
                  </div>
                ) : (
                  'Đăng nhập'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
