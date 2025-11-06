import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Save, User, Settings as SettingsIcon, CreditCard, Bell } from 'lucide-react';
import { AdminProfile, SystemSettings } from '@/types';
import { profileUpdateSchema, passwordUpdateSchema, systemSettingsSchema, ProfileUpdateFormData, PasswordUpdateFormData, SystemSettingsFormData } from '@/lib/validations';
import { useFormValidation } from '@/hooks/useFormValidation';

const SettingsPage: React.FC = () => {
  const [profile, setProfile] = useState<AdminProfile>({
    id: '1',
    name: 'Admin User',
    email: 'admin@dormitory.com',
    role: 'admin',
  });

  const [settings, setSettings] = useState<SystemSettings>({
    dormCapacityLimit: 500,
    paymentGatewayKeys: {
      momo: 'your-momo-key-here',
      vnpay: 'your-vnpay-key-here',
    },
    notificationSettings: {
      emailNotifications: true,
      smsNotifications: false,
    },
    maintenanceMode: false,
  });

  const [profileFormData, setProfileFormData] = useState<ProfileUpdateFormData>({
    name: profile.name,
    email: profile.email,
  });

  const [passwordFormData, setPasswordFormData] = useState<PasswordUpdateFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [settingsFormData, setSettingsFormData] = useState<SystemSettingsFormData>({
    dormCapacityLimit: settings.dormCapacityLimit,
    paymentGatewayKeys: settings.paymentGatewayKeys,
    notificationSettings: settings.notificationSettings,
    maintenanceMode: settings.maintenanceMode,
  });

  const profileValidation = useFormValidation(profileUpdateSchema);
  const passwordValidation = useFormValidation(passwordUpdateSchema);
  const settingsValidation = useFormValidation(systemSettingsSchema);

  const handleProfileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileFormData(prev => ({ ...prev, [name]: value }));
    
    if (profileValidation.errors[name]) {
      profileValidation.clearFieldError(name);
    }
  };

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordFormData(prev => ({ ...prev, [name]: value }));
    
    if (passwordValidation.errors[name]) {
      passwordValidation.clearFieldError(name);
    }
  };

  const handleSettingsInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setSettingsFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }));
    
    if (settingsValidation.errors[name]) {
      settingsValidation.clearFieldError(name);
    }
  };

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profileValidation.validate(profileFormData)) return;
    
    // Handle profile update
    console.log('Updating profile...', profileFormData);
    setProfile(prev => ({ ...prev, ...profileFormData }));
  };

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passwordValidation.validate(passwordFormData)) return;
    
    // Handle password update
    console.log('Updating password...');
    setPasswordFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    passwordValidation.clearErrors();
  };

  const handleSettingsUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!settingsValidation.validate(settingsFormData)) return;
    
    // Handle settings update
    console.log('Updating settings...', settingsFormData);
    setSettings(prev => ({ ...prev, ...settingsFormData }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Cài đặt</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Quản lý hồ sơ và cấu hình hệ thống
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <CardTitle>Thông tin hồ sơ</CardTitle>
              </div>
              <CardDescription>
                Cập nhật thông tin tài khoản của bạn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Họ và tên</Label>
                  <Input
                    id="name"
                    name="name"
                    value={profileFormData.name}
                    onChange={handleProfileInputChange}
                    className={profileValidation.errors.name ? 'border-red-500 focus:border-red-500' : ''}
                  />
                  {profileValidation.errors.name && (
                    <p className="text-sm text-red-600">{profileValidation.errors.name}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Địa chỉ Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={profileFormData.email}
                    onChange={handleProfileInputChange}
                    className={profileValidation.errors.email ? 'border-red-500 focus:border-red-500' : ''}
                  />
                  {profileValidation.errors.email && (
                    <p className="text-sm text-red-600">{profileValidation.errors.email}</p>
                  )}
                </div>
                <Button type="submit" className="w-full">
                  <Save className="mr-2 h-4 w-4" />
                  Lưu thay đổi
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card>
            <CardHeader>
              <CardTitle>Đổi mật khẩu</CardTitle>
              <CardDescription>
                Cập nhật mật khẩu để tăng bảo mật
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    value={passwordFormData.currentPassword}
                    onChange={handlePasswordInputChange}
                    className={passwordValidation.errors.currentPassword ? 'border-red-500 focus:border-red-500' : ''}
                  />
                  {passwordValidation.errors.currentPassword && (
                    <p className="text-sm text-red-600">{passwordValidation.errors.currentPassword}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="newPassword">Mật khẩu mới</Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={passwordFormData.newPassword}
                    onChange={handlePasswordInputChange}
                    className={passwordValidation.errors.newPassword ? 'border-red-500 focus:border-red-500' : ''}
                  />
                  {passwordValidation.errors.newPassword && (
                    <p className="text-sm text-red-600">{passwordValidation.errors.newPassword}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={passwordFormData.confirmPassword}
                    onChange={handlePasswordInputChange}
                    className={passwordValidation.errors.confirmPassword ? 'border-red-500 focus:border-red-500' : ''}
                  />
                  {passwordValidation.errors.confirmPassword && (
                    <p className="text-sm text-red-600">{passwordValidation.errors.confirmPassword}</p>
                  )}
                </div>
                <Button type="submit" className="w-full">
                  <Save className="mr-2 h-4 w-4" />
                  Cập nhật mật khẩu
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* System Configuration */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <SettingsIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <CardTitle>Cấu hình hệ thống</CardTitle>
              </div>
              <CardDescription>
                Cấu hình các thiết lập chung của hệ thống
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSettingsUpdate}>
                <div className="grid gap-2">
                  <Label htmlFor="dormCapacityLimit">Giới hạn sức chứa ký túc xá</Label>
                  <Input
                    id="dormCapacityLimit"
                    name="dormCapacityLimit"
                    type="number"
                    value={settingsFormData.dormCapacityLimit}
                    onChange={handleSettingsInputChange}
                    className={settingsValidation.errors.dormCapacityLimit ? 'border-red-500 focus:border-red-500' : ''}
                  />
                  {settingsValidation.errors.dormCapacityLimit && (
                    <p className="text-sm text-red-600">{settingsValidation.errors.dormCapacityLimit}</p>
                  )}
                </div>
                <Button type="submit" className="w-full mt-4">
                  <Save className="mr-2 h-4 w-4" />
                  Lưu cấu hình
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Notification Settings */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <CardTitle>Thông báo</CardTitle>
              </div>
              <CardDescription>
                Cấu hình tùy chọn thông báo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Thông báo qua Email</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Nhận cập nhật qua email
                  </p>
                </div>
                <Switch
                  checked={settings.notificationSettings.emailNotifications}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      notificationSettings: {
                        ...settings.notificationSettings,
                        emailNotifications: checked,
                      },
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Thông báo SMS</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Nhận cập nhật qua SMS
                  </p>
                </div>
                <Switch
                  checked={settings.notificationSettings.smsNotifications}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      notificationSettings: {
                        ...settings.notificationSettings,
                        smsNotifications: checked,
                      },
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Chế độ bảo trì</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Bật chế độ bảo trì
                  </p>
                </div>
                <Switch
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, maintenanceMode: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <CardTitle>Cổng thanh toán</CardTitle>
              </div>
              <CardDescription>
                Quản lý khóa tích hợp cổng thanh toán
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSettingsUpdate}>
                <div className="grid gap-2">
                  <Label htmlFor="momoKey">Khóa API MOMO</Label>
                  <Input
                    id="momoKey"
                    name="momoKey"
                    type="password"
                    value={settingsFormData.paymentGatewayKeys.momo}
                    onChange={(e) =>
                      setSettingsFormData({
                        ...settingsFormData,
                        paymentGatewayKeys: {
                          ...settingsFormData.paymentGatewayKeys,
                          momo: e.target.value,
                        },
                      })
                    }
                    placeholder="Nhập khóa MOMO"
                    className={settingsValidation.errors['paymentGatewayKeys.momo'] ? 'border-red-500 focus:border-red-500' : ''}
                  />
                  {settingsValidation.errors['paymentGatewayKeys.momo'] && (
                    <p className="text-sm text-red-600">{settingsValidation.errors['paymentGatewayKeys.momo']}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="vnpayKey">Khóa API VNPay</Label>
                  <Input
                    id="vnpayKey"
                    name="vnpayKey"
                    type="password"
                    value={settingsFormData.paymentGatewayKeys.vnpay}
                    onChange={(e) =>
                      setSettingsFormData({
                        ...settingsFormData,
                        paymentGatewayKeys: {
                          ...settingsFormData.paymentGatewayKeys,
                          vnpay: e.target.value,
                        },
                      })
                    }
                    placeholder="Nhập khóa VNPay"
                    className={settingsValidation.errors['paymentGatewayKeys.vnpay'] ? 'border-red-500 focus:border-red-500' : ''}
                  />
                  {settingsValidation.errors['paymentGatewayKeys.vnpay'] && (
                    <p className="text-sm text-red-600">{settingsValidation.errors['paymentGatewayKeys.vnpay']}</p>
                  )}
                </div>
                <Button type="submit" className="w-full">
                  <Save className="mr-2 h-4 w-4" />
                  Lưu khóa
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
