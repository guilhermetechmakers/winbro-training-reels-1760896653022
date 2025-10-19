import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Library, 
  BookOpen, 
  Settings, 
  Users, 
  Upload, 
  BarChart3,
  ChevronLeft,
  ChevronRight,
  User,
  LogOut,
  Shield,
  FileText,
  DollarSign
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  
  // For now, we'll assume admin role - this should be connected to actual auth context
  const isAdmin = true; // TODO: Connect to actual auth context

  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Library', href: '/library', icon: Library },
    { name: 'My Courses', href: '/courses', icon: BookOpen },
    { name: 'Upload', href: '/upload', icon: Upload },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    ...(isAdmin ? [
      { name: 'Admin Dashboard', href: '/admin', icon: Shield },
      { name: 'User Management', href: '/admin/users', icon: Users },
      { name: 'Content Moderation', href: '/admin/content', icon: FileText },
      { name: 'Subscriptions', href: '/admin/subscriptions', icon: DollarSign },
    ] : []),
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  return (
    <div className={`bg-sidebar-bg border-r border-border transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          {!isCollapsed && (
            <h1 className="text-xl font-bold text-primary-text">Winbro</h1>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-8 w-8"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`nav-item ${
                  isActive(item.href) ? 'nav-item-active' : ''
                }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="ml-3">{item.name}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-accent-blue rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-primary-text truncate">
                  John Smith
                </p>
                <p className="text-xs text-secondary-text truncate">
                  john@company.com
                </p>
              </div>
            )}
          </div>
          
          {!isCollapsed && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-2 justify-start text-secondary-text hover:text-primary-text"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}