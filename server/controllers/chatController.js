const Groq = require('groq-sdk');
const Inventory = require('../models/Inventory');
const Customer = require('../models/Customer');
const Transaction = require('../models/Transaction');
const Chat = require('../models/Chat');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

exports.sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user._id;

    // Fetch real user data
    const inventory = await Inventory.find({ userId }).lean();
    const customers = await Customer.find({ userId }).lean();
    const transactions = await Transaction
      .find({ userId })
      .sort({ date: -1 })
      .limit(50)
      .lean();

    // Build system prompt with real data
    const systemPrompt = `
You are StyleSync AI, a smart business assistant
for a Pakistani clothing brand owner.

You have access to their real business data:

CURRENT INVENTORY:
${JSON.stringify(inventory, null, 2)}

CUSTOMER LIST:
${JSON.stringify(customers, null, 2)}

RECENT TRANSACTIONS (last 50):
${JSON.stringify(transactions, null, 2)}

Instructions:
- Answer based on their actual data only
- Give specific product names and numbers
- All amounts are in Pakistani Rupees (PKR)
- Be concise and actionable
- If data is empty tell them to add data first
- Suggest specific actions they can take today
- Format responses cleanly and clearly
    `;

    // Call Groq API
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 1000,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ]
    });

    const aiMessage = completion.choices[0].message.content;

    // Save to chat history
    await Chat.create({
      userId,
      userMessage: message,
      aiMessage
    });

    res.json({ success: true, message: aiMessage });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error.message });
  }
};

// GET chat history
exports.getChatHistory = async (req, res) => {
  try {
    const chats = await Chat
      .find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ success: true, chats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// WHATSAPP WIN-BACK GENERATOR
exports.generateWhatsAppMessages = async (req, res) => {
  console.log('WhatsApp generator called');
  console.log('User ID:', req.user._id);
  try {
    const userId = req.user._id;

    // Find inactive customers (60+ days)
    const customers = await Customer.find({ userId }).lean();

    const inactiveCustomers = customers.filter((c) => {
      if (!c.lastPurchaseDate) return false;
      const lastPurchase = new Date(c.lastPurchaseDate);
      const today = new Date();
      const diffTime = today.getTime() - lastPurchase.getTime();
      const daysSince = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      console.log(`${c.customerName}: ${daysSince} days since last purchase`);
      return daysSince >= 60;
    });
    if (inactiveCustomers.length === 0) {
      return res.json({
        success: true,
        messages: [],
        note: 'No inactive customers found. All customers purchased within 60 days.'
      });
    }

    // Build prompt
    const prompt = `
You are StyleSync AI helping a Pakistani clothing brand owner
win back inactive customers via WhatsApp.

Generate a personalized WhatsApp message for EACH customer below.
Mix Urdu and English naturally (like Pakistanis text each other).
Keep it warm, friendly, not salesy.
Include a unique discount code for each customer.
Keep each message under 100 words.

Inactive Customers:
${JSON.stringify(inactiveCustomers, null, 2)}

Respond in this EXACT JSON format only, no extra text:
{
  "messages": [
    {
      "customerName": "name here",
      "phone": "phone here",
      "discountCode": "UNIQUE10",
      "message": "whatsapp message here"
    }
  ]
}
    `;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 2000,
      messages: [
        { role: 'user', content: prompt }
      ]
    });

    const rawResponse = completion.choices[0].message.content;

    // Parse JSON response
    const cleanResponse = rawResponse
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    const parsed = JSON.parse(cleanResponse);

    res.json({
      success: true,
      inactiveCount: inactiveCustomers.length,
      messages: parsed.messages
    });

  } catch (error) {
    console.error('WhatsApp generator error:', error);
    res.status(500).json({ error: error.message });
  }
};

// SMART RESTOCK ANALYZER
exports.generateRestockAlerts = async (req, res) => {
  try {
    const userId = req.user._id;

    const inventory = await Inventory.find({ userId }).lean();
    const transactions = await Transaction
      .find({ userId })
      .sort({ date: -1 })
      .lean();

    if (inventory.length === 0) {
      return res.json({
        success: true,
        alerts: [],
        note: 'No inventory found. Add products first.'
      });
    }

    // Calculate sales velocity per product
    const productVelocity = {};

    transactions.forEach((t) => {
      const pid = t.productId.toString();
      if (!productVelocity[pid]) {
        productVelocity[pid] = {
          totalSold: 0,
          productName: t.productName
        };
      }
      productVelocity[pid].totalSold += t.quantity;
    });

    // Build enriched inventory with velocity data
    const enrichedInventory = inventory.map((p) => {
      const pid = p._id.toString();
      const velocity = productVelocity[pid];
      const totalSold = velocity ? velocity.totalSold : 0;

      // Calculate days since first transaction
      const productTransactions = transactions.filter(
        t => t.productId.toString() === pid
      );

      let daysUntilStockout = null;
      let dailyVelocity = 0;

      if (productTransactions.length > 0 && totalSold > 0) {
        const oldestTransaction = productTransactions[
          productTransactions.length - 1
        ];
        const daysSinceFirst = Math.max(1, Math.floor(
          (new Date() - new Date(oldestTransaction.date)) /
          (1000 * 60 * 60 * 24)
        ));
        dailyVelocity = totalSold / daysSinceFirst;
        if (dailyVelocity > 0) {
          daysUntilStockout = Math.floor(p.quantity / dailyVelocity);
        }
      }

      return {
        productName: p.productName,
        category: p.category,
        currentStock: p.quantity,
        totalSold,
        dailyVelocity: dailyVelocity.toFixed(2),
        daysUntilStockout,
        price: p.price
      };
    });

    // Build AI prompt
    const prompt = `
You are StyleSync AI analyzing inventory for a Pakistani clothing brand.

Here is the inventory with sales velocity data:
${JSON.stringify(enrichedInventory, null, 2)}

Analyze each product and generate restock alerts.
Consider:
- Products with less than 20 units as low stock
- Products that will run out within 30 days as urgent
- Products with no sales as slow moving
- All prices are in PKR

Respond in this EXACT JSON format only, no extra text:
{
  "alerts": [
    {
      "productName": "product name",
      "currentStock": 48,
      "daysUntilStockout": 12,
      "urgency": "urgent",
      "recommendation": "specific action to take",
      "suggestedRestockQuantity": 100
    }
  ],
  "summary": "one line overall summary"
}

urgency must be one of: "urgent", "warning", "ok"
    `;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }]
    });

    const rawResponse = completion.choices[0].message.content;
    const cleanResponse = rawResponse
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    const parsed = JSON.parse(cleanResponse);

    res.json({
      success: true,
      alerts: parsed.alerts,
      summary: parsed.summary
    });

  } catch (error) {
    console.error('Restock analyzer error:', error);
    res.status(500).json({ error: error.message });
  }
};

// EID SEASON FORECAST
exports.generateEidForecast = async (req, res) => {
  try {
    const userId = req.user._id;

    const inventory = await Inventory.find({ userId }).lean();
    const customers = await Customer.find({ userId }).lean();
    const transactions = await Transaction
      .find({ userId })
      .sort({ date: -1 })
      .lean();

    // Calculate days until Eid ul Adha 2026
    const eidDate = new Date('2026-06-06');
    const today = new Date();
    const daysUntilEid = Math.floor(
      (eidDate - today) / (1000 * 60 * 60 * 24)
    );

    // Calculate sales velocity per product
    const productStats = {};
    transactions.forEach((t) => {
      const pid = t.productId.toString();
      if (!productStats[pid]) {
        productStats[pid] = {
          productName: t.productName,
          totalSold: 0,
          totalRevenue: 0,
          transactionCount: 0
        };
      }
      productStats[pid].totalSold += t.quantity;
      productStats[pid].totalRevenue += t.amount;
      productStats[pid].transactionCount += 1;
    });

    // Enrich inventory
    const enrichedInventory = inventory.map((p) => {
      const pid = p._id.toString();
      const stats = productStats[pid] || {
        totalSold: 0,
        totalRevenue: 0,
        transactionCount: 0
      };

      const productTxns = transactions.filter(
        t => t.productId.toString() === pid
      );

      let dailyVelocity = 0;
      if (productTxns.length > 0) {
        const oldest = productTxns[productTxns.length - 1];
        const daysSinceFirst = Math.max(1, Math.floor(
          (today - new Date(oldest.date)) / (1000 * 60 * 60 * 24)
        ));
        dailyVelocity = stats.totalSold / daysSinceFirst;
      }

      const eidMultiplier = 3;
      const eidDailyDemand = dailyVelocity * eidMultiplier;
      const unitsNeededForEid = Math.ceil(eidDailyDemand * daysUntilEid);
      const unitsToOrder = Math.max(0, unitsNeededForEid - p.quantity);
      const projectedEidRevenue = unitsNeededForEid * p.price;

      return {
        productName: p.productName,
        category: p.category,
        currentStock: p.quantity,
        price: p.price,
        dailyVelocity: dailyVelocity.toFixed(2),
        totalSoldSoFar: stats.totalSold,
        unitsNeededForEid,
        unitsToOrder,
        projectedEidRevenue,
        status: unitsToOrder > 0 ? 'RESTOCK NEEDED' : 'SUFFICIENT STOCK'
      };
    });

    // Inactive customers value
    const inactiveCustomers = customers.filter((c) => {
      const days = Math.floor(
        (today - new Date(c.lastPurchaseDate)) / (1000 * 60 * 60 * 24)
      );
      return days >= 60;
    });

    const inactiveValue = inactiveCustomers.reduce(
      (sum, c) => sum + c.totalSpent, 0
    );

    // Total projected revenue
    const totalProjectedRevenue = enrichedInventory.reduce(
      (sum, p) => sum + p.projectedEidRevenue, 0
    );

    // Build AI prompt
    const prompt = `
You are StyleSync AI helping a Pakistani clothing brand owner
prepare for Eid ul Adha 2026 which is in ${daysUntilEid} days.

Here is their complete business data:

INVENTORY WITH EID FORECAST:
${JSON.stringify(enrichedInventory, null, 2)}

INACTIVE CUSTOMERS (60+ days):
${JSON.stringify(inactiveCustomers, null, 2)}

TOTAL PROJECTED EID REVENUE: PKR ${totalProjectedRevenue.toLocaleString()}
INACTIVE CUSTOMERS POTENTIAL VALUE: PKR ${inactiveValue.toLocaleString()}

Generate a complete Eid battle plan in this EXACT JSON format only:
{
  "daysUntilEid": ${daysUntilEid},
  "eidName": "Eid ul Adha 2026",
  "executiveSummary": "2-3 sentence overall assessment",
  "revenueProjection": {
    "conservative": 0,
    "realistic": 0,
    "optimistic": 0
  },
  "productAlerts": [
    {
      "productName": "name",
      "currentStock": 0,
      "unitsToOrder": 0,
      "projectedRevenue": 0,
      "urgency": "urgent/warning/ok",
      "action": "specific action"
    }
  ],
  "customerStrategy": {
    "inactiveCount": 0,
    "potentialRevenue": 0,
    "recommendation": "specific whatsapp strategy"
  },
  "actionPlan": [
    "specific action 1",
    "specific action 2",
    "specific action 3",
    "specific action 4",
    "specific action 5"
  ],
  "motivationalMessage": "short urdu/english mixed motivational message"
}
    `;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 3000,
      messages: [{ role: 'user', content: prompt }]
    });

    const rawResponse = completion.choices[0].message.content;
    const cleanResponse = rawResponse
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    const parsed = JSON.parse(cleanResponse);

    res.json({ success: true, forecast: parsed });

  } catch (error) {
    console.error('Eid forecast error:', error);
    res.status(500).json({ error: error.message });
  }
};

// PROFIT INTELLIGENCE REPORT
exports.generateProfitReport = async (req, res) => {
  try {
    const userId = req.user._id;

    const inventory = await Inventory.find({ userId }).lean();
    const customers = await Customer.find({ userId }).lean();
    const transactions = await Transaction
      .find({ userId })
      .sort({ date: -1 })
      .lean();

    if (transactions.length === 0) {
      return res.json({
        success: true,
        report: null,
        note: 'No transactions found. Add sales data first.'
      });
    }

    // Calculate per product stats
    const productStats = {};
    transactions.forEach((t) => {
      const pid = t.productId.toString();
      if (!productStats[pid]) {
        productStats[pid] = {
          productName: t.productName,
          totalRevenue: 0,
          totalUnitsSold: 0,
          transactionCount: 0,
          lastSaleDate: t.date
        };
      }
      productStats[pid].totalRevenue += t.amount;
      productStats[pid].totalUnitsSold += t.quantity;
      productStats[pid].transactionCount += 1;
    });

    // Enrich with inventory cost data
    const enrichedProducts = inventory.map((p) => {
      const pid = p._id.toString();
      const stats = productStats[pid] || {
        totalRevenue: 0,
        totalUnitsSold: 0,
        transactionCount: 0,
        lastSaleDate: null
      };

      // Estimate cost as 40% of price (standard clothing margin)
      const estimatedCostPerUnit = p.price * 0.4;
      const estimatedTotalCost = estimatedCostPerUnit * stats.totalUnitsSold;
      const estimatedProfit = stats.totalRevenue - estimatedTotalCost;
      const profitMargin = stats.totalRevenue > 0
        ? ((estimatedProfit / stats.totalRevenue) * 100).toFixed(1)
        : 0;

      // Days since last sale
      const daysSinceLastSale = stats.lastSaleDate
        ? Math.floor(
            (new Date() - new Date(stats.lastSaleDate)) /
            (1000 * 60 * 60 * 24)
          )
        : 999;

      return {
        productName: p.productName,
        category: p.category,
        currentStock: p.quantity,
        pricePerUnit: p.price,
        totalRevenue: stats.totalRevenue,
        totalUnitsSold: stats.totalUnitsSold,
        estimatedProfit,
        profitMargin,
        daysSinceLastSale,
        isDeadWeight: daysSinceLastSale > 30 && stats.totalUnitsSold === 0
      };
    });

    // Customer value analysis
    const customerStats = customers.map((c) => {
      const customerTxns = transactions.filter(
        t => t.customerId.toString() === c._id.toString()
      );
      const avgOrderValue = customerTxns.length > 0
        ? c.totalSpent / customerTxns.length
        : 0;
      const daysSinceLastPurchase = Math.floor(
        (new Date() - new Date(c.lastPurchaseDate)) /
        (1000 * 60 * 60 * 24)
      );

      return {
        customerName: c.customerName,
        phone: c.phone,
        totalSpent: c.totalSpent,
        totalOrders: customerTxns.length,
        avgOrderValue: avgOrderValue.toFixed(0),
        daysSinceLastPurchase,
        isVIP: c.totalSpent > 10000,
        isAtRisk: daysSinceLastPurchase > 45 && c.totalSpent > 5000
      };
    });

    // Overall financials
    const totalRevenue = transactions.reduce((s, t) => s + t.amount, 0);
    const estimatedTotalCost = totalRevenue * 0.4;
    const estimatedNetProfit = totalRevenue - estimatedTotalCost;

    // This month
    const now = new Date();
    const monthlyTxns = transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() === now.getMonth() &&
             d.getFullYear() === now.getFullYear();
    });
    const monthlyRevenue = monthlyTxns.reduce((s, t) => s + t.amount, 0);
    const monthlyProfit = monthlyRevenue * 0.6;

    const prompt = `
You are StyleSync AI generating a profit intelligence report
for a Pakistani clothing brand owner.

FINANCIAL DATA:
Total Revenue All Time: PKR ${totalRevenue.toLocaleString()}
Estimated Net Profit All Time: PKR ${estimatedNetProfit.toLocaleString()}
This Month Revenue: PKR ${monthlyRevenue.toLocaleString()}
This Month Profit: PKR ${monthlyProfit.toLocaleString()}

PRODUCT PERFORMANCE:
${JSON.stringify(enrichedProducts, null, 2)}

CUSTOMER VALUE ANALYSIS:
${JSON.stringify(customerStats, null, 2)}

Generate a profit intelligence report in this EXACT JSON format only:
{
  "overallHealth": "excellent/good/warning/critical",
  "healthMessage": "one line business health assessment",
  "financials": {
    "totalRevenue": 0,
    "estimatedProfit": 0,
    "profitMargin": "0%",
    "monthlyRevenue": 0,
    "monthlyProfit": 0
  },
  "starProduct": {
    "productName": "name",
    "insight": "why this is your best product",
    "action": "what to do with it"
  },
  "deadWeightProduct": {
    "productName": "name or null",
    "insight": "why it is dead weight",
    "suggestedDiscountPrice": 0,
    "action": "what to do"
  },
  "vipCustomer": {
    "customerName": "name or null",
    "totalSpent": 0,
    "insight": "why they are valuable",
    "action": "how to retain them"
  },
  "atRiskCustomer": {
    "customerName": "name or null",
    "totalSpent": 0,
    "daysSinceLastPurchase": 0,
    "action": "how to win them back"
  },
  "topOpportunity": "single biggest opportunity right now",
  "weeklyActions": [
    "action 1",
    "action 2",
    "action 3"
  ],
  "profitTip": "one specific tip to increase profit this week"
}
    `;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 3000,
      messages: [{ role: 'user', content: prompt }]
    });

    const rawResponse = completion.choices[0].message.content;
    const cleanResponse = rawResponse
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    const parsed = JSON.parse(cleanResponse);

    res.json({ success: true, report: parsed });

  } catch (error) {
    console.error('Profit report error:', error);
    res.status(500).json({ error: error.message });
  }
};
// WHATSAPP BUSINESS AUTOMATION HUB
exports.generateWhatsAppHub = async (req, res) => {
  try {
    const userId = req.user._id;

    const inventory = await Inventory.find({ userId }).lean();
    const customers = await Customer.find({ userId }).lean();
    const transactions = await Transaction
      .find({ userId })
      .sort({ date: -1 })
      .lean();

    const today = new Date();

    // Inactive customers (60+ days)
    const inactiveCustomers = customers.filter((c) => {
      const days = Math.floor(
        (today - new Date(c.lastPurchaseDate)) /
        (1000 * 60 * 60 * 24)
      );
      return days >= 60;
    });

    // Low stock products (under 20 units)
    const lowStockProducts = inventory.filter(p => p.quantity < 20);

    // VIP customers (spent over 10000)
    const vipCustomers = customers.filter(c => c.totalSpent > 10000);

    // This week transactions
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    const weeklyTxns = transactions.filter(
      t => new Date(t.date) >= weekStart
    );
    const weeklyRevenue = weeklyTxns.reduce(
      (s, t) => s + t.amount, 0
    );

    // Eid countdown
    const eidDate = new Date('2026-06-06');
    const daysUntilEid = Math.floor(
      (eidDate - today) / (1000 * 60 * 60 * 24)
    );

    const prompt = `
You are StyleSync AI generating a complete WhatsApp Business
Automation Hub for a Pakistani clothing brand owner.

BUSINESS DATA:
Inactive Customers (60+ days): ${JSON.stringify(inactiveCustomers, null, 2)}
Low Stock Products: ${JSON.stringify(lowStockProducts, null, 2)}
VIP Customers: ${JSON.stringify(vipCustomers, null, 2)}
Weekly Revenue: PKR ${weeklyRevenue.toLocaleString()}
Weekly Transactions: ${weeklyTxns.length}
Days Until Eid: ${daysUntilEid}
All Inventory: ${JSON.stringify(inventory, null, 2)}

Generate a complete WhatsApp hub in this EXACT JSON only, no extra text:
{
  "campaigns": [
    {
      "id": "winback",
      "title": "Customer Win-Back Campaign",
      "icon": "💔",
      "urgency": "high",
      "description": "one line description",
      "recipientCount": 0,
      "messages": [
        {
          "recipientName": "name",
          "recipientPhone": "phone",
          "message": "full whatsapp message in urdu/english mix"
        }
      ]
    },
    {
      "id": "supplier",
      "title": "Supplier Restock Message",
      "icon": "📦",
      "urgency": "urgent",
      "description": "one line description",
      "recipientCount": 1,
      "messages": [
        {
          "recipientName": "Supplier",
          "recipientPhone": "",
          "message": "full whatsapp message to supplier about restocking low stock items"
        }
      ]
    },
    {
      "id": "vip",
      "title": "VIP Customer Reward",
      "icon": "👑",
      "urgency": "medium",
      "description": "one line description",
      "recipientCount": 0,
      "messages": [
        {
          "recipientName": "name",
          "recipientPhone": "phone",
          "message": "full whatsapp VIP reward message with unique discount code"
        }
      ]
    },
    {
      "id": "eid",
      "title": "Eid Campaign",
      "icon": "🕌",
      "urgency": "high",
      "description": "one line description",
      "recipientCount": 0,
      "messages": [
        {
          "recipientName": "name",
          "recipientPhone": "phone",
          "message": "full eid campaign whatsapp message"
        }
      ]
    },
    {
      "id": "weekly",
      "title": "Weekly Summary",
      "icon": "📊",
      "urgency": "low",
      "description": "one line description",
      "recipientCount": 1,
      "messages": [
        {
          "recipientName": "Self/Team",
          "recipientPhone": "",
          "message": "weekly business summary whatsapp message with all key numbers"
        }
      ]
    }
  ],
  "hubSummary": "one line overall summary of all campaigns"
}

Make all messages sound natural Pakistani WhatsApp style.
Mix Urdu and English naturally.
Each message must be complete and ready to send.
    `;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }]
    });

    const rawResponse = completion.choices[0].message.content;
    const cleanResponse = rawResponse
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    const parsed = JSON.parse(cleanResponse);

    res.json({ success: true, hub: parsed });

  } catch (error) {
    console.error('WhatsApp hub error:', error);
    res.status(500).json({ error: error.message });
  }
};
// DAILY BUSINESS BRIEFING
exports.generateDailyBriefing = async (req, res) => {
  try {
    const userId = req.user._id;
    const userName = req.user.name;

    const inventory = await Inventory.find({ userId }).lean();
    const customers = await Customer.find({ userId }).lean();
    const transactions = await Transaction
      .find({ userId })
      .sort({ date: -1 })
      .lean();

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - 7);

    const monthStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    );

    // Revenue calculations
    const yesterdayRevenue = transactions
      .filter(t => new Date(t.date) >= yesterday)
      .reduce((s, t) => s + t.amount, 0);

    const weeklyRevenue = transactions
      .filter(t => new Date(t.date) >= weekStart)
      .reduce((s, t) => s + t.amount, 0);

    const monthlyRevenue = transactions
      .filter(t => new Date(t.date) >= monthStart)
      .reduce((s, t) => s + t.amount, 0);

    const bestDayRevenue = Math.max(
      ...transactions.map(t => t.amount), 0
    );

    // Last week revenue for comparison
    const lastWeekStart = new Date(today);
    lastWeekStart.setDate(lastWeekStart.getDate() - 14);
    const lastWeekEnd = new Date(today);
    lastWeekEnd.setDate(lastWeekEnd.getDate() - 7);

    const lastWeekRevenue = transactions
      .filter(t => {
        const d = new Date(t.date);
        return d >= lastWeekStart && d < lastWeekEnd;
      })
      .reduce((s, t) => s + t.amount, 0);

    const weeklyChange = lastWeekRevenue > 0
      ? (((weeklyRevenue - lastWeekRevenue) / lastWeekRevenue) * 100)
        .toFixed(0)
      : 0;

    // Stock health
    const criticalStock = inventory.filter(p => p.quantity < 10);
    const warningStock = inventory.filter(
      p => p.quantity >= 10 && p.quantity < 20
    );
    const healthyStock = inventory.filter(p => p.quantity >= 20);

    // Customer health
    const activeCustomers = customers.filter(c => {
      const days = Math.floor(
        (today - new Date(c.lastPurchaseDate)) /
        (1000 * 60 * 60 * 24)
      );
      return days <= 30;
    });

    const atRiskCustomers = customers.filter(c => {
      const days = Math.floor(
        (today - new Date(c.lastPurchaseDate)) /
        (1000 * 60 * 60 * 24)
      );
      return days > 30 && days <= 60;
    });

    const lostCustomers = customers.filter(c => {
      const days = Math.floor(
        (today - new Date(c.lastPurchaseDate)) /
        (1000 * 60 * 60 * 24)
      );
      return days > 60;
    });

    const lostCustomerValue = lostCustomers.reduce(
      (s, c) => s + c.totalSpent, 0
    );

    // Eid countdown
    const eidDate = new Date('2026-06-06');
    const daysUntilEid = Math.floor(
      (eidDate - today) / (1000 * 60 * 60 * 24)
    );

    // Day of week greeting
    const days = [
      'Sunday', 'Monday', 'Tuesday',
      'Wednesday', 'Thursday', 'Friday', 'Saturday'
    ];
    const dayName = days[today.getDay()];
    const dateStr = today.toLocaleDateString('en-PK', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const prompt = `
You are StyleSync AI generating a morning business briefing
for ${userName}, a Pakistani clothing brand owner.

TODAY: ${dayName}, ${dateStr}

BUSINESS DATA:
Yesterday Revenue: PKR ${yesterdayRevenue.toLocaleString()}
This Week Revenue: PKR ${weeklyRevenue.toLocaleString()}
Last Week Revenue: PKR ${lastWeekRevenue.toLocaleString()}
Weekly Change: ${weeklyChange}%
This Month Revenue: PKR ${monthlyRevenue.toLocaleString()}
Best Single Transaction: PKR ${bestDayRevenue.toLocaleString()}

STOCK HEALTH:
Critical (under 10 units): ${criticalStock.length} products
${JSON.stringify(criticalStock.map(p => ({
  name: p.productName,
  quantity: p.quantity
})))}
Warning (10-20 units): ${warningStock.length} products
Healthy (20+ units): ${healthyStock.length} products

CUSTOMER HEALTH:
Active (last 30 days): ${activeCustomers.length} customers
At Risk (30-60 days): ${atRiskCustomers.length} customers
Lost (60+ days): ${lostCustomers.length} customers
Lost Customer Total Value: PKR ${lostCustomerValue.toLocaleString()}
${JSON.stringify(lostCustomers.map(c => ({
  name: c.customerName,
  daysSince: Math.floor(
    (today - new Date(c.lastPurchaseDate)) / (1000 * 60 * 60 * 24)
  ),
  totalSpent: c.totalSpent
})))}

EID ul ADHA: ${daysUntilEid} days away

Generate a morning briefing in this EXACT JSON only:
{
  "greeting": "warm good morning greeting with name in urdu/english mix",
  "urgentItems": [
    {
      "priority": 1,
      "emoji": "🔴",
      "issue": "short issue title",
      "detail": "specific detail with numbers",
      "action": "exact action to take right now"
    }
  ],
  "moneySnapshot": {
    "yesterday": 0,
    "thisWeek": 0,
    "thisMonth": 0,
    "weeklyTrend": "up/down/same",
    "trendPercent": "0%",
    "trendMessage": "one line trend insight"
  },
  "stockHealth": {
    "critical": 0,
    "warning": 0,
    "healthy": 0,
    "stockMessage": "one line stock insight"
  },
  "customerHealth": {
    "active": 0,
    "atRisk": 0,
    "lost": 0,
    "lostValue": 0,
    "customerMessage": "one line customer insight"
  },
  "oneFocusToday": {
    "title": "your single most important focus today",
    "detail": "2-3 sentences explaining why this matters today specifically",
    "expectedResult": "what happens if they do this today"
  },
  "motivationalNote": "short urdu/english mixed motivational message personalized to their situation"
}
    `;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }]
    });

    const rawResponse = completion.choices[0].message.content;
    const cleanResponse = rawResponse
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    const parsed = JSON.parse(cleanResponse);

    res.json({
      success: true,
      briefing: parsed,
      meta: {
        dayName,
        dateStr,
        daysUntilEid
      }
    });

  } catch (error) {
    console.error('Daily briefing error:', error);
    res.status(500).json({ error: error.message });
  }
};


// BUSINESS HEALTH SCORE
exports.generateHealthScore = async (req, res) => {
  try {
    const userId = req.user._id;

    const inventory = await Inventory.find({ userId }).lean();
    const customers = await Customer.find({ userId }).lean();
    const transactions = await Transaction
      .find({ userId })
      .sort({ date: -1 })
      .lean();

    const today = new Date();

    // INVENTORY HEALTH (25 points)
    const totalProducts = inventory.length;
    const criticalStock = inventory.filter(p => p.quantity < 10).length;
    const lowStock = inventory.filter(
      p => p.quantity >= 10 && p.quantity < 20
    ).length;
    const healthyStock = inventory.filter(p => p.quantity >= 20).length;

    let inventoryScore = 0;
    if (totalProducts > 0) {
      inventoryScore = Math.round(
        ((healthyStock * 100) + (lowStock * 50) + (criticalStock * 0))
        / totalProducts
      );
    }

    // CUSTOMER HEALTH (25 points)
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(c => {
      const days = Math.floor(
        (today - new Date(c.lastPurchaseDate)) /
        (1000 * 60 * 60 * 24)
      );
      return days <= 30;
    }).length;

    const atRiskCustomers = customers.filter(c => {
      const days = Math.floor(
        (today - new Date(c.lastPurchaseDate)) /
        (1000 * 60 * 60 * 24)
      );
      return days > 30 && days <= 60;
    }).length;

    const lostCustomers = customers.filter(c => {
      const days = Math.floor(
        (today - new Date(c.lastPurchaseDate)) /
        (1000 * 60 * 60 * 24)
      );
      return days > 60;
    }).length;

    let customerScore = 0;
    if (totalCustomers > 0) {
      customerScore = Math.round(
        ((activeCustomers * 100) +
         (atRiskCustomers * 50) +
         (lostCustomers * 0))
        / totalCustomers
      );
    }

    // REVENUE HEALTH (25 points)
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - 7);
    const lastWeekStart = new Date(today);
    lastWeekStart.setDate(lastWeekStart.getDate() - 14);
    const lastWeekEnd = new Date(today);
    lastWeekEnd.setDate(lastWeekEnd.getDate() - 7);

    const thisWeekRevenue = transactions
      .filter(t => new Date(t.date) >= weekStart)
      .reduce((s, t) => s + t.amount, 0);

    const lastWeekRevenue = transactions
      .filter(t => {
        const d = new Date(t.date);
        return d >= lastWeekStart && d < lastWeekEnd;
      })
      .reduce((s, t) => s + t.amount, 0);

    let revenueScore = 50;
    if (lastWeekRevenue > 0) {
      const growth = (thisWeekRevenue - lastWeekRevenue) / lastWeekRevenue;
      if (growth > 0.2) revenueScore = 100;
      else if (growth > 0) revenueScore = 75;
      else if (growth === 0) revenueScore = 50;
      else if (growth > -0.2) revenueScore = 25;
      else revenueScore = 0;
    } else if (thisWeekRevenue > 0) {
      revenueScore = 75;
    }

    // SALES VELOCITY (25 points)
    const monthStart = new Date(
      today.getFullYear(), today.getMonth(), 1
    );
    const monthlyTransactions = transactions.filter(
      t => new Date(t.date) >= monthStart
    );
    const avgDailyTransactions = monthlyTransactions.length /
      Math.max(1, today.getDate());

    let velocityScore = 0;
    if (avgDailyTransactions >= 2) velocityScore = 100;
    else if (avgDailyTransactions >= 1) velocityScore = 75;
    else if (avgDailyTransactions >= 0.5) velocityScore = 50;
    else if (avgDailyTransactions > 0) velocityScore = 25;
    else velocityScore = 0;

    // OVERALL SCORE
    const overallScore = Math.round(
      (inventoryScore + customerScore + revenueScore + velocityScore) / 4
    );

    const prompt = `
You are StyleSync AI calculating a business health score
for a Pakistani clothing brand owner.

SCORES CALCULATED:
Overall Score: ${overallScore}/100
Inventory Health: ${inventoryScore}/100
Customer Health: ${customerScore}/100
Revenue Health: ${revenueScore}/100
Sales Velocity: ${velocityScore}/100

BUSINESS DATA:
Total Products: ${totalProducts}
Critical Stock: ${criticalStock}
Low Stock: ${lowStock}
Healthy Stock: ${healthyStock}
Total Customers: ${totalCustomers}
Active Customers: ${activeCustomers}
At Risk Customers: ${atRiskCustomers}
Lost Customers: ${lostCustomers}
This Week Revenue: PKR ${thisWeekRevenue.toLocaleString()}
Last Week Revenue: PKR ${lastWeekRevenue.toLocaleString()}

Generate health score report in this EXACT JSON only:
{
  "overallScore": ${overallScore},
  "grade": "A+/A/B+/B/C/D",
  "status": "Excellent/Good/Average/Needs Work/Critical",
  "scores": {
    "inventory": ${inventoryScore},
    "customer": ${customerScore},
    "revenue": ${revenueScore},
    "velocity": ${velocityScore}
  },
  "weeklyChange": "+12 from last week or similar",
  "aiVerdict": "2-3 sentences in urdu/english mix explaining the score",
  "biggestStrength": "what they are doing best",
  "biggestWeakness": "what needs most improvement",
  "scoreBooster": "single most impactful action to improve score this week",
  "badges": [
    {
      "emoji": "🏆",
      "title": "badge title",
      "reason": "why they earned this"
    }
  ]
}

Give 1-3 badges based on what they have achieved.
Make aiVerdict warm and encouraging in Pakistani style.
    `;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }]
    });

    const rawResponse = completion.choices[0].message.content;
    const cleanResponse = rawResponse
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    const parsed = JSON.parse(cleanResponse);

    res.json({ success: true, health: parsed });

  } catch (error) {
    console.error('Health score error:', error);
    res.status(500).json({ error: error.message });
  }
};
// GHOST INVENTORY RECOVERY
exports.generateGhostInventory = async (req, res) => {
  try {
    const userId = req.user._id;

    const inventory = await Inventory.find({ userId }).lean();
    const transactions = await Transaction
      .find({ userId })
      .sort({ date: -1 })
      .lean();

    const today = new Date();
    const fourteenDaysAgo = new Date(today);
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    // Find products with no sales in 14 days
    const ghostProducts = inventory.filter((p) => {
      const productTxns = transactions.filter(
        t => t.productId.toString() === p._id.toString()
      );

      if (productTxns.length === 0) return true;

      const lastSale = new Date(productTxns[0].date);
      return lastSale < fourteenDaysAgo;
    });

    if (ghostProducts.length === 0) {
      return res.json({
        success: true,
        ghostProducts: [],
        note: 'No ghost inventory found. All products sold recently.'
      });
    }

    // Calculate liquidity risk per product
    const enrichedGhosts = ghostProducts.map((p) => {
      const productTxns = transactions.filter(
        t => t.productId.toString() === p._id.toString()
      );

      const lastSaleDate = productTxns.length > 0
        ? productTxns[0].date
        : p.createdAt;

      const daysSinceLastSale = Math.floor(
        (today - new Date(lastSaleDate)) / (1000 * 60 * 60 * 24)
      );

      const totalRevenue = productTxns.reduce(
        (s, t) => s + t.amount, 0
      );

      const liquidityRisk = p.quantity * p.price;
      const discountedValue15 = liquidityRisk * 0.85;
      const discountedValue25 = liquidityRisk * 0.75;

      return {
        productName: p.productName,
        category: p.category,
        quantity: p.quantity,
        pricePerUnit: p.price,
        liquidityRisk,
        discountedValue15: Math.round(discountedValue15),
        discountedValue25: Math.round(discountedValue25),
        daysSinceLastSale,
        totalRevenueEver: totalRevenue,
        riskLevel: daysSinceLastSale > 30
          ? 'critical'
          : daysSinceLastSale > 14
          ? 'high'
          : 'medium'
      };
    });

    const totalLiquidityRisk = enrichedGhosts.reduce(
      (s, p) => s + p.liquidityRisk, 0
    );

    const prompt = `
You are StyleSync AI identifying ghost inventory
for a Pakistani clothing brand owner in Karachi.

Ghost inventory means products that have not sold
in 14+ days. In Karachi fashion market this is
very high risk because trends change fast.

GHOST PRODUCTS DETECTED:
${JSON.stringify(enrichedGhosts, null, 2)}

TOTAL MONEY STUCK IN DEAD STOCK: PKR ${totalLiquidityRisk.toLocaleString()}

Generate a ghost inventory recovery plan in this EXACT JSON only:
{
  "totalLiquidityRisk": ${totalLiquidityRisk},
  "totalProductsAffected": ${enrichedGhosts.length},
  "urgencyLevel": "critical/high/medium",
  "executiveSummary": "2 sentences about the situation",
  "recoveryPlan": [
    {
      "productName": "name",
      "quantity": 0,
      "liquidityRisk": 0,
      "daysSinceLastSale": 0,
      "riskLevel": "critical/high/medium",
      "recommendedDiscount": "15%/20%/25%/30%",
      "recoveryAmount": 0,
      "flashSaleMessage": "complete whatsapp flash sale message in urdu/english for this specific product",
      "strategy": "specific recovery strategy for this product"
    }
  ],
  "totalRecoveryPotential": 0,
  "topPriorityAction": "single most important action to take today",
  "cashFlowInsight": "how recovering this cash helps the business specifically"
}
    `;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 3000,
      messages: [{ role: 'user', content: prompt }]
    });

    const rawResponse = completion.choices[0].message.content;
    const cleanResponse = rawResponse
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    const parsed = JSON.parse(cleanResponse);

    res.json({ success: true, recovery: parsed });

  } catch (error) {
    console.error('Ghost inventory error:', error);
    res.status(500).json({ error: error.message });
  }
};
// ANOMALY DETECTION
exports.detectAnomalies = async (req, res) => {
  try {
    const userId = req.user._id;

    const inventory = await Inventory.find({ userId }).lean();
    const transactions = await Transaction
      .find({ userId })
      .sort({ date: -1 })
      .limit(50)
      .lean();

    const anomalies = [];

    // Check each transaction for anomalies
    for (const txn of transactions) {
      const product = inventory.find(
        p => p._id.toString() === txn.productId.toString()
      );

      // Anomaly 1: Product not found in inventory
      if (!txn.productId) {
        anomalies.push({
          type: 'missing_product',
          severity: 'high',
          transaction: txn,
          description: `Transaction recorded but product ID missing`,
          suggestedFix: 'Review and link transaction to correct product'
        });
      }

      // Anomaly 2: Unusually high transaction amount
      const avgAmount = transactions.reduce(
        (s, t) => s + t.amount, 0
      ) / transactions.length;

      if (txn.amount > avgAmount * 5) {
        anomalies.push({
          type: 'unusual_amount',
          severity: 'medium',
          transaction: txn,
          description: `Transaction of PKR ${txn.amount.toLocaleString()} is 5x above average`,
          suggestedFix: 'Verify this transaction is correct'
        });
      }

      // Anomaly 3: Zero quantity transaction
      if (txn.quantity === 0) {
        anomalies.push({
          type: 'zero_quantity',
          severity: 'high',
          transaction: txn,
          description: 'Transaction recorded with zero quantity',
          suggestedFix: 'Update quantity or delete this transaction'
        });
      }

      // Anomaly 4: Current stock seems too low vs sales
      if (product && product.quantity === 0 && txn.amount > 0) {
        anomalies.push({
          type: 'stock_mismatch',
          severity: 'critical',
          transaction: txn,
          product: product.productName,
          description: `${product.productName} shows 0 stock but has recorded sales`,
          suggestedFix: 'Audit stock count and adjust inventory'
        });
      }
    }

    // Check for products with suspicious stock levels
    for (const product of inventory) {
      const productTxns = transactions.filter(
        t => t.productId.toString() === product._id.toString()
      );
      const totalSold = productTxns.reduce(
        (s, t) => s + t.quantity, 0
      );

      // Anomaly 5: Negative implied stock
      if (totalSold > 0 && product.quantity < 0) {
        anomalies.push({
          type: 'negative_stock',
          severity: 'critical',
          product: product.productName,
          description: `${product.productName} has negative stock count`,
          suggestedFix: 'Immediately audit and correct stock levels'
        });
      }
    }

    const prompt = `
You are StyleSync AI performing anomaly detection
for a Pakistani clothing brand owner.

ANOMALIES DETECTED:
${JSON.stringify(anomalies, null, 2)}

Total Anomalies: ${anomalies.length}

Generate anomaly report in this EXACT JSON only:
{
  "totalAnomalies": ${anomalies.length},
  "criticalCount": 0,
  "highCount": 0,
  "mediumCount": 0,
  "systemStatus": "Clean/Warning/Critical",
  "statusMessage": "one line system status",
  "anomalies": [
    {
      "id": 1,
      "type": "anomaly type",
      "severity": "critical/high/medium",
      "title": "short title",
      "description": "what went wrong",
      "impact": "business impact of this anomaly",
      "fix": "exact steps to fix this",
      "autoFixable": true
    }
  ],
  "dataIntegrityScore": 0,
  "recommendation": "overall recommendation for data health"
}

dataIntegrityScore should be 0-100 based on anomaly severity.
If no anomalies, score is 100.
    `;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }]
    });

    const rawResponse = completion.choices[0].message.content;
    const cleanResponse = rawResponse
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    const parsed = JSON.parse(cleanResponse);

    res.json({ success: true, audit: parsed });

  } catch (error) {
    console.error('Anomaly detection error:', error);
    res.status(500).json({ error: error.message });
  }
};