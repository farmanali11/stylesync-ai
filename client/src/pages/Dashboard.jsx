import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, LineChart, Line,
  PieChart, Pie, Cell
} from 'recharts';

const StatCard = ({ title, value, icon, color, trend }) => (
  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6
                hover:border-gray-700 transition-colors duration-200">
    <div className="flex items-center justify-between mb-4">
      <p className="text-gray-400 text-sm">{title}</p>
      <span className="text-2xl">{icon}</span>
    </div>
    <p className={`text-3xl font-bold ${color}`}>{value}</p>
    {trend && (
      <p className={`text-xs mt-2 ${
        trend.startsWith('+') ? 'text-emerald-400' : 'text-red-400'
      }`}>
        {trend} vs last week
      </p>
    )}
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 border border-gray-700
                    rounded-xl px-4 py-3 shadow-xl">
        <p className="text-gray-400 text-xs mb-1">{label}</p>
        <p className="text-emerald-400 font-bold text-sm">
          PKR {payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

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

      // Stats
      const lowStock = products.filter(p => p.quantity < 10).length;
      const now = new Date();
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

      // Last 7 days revenue chart
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        const dayRevenue = transactions
          .filter(t => {
            const tDate = new Date(t.date);
            return tDate.toDateString() === date.toDateString();
          })
          .reduce((s, t) => s + t.amount, 0);
        return {
          day: date.toLocaleDateString('en-PK', { weekday: 'short' }),
          revenue: dayRevenue,
          date: date.toLocaleDateString('en-PK', {
            day: 'numeric', month: 'short'
          })
        };
      });
      setRevenueChartData(last7Days);

      // Weekly trend
      const thisWeek = last7Days.reduce((s, d) => s + d.revenue, 0);
      const lastWeekDays = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (13 - i));
        return transactions
          .filter(t => new Date(t.date).toDateString() === date.toDateString())
          .reduce((s, t) => s + t.amount, 0);
      });
      const lastWeek = lastWeekDays.reduce((s, d) => s + d, 0);
      if (lastWeek > 0) {
        const change = (((thisWeek - lastWeek) / lastWeek) * 100).toFixed(0);
        setWeeklyTrend(change > 0 ? `+${change}%` : `${change}%`);
      }

      // Category breakdown pie chart
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

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-800 rounded-lg w-64" />
        <div className="grid grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-32 bg-gray-800 rounded-2xl" />
          ))}
        </div>
        <div className="h-64 bg-gray-800 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-400 mt-1">
            Here is what is happening with{' '}
            <span className="text-emerald-400">{user?.brandName}</span> today
          </p>
        </div>
        <div className="text-right">
          <p className="text-gray-500 text-xs">
            {new Date().toLocaleDateString('en-PK', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          icon="📦"
          color="text-white"
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
          color="text-white"
        />
        <StatCard
          title="Monthly Revenue"
          value={`PKR ${stats.monthlyRevenue.toLocaleString()}`}
          icon="💰"
          color="text-emerald-400"
          trend={weeklyTrend}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Revenue Bar Chart */}
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800
                      rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-white font-semibold">
                📈 Revenue Last 7 Days
              </h2>
              <p className="text-gray-500 text-xs mt-1">
                Daily revenue breakdown
              </p>
            </div>
            {weeklyTrend && (
              <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                weeklyTrend.startsWith('+')
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'bg-red-500/10 text-red-400'
              }`}>
                {weeklyTrend} this week
              </span>
            )}
          </div>
          {revenueChartData.every(d => d.revenue === 0) ? (
            <div className="flex items-center justify-center h-48">
              <div className="text-center">
                <p className="text-4xl mb-2">📊</p>
                <p className="text-gray-500 text-sm">
                  No transactions yet
                </p>
                <p className="text-gray-600 text-xs mt-1">
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
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) =>
                    v >= 1000 ? `${(v/1000).toFixed(0)}k` : v
                  }
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
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-2">
            🗂 Stock by Category
          </h2>
          <p className="text-gray-500 text-xs mb-4">
            Units per category
          </p>
          {categoryChartData.length === 0 ? (
            <div className="flex items-center justify-center h-48">
              <p className="text-gray-500 text-sm">No products yet</p>
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
                    {categoryChartData.map((_, index) => (
                      <Cell
                        key={index}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                    formatter={(value, name) => [
                      `${value} units`, name
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {categoryChartData.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: COLORS[index % COLORS.length] }}
                      />
                      <p className="text-gray-400 text-xs truncate max-w-28">
                        {item.name}
                      </p>
                    </div>
                    <p className="text-white text-xs font-medium">
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
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold">
            Recent Transactions
          </h2>
          
            href="/inventory"
            className="text-emerald-400 hover:text-emerald-300
                     text-xs transition-colors"
          >
            View inventory →
          </a>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-4xl mb-3">📊</p>
            <p className="text-white font-medium">No transactions yet</p>
            <p className="text-gray-500 text-sm mt-1">
              Add your first sale to see activity here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentTransactions.map((t) => (
              <div
                key={t._id}
                className="flex items-center justify-between
                         py-3 border-b border-gray-800 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10
                                border border-emerald-500/20 flex items-center
                                justify-center flex-shrink-0">
                    <span className="text-xs">💳</span>
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">
                      {t.productName}
                    </p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      {t.customerId?.customerName || 'Customer'} •{' '}
                      {new Date(t.date).toLocaleDateString('en-PK', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-emerald-400 text-sm font-semibold">
                    PKR {t.amount.toLocaleString()}
                  </p>
                  <p className="text-gray-500 text-xs">
                    Qty: {t.quantity}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-4">
          ⚡ Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Add Product', icon: '📦', path: '/inventory' },
            { label: 'Add Customer', icon: '👤', path: '/customers' },
            { label: 'Ask AI', icon: '🤖', path: '/ai-assistant' },
            { label: 'Daily Briefing', icon: '🌅', path: '/briefing' },
          ].map((action) => (
            
              key={action.label}
              href={action.path}
              className="flex flex-col items-center gap-2 p-4
                       bg-gray-800 hover:bg-gray-700 rounded-xl
                       transition-colors duration-200 cursor-pointer
                       border border-gray-700 hover:border-gray-600"
            >
              <span className="text-2xl">{action.icon}</span>
              <span className="text-gray-400 text-xs text-center
                             hover:text-white transition-colors">
                {action.label}
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;