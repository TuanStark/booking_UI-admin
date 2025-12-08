import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes - data is fresh for 5 minutes
            gcTime: 10 * 60 * 1000, // 10 minutes - garbage collect after 10 minutes (formerly cacheTime)
            refetchOnWindowFocus: false, // Don't refetch when window regains focus
            retry: 1, // Only retry once on failure
            refetchOnReconnect: true, // Refetch when reconnecting to internet
        },
        mutations: {
            retry: 0, // Don't retry mutations
        },
    },
});

// Query key factories for type-safe query keys
export const queryKeys = {
    // Posts
    posts: {
        all: ['posts'] as const,
        lists: () => [...queryKeys.posts.all, 'list'] as const,
        list: (filters: object) => [...queryKeys.posts.lists(), filters] as const,
        details: () => [...queryKeys.posts.all, 'detail'] as const,
        detail: (id: string) => [...queryKeys.posts.details(), id] as const,
    },

    // Categories
    categories: {
        all: ['categories'] as const,
        lists: () => [...queryKeys.categories.all, 'list'] as const,
        list: (filters?: object) => [...queryKeys.categories.lists(), filters] as const,
        details: () => [...queryKeys.categories.all, 'detail'] as const,
        detail: (id: string) => [...queryKeys.categories.details(), id] as const,
    },

    // Bookings
    bookings: {
        all: ['bookings'] as const,
        lists: () => [...queryKeys.bookings.all, 'list'] as const,
        list: (filters: object) => [...queryKeys.bookings.lists(), filters] as const,
        details: () => [...queryKeys.bookings.all, 'detail'] as const,
        detail: (id: string) => [...queryKeys.bookings.details(), id] as const,
    },

    // Buildings
    buildings: {
        all: ['buildings'] as const,
        lists: () => [...queryKeys.buildings.all, 'list'] as const,
        list: (filters?: object) => [...queryKeys.buildings.lists(), filters] as const,
        details: () => [...queryKeys.buildings.all, 'detail'] as const,
        detail: (id: string) => [...queryKeys.buildings.details(), id] as const,
    },

    // Rooms
    rooms: {
        all: ['rooms'] as const,
        lists: () => [...queryKeys.rooms.all, 'list'] as const,
        list: (filters: object) => [...queryKeys.rooms.lists(), filters] as const,
        details: () => [...queryKeys.rooms.all, 'detail'] as const,
        detail: (id: string) => [...queryKeys.rooms.details(), id] as const,
    },

    // Users
    users: {
        all: ['users'] as const,
        lists: () => [...queryKeys.users.all, 'list'] as const,
        list: (filters: object) => [...queryKeys.users.lists(), filters] as const,
        details: () => [...queryKeys.users.all, 'detail'] as const,
        detail: (id: string) => [...queryKeys.users.details(), id] as const,
    },

    // Payments
    payments: {
        all: ['payments'] as const,
        lists: () => [...queryKeys.payments.all, 'list'] as const,
        list: (filters: object) => [...queryKeys.payments.lists(), filters] as const,
        details: () => [...queryKeys.payments.all, 'detail'] as const,
        detail: (id: string) => [...queryKeys.payments.details(), id] as const,
    },
} as const;
