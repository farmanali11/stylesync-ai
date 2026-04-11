import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, 
  LayoutDashboard, 
  PackageSearch, 
  UsersRound, 
  BotMessageSquare, 
  MoonStar, 
  TrendingUp, 
  MessageSquareShare, 
  Activity, 
  Ghost, 
  ShieldAlert, 
  Zap,
  LogOut,
  Menu
} from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Expert Tip: Add specific colors to each icon to give the UI life
  const navItems = [
    { path: '/briefing', label: 'Daily Briefing', icon: <Sparkles size={20} strokeWidth={1.5} className="text-amber-400" /> },
    { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} strokeWidth={1.5} className="text-sky-400" /> },
    { path: '/inventory', label: 'Inventory', icon: <PackageSearch size={20} strokeWidth={1.5} className="text-indigo-400" /> },
    { path: '/customers', label: 'Customers', icon: <UsersRound size={20} strokeWidth={1.5} className="text-purple-400" /> },
    { path: '/ai-assistant', label: 'AI Assistant', icon: <BotMessageSquare size={20} strokeWidth={1.5} className="text-emerald-400" /> },
    { path: '/eid-forecast', label: 'Eid Forecast', icon: <MoonStar size={20} strokeWidth={1.5} className="text-yellow-200" /> },
    { path: '/profit', label: 'Profit Intel', icon: <TrendingUp size={20} strokeWidth={1.5} className="text-green-400" /> },
    { path: '/whatsapp-hub', label: 'WhatsApp Hub', icon: <MessageSquareShare size={20} strokeWidth={1.5} className="text-teal-400" /> },
    { path: '/health-score', label: 'Health Score', icon: <Activity size={20} strokeWidth={1.5} className="text-rose-400" /> },
    { path: '/ghost-inventory', label: 'Ghost Inventory', icon: <Ghost size={20} strokeWidth={1.5} className="text-gray-400" /> },
    { path: '/anomalies', label: 'Anomaly Detection', icon: <ShieldAlert size={20} strokeWidth={1.5} className="text-orange-400" /> },
    { path: '/api-dashboard', label: 'API Integration', icon: <Zap size={20} strokeWidth={1.5} className="text-cyan-400" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-950 flex font-sans selection:bg-emerald-500/30">

      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} 
                      bg-gray-900 border-r border-gray-800/50 
                      transition-all duration-300 ease-in-out flex flex-col z-50`}>

        {/* Logo Section */}
        <div className="h-16 flex items-center px-6 border-b border-gray-800/50 bg-gray-900/50 backdrop-blur-xl">
          {sidebarOpen ? (
            <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-gray-900">S</div>
              Style<span className="text-emerald-400">Sync</span> AI
            </h1>
          ) : (
            <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center text-gray-900 font-bold mx-auto">S</div>
          )}
        </div>

        {/* Nav Items */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto sidebar-scroll">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-4 px-3 py-2.5 rounded-xl transition-all duration-200 group relative
                           ${isActive 
                             ? 'bg-emerald-500/10 text-emerald-400 shadow-[inset_0_0_10px_rgba(16,185,129,0.05)]' 
                             : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-100'}`}
              >
                {/* Active Indicator Line */}
                {isActive && <div className="absolute left-0 w-1 h-5 bg-emerald-500 rounded-r-full" />}
                
                <div className={`transition-transform duration-200 group-hover:scale-110 ${isActive ? 'scale-110' : ''}`}>
                  {item.icon}
                </div>

                {sidebarOpen && (
                  <span className="text-[13px] font-semibold tracking-wide">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User + Logout Section */}
        <div className="p-4 bg-gray-900/80 border-t border-gray-800/50">
          {sidebarOpen && user && (
            <div className="px-3 py-3 mb-3 bg-gray-800/30 rounded-xl border border-gray-800/50">
              <p className="text-white text-sm font-bold truncate">{user?.name}</p>
              <p className="text-emerald-500/80 text-[10px] uppercase tracking-widest font-bold mt-0.5">
                {user?.brandName || 'ADMIN'}
              </p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 px-3 py-2.5 w-full
                     text-gray-400 hover:bg-red-500/10 hover:text-red-400
                     rounded-xl transition-all duration-200 group"
          >
            <LogOut size={20} strokeWidth={1.5} className="group-hover:-translate-x-1 transition-transform" />
            {sidebarOpen && <span className="text-sm font-bold">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">

        {/* Glassmorphism Header */}
        <header className="h-16 bg-gray-900/50 backdrop-blur-md border-b border-gray-800/50 
                           px-8 flex items-center justify-between z-40">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-all shadow-sm"
            >
              <Menu size={20} />
            </button>
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-400">
              {navItems.find(i => i.path === location.pathname)?.label || 'Overview'}
            </h2>
          </div>
          
          {/* Top Bar Action (Optional Placeholder for Profile/Notifications) */}
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-[10px] font-bold text-gray-950">
              FA
            </div>
          </div>
        </header>

        {/* Page Content with custom scrollbar */}
        <main className="flex-1 overflow-y-auto bg-gray-950 p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;