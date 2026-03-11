import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Building2,
  Globe,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useLocation } from 'wouter';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Users, label: 'People', path: '/people' },
  { icon: Building2, label: 'Properties', path: '/properties' },
  { icon: Globe, label: 'Community', path: '/community' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const [location, setLocation] = useLocation();

  return (
    <aside
      className={cn(
        'flex flex-col h-screen bg-white border-r border-gray-200 transition-all duration-200 shrink-0',
        collapsed ? 'w-16' : 'w-56'
      )}
    >
      {/* Logo area */}
      <div className="h-14 flex items-center px-4 border-b border-gray-100">
        {!collapsed && (
          <span className="text-base font-semibold tracking-tight text-gray-900">
            Relate
          </span>
        )}
        <button
          onClick={onToggle}
          className={cn(
            'p-1.5 rounded-md hover:bg-gray-100 transition-colors text-gray-400',
            collapsed ? 'mx-auto' : 'ml-auto'
          )}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-2 px-2 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.path === '/'
              ? location === '/'
              : location.startsWith(item.path);
          return (
            <button
              key={item.path}
              onClick={() => setLocation(item.path)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <item.icon
                className={cn(
                  'w-[18px] h-[18px] shrink-0',
                  isActive ? 'text-emerald-600' : 'text-gray-400'
                )}
              />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
