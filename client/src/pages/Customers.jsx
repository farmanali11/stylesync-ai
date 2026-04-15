import { useState, useEffect } from 'react';
import api from '../utils/api';
import { MessageCircle, Smartphone } from 'lucide-react';

const WhatsAppCard = ({ data, onCopy }) => (
  <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
    <div className="flex items-center justify-between mb-3">
      <div>
        <p className="text-white text-sm font-medium">{data.customerName}</p>
        <p className="text-gray-500 text-xs">{data.phone}</p>
      </div>
      <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs px-2 py-1 rounded-full">
        {data.discountCode}
      </span>
    </div>
    <p className="text-gray-300 text-sm leading-relaxed mb-3">{data.message}</p>
    <button
      onClick={() => onCopy(data.message, data.customerName)}
      className="w-full bg-green-600 hover:bg-green-500 text-white text-sm py-2 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
    >
      <span>📱</span>Copy for WhatsApp
    </button>
  </div>
);

const CustomerPanel = ({ customer, onClose, getDaysSince }) => {
  const days = getDaysSince(customer.lastPurchaseDate);
  const isInactive = days > 60;
  const isVIP = customer.totalSpent > 10000;

  const getEngagementScore = () => {
    if (days <= 30) return { score: 'High', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' };
    if (days <= 60) return { score: 'Medium', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' };
    return { score: 'Low', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' };
  };

  const engagement = getEngagementScore();

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="flex-1 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Panel */}
      <div className="w-96 bg-gray-900 border-l border-gray-800 h-full overflow-y-auto flex flex-col">

        {/* Panel Header */}
        <div className="p-6 border-b border-gray-800 flex items-start justify-between sticky top-0 bg-gray-900 z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-white font-bold text-lg">
                {customer.customerName}
              </h2>
              {isVIP && (
                <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-0.5 rounded-full border border-yellow-500/30">
                  👑 VIP
                </span>
              )}
            </div>
            <p className="text-gray-400 text-sm">{customer.phone}</p>
            {customer.email && (
              <p className="text-gray-500 text-xs mt-0.5">{customer.email}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors bg-gray-800 hover:bg-gray-700 w-8 h-8 rounded-lg flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {/* Panel Content */}
        <div className="p-6 space-y-4 flex-1">

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-800 rounded-xl p-4 text-center">
              <p className="text-emerald-400 font-bold text-xl">
                PKR {(customer.totalSpent || 0).toLocaleString()}
              </p>
              <p className="text-gray-500 text-xs mt-1">Total Spent</p>
            </div>
            <div className={'border rounded-xl p-4 text-center ' + engagement.bg}>
              <p className={'font-bold text-xl ' + engagement.color}>
                {engagement.score}
              </p>
              <p className="text-gray-500 text-xs mt-1">Engagement</p>
            </div>
          </div>

          {/* Last Purchase */}
          <div className={'border rounded-xl p-4 ' + (isInactive ? 'bg-red-500/5 border-red-500/20' : 'bg-gray-800 border-gray-700')}>
            <p className="text-gray-400 text-xs mb-1">Last Purchase</p>
            <p className={'font-semibold ' + (isInactive ? 'text-red-400' : 'text-white')}>
              {days} days ago
            </p>
            <p className="text-gray-500 text-xs mt-1">
              {new Date(customer.lastPurchaseDate).toLocaleDateString('en-PK', {
                day: 'numeric', month: 'long', year: 'numeric'
              })}
            </p>
            {isInactive && (
              <p className="text-red-400 text-xs mt-2">
                ⚠️ Customer needs win-back campaign
              </p>
            )}
          </div>

          {/* Customer Value Rating */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
            <p className="text-gray-400 text-xs mb-3">Customer Value Rating</p>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">Spending Power</span>
                  <span className="text-white">
                    {customer.totalSpent > 50000 ? 'High' : customer.totalSpent > 10000 ? 'Medium' : 'Low'}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-1.5">
                  <div
                    className="bg-emerald-500 h-1.5 rounded-full"
                    style={{ width: Math.min((customer.totalSpent / 100000) * 100, 100) + '%' }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">Recency</span>
                  <span className="text-white">{days <= 30 ? 'Active' : days <= 60 ? 'At Risk' : 'Lost'}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-1.5">
                  <div
                    className={'h-1.5 rounded-full ' + (days <= 30 ? 'bg-emerald-500' : days <= 60 ? 'bg-yellow-500' : 'bg-red-500')}
                    style={{ width: Math.max(100 - (days / 180 * 100), 5) + '%' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Recommended Action */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
            <p className="text-gray-400 text-xs mb-2">AI Recommended Action</p>
            {isInactive && isVIP && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                <p className="text-red-400 text-xs">
                  🚨 High priority win-back — VIP customer inactive for {days} days. Send personalized offer immediately.
                </p>
              </div>
            )}
            {isInactive && !isVIP && (
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg px-3 py-2">
                <p className="text-orange-400 text-xs">
                  ⚠️ Send win-back WhatsApp with 15% discount code to re-engage this customer.
                </p>
              </div>
            )}
            {!isInactive && isVIP && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-2">
                <p className="text-yellow-400 text-xs">
                  👑 VIP customer is active. Send exclusive early access to new collection to maintain loyalty.
                </p>
              </div>
            )}
            {!isInactive && !isVIP && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
                <p className="text-emerald-400 text-xs">
                  ✅ Customer is active. Consider upselling premium products on next purchase.
                </p>
              </div>
            )}
          </div>

          {/* Quick WhatsApp */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
            <p className="text-gray-400 text-xs mb-3">Quick WhatsApp Message</p>
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 mb-3">
              <p className="text-gray-300 text-xs leading-relaxed">
                {isInactive
                  ? 'Assalam o Alaikum ' + customer.customerName + '! Aapko miss kar rahe hain 😊 Sirf aapke liye special 15% discount: WELCOME15 — Valid 48 hours only!'
                  : 'Assalam o Alaikum ' + customer.customerName + '! Hamare naye collection mein aapke liye kuch khaas hai. Zaroor dekhein! 🎁'
                }
              </p>
            </div>
            <a
              href={'https://wa.me/' + customer.phone.replace(/^0/, '92')}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-500 text-white text-sm py-2.5 rounded-lg transition-colors"
            >
              <span><Smartphone size={20} strokeWidth={1.5} className="text-sky-400" /></span>
              Open WhatsApp Chat
            </a>
          </div>

        </div>
      </div>
    </div>
  );
};

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [whatsappMessages, setWhatsappMessages] = useState([]);
  const [generatingMessages, setGeneratingMessages] = useState(false);
  const [showWhatsapp, setShowWhatsapp] = useState(false);
  const [copiedName, setCopiedName] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    email: '',
    totalSpent: '',
    lastPurchaseDate: ''
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/customers');
      setCustomers(res.data.customers);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        await api.put('/customers/' + editingCustomer._id, formData);
      } else {
        await api.post('/customers', formData);
      }
      setFormData({ customerName: '', phone: '', email: '', totalSpent: '', lastPurchaseDate: '' });
      setShowForm(false);
      setEditingCustomer(null);
      fetchCustomers();
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      customerName: customer.customerName,
      phone: customer.phone,
      email: customer.email || '',
      totalSpent: customer.totalSpent,
      lastPurchaseDate: customer.lastPurchaseDate?.split('T')[0] || ''
    });
    setShowForm(true);
    setSelectedCustomer(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this customer?')) return;
    try {
      await api.delete('/customers/' + id);
      setSelectedCustomer(null);
      fetchCustomers();
    } catch (error) {
      console.error(error);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCustomer(null);
    setFormData({ customerName: '', phone: '', email: '', totalSpent: '', lastPurchaseDate: '' });
  };

  const generateWhatsAppMessages = async () => {
    setGeneratingMessages(true);
    setShowWhatsapp(true);
    try {
      const res = await api.get('/chat/whatsapp');
      setWhatsappMessages(res.data.messages);
    } catch (error) {
      console.error(error);
    } finally {
      setGeneratingMessages(false);
    }
  };

  const handleCopy = (message, name) => {
    navigator.clipboard.writeText(message);
    setCopiedName(name);
    setTimeout(() => setCopiedName(''), 2000);
  };

  const getDaysSince = (date) => {
    return Math.floor((new Date() - new Date(date)) / (1000 * 60 * 60 * 24));
  };

  // Filter customers
  const filteredCustomers = customers
    .filter(c => {
      const matchesSearch = c.customerName.toLowerCase()
        .includes(search.toLowerCase()) ||
        c.phone.includes(search);
      const days = getDaysSince(c.lastPurchaseDate);
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && days <= 30) ||
        (statusFilter === 'atrisk' && days > 30 && days <= 60) ||
        (statusFilter === 'inactive' && days > 60) ||
        (statusFilter === 'vip' && c.totalSpent > 10000);
      return matchesSearch && matchesStatus;
    });

  const activeCount = customers.filter(c => getDaysSince(c.lastPurchaseDate) <= 30).length;
  const atRiskCount = customers.filter(c => {
    const d = getDaysSince(c.lastPurchaseDate);
    return d > 30 && d <= 60;
  }).length;
  const inactiveCount = customers.filter(c => getDaysSince(c.lastPurchaseDate) > 60).length;
  const vipCount = customers.filter(c => c.totalSpent > 10000).length;
  const totalRevenue = customers.reduce((s, c) => s + (c.totalSpent || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-emerald-400">Loading customers...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Customer Profile Panel */}
      {selectedCustomer && (
        <CustomerPanel
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          getDaysSince={getDaysSince}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Customers</h1>
          <p className="text-gray-400 mt-1">
            {customers.length} customers •
            PKR {totalRevenue.toLocaleString()} total revenue
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={generateWhatsAppMessages}
            className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2"
          >
            <span><MessageCircle size={20} strokeWidth={1.5} className="text-white-400" /></span>Win-Back Customers
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
          >
            + Add Customer
          </button>
        </div>
      </div>

      {/* Status Filter Pills */}
      <div className="flex gap-3 flex-wrap">
        {[
          { key: 'all', label: 'All', count: customers.length, color: 'border-gray-700 text-gray-400' },
          { key: 'active', label: '✅ Active', count: activeCount, color: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' },
          { key: 'atrisk', label: '⚠️ At Risk', count: atRiskCount, color: 'border-yellow-500/30 text-yellow-400 bg-yellow-500/10' },
          { key: 'inactive', label: '💔 Inactive', count: inactiveCount, color: 'border-red-500/30 text-red-400 bg-red-500/10' },
          { key: 'vip', label: '👑 VIP', count: vipCount, color: 'border-yellow-500/30 text-yellow-400 bg-yellow-500/10' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setStatusFilter(f.key)}
            className={
              'border rounded-xl px-4 py-2 text-xs font-medium transition-colors ' +
              f.color +
              (statusFilter === f.key ? ' ring-2 ring-emerald-500/50' : '')
            }
          >
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
        <input
          type="text"
          placeholder="Search by name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 placeholder-gray-600"
        />
        {search && (
          <p className="text-gray-500 text-xs mt-2">
            Showing {filteredCustomers.length} of {customers.length} customers
          </p>
        )}
      </div>

      {/* WhatsApp Win-Back Panel */}
      {showWhatsapp && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-white font-semibold">
                📱 WhatsApp Win-Back Messages
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Personalized messages for inactive customers
              </p>
            </div>
            <button
              onClick={() => setShowWhatsapp(false)}
              className="text-gray-500 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
          {generatingMessages ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-emerald-400 text-sm">
                AI is generating personalized messages...
              </p>
            </div>
          ) : whatsappMessages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm">No inactive customers found.</p>
            </div>
          ) : (
            <>
              {copiedName && (
                <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-2 rounded-lg mb-4 text-sm text-center">
                  ✓ Message copied for {copiedName}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {whatsappMessages.map((msg, index) => (
                  <WhatsAppCard key={index} data={msg} onCopy={handleCopy} />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-4">
            {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Customer Name</label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  placeholder="Ahmed Khan"
                  required
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 placeholder-gray-600"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="03001234567"
                  required
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 placeholder-gray-600"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Email (optional)</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="ahmed@gmail.com"
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 placeholder-gray-600"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Last Purchase Date</label>
                <input
                  type="date"
                  name="lastPurchaseDate"
                  value={formData.lastPurchaseDate}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                type="submit"
                className="bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
              >
                {editingCustomer ? 'Update Customer' : 'Add Customer'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-800 hover:bg-gray-700 text-gray-400 px-6 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Customers Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        {filteredCustomers.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-4xl mb-3">👥</p>
            <p className="text-white font-medium">
              {customers.length === 0 ? 'No customers yet' : 'No customers match your search'}
            </p>
            <p className="text-gray-500 text-sm mt-1">
              {customers.length === 0 ? 'Add your first customer to get started' : 'Try changing your filters'}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Customer</th>
                <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Phone</th>
                <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Total Spent</th>
                <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Last Purchase</th>
                <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Status</th>
                <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => {
                const days = getDaysSince(customer.lastPurchaseDate);
                const isInactive = days > 60;
                const isAtRisk = days > 30 && days <= 60;
                const isVIP = customer.totalSpent > 10000;

                return (
                  <tr
                    key={customer._id}
                    onClick={() => setSelectedCustomer(customer)}
                    className={
                      'border-b border-gray-800 last:border-0 transition-colors cursor-pointer ' +
                      (isInactive ? 'bg-red-500/5 hover:bg-red-500/10' : 'hover:bg-gray-800/50')
                    }
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <p className="text-white text-sm font-medium">
                          {customer.customerName}
                        </p>
                        {isVIP && <span className="text-yellow-400 text-xs">👑</span>}
                      </div>
                      {customer.email && (
                        <p className="text-gray-500 text-xs mt-0.5">{customer.email}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-300 text-sm">{customer.phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-emerald-400 text-sm font-medium">
                        PKR {(customer.totalSpent || 0).toLocaleString()}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-300 text-sm">{days} days ago</p>
                    </td>
                    <td className="px-6 py-4">
                      {isInactive && (
                        <span className="bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded-full border border-red-500/30">
                          💔 Inactive
                        </span>
                      )}
                      {isAtRisk && (
                        <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-1 rounded-full border border-yellow-500/30">
                          ⚠️ At Risk
                        </span>
                      )}
                      {!isInactive && !isAtRisk && (
                        <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-1 rounded-full border border-emerald-500/30">
                          ✅ Active
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleEdit(customer)}
                          className="text-gray-400 hover:text-white text-xs bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(customer._id)}
                          className="text-gray-400 hover:text-red-400 text-xs bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
};

export default Customers;