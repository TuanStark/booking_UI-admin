import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface ConfirmDialogConfig {
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'default' | 'destructive';
    onConfirm: () => void | Promise<void>;
}

interface UIState {
    // Sidebar state
    sidebarOpen: boolean;
    sidebarCollapsed: boolean;

    // Confirm dialog state
    confirmDialog: (ConfirmDialogConfig & { isOpen: boolean }) | null;

    // Global loading state
    globalLoading: boolean;

    // Actions
    toggleSidebar: () => void;
    setSidebarOpen: (open: boolean) => void;
    setSidebarCollapsed: (collapsed: boolean) => void;

    openConfirmDialog: (config: ConfirmDialogConfig) => void;
    closeConfirmDialog: () => void;

    setGlobalLoading: (loading: boolean) => void;
}

export const useUIStore = create<UIState>()(
    devtools(
        persist(
            (set) => ({
                // Initial state
                sidebarOpen: true,
                sidebarCollapsed: false,
                confirmDialog: null,
                globalLoading: false,

                // Sidebar actions
                toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
                setSidebarOpen: (open) => set({ sidebarOpen: open }),
                setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

                // Confirm dialog actions
                openConfirmDialog: (config) => set({
                    confirmDialog: { ...config, isOpen: true },
                }),
                closeConfirmDialog: () => set({ confirmDialog: null }),

                // Global loading actions
                setGlobalLoading: (loading) => set({ globalLoading: loading }),
            }),
            {
                name: 'ui-store',
                partialize: (state) => ({
                    sidebarCollapsed: state.sidebarCollapsed,
                }),
            }
        ),
        { name: 'UIStore' }
    )
);

// Selector hooks for better performance
export const useSidebarOpen = () => useUIStore((state) => state.sidebarOpen);
export const useSidebarCollapsed = () => useUIStore((state) => state.sidebarCollapsed);
export const useConfirmDialog = () => useUIStore((state) => state.confirmDialog);
export const useGlobalLoading = () => useUIStore((state) => state.globalLoading);
