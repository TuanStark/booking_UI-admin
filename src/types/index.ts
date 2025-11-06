export interface Role {
  id: string;
  name: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: 'active' | 'inactive';
  createdAt: string;
  avatar?: string;
}

export interface Room {
  id: string;
  roomNumber: string;
  type: 'single' | 'shared';
  capacity: number;
  price: number;
  status: 'available' | 'booked' | 'maintenance';
  buildingId: string;
  buildingName: string;
  images: string[];
  amenities: string[];
  description?: string;
}

export interface Building {
  id: string;
  name: string;
  address: string;
  images: string[];
}

export interface Booking {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  roomId: string;
  roomNumber: string;
  buildingName: string;
  checkInDate: string;
  checkOutDate: string;
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  bookingStatus: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
  notes?: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  userId: string;
  userName: string;
  amount: number;
  method: 'MOMO' | 'VNPay' | 'Bank Transfer' | 'Cash';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  createdAt: string;
  processedAt?: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  roomId: string;
  roomNumber: string;
  buildingName: string;
  rating: number;
  comment: string;
  createdAt: string;
  isVisible: boolean;
}

export interface DashboardStats {
  totalUsers: number;
  totalRooms: number;
  availableRooms: number;
  totalBookings: number;
  totalRevenue: number;
  totalReviews: number;
  occupancyRate: number;
  monthlyBookings: Array<{ month: string; count: number }>;
  monthlyRevenue: Array<{ month: string; amount: number }>;
}

export interface AdminProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'super_admin';
  lastLogin?: string;
}

export interface SystemSettings {
  dormCapacityLimit: number;
  paymentGatewayKeys: {
    momo: string;
    vnpay: string;
  };
  notificationSettings: {
    emailNotifications: boolean;
    smsNotifications: boolean;
  };
  maintenanceMode: boolean;
}


export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}