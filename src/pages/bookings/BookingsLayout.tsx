import { NavLink, Outlet } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LayoutList, CalendarDays } from 'lucide-react';

const BookingsLayout = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Quản lý đặt phòng</h1>
      </div>

      <div className="flex flex-wrap gap-1 border-b border-border">
        <NavLink
          to="/bookings"
          end
          className={({ isActive }) =>
            cn(
              'inline-flex items-center gap-2 rounded-t-md px-4 py-2.5 text-sm font-medium transition-colors border border-transparent -mb-px',
              isActive
                ? 'bg-background text-foreground border-border border-b-background shadow-sm relative z-[1]'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            )
          }
        >
          <LayoutList className="h-4 w-4 shrink-0" />
          Danh sách
        </NavLink>
        <NavLink
          to="/bookings/calendar"
          className={({ isActive }) =>
            cn(
              'inline-flex items-center gap-2 rounded-t-md px-4 py-2.5 text-sm font-medium transition-colors border border-transparent -mb-px',
              isActive
                ? 'bg-background text-foreground border-border border-b-background shadow-sm relative z-[1]'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            )
          }
        >
          <CalendarDays className="h-4 w-4 shrink-0" />
          Lịch tháng
        </NavLink>
      </div>

      <Outlet />
    </div>
  );
};

export default BookingsLayout;
