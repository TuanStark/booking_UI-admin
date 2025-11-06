import { z } from 'zod';

// Auth schemas
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email là bắt buộc')
    .email('Email không hợp lệ'),
  password: z
    .string()
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  rememberMe: z.boolean().optional().default(false),
});

export const registerSchema = z.object({
  name: z
    .string()
    .min(1, 'Họ tên là bắt buộc')
    .min(2, 'Họ tên phải có ít nhất 2 ký tự')
    .max(100, 'Họ tên không được vượt quá 100 ký tự'),
  email: z
    .string()
    .min(1, 'Email là bắt buộc')
    .email('Email không hợp lệ'),
  password: z
    .string()
    .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Mật khẩu phải chứa chữ hoa, chữ thường và số'
    ),
  confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
  agreeToTerms: z
    .boolean()
    .refine((val) => val === true, 'Bạn phải đồng ý với điều khoản sử dụng'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Mật khẩu không khớp',
  path: ['confirmPassword'],
});

// Building schemas
export const buildingSchema = z.object({
  name: z
    .string()
    .min(1, 'Tên tòa nhà là bắt buộc')
    .min(2, 'Tên tòa nhà phải có ít nhất 2 ký tự')
    .max(100, 'Tên tòa nhà không được vượt quá 100 ký tự'),
  address: z
    .string()
    .min(1, 'Địa chỉ là bắt buộc')
    .min(5, 'Địa chỉ phải có ít nhất 5 ký tự')
    .max(200, 'Địa chỉ không được vượt quá 200 ký tự'),
  images: z.array(z.string()).optional(),
});

// Room schemas
export const roomSchema = z.object({
  roomNumber: z
    .string()
    .min(1, 'Số phòng là bắt buộc')
    .min(2, 'Số phòng phải có ít nhất 2 ký tự')
    .max(20, 'Số phòng không được vượt quá 20 ký tự'),
  type: z.enum(['single', 'shared']),
  capacity: z
    .number()
    .min(1, 'Sức chứa phải lớn hơn 0')
    .max(10, 'Sức chứa không được vượt quá 10 người'),
  price: z
    .number()
    .min(0, 'Giá phòng không được âm')
    .max(10000, 'Giá phòng không được vượt quá $10,000'),
  buildingId: z
    .string()
    .min(1, 'Tòa nhà là bắt buộc'),
  description: z
    .string()
    .max(500, 'Mô tả không được vượt quá 500 ký tự')
    .optional(),
  amenities: z
    .array(z.string())
    .optional()
    .default([]),
});

// User schemas
export const userSchema = z.object({
  name: z
    .string()
    .min(1, 'Họ tên là bắt buộc')
    .min(2, 'Họ tên phải có ít nhất 2 ký tự')
    .max(100, 'Họ tên không được vượt quá 100 ký tự'),
  email: z
    .string()
    .min(1, 'Email là bắt buộc')
    .email('Email không hợp lệ'),
  role: z.enum(['student', 'admin']),
  status: z.enum(['active', 'inactive']).optional().default('active'),
});

// Profile schemas
export const profileUpdateSchema = z.object({
  name: z
    .string()
    .min(1, 'Họ tên là bắt buộc')
    .min(2, 'Họ tên phải có ít nhất 2 ký tự')
    .max(100, 'Họ tên không được vượt quá 100 ký tự'),
  email: z
    .string()
    .min(1, 'Email là bắt buộc')
    .email('Email không hợp lệ'),
});

export const passwordUpdateSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'Mật khẩu hiện tại là bắt buộc'),
  newPassword: z
    .string()
    .min(8, 'Mật khẩu mới phải có ít nhất 8 ký tự')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Mật khẩu mới phải chứa chữ hoa, chữ thường và số'
    ),
  confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu mới'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Mật khẩu mới không khớp',
  path: ['confirmPassword'],
});

// System settings schemas
export const systemSettingsSchema = z.object({
  dormCapacityLimit: z
    .number()
    .min(1, 'Giới hạn sức chứa phải lớn hơn 0')
    .max(10000, 'Giới hạn sức chứa không được vượt quá 10,000'),
  paymentGatewayKeys: z.object({
    momo: z
      .string()
      .min(1, 'Khóa MOMO là bắt buộc')
      .max(200, 'Khóa MOMO không được vượt quá 200 ký tự'),
    vnpay: z
      .string()
      .min(1, 'Khóa VNPay là bắt buộc')
      .max(200, 'Khóa VNPay không được vượt quá 200 ký tự'),
  }),
  notificationSettings: z.object({
    emailNotifications: z.boolean(),
    smsNotifications: z.boolean(),
  }),
  maintenanceMode: z.boolean(),
});

// Booking schemas
export const bookingSchema = z.object({
  roomId: z
    .string()
    .min(1, 'Phòng là bắt buộc'),
  checkInDate: z
    .string()
    .min(1, 'Ngày nhận phòng là bắt buộc')
    .refine((date) => new Date(date) >= new Date(), {
      message: 'Ngày nhận phòng phải từ hôm nay trở đi',
    }),
  checkOutDate: z
    .string()
    .min(1, 'Ngày trả phòng là bắt buộc'),
  notes: z
    .string()
    .max(500, 'Ghi chú không được vượt quá 500 ký tự')
    .optional(),
}).refine((data) => new Date(data.checkOutDate) > new Date(data.checkInDate), {
  message: 'Ngày trả phòng phải sau ngày nhận phòng',
  path: ['checkOutDate'],
});

// Review schemas
export const reviewSchema = z.object({
  roomId: z
    .string()
    .min(1, 'Phòng là bắt buộc'),
  rating: z
    .number()
    .min(1, 'Đánh giá phải từ 1 sao')
    .max(5, 'Đánh giá không được vượt quá 5 sao'),
  comment: z
    .string()
    .min(1, 'Bình luận là bắt buộc')
    .min(10, 'Bình luận phải có ít nhất 10 ký tự')
    .max(1000, 'Bình luận không được vượt quá 1000 ký tự'),
});

// Search schemas
export const searchSchema = z.object({
  query: z
    .string()
    .max(100, 'Từ khóa tìm kiếm không được vượt quá 100 ký tự')
    .optional(),
  filters: z.object({
    role: z.enum(['all', 'student', 'admin']).optional(),
    status: z.enum(['all', 'active', 'inactive']).optional(),
    type: z.enum(['all', 'single', 'shared']).optional(),
    buildingId: z.string().optional(),
  }).optional(),
});

// Type exports
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type BuildingFormData = z.infer<typeof buildingSchema>;
export type RoomFormData = z.infer<typeof roomSchema>;
export type UserFormData = z.infer<typeof userSchema>;
export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;
export type PasswordUpdateFormData = z.infer<typeof passwordUpdateSchema>;
export type SystemSettingsFormData = z.infer<typeof systemSettingsSchema>;
export type BookingFormData = z.infer<typeof bookingSchema>;
export type ReviewFormData = z.infer<typeof reviewSchema>;
export type SearchFormData = z.infer<typeof searchSchema>;
