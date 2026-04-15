import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Receipt, Package, BarChart3, Lightbulb, RotateCcw, Users, Settings,
  Search, Bell, Sun, Moon, LogOut, ChevronLeft, Menu, User, X,
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { PageTransition } from '@/components/shared/PageTransition';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { useWebSocketNotifications } from '@/hooks/useWebSocket';
import { useIsMobile } from '@/hooks/use-mobile';
import { CommandPalette } from '@/components/shared/CommandPalette';
import { NotificationCenter } from '@/components/shared/NotificationCenter';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';

const allNavItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', adminOnly: true },
  { label: 'Billing', icon: Receipt, path: '/billing', adminOnly: false },
  { label: 'Products', icon: Package, path: '/products', adminOnly: false },
  { label: 'Reports', icon: BarChart3, path: '/reports', adminOnly: true },
  { label: 'Insights', icon: Lightbulb, path: '/insights', adminOnly: true },
  { label: 'Returns', icon: RotateCcw, path: '/returns', adminOnly: true },
  { label: 'Customers', icon: Users, path: '/customers', adminOnly: true },
  { label: 'Settings', icon: Settings, path: '/settings', adminOnly: false },
];

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const isAdmin = user?.role === 'admin';
  const navItems = allNavItems.filter((item) => isAdmin || !item.adminOnly);

  useWebSocketNotifications();

  // Close mobile drawer on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  // Cmd+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  // Shared sidebar content
  const SidebarNav = ({ mobile = false }: { mobile?: boolean }) => {
    const showLabels = mobile || !collapsed;
    return (
      <>
        <div className="flex items-center justify-between px-4 h-16 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-primary-foreground">R</span>
            </div>
            {showLabels && <span className="font-bold text-lg">RetailPro</span>}
          </div>
          {!mobile && (
            <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)} className="h-8 w-8">
              {collapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-3">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                'text-muted-foreground hover:text-foreground hover:bg-accent',
                !showLabels && 'justify-center px-2',
              )}
              activeClassName="bg-primary/10 text-primary hover:bg-primary/15"
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {showLabels && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {showLabels && user && (
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate capitalize">{user.role}</p>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Command Palette */}
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />

      {/* Desktop Sidebar */}
      {!isMobile && (
        <motion.aside
          animate={{ width: collapsed ? 72 : 256 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="no-print flex flex-col border-r border-border bg-card h-full shrink-0 overflow-hidden z-20"
        >
          <SidebarNav />
        </motion.aside>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top navbar */}
        <header className="no-print h-16 border-b border-border bg-card/80 backdrop-blur-xl flex items-center justify-between px-4 md:px-6 shrink-0 z-10">
          <div className="flex items-center gap-3 flex-1">
            {/* Mobile hamburger */}
            {isMobile && (
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-72 flex flex-col">
                  <SidebarNav mobile />
                </SheetContent>
              </Sheet>
            )}

            <div
              className="relative max-w-md flex-1 cursor-pointer"
              onClick={() => setCommandOpen(true)}
            >
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <div className="pl-9 pr-16 py-2 rounded-md bg-muted/50 text-sm text-muted-foreground select-none">
                Search… <kbd className="hidden sm:inline-flex ml-1 pointer-events-none h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">⌘K</kbd>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <NotificationCenter />

            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Settings className="mr-2 h-4 w-4" /> Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Breadcrumbs */}
        <Breadcrumbs />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <ErrorBoundary>
            <PageTransition>
              <Outlet />
            </PageTransition>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
