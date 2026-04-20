import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

const StatCard = ({ title, value, icon, color, trend }) => (
  <div
    className="rounded-2xl p-6 hover:opacity-90 transition-all duration-200 border"
    style={{
      backgroundColor: 'var(--bg-card)',
      borderColor: 'var(--border-color)'
    }}
  >
    <div className="flex items-center justify-between mb-4">
      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
        {title}
      </p>
      <span className="text-2xl">{icon}</span>
    </div>
    <p className={`text-3xl font-bold ${color}`}>{value}</p>
    {trend && (
      <p className={`text-xs mt-2 ${trend.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>
        {trend} vs last week
      </p>
    )}
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="rounded-xl px-4 py-3 shadow-xl border"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-color)'
        }}
      >
        <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
          {label}
        </p>
        <p className="text-emerald-400 font-bold text-sm">
          PKR {payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockItems: 0,
    totalCustomers: 0,
    monthlyRevenue: 0
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [revenueChartData, setRevenueChartData] = useState([]);
  const [categoryChartData, setCategoryChartData] = useState([]);
  const [weeklyTrend, setWeeklyTrend] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [inventoryRes, customersRes, transactionsRes] = await Promise.all([
        api.get('/inventory'),
        api.get('/customers'),
        api.get('/transactions')
      ]);

      const products = inventoryRes.data.products;
      const customers = customersRes.data.customers;
      const transactions = transactionsRes.data.transactions;

      const now = new Date();

      const lowStock = products.filter(p => p.quantity < 10).length;

      const monthlyRevenue = transactions
        .filter(t => {
          const d = new Date(t.date);
          return d.getMonth() === now.getMonth() &&
            d.getFullYear() === now.getFullYear();
        })
        .reduce((s, t) => s + t.amount, 0);

      setStats({
        totalProducts: products.length,
        lowStockItems: lowStock,
        totalCustomers: customers.length,
        monthlyRevenue
      });

      setRecentTransactions(transactions.slice(0, 5));

      // Last 7 days chart data
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        const dayRevenue = transactions
          .filter(t => new Date(t.date).toDateString() === date.toDateString())
          .reduce((s, t) => s + t.amount, 0);
        return {
          day: date.toLocaleDateString('en-PK', { weekday: 'short' }),
          revenue: dayRevenue
        };
      });
      setRevenueChartData(last7Days);

      // Weekly trend
      const thisWeekTotal = last7Days.reduce((s, d) => s + d.revenue, 0);
      const lastWeekTotal = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (13 - i));
        return transactions
          .filter(t => new Date(t.date).toDateString() === date.toDateString())
          .reduce((s, t) => s + t.amount, 0);
      }).reduce((s, d) => s + d, 0);

      if (lastWeekTotal > 0) {
        const change = (((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100).toFixed(0);
        setWeeklyTrend(change > 0 ? '+' + change + '%' : change + '%');
      }

      // Category pie chart
      const categoryMap = {};
      products.forEach(p => {
        if (!categoryMap[p.category]) categoryMap[p.category] = 0;
        categoryMap[p.category] += p.quantity;
      });
      const categoryData = Object.entries(categoryMap)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);
      setCategoryChartData(categoryData);

    } catch (error) {
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-PK', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getTodayDate = () => {
    return new Date().toLocaleDateString('en-PK', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getFirstName = () => {
    if (!user || !user.name) return '';
    return user.name.split(' ')[0];
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 rounded-lg w-64" style={{ backgroundColor: 'var(--bg-card)' }} />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 rounded-2xl" style={{ backgroundColor: 'var(--bg-card)' }} />
          ))}
        </div>
        <div className="h-64 rounded-2xl" style={{ backgroundColor: 'var(--bg-card)' }} />
      </div>
    );
  }

  const hasRevenue = revenueChartData.some(d => d.revenue > 0);

  return (
    <div className="space-y-6">

      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Welcome back, {getFirstName()} 👋
          </h1>
          <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
            Here is what is happening with{' '}
            <span className="text-emerald-400">{user && user.brandName}</span> today
          </p>
        </div>
        <div className="text-right">
          <p className="bg-emerald-400 p-1 rounded-lg text-white text-m">
            {getTodayDate()}
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          icon="📦"
          color="text-[var(--text-primary)]"
        />
        <StatCard
          title="Low Stock Items"
          value={stats.lowStockItems}
          icon="⚠️"
          color={stats.lowStockItems > 0 ? 'text-red-400' : 'text-emerald-400'}
        />
        <StatCard
          title="Total Customers"
          value={stats.totalCustomers}
          icon="👥"
          color="text-[var(--text-primary)]"
        />
        <StatCard
          title="Monthly Revenue"
          value={'PKR ' + stats.monthlyRevenue.toLocaleString()}
          icon="💰"
          color="text-emerald-400"
          trend={weeklyTrend}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Revenue Bar Chart */}
        <div
          className="lg:col-span-2 rounded-2xl p-6 border"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-color)'
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                📈 Revenue Last 7 Days
              </h2>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Daily revenue breakdown
              </p>
            </div>
            {weeklyTrend && (
              <span className={
                'text-sm font-bold px-3 py-1 rounded-full ' +
                (weeklyTrend.startsWith('+')
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'bg-red-500/10 text-red-400')
              }>
                {weeklyTrend} this week
              </span>
            )}
          </div>

          {!hasRevenue ? (
            <div className="flex items-center justify-center h-48">
              <div className="text-center">
                <p className="text-4xl mb-2">📊</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  No transactions yet
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  Add sales to see revenue chart
                </p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={revenueChartData}
                margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
              >
                <XAxis
                  dataKey="day"
                  tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}
                  width={40}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="revenue"
                  fill="#10b981"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={48}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Category Pie Chart */}
        <div
          className="rounded-2xl p-6 border"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-color)'
          }}
        >
          <h2 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
            🗂 Stock by Category
          </h2>
          <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
            Units per category
          </p>

          {categoryChartData.length === 0 ? (
            <div className="flex items-center justify-center h-48">
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                No products yet
              </p>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                      fontSize: '12px'
                    }}
                    formatter={(value, name) => [value + ' units', name]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {categoryChartData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: COLORS[index % COLORS.length] }}
                      />
                      <p className="text-xs truncate max-w-28" style={{ color: 'var(--text-secondary)' }}>
                        {item.name}
                      </p>
                    </div>
                    <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div
        className="rounded-2xl p-6 border"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-color)'
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
            Recent Transactions
          </h2>
          <a
            href="/inventory"
            className="text-emerald-400 hover:text-emerald-300 text-xs transition-colors"
          >
            View inventory →
          </a>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-4xl mb-3">📊</p>
            <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
              No transactions yet
            </p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              Add your first sale to see activity here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentTransactions.map((t) => (
              <div
                key={t._id}
                className="flex items-center justify-between py-3 border-b last:border-0"
                style={{ borderColor: 'var(--border-color)' }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs">💳</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {t.productName}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {t.customerId && t.customerId.customerName
                        ? t.customerId.customerName
                        : 'Customer'
                      } • {formatDate(t.date)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-emerald-400 text-sm font-semibold">
                    PKR {t.amount.toLocaleString()}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Qty: {t.quantity}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div
        className="rounded-2xl p-6 border"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-color)'
        }}
      >
        <h2 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          ⚡ Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { href: '/inventory',   icon: '📦', label: 'Add Product'   },
            { href: '/customers',   icon: '👤', label: 'Add Customer'  },
            { href: '/ai-assistant',icon: '🤖', label: 'Ask AI'        },
            { href: '/briefing',    icon: '🌅', label: 'Daily Briefing'},
          ].map(({ href, icon, label }) => (
            <a
              key={href}
              href={href}
              className="flex flex-col items-center gap-2 p-4 rounded-xl transition-colors duration-200 border"
              style={{
                backgroundColor: 'var(--bg-hover)',
                borderColor: 'var(--border-color)'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = 'var(--bg-hover-active)';
                e.currentTarget.style.borderColor = 'var(--border-hover)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                e.currentTarget.style.borderColor = 'var(--border-color)';
              }}
            >
              <span className="text-2xl">{icon}</span>
              <span className="text-xs text-center" style={{ color: 'var(--text-secondary)' }}>
                {label}
              </span>
            </a>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Dashboard;