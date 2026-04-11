import { useState, useEffect } from 'react';
import api from '../utils/api';

const ApiDashboard = () => {
  const [apiKey, setApiKey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState('');

  useEffect(() => {
    fetchApiKey();
  }, []);

  const fetchApiKey = async () => {
    try {
      const res = await api.get('/keys/my-key');
      setApiKey(res.data.apiKey);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const generateKey = async () => {
    if (!businessName.trim()) return;
    setGenerating(true);
    try {
      const res = await api.post('/keys/generate', { businessName });
      setApiKey(res.data.apiKey);
    } catch (error) {
      console.error(error);
    } finally {
      setGenerating(false);
    }
  };

  const regenerateKey = async () => {
    if (!window.confirm(
      'This will invalidate your old key. Continue?'
    )) return;
    try {
      const res = await api.post('/keys/regenerate');
      setApiKey(res.data.apiKey);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  };

  const usagePercent = apiKey
    ? Math.round((apiKey.callsUsed / apiKey.callsLimit) * 100)
    : 0;

  const planColors = {
    free: 'text-gray-400 bg-gray-700',
    starter: 'text-blue-400 bg-blue-500/20',
    business: 'text-emerald-400 bg-emerald-500/20',
    enterprise: 'text-yellow-400 bg-yellow-500/20'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-emerald-400">Loading API dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          🔌 API Integration
        </h1>
        <p className="text-gray-400 mt-1">
          Integrate StyleSync AI into any business system
        </p>
      </div>

      {/* Generate Key Form */}
      {!apiKey && (
        <div className="bg-gray-900 border border-gray-800
                      rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-4">
            Generate Your API Key
          </h2>
          <div className="flex gap-3">
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Your business name (e.g. Imtiaz Supermart)"
              className="flex-1 bg-gray-800 border border-gray-700
                       text-white rounded-lg px-4 py-3 text-sm
                       focus:outline-none focus:border-emerald-500
                       placeholder-gray-600"
            />
            <button
              onClick={generateKey}
              disabled={generating || !businessName.trim()}
              className="bg-emerald-500 hover:bg-emerald-400 text-white
                       px-6 py-3 rounded-lg text-sm font-medium
                       transition-colors disabled:opacity-50"
            >
              {generating ? 'Generating...' : 'Generate Key'}
            </button>
          </div>
        </div>
      )}

      {/* API Key Card */}
      {apiKey && (
        <>
          <div className="bg-gray-900 border border-gray-800
                        rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold">
                Your API Key
              </h2>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-3 py-1 rounded-full
                               ${planColors[apiKey.plan]}`}>
                  {apiKey.plan.toUpperCase()} PLAN
                </span>
                <span className={`text-xs px-2 py-1 rounded-full
                               ${apiKey.isActive
                                 ? 'bg-emerald-500/20 text-emerald-400'
                                 : 'bg-red-500/20 text-red-400'}`}>
                  {apiKey.isActive ? 'Active' : 'Disabled'}
                </span>
              </div>
            </div>

            {/* Key Display */}
            <div className="bg-gray-800 border border-gray-700
                          rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between gap-3">
                <code className="text-emerald-400 text-sm font-mono
                               flex-1 truncate">
                  {showKey
                    ? apiKey.apiKey
                    : apiKey.apiKey.slice(0, 12) + '•'.repeat(20)}
                </code>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => setShowKey(!showKey)}
                    className="text-gray-400 hover:text-white text-xs
                             bg-gray-700 hover:bg-gray-600 px-3 py-1.5
                             rounded-lg transition-colors"
                  >
                    {showKey ? '🙈 Hide' : '👁 Show'}
                  </button>
                  <button
                    onClick={() => handleCopy(apiKey.apiKey, 'key')}
                    className={`text-xs px-3 py-1.5 rounded-lg
                               transition-colors ${
                      copied === 'key'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-white'
                    }`}
                  >
                    {copied === 'key' ? '✓ Copied' : '📋 Copy'}
                  </button>
                </div>
              </div>
            </div>

            {/* Usage */}
            <div className="mb-4">
              <div className="flex justify-between text-xs mb-2">
                <span className="text-gray-400">API Usage</span>
                <span className="text-white">
                  {apiKey.callsUsed} / {apiKey.callsLimit} calls
                </span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    usagePercent > 80
                      ? 'bg-red-500'
                      : usagePercent > 50
                      ? 'bg-yellow-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(usagePercent, 100)}%` }}
                />
              </div>
            </div>

            <button
              onClick={regenerateKey}
              className="text-gray-500 hover:text-red-400 text-xs
                       transition-colors"
            >
              🔄 Regenerate Key (invalidates old key)
            </button>
          </div>

          {/* Plan Limits */}
          <div className="bg-gray-900 border border-gray-800
                        rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-4">
              📊 Plans
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                {
                  plan: 'Free',
                  calls: '100/month',
                  price: 'PKR 0',
                  color: 'border-gray-700'
                },
                {
                  plan: 'Starter',
                  calls: '500/month',
                  price: 'PKR 5,000',
                  color: 'border-blue-500/30'
                },
                {
                  plan: 'Business',
                  calls: '5,000/month',
                  price: 'PKR 25,000',
                  color: 'border-emerald-500/30'
                },
                {
                  plan: 'Enterprise',
                  calls: 'Unlimited',
                  price: 'Custom',
                  color: 'border-yellow-500/30'
                }
              ].map((p, i) => (
                <div
                  key={i}
                  className={`border ${p.color} rounded-xl p-4
                             text-center bg-gray-800/50`}
                >
                  <p className="text-white font-bold text-sm">
                    {p.plan}
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    {p.calls}
                  </p>
                  <p className="text-emerald-400 text-xs font-medium mt-1">
                    {p.price}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Code Examples */}
          <div className="bg-gray-900 border border-gray-800
                        rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-4">
              💻 Integration Examples
            </h2>

            {/* Example 1 */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-400 text-sm">
                  Quick Health Check (JavaScript)
                </p>
                <button
                  onClick={() => handleCopy(
                    `fetch('http://localhost:5000/v1/health-check', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': '${apiKey.apiKey}'
  },
  body: JSON.stringify({
    inventory: yourInventoryArray,
    customers: yourCustomersArray,
    transactions: yourTransactionsArray
  })
})
.then(res => res.json())
.then(data => console.log(data.quickHealth));`,
                    'example1'
                  )}
                  className={`text-xs px-3 py-1 rounded-lg
                             transition-colors ${
                    copied === 'example1'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  }`}
                >
                  {copied === 'example1' ? '✓ Copied' : '📋 Copy'}
                </button>
              </div>
              <div className="bg-gray-950 border border-gray-700
                            rounded-xl p-4 overflow-x-auto">
                <pre className="text-emerald-400 text-xs leading-relaxed">
{`fetch('http://localhost:5000/v1/health-check', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': '${apiKey.apiKey.slice(0, 20)}...'
  },
  body: JSON.stringify({
    inventory: yourInventoryArray,
    customers: yourCustomersArray,
    transactions: yourTransactionsArray
  })
})
.then(res => res.json())
.then(data => console.log(data.quickHealth));`}
                </pre>
              </div>
            </div>

            {/* Example 2 */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-400 text-sm">
                  Full Analysis (JavaScript)
                </p>
                <button
                  onClick={() => handleCopy(
                    `fetch('http://localhost:5000/v1/analyze', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': '${apiKey.apiKey}'
  },
  body: JSON.stringify({
    inventory: yourInventoryArray,
    customers: yourCustomersArray,
    transactions: yourTransactionsArray,
    analysisType: 'full'
  })
})
.then(res => res.json())
.then(data => {
  console.log(data.analysis.healthScore);
  console.log(data.analysis.restockAlerts);
  console.log(data.analysis.winBackTargets);
});`,
                    'example2'
                  )}
                  className={`text-xs px-3 py-1 rounded-lg
                             transition-colors ${
                    copied === 'example2'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  }`}
                >
                  {copied === 'example2' ? '✓ Copied' : '📋 Copy'}
                </button>
              </div>
              <div className="bg-gray-950 border border-gray-700
                            rounded-xl p-4 overflow-x-auto">
                <pre className="text-emerald-400 text-xs leading-relaxed">
{`fetch('http://localhost:5000/v1/analyze', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': '${apiKey.apiKey.slice(0, 20)}...'
  },
  body: JSON.stringify({
    inventory: yourInventoryArray,
    customers: yourCustomersArray,
    transactions: yourTransactionsArray,
    analysisType: 'full'
  })
})
.then(res => res.json())
.then(data => {
  console.log(data.analysis.healthScore);
  console.log(data.analysis.restockAlerts);
  console.log(data.analysis.winBackTargets);
});`}
                </pre>
              </div>
            </div>

            {/* Example 3 Python */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-400 text-sm">
                  Full Analysis (Python)
                </p>
              </div>
              <div className="bg-gray-950 border border-gray-700
                            rounded-xl p-4 overflow-x-auto">
                <pre className="text-emerald-400 text-xs leading-relaxed">
{`import requests

response = requests.post(
  'http://localhost:5000/v1/analyze',
  headers={
    'x-api-key': '${apiKey.apiKey.slice(0, 20)}...'
  },
  json={
    'inventory': your_inventory_list,
    'customers': your_customers_list,
    'transactions': your_transactions_list,
    'analysisType': 'full'
  }
)

data = response.json()
print(data['analysis']['healthScore'])
print(data['analysis']['actionPlan'])`}
                </pre>
              </div>
            </div>
          </div>

          {/* API Response Example */}
          <div className="bg-gray-900 border border-gray-800
                        rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-4">
              📦 Sample API Response
            </h2>
            <div className="bg-gray-950 border border-gray-700
                          rounded-xl p-4 overflow-x-auto">
              <pre className="text-gray-300 text-xs leading-relaxed">
{`{
  "success": true,
  "powered_by": "StyleSync AI",
  "plan": "free",
  "callsRemaining": 98,
  "analysis": {
    "healthScore": {
      "overall": 87,
      "inventory": 90,
      "customers": 75,
      "revenue": 95,
      "grade": "A"
    },
    "inventoryInsights": {
      "restockAlerts": [
        {
          "productName": "Khaddar Shalwar Kameez",
          "currentStock": 48,
          "urgency": "urgent",
          "recommendedRestockQuantity": 120
        }
      ]
    },
    "customerInsights": {
      "winBackTargets": [
        {
          "customerName": "Sara Malik",
          "daysSinceLastPurchase": 130,
          "whatsappMessage": "..."
        }
      ]
    },
    "actionPlan": [
      "Restock Khaddar immediately",
      "Contact 3 inactive customers",
      "Prepare Eid campaign"
    ],
    "aiSummary": "Business is performing well..."
  }
}`}
              </pre>
            </div>
          </div>

          {/* Imtiaz Integration Example */}
          <div className="bg-gradient-to-r from-emerald-900/20
                        to-gray-900 border border-emerald-500/20
                        rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-2">
              🏪 Imtiaz Supermart Integration Example
            </h2>
            <p className="text-gray-400 text-sm mb-4">
              How a large retailer would integrate StyleSync AI
              into their existing system
            </p>
            <div className="bg-gray-950 border border-gray-700
                          rounded-xl p-4 overflow-x-auto">
              <pre className="text-emerald-400 text-xs leading-relaxed">
{`// In Imtiaz Supermart's existing dashboard
// Add this function to get AI insights

async function getStyleSyncInsights() {
  // They send their own data format
  const response = await fetch(
    'https://api.stylesync.ai/v1/analyze',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'their_enterprise_key'
      },
      body: JSON.stringify({
        inventory: imtiazInventory,
        customers: imtiazCustomers,
        transactions: imtiazSales,
        analysisType: 'full',
        businessContext: {
          businessType: 'supermarket',
          location: 'Karachi',
          currency: 'PKR'
        }
      })
    }
  );

  const { analysis } = await response.json();

  // Show in their own UI
  showRestockAlerts(analysis.inventoryInsights);
  showCustomerAlerts(analysis.customerInsights);
  showHealthScore(analysis.healthScore);
}`}
              </pre>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ApiDashboard;