import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { buildingService, GetBuildingsParams } from '@/services/buildingService';
import { queryKeys } from '@/lib/queryClient';
import { Building } from '@/types';
import { BuildingFormData } from '@/lib/validations';

// ============ QUERIES ============

/**
 * Hook để fetch danh sách buildings với pagination
 */
export const useBuildings = (params?: GetBuildingsParams) => {
    return useQuery({
        queryKey: queryKeys.buildings.list(params),
        queryFn: async () => {
            const response = await buildingService.getAll(params);
            return {
                data: response.data as Building[],
                meta: response.meta,
            };
        },
    });
};

/**
 * Hook để fetch chi tiết một building
 */
export const useBuilding = (id: string | undefined) => {
    return useQuery({
        queryKey: queryKeys.buildings.detail(id || ''),
        queryFn: async () => {
            if (!id) throw new Error('Building ID is required');
            return await buildingService.getById(id);
        },
        enabled: !!id,
    });
};

// ============ MUTATIONS ============

/**
 * Hook để tạo building mới
 */
export const useCreateBuilding = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: BuildingFormData & { imageFiles?: File[] }) =>
            buildingService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.buildings.lists() });
        },
    });
};

/**
 * Hook để update building
 */
export const useUpdateBuilding = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: BuildingFormData & { imageFiles?: File[] } }) =>
            buildingService.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.buildings.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: queryKeys.buildings.lists() });
        },
    });
};

/**
 * Hook để xóa building
 */
export const useDeleteBuilding = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => buildingService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.buildings.lists() });
        },
    });
};

/**
 * Hook để upload images cho building
 */
export const useUploadBuildingImages = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ buildingId, images }: { buildingId: string; images: File[] }) =>
            buildingService.uploadImages(buildingId, images),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.buildings.detail(variables.buildingId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.buildings.lists() });
        },
    });
};
