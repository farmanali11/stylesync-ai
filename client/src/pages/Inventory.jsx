import { useState, useEffect } from 'react';
import api from '../utils/api';

const urgencyConfig = {
  urgent: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    text: 'text-red-400',
    badge: 'bg-red-500/20 text-red-400',
    icon: '🚨'
  },
  warning: {
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    text: 'text-yellow-400',
    badge: 'bg-yellow-500/20 text-yellow-400',
    icon: '⚠️'
  },
  ok: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    text: 'text-emerald-400',
    badge: 'bg-emerald-500/20 text-emerald-400',
    icon: '✅'
  }
};

const RestockCard = ({ alert }) => {
  const config = urgencyConfig[alert.urgency] || urgencyConfig.ok;
  return (
    <div className={`${config.bg} border ${config.border} rounded-xl p-4`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-white font-medium text-sm">
          {config.icon} {alert.productName}
        </p>
        <span className={`${config.badge} text-xs px-2 py-1 rounded-full`}>
          {alert.urgency.toUpperCase()}
        </span>
      </div>
      <div className="space-y-1 mb-3">
        <p className="text-gray-400 text-xs">
          Current stock: <span className="text-white">
            {alert.currentStock} units
          </span>
        </p>
        {alert.daysUntilStockout && (
          <p className="text-gray-400 text-xs">
            Runs out in: <span className={config.text}>
              {alert.daysUntilStockout} days
            </span>
          </p>
        )}
        <p className="text-gray-400 text-xs">
          Suggested restock: <span className="text-white">
            {alert.suggestedRestockQuantity} units
          </span>
        </p>
      </div>
      <p className="text-gray-300 text-xs leading-relaxed">
        {alert.recommendation}
      </p>
    </div>
  );
};

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [restockAlerts, setRestockAlerts] = useState([]);
  const [restockSummary, setRestockSummary] = useState('');
  const [generatingAlerts, setGeneratingAlerts] = useState(false);
  const [showRestock, setShowRestock] = useState(false);
  const [formData, setFormData] = useState({
    productName: '',
    category: '',
    quantity: '',
    price: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/inventory');
      setProducts(res.data.products);
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
      if (editingProduct) {
        await api.put(`/inventory/${editingProduct._id}`, formData);
      } else {
        await api.post('/inventory', formData);
      }
      setFormData({
        productName: '',
        category: '',
        quantity: '',
        price: ''
      });
      setShowForm(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      productName: product.productName,
      category: product.category,
      quantity: product.quantity,
      price: product.price
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/inventory/${id}`);
      fetchProducts();
    } catch (error) {
      console.error(error);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingProduct(null);
    setFormData({
      productName: '',
      category: '',
      quantity: '',
      price: ''
    });
  };

  const generateRestockAlerts = async () => {
    setGeneratingAlerts(true);
    setShowRestock(true);
    try {
      const res = await api.get('/chat/restock');
      setRestockAlerts(res.data.alerts);
      setRestockSummary(res.data.summary);
    } catch (error) {
      console.error(error);
    } finally {
      setGeneratingAlerts(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-emerald-400">Loading inventory...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Inventory</h1>
          <p className="text-gray-400 mt-1">
            {products.length} products in stock
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={generateRestockAlerts}
            className="bg-yellow-600 hover:bg-yellow-500 text-white
                     px-4 py-2 rounded-lg text-sm font-medium
                     transition-colors duration-200 flex items-center gap-2"
          >
            <span>🔍</span>
            AI Restock Analysis
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-emerald-500 hover:bg-emerald-400 text-white
                     px-4 py-2 rounded-lg text-sm font-medium
                     transition-colors duration-200"
          >
            + Add Product
          </button>
        </div>
      </div>

      {/* Restock Alerts Panel */}
      {showRestock && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-white font-semibold">
                🔍 AI Restock Analysis
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Based on your sales velocity and current stock
              </p>
            </div>
            <button
              onClick={() => setShowRestock(false)}
              className="text-gray-500 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          {generatingAlerts ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-emerald-400 text-sm">
                AI is analyzing your inventory...
              </p>
            </div>
          ) : (
            <>
              {restockSummary && (
                <div className="bg-gray-800 border border-gray-700
                              rounded-xl px-4 py-3 mb-4">
                  <p className="text-gray-300 text-sm">
                    📊 {restockSummary}
                  </p>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2
                            lg:grid-cols-3 gap-4">
                {restockAlerts.map((alert, index) => (
                  <RestockCard key={index} alert={alert} />
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
            {editingProduct ? 'Edit Product' : 'Add New Product'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-gray-400 text-sm mb-1 block">
                  Product Name
                </label>
                <input
                  type="text"
                  name="productName"
                  value={formData.productName}
                  onChange={handleChange}
                  placeholder="Khaddar Shalwar Kameez"
                  required
                  className="w-full bg-gray-800 border border-gray-700
                           text-white rounded-lg px-4 py-3 text-sm
                           focus:outline-none focus:border-emerald-500
                           placeholder-gray-600"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1 block">
                  Category
                </label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="Winter Collection"
                  required
                  className="w-full bg-gray-800 border border-gray-700
                           text-white rounded-lg px-4 py-3 text-sm
                           focus:outline-none focus:border-emerald-500
                           placeholder-gray-600"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1 block">
                  Quantity
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder="50"
                  required
                  className="w-full bg-gray-800 border border-gray-700
                           text-white rounded-lg px-4 py-3 text-sm
                           focus:outline-none focus:border-emerald-500
                           placeholder-gray-600"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1 block">
                  Price (PKR)
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="2500"
                  required
                  className="w-full bg-gray-800 border border-gray-700
                           text-white rounded-lg px-4 py-3 text-sm
                           focus:outline-none focus:border-emerald-500
                           placeholder-gray-600"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                type="submit"
                className="bg-emerald-500 hover:bg-emerald-400 text-white
                         px-6 py-2 rounded-lg text-sm font-medium
                         transition-colors duration-200"
              >
                {editingProduct ? 'Update Product' : 'Add Product'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-800 hover:bg-gray-700 text-gray-400
                         px-6 py-2 rounded-lg text-sm font-medium
                         transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-gray-900 border border-gray-800
                      rounded-2xl overflow-hidden">
        {products.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-4xl mb-3">📦</p>
            <p className="text-white font-medium">No products yet</p>
            <p className="text-gray-500 text-sm mt-1">
              Add your first product to get started
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-gray-400 text-sm
                             font-medium px-6 py-4">Product</th>
                <th className="text-left text-gray-400 text-sm
                             font-medium px-6 py-4">Category</th>
                <th className="text-left text-gray-400 text-sm
                             font-medium px-6 py-4">Quantity</th>
                <th className="text-left text-gray-400 text-sm
                             font-medium px-6 py-4">Price</th>
                <th className="text-left text-gray-400 text-sm
                             font-medium px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  key={product._id}
                  className="border-b border-gray-800 last:border-0
                           hover:bg-gray-800/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <p className="text-white text-sm font-medium">
                      {product.productName}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-gray-800 text-gray-300 text-xs
                                   px-2 py-1 rounded-full">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-medium ${
                      product.quantity < 10
                        ? 'text-red-400'
                        : 'text-white'
                    }`}>
                      {product.quantity}
                      {product.quantity < 10 && (
                        <span className="text-red-400 text-xs ml-1">
                          ⚠️ Low
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-emerald-400 text-sm">
                      PKR {product.price.toLocaleString()}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-gray-400 hover:text-white text-xs
                                 bg-gray-800 hover:bg-gray-700 px-3 py-1.5
                                 rounded-lg transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="text-gray-400 hover:text-red-400 text-xs
                                 bg-gray-800 hover:bg-gray-700 px-3 py-1.5
                                 rounded-lg transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Inventory;