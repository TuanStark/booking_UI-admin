import { useQuery } from '@tanstack/react-query';
import { auditLogService, AuditLogQuery } from '@/services/auditLogService';

export const auditLogQueryKeys = {
  all: ['audit-logs'] as const,
  list: (params: AuditLogQuery) => ['audit-logs', 'list', params] as const,
};

export const useAuditLogs = (query?: AuditLogQuery) => {
  return useQuery({
    queryKey: auditLogQueryKeys.list(query ?? {}),
    queryFn: () => auditLogService.findAll(query),
    staleTime: 30_000,
  });
};
