import Link from 'next/link';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  BookOpen,
  FolderKanban,
  MessageSquare,
  Users,
  BriefcaseBusiness,
  Mail,
  Search,
  Upload,
  Menu,
  X,
  Moon,
  Sun,
  LogOut,
  Bell,
  ChevronRight,
  Settings,
  Sparkles,
  ChevronDown,
  Tag,
  FolderTree,
  Code,
  DollarSign,
  Handshake,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  roles?: string[];
  group?: string;
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, group: 'Main' },
  { name: 'Services', href: '/services', icon: Briefcase, group: 'Content' },
  { name: 'CMS Pages', href: '/cms/pages', icon: FileText, group: 'Content' },
  { name: 'Blog', href: '/blog', icon: BookOpen, group: 'Content' },
  { name: 'Blog Categories', href: '/blog-categories', icon: Tag, group: 'Content' },
  { name: 'Portfolio', href: '/portfolio', icon: FolderKanban, group: 'Content' },
  { name: 'Portfolio Categories', href: '/portfolio-categories', icon: FolderTree, group: 'Content' },
  { name: 'Testimonials', href: '/testimonials', icon: MessageSquare, group: 'Content' },
  { name: 'Team', href: '/team', icon: Users, group: 'Content' },
  { name: 'Tech Stack', href: '/tech-stack', icon: Code, group: 'Content' },
  { name: 'Pricing Plans', href: '/pricing', icon: DollarSign, group: 'Content' },
  { name: 'Trusted Partners', href: '/partners', icon: Handshake, group: 'Content' },
  { name: 'Service Categories', href: '/service-categories', icon: FolderTree, group: 'Content' },
  { name: 'Jobs', href: '/jobs', icon: BriefcaseBusiness, roles: ['Admin', 'SuperAdmin'], group: 'Management' },
  { name: 'Inquiries', href: '/inquiries', icon: Mail, roles: ['Admin', 'SuperAdmin'], group: 'Management' },
  { name: 'Newsletter', href: '/newsletter', icon: Mail, roles: ['Admin', 'SuperAdmin'], group: 'Management' },
  { name: 'SEO', href: '/seo', icon: Search, roles: ['Admin', 'SuperAdmin'], group: 'Settings' },
  { name: 'Uploads', href: '/uploads', icon: Upload, group: 'Settings' },
];

export default function Layout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, hasRole } = useAuth();
  const [theme, setTheme] = useState<string>(
    typeof window !== 'undefined' ? localStorage.getItem('theme') || 'light' : 'light'
  );
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [userMenuOpen, setUserMenuOpen] = useState<boolean>(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    Main: true,
    Content: true,
    Management: true,
    Settings: true,
  });

  const sectionTitle = useMemo(() => {
    const path = router.pathname.split('/')[1];
    return path ? path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ') : 'Dashboard';
  }, [router.pathname]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [theme]);

  function logout() {
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    router.replace('/login');
  }

  const filteredNav = navigation.filter((item) => !item.roles || hasRole(...item.roles));
  
  const groupedNav = filteredNav.reduce((acc, item) => {
    const group = item.group || 'Other';
    if (!acc[group]) acc[group] = [];
    acc[group].push(item);
    return acc;
  }, {} as Record<string, NavItem[]>);

  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) => ({ ...prev, [group]: !prev[group] }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex">
      {/* Mobile menu backdrop */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: sidebarOpen ? 280 : 0,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={cn(
          'fixed lg:relative inset-y-0 left-0 z-40 lg:z-auto bg-card/95 backdrop-blur-xl border-r border-border/50 overflow-hidden shadow-xl shrink-0',
          !sidebarOpen && 'lg:w-0 lg:overflow-hidden',
          mobileMenuOpen && 'z-50'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-20 px-6 border-b border-border/50 shrink-0">
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary-blue to-primary-purple rounded-2xl blur-xl opacity-60 group-hover:opacity-100 transition-opacity" />
                <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-blue to-primary-purple flex items-center justify-center shadow-2xl">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
              </motion.div>
              {sidebarOpen && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="font-display font-bold text-2xl gradient-text"
                >
                  Nullscape
                </motion.span>
              )}
            </Link>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden btn btn-ghost btn-sm"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
            {Object.entries(groupedNav).map(([group, items]) => (
              <div key={group} className="mb-6">
                {sidebarOpen && (
                  <button
                    onClick={() => toggleGroup(group)}
                    className="flex items-center justify-between w-full px-3 py-2.5 mb-2 text-xs font-bold text-muted-foreground uppercase tracking-widest hover:text-foreground transition-colors"
                  >
                    <span>{group}</span>
                    <ChevronDown
                      className={cn(
                        'w-4 h-4 transition-transform duration-200',
                        expandedGroups[group] && 'rotate-180'
                      )}
                    />
                  </button>
                )}
                <AnimatePresence>
                  {expandedGroups[group] && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-1"
                    >
                      {items.map((item, index) => {
                        const isActive = router.pathname.startsWith(item.href);
                        const Icon = item.icon;
                        return (
                          <motion.div
                            key={item.name}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.03 }}
                          >
                            <Link
                              href={item.href}
                              className={cn(
                                'sidebar-nav-item',
                                isActive && 'active'
                              )}
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              <Icon className="w-5 h-5 shrink-0" />
                              {sidebarOpen && (
                                <>
                                  <span className="flex-1">{item.name}</span>
                                  {item.badge && (
                                    <span className="px-2.5 py-1 text-xs font-bold bg-gradient-to-r from-primary-blue to-primary-purple text-white rounded-full shadow-md">
                                      {item.badge}
                                    </span>
                                  )}
                                </>
                              )}
                            </Link>
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </nav>

          {/* User section */}
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 border-t border-border/50 space-y-3 shrink-0 bg-muted/20"
            >
              <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-br from-primary-blue/10 to-primary-purple/10 border border-primary-blue/20">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-blue to-primary-purple flex items-center justify-center text-white text-base font-bold shrink-0 shadow-lg">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{user?.name || 'User'}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email || ''}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="flex-1 btn btn-outline btn-sm"
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
                <button
                  onClick={logout}
                  className="flex-1 btn btn-outline btn-sm text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  aria-label="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.aside>

      {/* Main content */}
      <div className={cn('flex-1 min-w-0 transition-all duration-300 relative z-10 flex flex-col')}>
        {/* Header */}
        <header className="sticky top-0 z-30 glass-strong border-b border-border/50 shrink-0">
          <div className="flex items-center justify-between h-20 px-6">
            <div className="flex items-center gap-6">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden btn btn-ghost btn-sm z-50 relative"
                aria-label="Toggle menu"
              >
                <Menu className="w-5 h-5" />
              </button>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hidden lg:flex btn btn-ghost btn-sm"
                aria-label="Toggle sidebar"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold mb-1">{sectionTitle}</h1>
                <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Link href="/dashboard" className="hover:text-foreground transition-colors font-medium">
                    Dashboard
                  </Link>
                  {router.pathname !== '/dashboard' && (
                    <>
                      <ChevronRight className="w-4 h-4" />
                      <span className="font-medium">{sectionTitle}</span>
                    </>
                  )}
                </nav>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Search */}
              <button
                onClick={() => {}}
                className="hidden md:flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 border-input bg-background hover:bg-accent text-sm text-muted-foreground transition-all hover:border-primary/50"
              >
                <Search className="w-4 h-4" />
                <span className="hidden lg:inline">Search...</span>
                <kbd className="hidden lg:inline-flex items-center gap-1 px-2 py-1 text-xs font-bold bg-muted border border-border rounded-lg">
                  ⌘K
                </kbd>
              </button>

              {/* Notifications */}
              <button
                className="relative btn btn-ghost btn-sm p-2.5"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-destructive rounded-full ring-2 ring-background" />
              </button>

              {/* User menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="btn btn-ghost btn-sm p-1.5"
                  aria-label="User menu"
                >
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-blue to-primary-purple flex items-center justify-center text-white text-sm font-bold shadow-lg">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                </button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setUserMenuOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-64 rounded-2xl border border-border bg-card shadow-2xl z-20 p-2"
                      >
                        <div className="px-4 py-3 border-b border-border mb-2">
                          <p className="text-sm font-bold">{user?.name}</p>
                          <p className="text-xs text-muted-foreground">{user?.email}</p>
                          <p className="text-xs text-muted-foreground mt-1 font-medium">{user?.roles?.join(', ')}</p>
                        </div>
                        <div className="space-y-1">
                          <button
                            onClick={() => {
                              setTheme(theme === 'dark' ? 'light' : 'dark');
                              setUserMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm rounded-xl hover:bg-accent transition-colors"
                          >
                            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                          </button>
                          <Link
                            href="/settings"
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm rounded-xl hover:bg-accent transition-colors"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <Settings className="w-4 h-4" />
                            Settings
                          </Link>
                          <button
                            onClick={logout}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm rounded-xl hover:bg-destructive/10 text-destructive transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            Logout
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 lg:p-8 relative z-10 overflow-auto">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
