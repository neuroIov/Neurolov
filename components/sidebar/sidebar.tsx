'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Server,
  Cpu,
  Bot,
  Users,
  Wallet,
  Settings,
  HelpCircle,
  Search,
  Star,
  Activity,
  MonitorDot,
  DollarSign,
  Handshake,
  BellDot,
  X,
  Beaker,
  type LucideIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ThemeToggle } from '@/components/theme-toggle';
import { useState, useEffect } from 'react';

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  tooltip?: string;
  disabled?: boolean;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    title: 'MAIN',
    items: [
      {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
        tooltip: 'Overview of your activity'
      },
      {
        title: 'Compute',
        href: '/gpu-marketplace',
        icon: Server,
        badge: 'New',
        tooltip: 'Buy/Sell GPU compute power'
      },
      {
        title: 'AI Models',
        href: '/ai-models',
        icon: Cpu,
        tooltip: 'Pre-trained models for various tasks'
      },
      {
        title: 'AI Agents',
        href: '/ai-agents',
        icon: Bot,
        badge: 'Coming Soon',
        tooltip: 'Autonomous AI assistants',
        disabled: true
      }
    ]
  },
  {
    title: 'EARNINGS & FINANCE',
    items: [
      {
        title: 'Earnings',
        href: '/earnings',
        icon: DollarSign,
        tooltip: 'Track your earnings',
        disabled: true,
        badge: 'Coming Soon'
      },
      {
        title: 'Connect to Earn',
        href: '/connect-to-earn',
        icon: Handshake,
        tooltip: 'Partner with us'
      },
      {
        title: 'Wallet',
        href: '/wallet',
        icon: Wallet,
        tooltip: 'Manage your wallet',
        disabled: true,
        badge: 'Coming Soon'
      }
    ]
  },
  {
    title: 'COMMUNITY',
    items: [
      {
        title: 'Community',
        href: '/community',
        icon: Users,
        tooltip: 'Join our community',
        disabled: true,
        badge: 'Coming Soon'
      }
    ]
  }
];

function NavItem({ item, isCollapsed }: { item: NavItem; isCollapsed: boolean }) {
  const pathname = usePathname();
  const isActive = pathname === item.href;

  if (item.disabled) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'group flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent/50 cursor-not-allowed opacity-50',
              isActive && 'bg-accent',
              isCollapsed ? 'justify-center' : 'justify-between'
            )}
          >
            <div className="flex items-center gap-x-3">
              {item.icon && <item.icon className="h-4 w-4" />}
              {!isCollapsed && item.title}
            </div>
            {!isCollapsed && item.badge && (
              <Badge variant="outline" className="ml-auto">
                {item.badge}
              </Badge>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="flex items-center gap-4">
          {isCollapsed && item.title}
          {item.tooltip}
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href={item.href}
          className={cn(
            'group flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent/50',
            isActive && 'bg-accent',
            isCollapsed ? 'justify-center' : 'justify-between'
          )}
        >
          <div className="flex items-center gap-x-3">
            {item.icon && <item.icon className="h-4 w-4" />}
            {!isCollapsed && item.title}
          </div>
          {!isCollapsed && item.badge && (
            <Badge variant="outline" className="ml-auto">
              {item.badge}
            </Badge>
          )}
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right" className="flex items-center gap-4">
        {isCollapsed && item.title}
        {item.tooltip}
      </TooltipContent>
    </Tooltip>
  );
}

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebarFavorites');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [systemHealth, setSystemHealth] = useState(100);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebarFavorites', JSON.stringify(favorites));
    }
  }, [favorites]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSystemHealth(Math.floor(Math.random() * 20) + 80); // Random between 80-100
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const toggleFavorite = (href: string) => {
    setFavorites(prev => 
      prev.includes(href) 
        ? prev.filter(f => f !== href)
        : [...prev, href]
    );
  };

  const filteredGroups = navGroups.map(group => ({
    ...group,
    items: group.items.filter(item =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(group => group.items.length > 0);

  return (
    <nav
      className={cn(
        'relative flex flex-col gap-4 p-4 pt-0 border-r',
        isCollapsed ? 'w-[80px]' : 'w-[280px]'
      )}
    >
      {/* Header */}
      <div className="flex h-[60px] items-center justify-between px-2">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            <span className="font-semibold">Neurolov</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Search */}
      {!isCollapsed && (
        <div className="relative px-2">
          <Search className="absolute left-4 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search"
            className="pl-8 h-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      )}

      {/* System Health */}
      <div className={cn(
        'flex items-center gap-2 rounded-lg border px-3 py-2 mx-2',
        isCollapsed ? 'justify-center' : ''
      )}>
        <MonitorDot className={cn(
          'h-4 w-4',
          systemHealth > 90 ? 'text-green-500' :
          systemHealth > 80 ? 'text-yellow-500' : 'text-red-500'
        )} />
        {!isCollapsed && (
          <div className="flex flex-1 items-center justify-between">
            <span className="text-sm">System Health</span>
            <span className="text-sm font-medium">{systemHealth}%</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <div className="space-y-4">
          {filteredGroups.map((group, i) => (
            <div key={i} className="space-y-2">
              {!isCollapsed && (
                <div className="px-3">
                  <h3 className="text-xs font-medium text-muted-foreground">
                    {group.title}
                  </h3>
                </div>
              )}
              <div className="space-y-1">
                {group.items.map((item, j) => (
                  <div key={j} className="relative group">
                    <NavItem item={item} isCollapsed={isCollapsed} />
                    {!isCollapsed && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100"
                        onClick={() => toggleFavorite(item.href)}
                      >
                        <Star
                          className={cn('h-4 w-4', {
                            'fill-yellow-400 text-yellow-400': favorites.includes(item.href),
                            'text-gray-400': !favorites.includes(item.href)
                          })}
                        />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="mt-auto flex items-center gap-2 pt-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
            >
              <BellDot size={16} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            No new notifications
          </TooltipContent>
        </Tooltip>

        {!isCollapsed && <ThemeToggle />}
      </div>
    </nav>
  );
}
