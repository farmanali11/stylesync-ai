import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  LayoutDashboard,
  Sunrise,
  Package,
  Users,
  Upload,
  Bot,
  Moon,
  DollarSign,
  MessageCircle,
  Heart,
  Ghost,
  ScanSearch,
  PlugZap,
  LogOut,
  Menu,
  Sun,
  MoonStar,
} from 'lucide-react';

const navItems = [
  { path: '/briefing',       label: 'Daily Briefing',    icon: Sunrise        },
  { path: '/',               label: 'Dashboard',         icon: LayoutDashboard},
  { path: '/inventory',      label: 'Inventory',         icon: Package        },
  { path: '/customers',      label: 'Customers',         icon: Users          },
  { path: '/import',         label: 'Import Data',       icon: Upload         },
  { path: '/ai-assistant',   label: 'AI Assistant',      icon: Bot            },
  { path: '/eid-forecast',   label: 'Eid Forecast',      icon: Moon           },
  { path: '/profit',         label: 'Profit Intel',      icon: DollarSign     },
  { path: '/whatsapp-hub',   label: 'WhatsApp Hub',      icon: MessageCircle  },
  { path: '/health-score',   label: 'Health Score',      icon: Heart          },
  { path: '/ghost-inventory',label: 'Ghost Inventory',   icon: Ghost          },
  { path: '/anomalies',      label: 'Anomaly Detection', icon: ScanSearch     },
  { path: '/api-dashboard',  label: 'API Integration',   icon: PlugZap        },
];

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div
      className="min-h-screen flex"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      {/* Sidebar */}
      <div
        className={`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 flex flex-col border-r flex-shrink-0`}
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border-color)'
        }}
      >
        {/* Logo */}
        <div
          className="p-4 border-b flex-shrink-0"
          style={{ borderColor: 'var(--border-color)' }}
        >
          {sidebarOpen ? (
            <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Style<span style={{ color: 'var(--accent)' }}>Sync</span> AI
            </h1>
          ) : (
            <h1 className="text-xl font-bold" style={{ color: 'var(--accent)' }}>S</h1>
          )}
        </div>

        {/* Nav Items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(({ path, label }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-200"
                style={{
                  backgroundColor: isActive ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                  color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                  border: isActive ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid transparent'
                }}
              >
                <Icon size={18} className="flex-shrink-0" />
                {sidebarOpen && (
                  <span className="text-sm font-medium truncate">{label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div
          className="p-3 border-t flex-shrink-0"
          style={{ borderColor: 'var(--border-color)' }}
        >
          {sidebarOpen && (
            <div className="px-3 py-2 mb-2">
              <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                {user?.name}
              </p>
              <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                {user?.brandName}
              </p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg transition-colors duration-200 hover:bg-red-500/10"
            style={{ color: 'var(--text-secondary)' }}
          >
            <LogOut size={18} className="flex-shrink-0" />
            {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top Bar */}
        <header
          className="border-b px-6 py-4 flex items-center gap-4 flex-shrink-0"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border-color)'
          }}
        >
          <button
            onClick={() => setSidebarOpen(prev => !prev)}
            className="transition-colors rounded-lg p-1.5 hover:bg-gray-500/10"
            style={{ color: 'var(--text-secondary)' }}
          >
            <Menu size={20} />
          </button>

          <h2 className="font-medium flex-1" style={{ color: 'var(--text-primary)' }}>
            {navItems.find(i => i.path === location.pathname)?.label || 'Dashboard'}
          </h2>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-200 text-sm font-medium"
            style={{
              backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(5, 150, 105, 0.1)',
              borderColor: isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(5, 150, 105, 0.3)',
              color: 'var(--accent)'
            }}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark
              ? <Sun size={16} />
              : <MoonStar size={16} />
            }
            <span className="hidden md:block">
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </span>
          </button>
        </header>

        {/* Page Content */}
        <main
          className="flex-1 overflow-y-auto p-6"
          style={{ backgroundColor: 'var(--bg-primary)' }}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;