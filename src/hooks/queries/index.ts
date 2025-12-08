// Posts
export {
    usePosts,
    usePost,
    useCreatePost,
    useUpdatePost,
    useDeletePost,
    usePublishPost,
    useDraftPost
} from './usePostsQuery';

// Categories
export {
    useCategories,
    useCategory,
    useCreateCategory,
    useUpdateCategory,
    useDeleteCategory
} from './useCategoriesQuery';

// Bookings
export {
    useBookings,
    useBooking,
    useApproveBooking,
    useRejectBooking,
    useDeleteBooking
} from './useBookingsQuery';

// Buildings
export {
    useBuildings,
    useBuilding,
    useCreateBuilding,
    useUpdateBuilding,
    useDeleteBuilding,
    useUploadBuildingImages
} from './useBuildingsQuery';

// Rooms
export {
    useRooms,
    useRoom,
    useCreateRoom,
    useUpdateRoom,
    useDeleteRoom
} from './useRoomsQuery';

// Users
export {
    useUsers,
    useUser,
    useCreateUser,
    useUpdateUser,
    useDeleteUser
} from './useUsersQuery';

// Payments
export {
    usePayments,
    usePayment,
    usePaymentStats,
    useMonthlyRevenue,
    useUpdatePaymentStatus,
    useMarkPaymentCompleted,
    useRefundPayment,
    useDeletePayment
} from './usePaymentsQuery';
