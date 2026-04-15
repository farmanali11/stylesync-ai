const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const TARGET_RESPONSE_TOKENS = 11800;
const MAX_TOTAL_TOKENS = 12000;
const MIN_RESPONSE_TOKENS = 300;
const TOKEN_SAFETY_BUFFER = 1000;
const MAX_PROMPT_TOKENS = 2500;
// Conservative estimate to avoid provider tokenizer undercount.
const CHARS_PER_TOKEN = 2;

const buildGroqTokenSafeRequest = (prompt) => {
  const maxPromptTokens = Math.min(
    MAX_PROMPT_TOKENS,
    MAX_TOTAL_TOKENS - TOKEN_SAFETY_BUFFER - MIN_RESPONSE_TOKENS
  );
  const maxPromptChars = Math.max(1000, maxPromptTokens * CHARS_PER_TOKEN);

  const safePrompt = (!prompt || prompt.length <= maxPromptChars)
    ? prompt
    : `${prompt.slice(0, maxPromptChars)}\n\n[Truncated to stay under token budget]`;

  const estimatedPromptTokens = Math.ceil((safePrompt || '').length / CHARS_PER_TOKEN);
  const availableResponseTokens = MAX_TOTAL_TOKENS -
    TOKEN_SAFETY_BUFFER -
    estimatedPromptTokens;
  const maxTokens = Math.max(
    MIN_RESPONSE_TOKENS,
    Math.min(TARGET_RESPONSE_TOKENS, availableResponseTokens)
  );

  return { safePrompt, maxTokens };
};

// MAIN PUBLIC ANALYSIS ENDPOINT
exports.analyzeBusinessData = async (req, res) => {
  try {
    const {
      inventory = [],
      customers = [],
      transactions = [],
      analysisType = 'full',
      businessContext = {}
    } = req.body;

    const businessName = req.apiKeyRecord.businessName;
    const plan = req.apiKeyRecord.plan;

    // Validate input
    if (!inventory.length && !customers.length && !transactions.length) {
      return res.status(400).json({
        error: 'No data provided',
        message: 'Send at least one of: inventory, customers, transactions'
      });
    }

    // Build analysis based on type
    const analyses = {
      full: 'complete business analysis',
      inventory: 'inventory and restock analysis only',
      customers: 'customer analysis and win-back only',
      revenue: 'revenue and profit analysis only',
      health: 'business health score only'
    };

    const today = new Date();
    const eidDate = new Date('2026-06-06');
    const daysUntilEid = Math.floor(
      (eidDate - today) / (1000 * 60 * 60 * 24)
    );

    const prompt = `
You are StyleSync AI analyzing business data for ${businessName}.
Perform a ${analyses[analysisType] || analyses.full}.

BUSINESS DATA PROVIDED:
Inventory (${inventory.length} products):
${JSON.stringify(inventory.slice(0, 50), null, 2)}

Customers (${customers.length} customers):
${JSON.stringify(customers.slice(0, 50), null, 2)}

Recent Transactions (${transactions.length} transactions):
${JSON.stringify(transactions.slice(0, 100), null, 2)}

Business Context: ${JSON.stringify(businessContext)}
Days Until Eid ul Adha: ${daysUntilEid}

Generate a comprehensive analysis in this EXACT JSON format only:
{
  "businessName": "${businessName}",
  "analysisType": "${analysisType}",
  "generatedAt": "${today.toISOString()}",
  "healthScore": {
    "overall": 0,
    "inventory": 0,
    "customers": 0,
    "revenue": 0,
    "grade": "A/B/C/D"
  },
  "inventoryInsights": {
    "totalProducts": 0,
    "lowStockCount": 0,
    "deadStockCount": 0,
    "restockAlerts": [
      {
        "productName": "name",
        "currentStock": 0,
        "urgency": "urgent/warning/ok",
        "recommendedRestockQuantity": 0,
        "reason": "why restock needed"
      }
    ],
    "deadStock": [
      {
        "productName": "name",
        "daysSinceLastSale": 0,
        "recommendedAction": "discount/bundle/return"
      }
    ]
  },
  "customerInsights": {
    "totalCustomers": 0,
    "activeCount": 0,
    "atRiskCount": 0,
    "lostCount": 0,
    "winBackTargets": [
      {
        "customerName": "name",
        "daysSinceLastPurchase": 0,
        "totalSpent": 0,
        "whatsappMessage": "ready to send message"
      }
    ]
  },
  "revenueInsights": {
    "totalRevenue": 0,
    "estimatedProfit": 0,
    "profitMargin": "0%",
    "topProduct": "name",
    "revenuetrend": "up/down/stable"
  },
  "eidOpportunity": {
    "daysUntilEid": ${daysUntilEid},
    "projectedEidRevenue": 0,
    "urgentRestockForEid": [],
    "eidStrategy": "one paragraph eid strategy"
  },
  "actionPlan": [
    "action 1",
    "action 2",
    "action 3"
  ],
  "aiSummary": "2-3 sentence executive summary in English"
}
    `;

    const { safePrompt, maxTokens } = buildGroqTokenSafeRequest(prompt);
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: safePrompt }]
    });

    const rawResponse = completion.choices[0].message.content;
    const cleanResponse = rawResponse
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    const analysis = JSON.parse(cleanResponse);

    res.json({
      success: true,
      powered_by: 'StyleSync AI',
      plan: plan,
      callsRemaining: req.apiKeyRecord.callsLimit -
        req.apiKeyRecord.callsUsed,
      analysis
    });

  } catch (error) {
    console.error('Public API error:', error);
    res.status(500).json({ error: error.message });
  }
};

// QUICK HEALTH CHECK ENDPOINT
exports.quickHealthCheck = async (req, res) => {
  try {
    const { inventory = [], customers = [], transactions = [] } = req.body;

    const today = new Date();

    // Calculate scores without AI (instant)
    const lowStock = inventory.filter(p => p.quantity < 10).length;
    const totalProducts = inventory.length;

    const activeCustomers = customers.filter(c => {
      const days = Math.floor(
        (today - new Date(c.lastPurchaseDate)) /
        (1000 * 60 * 60 * 24)
      );
      return days <= 30;
    }).length;

    const lostCustomers = customers.filter(c => {
      const days = Math.floor(
        (today - new Date(c.lastPurchaseDate)) /
        (1000 * 60 * 60 * 24)
      );
      return days > 60;
    }).length;

    const totalRevenue = transactions.reduce(
      (s, t) => s + (t.amount || 0), 0
    );

    const inventoryScore = totalProducts > 0
      ? Math.round(((totalProducts - lowStock) / totalProducts) * 100)
      : 0;

    const customerScore = customers.length > 0
      ? Math.round((activeCustomers / customers.length) * 100)
      : 0;

    const overallScore = Math.round(
      (inventoryScore + customerScore) / 2
    );

    res.json({
      success: true,
      powered_by: 'StyleSync AI',
      quickHealth: {
        overallScore,
        inventoryScore,
        customerScore,
        totalRevenue,
        lowStockAlerts: lowStock,
        lostCustomers,
        grade: overallScore >= 75 ? 'A'
          : overallScore >= 50 ? 'B'
          : overallScore >= 25 ? 'C' : 'D'
      },
      callsRemaining: req.apiKeyRecord.callsLimit -
        req.apiKeyRecord.callsUsed
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};