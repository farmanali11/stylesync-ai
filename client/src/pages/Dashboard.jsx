import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
    <div className="flex items-center justify-between mb-4">
      <p className="text-gray-400 text-sm">{title}</p>
      <span className="text-2xl">{icon}</span>
    </div>
    <p className={`text-3xl font-bold ${color}`}>{value}</p>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockItems: 0,
    totalCustomers: 0,
    monthlyRevenue: 0
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
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

      // Calculate stats
      const lowStock = products.filter(p => p.quantity < 10).length;

      const now = new Date();
      const monthlyRevenue = transactions
        .filter(t => {
          const tDate = new Date(t.date);
          return tDate.getMonth() === now.getMonth() &&
                 tDate.getFullYear() === now.getFullYear();
        })
        .reduce((sum, t) => sum + t.amount, 0);

      setStats({
        totalProducts: products.length,
        lowStockItems: lowStock,
        totalCustomers: customers.length,
        monthlyRevenue
      });

      setRecentTransactions(transactions.slice(0, 5));
    } catch (error) {
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-emerald-400">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Welcome back, {user?.name} 👋
        </h1>
        <p className="text-gray-400 mt-1">
          Here is what is happening with {user?.brandName} today
        </p>
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
          color={stats.lowStockItems > 0 ? "text-red-400" : "text-emerald-400"}
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
        />
      </div>

      {/* Recent Transactions */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-4">
          Recent Transactions
        </h2>

        {recentTransactions.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No transactions yet. Add your first sale.
          </p>
        ) : (
          <div className="space-y-3">
            {recentTransactions.map((t) => (
              <div
                key={t._id}
                className="flex items-center justify-between 
                         py-3 border-b border-gray-800 last:border-0"
              >
                <div>
                  <p className="text-white text-sm font-medium">
                    {t.productName}
                  </p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    {t.customerId?.customerName || 'Customer'} •{' '}
                    {new Date(t.date).toLocaleDateString()}
                  </p>
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
      {/* Quick Actions */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <a href="/inventory"
            className="flex flex-col items-center gap-2 p-4
                     bg-gray-800 hover:bg-gray-700 rounded-xl
                     transition-colors duration-200">
            <span className="text-2xl">📦</span>
            <span className="text-gray-400 text-xs">Add Product</span>
          </a>
          <a href="/customers"
            className="flex flex-col items-center gap-2 p-4
                     bg-gray-800 hover:bg-gray-700 rounded-xl
                     transition-colors duration-200">
            <span className="text-2xl">👤</span>
            <span className="text-gray-400 text-xs">Add Customer</span>
          </a>
          <a href="/ai-assistant"
            className="flex flex-col items-center gap-2 p-4
                     bg-gray-800 hover:bg-gray-700 rounded-xl
                     transition-colors duration-200">
            <span className="text-2xl">🤖</span>
            <span className="text-gray-400 text-xs">Ask AI</span>
          </a>
          <a href="/"
            className="flex flex-col items-center gap-2 p-4
                     bg-gray-800 hover:bg-gray-700 rounded-xl
                     transition-colors duration-200">
            <span className="text-2xl">📊</span>
            <span className="text-gray-400 text-xs">View Sales</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
  