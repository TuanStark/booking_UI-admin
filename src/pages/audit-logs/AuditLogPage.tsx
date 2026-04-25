import React, { useState } from 'react';
import { useAuditLogs } from '@/hooks/queries/useAuditLogsQuery';
import type { AuditLogQuery } from '@/services/auditLogService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, ClipboardList, RefreshCw } from 'lucide-react';

const ALL_OPTION_VALUE = '__all__';

const RESOURCE_OPTIONS = [
  { label: 'Tất cả', value: ALL_OPTION_VALUE },
  { label: 'Tòa nhà', value: 'building' },
  { label: 'Phòng', value: 'room' },
  { label: 'Đặt phòng', value: 'booking' },
  { label: 'Người dùng', value: 'user' },
  { label: 'Thanh toán', value: 'payment' },
  { label: 'Thông báo', value: 'notification' },
  { label: 'Bài viết', value: 'post' },
  { label: 'Danh mục bài viết', value: 'post_category' },
  { label: 'Đánh giá', value: 'review' },
  { label: 'Chat', value: 'chat' },
  { label: 'Upload', value: 'upload' },
  { label: 'Xác thực', value: 'auth' },
];

const ACTION_OPTIONS = [
  { label: 'Tất cả', value: ALL_OPTION_VALUE },
  { label: 'Tạo mới', value: 'CREATE' },
  { label: 'Cập nhật', value: 'UPDATE' },
  { label: 'Xoá', value: 'DELETE' },
  { label: 'Bulk Update', value: 'BULK_UPDATE' },
  { label: 'Đăng nhập', value: 'LOGIN' },
  { label: 'Đăng xuất', value: 'LOGOUT' },
];

function getActionBadgeVariant(action: string): 'destructive' | 'secondary' | 'outline' | 'default' {
  switch (action) {
    case 'DELETE': return 'destructive';
    case 'CREATE': return 'default';
    case 'LOGIN':
    case 'LOGOUT': return 'secondary';
    default: return 'outline';
  }
}

function getStatusColor(code: number): string {
  if (code >= 500) return 'text-red-600 dark:text-red-400';
  if (code >= 400) return 'text-amber-600 dark:text-amber-400';
  return 'text-emerald-600 dark:text-emerald-400';
}

function formatMetadataValue(value: unknown): string {
  if (value === null || value === undefined) return 'null';
  if (Array.isArray(value)) {
    return `[${value
      .map((item) => {
        if (typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean') {
          return String(item);
        }
        if (item && typeof item === 'object' && 'name' in (item as Record<string, unknown>)) {
          return String((item as Record<string, unknown>).name ?? '');
        }
        return '[object]';
      })
      .filter(Boolean)
      .join(', ')}]`;
  }
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    if ('name' in obj) return String(obj.name ?? '[object]');
    return '[object]';
  }
  return String(value);
}

const PAGE_SIZE = 20;

const AuditLogPage: React.FC = () => {
  const [filters, setFilters] = useState<AuditLogQuery>({ page: 1, limit: PAGE_SIZE });

  const { data, isLoading, isFetching, refetch } = useAuditLogs(filters);

  const logs = data?.data ?? [];
  const meta = data?.meta;

  const handleFilterChange = (key: keyof AuditLogQuery, value: string) => {
    const normalized = value === ALL_OPTION_VALUE ? undefined : value;
    setFilters((prev) => ({ ...prev, [key]: normalized, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  return (
    <div className="space-y-6 pb-6">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-semibold tracking-tight">Audit Log</h1>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
          Làm mới
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Select
              value={filters.resource ?? ALL_OPTION_VALUE}
              onValueChange={(v) => handleFilterChange('resource', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Loại tài nguyên" />
              </SelectTrigger>
              <SelectContent>
                {RESOURCE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.action ?? ALL_OPTION_VALUE}
              onValueChange={(v) => handleFilterChange('action', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Loại hành động" />
              </SelectTrigger>
              <SelectContent>
                {ACTION_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="date"
              placeholder="Từ ngày"
              value={filters.dateFrom ?? ''}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            />

            <Input
              type="date"
              placeholder="Đến ngày"
              value={filters.dateTo ?? ''}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            />
          </div>

          {(filters.resource || filters.action || filters.dateFrom || filters.dateTo) && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-3"
              onClick={() => setFilters({ page: 1, limit: PAGE_SIZE })}
            >
              Xoá bộ lọc
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span>
              {meta ? `${meta.total.toLocaleString('vi-VN')} bản ghi` : 'Lịch sử thao tác'}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : logs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">
              Chưa có bản ghi nào phù hợp với bộ lọc đang chọn.
            </p>
          ) : (
            <div className="divide-y divide-border">
              {logs.map((log) => (
                <div key={log.id} className="px-6 py-4 hover:bg-muted/30 transition-colors">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2 min-w-0">
                      <Badge variant={getActionBadgeVariant(log.action)}>{log.action}</Badge>
                      <span className="text-sm font-medium text-foreground capitalize">{log.resource}</span>
                      {log.resourceId && (
                        <span className="text-xs text-muted-foreground font-mono">
                          #{log.resourceId.slice(0, 8)}…
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`text-sm font-medium tabular-nums ${getStatusColor(log.statusCode)}`}>
                        {log.statusCode}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(log.createdAt).toLocaleString('vi-VN')}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>
                      <span className="font-medium">Admin:</span>{' '}
                      {log.adminEmail ?? log.adminId}
                    </span>
                    <span className="font-mono">
                      {log.method} {log.path}
                    </span>
                    {log.ip && <span>IP: {log.ip}</span>}
                  </div>

                  {log.metadata && typeof log.metadata === 'object' && (
                    <div className="mt-3 rounded-md border border-border bg-muted/30 p-3">
                      {typeof (log.metadata as any).summary === 'string' &&
                        (!Array.isArray((log.metadata as any).changes) ||
                          (log.metadata as any).changes.length === 0) && (
                        <p className="text-xs text-foreground font-medium">
                          {(log.metadata as any).summary
                            .replace(/->/g, '→')}
                        </p>
                      )}

                      {Array.isArray((log.metadata as any).changes) && (log.metadata as any).changes.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {(log.metadata as any).changes.map((change: any, idx: number) => (
                            <p key={`${log.id}-change-${idx}`} className="text-xs text-muted-foreground font-mono">
                              {String(change.field)}: {formatMetadataValue(change.from)} → {formatMetadataValue(change.to)}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Trang {meta.page} / {meta.totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(meta.page - 1)}
              disabled={meta.page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(meta.page + 1)}
              disabled={meta.page >= meta.totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogPage;
