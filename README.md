# StyleSync AI 🤖

> AI-powered inventory and business intelligence platform for Pakistani clothing brands

[![Live Demo](https://img.shields.io/badge/Live%20Demo-stylesyncai--six.vercel.app-emerald)](https://stylesyncai-six.vercel.app)
[![Backend](https://img.shields.io/badge/Backend-Render-blue)](https://stylesync-server-2026.onrender.com)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## 🌟 What is StyleSync AI?

StyleSync AI is a full-stack SaaS platform that acts as an AI-powered business partner for clothing brand owners in Pakistan. Instead of guessing what to restock, losing customers silently, or spending hours on manual Excel calculations — owners simply ask StyleSync AI in plain language and get specific, actionable answers based on their real business data.

**One Line Pitch:**
> An AI-powered inventory and business assistant for Pakistani clothing brands that tells owners what to restock, which customers to target, and how their sales are performing — all through a simple chat interface.

---

## 🚀 Live Demo

| Service | URL |
|---------|-----|
| Frontend | https://stylesyncai-six.vercel.app |
| Backend API | https://stylesync-server-2026.onrender.com |
| Public API | https://stylesync-server-2026.onrender.com/v1 |

**Test Credentials:**
```
Email    → farman@stylesync.com
Password → 123456
```

---

## 💡 The Problem Being Solved

Small clothing brand owners in Karachi face three daily problems:

| Problem | Impact |
|---------|--------|
| No system to know what to restock | They guess and lose money |
| No system to track inactive customers | Revenue drops silently |
| No clean sales reports | Manual Excel calculations waste hours |

StyleSync AI solves all three through a simple AI chat interface that reads their actual business data.

---

## ✨ Core Features

### 1. 🤖 AI Chat Assistant
Ask anything about your business in plain English or Urdu. The AI reads your real inventory, customers and transactions to give specific answers.

### 2. 📱 WhatsApp Win-Back Engine
Identifies inactive customers (60+ days) and generates personalized WhatsApp messages in Urdu/English mix with unique discount codes. One click to copy and send.

### 3. 🔍 Smart Restock Analyzer
Calculates sales velocity per product and predicts when stock will run out. Gives specific restock quantities before you run out.

### 4. 🕌 Eid Season Forecaster
Predicts Eid demand based on sales history. Calculates units needed, projected revenue and generates a complete Eid battle plan.

### 5. 💰 Profit Intelligence
Shows real profit not just revenue. Identifies star products, dead weight products, VIP customers and at-risk customers.

### 6. 📱 WhatsApp Business Hub
Generates 5 complete WhatsApp campaigns: Win-Back, Supplier Restock, VIP Rewards, Eid Campaign and Weekly Summary. All personalized, all ready to send.

### 7. 🌅 Daily Business Briefing
Morning briefing with urgent items, money snapshot, stock health, customer health and one focused action for the day.

### 8. ❤️ Business Health Score
Overall business health score out of 100 with breakdown across inventory, customers, revenue and sales velocity.

### 9. 👻 Ghost Inventory Recovery
Identifies dead stock (no sales in 14+ days) and generates flash sale strategies with WhatsApp messages to recover cash.

### 10. 🔍 Anomaly Detection
Data integrity audit that identifies mismatches, unusual transactions and stock discrepancies automatically.

### 11. 🔌 Public API (B2B Integration)
Any business system can integrate StyleSync AI via REST API with API key authentication, rate limiting and tiered plans.

---

## 🛠 Tech Stack

### Frontend
```
React 18          → UI framework
Vite              → Build tool
Tailwind CSS 3    → Styling
React Router DOM  → Client-side routing
Axios             → HTTP client
```

### Backend
```
Node.js           → Runtime
Express.js        → Web framework
Mongoose          → MongoDB ODM
JWT               → Authentication
bcryptjs          → Password hashing
```

### Database
```
MongoDB Atlas     → Cloud database (M0 free tier)
```

### AI Integration
```
Groq API          → Free LLM inference
llama-3.3-70b     → AI model
```

### Deployment
```
Vercel            → Frontend hosting (free)
Render            → Backend hosting (free)
MongoDB Atlas     → Database hosting (free)
```

---

## 📁 Project Structure

```
stylesync-ai/
│
├── client/                          → React frontend
│   ├── src/
│   │   ├── components/
│   │   │   └── Layout.jsx           → Sidebar + navbar
│   │   ├── context/
│   │   │   └── AuthContext.jsx      → Global auth state
│   │   ├── pages/
│   │   │   ├── Landing.jsx          → Marketing page
│   │   │   ├── Login.jsx            → Authentication
│   │   │   ├── Signup.jsx           → Registration
│   │   │   ├── Dashboard.jsx        → Stats overview
│   │   │   ├── Inventory.jsx        → Product management
│   │   │   ├── Customers.jsx        → Customer management
│   │   │   ├── AIAssistant.jsx      → Chat interface
│   │   │   ├── EidForecast.jsx      → Eid predictions
│   │   │   ├── ProfitIntelligence.jsx → Profit analysis
│   │   │   ├── WhatsAppHub.jsx      → Campaign generator
│   │   │   ├── DailyBriefing.jsx    → Morning briefing
│   │   │   ├── HealthScore.jsx      → Business health
│   │   │   ├── GhostInventory.jsx   → Dead stock recovery
│   │   │   ├── AnomalyDetection.jsx → Data integrity
│   │   │   └── ApiDashboard.jsx     → API management
│   │   ├── utils/
│   │   │   └── api.js               → Axios instance
│   │   ├── App.jsx                  → Routes
│   │   └── main.jsx                 → Entry point
│   └── package.json
│
└── server/                          → Node/Express backend
    ├── controllers/
    │   ├── authController.js        → Signup, login
    │   ├── inventoryController.js   → Product CRUD
    │   ├── customerController.js    → Customer CRUD
    │   ├── transactionController.js → Sales recording
    │   ├── chatController.js        → All AI features
    │   ├── apiKeyController.js      → API key management
    │   └── publicApiController.js   → B2B endpoints
    ├── models/
    │   ├── User.js                  → User schema
    │   ├── Inventory.js             → Product schema
    │   ├── Customer.js              → Customer schema
    │   ├── Transaction.js           → Sales schema
    │   ├── Chat.js                  → Chat history schema
    │   └── ApiKey.js                → API key schema
    ├── routes/
    │   ├── authRoutes.js
    │   ├── inventoryRoutes.js
    │   ├── customerRoutes.js
    │   ├── transactionRoutes.js
    │   ├── chatRoutes.js
    │   ├── apiKeyRoutes.js
    │   └── publicApiRoutes.js
    ├── middleware/
    │   ├── authMiddleware.js        → JWT protection
    │   └── apiKeyMiddleware.js      → API key validation
    ├── server.js                    → Entry point
    └── package.json
```

---

## 🗄 Database Schema

```javascript
// User
{
  name: String,
  email: String (unique),
  password: String (bcrypt hashed),
  brandName: String,
  timestamps: true
}

// Inventory
{
  userId: ObjectId,
  productName: String,
  category: String,
  quantity: Number,
  price: Number,
  lastRestocked: Date,
  timestamps: true
}

// Customer
{
  userId: ObjectId,
  customerName: String,
  phone: String,
  email: String,
  totalSpent: Number,
  lastPurchaseDate: Date,
  timestamps: true
}

// Transaction
{
  userId: ObjectId,
  customerId: ObjectId,
  productId: ObjectId,
  productName: String,
  quantity: Number,
  amount: Number,
  date: Date,
  timestamps: true
}

// ApiKey
{
  userId: ObjectId,
  businessName: String,
  apiKey: String (unique),
  plan: enum[free, starter, business, enterprise],
  callsUsed: Number,
  callsLimit: Number,
  isActive: Boolean,
  timestamps: true
}
```

---

## 🔌 API Reference

### Internal API (requires JWT)

```
POST   /api/auth/signup           → Register user
POST   /api/auth/login            → Login user

GET    /api/inventory             → Get all products
POST   /api/inventory             → Add product
PUT    /api/inventory/:id         → Update product
DELETE /api/inventory/:id         → Delete product

GET    /api/customers             → Get all customers
POST   /api/customers             → Add customer
PUT    /api/customers/:id         → Update customer
DELETE /api/customers/:id         → Delete customer

GET    /api/transactions          → Get all transactions
POST   /api/transactions          → Add transaction

POST   /api/chat                  → Send AI message
GET    /api/chat/history          → Get chat history
GET    /api/chat/whatsapp         → Generate win-back messages
GET    /api/chat/restock          → Generate restock alerts
GET    /api/chat/eid-forecast     → Generate Eid forecast
GET    /api/chat/profit           → Generate profit report
GET    /api/chat/whatsapp-hub     → Generate all campaigns
GET    /api/chat/briefing         → Daily briefing
GET    /api/chat/health-score     → Business health score
GET    /api/chat/ghost-inventory  → Dead stock recovery
GET    /api/chat/anomalies        → Anomaly detection

POST   /api/keys/generate         → Generate API key
GET    /api/keys/my-key           → Get my API key
POST   /api/keys/regenerate       → Regenerate API key
```

### Public API (requires x-api-key header)

```
GET    /v1                        → API info
POST   /v1/analyze                → Full business analysis
POST   /v1/health-check           → Quick health check
```

---

## 🔌 Public API Integration

Any business system can integrate StyleSync AI intelligence:

```javascript
// Quick Health Check
fetch('https://stylesync-server-2026.onrender.com/v1/health-check', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'your_api_key'
  },
  body: JSON.stringify({
    inventory: [...],
    customers: [...],
    transactions: [...]
  })
})
.then(res => res.json())
.then(data => console.log(data.quickHealth));
```

### API Plans

| Plan | Calls/Month | Price |
|------|-------------|-------|
| Free | 100 | PKR 0 |
| Starter | 500 | PKR 5,000 |
| Business | 5,000 | PKR 25,000 |
| Enterprise | Unlimited | Custom |

---

## ⚙️ Local Setup

### Prerequisites
```
Node.js v18+
MongoDB (local or Atlas)
Groq API key (free at console.groq.com)
```

### Backend Setup

```bash
# Clone repository
git clone https://github.com/farmanali11/stylesync-ai.git
cd stylesync-ai/server

# Install dependencies
npm install

# Create .env file
PORT=5000
MONGODB_URI=mongodb://localhost:27017/stylesync
JWT_SECRET=your_secret_key
GROQ_API_KEY=your_groq_key

# Start server
node server.js
```

### Frontend Setup

```bash
cd ../client

# Install dependencies
npm install

# Create .env file
VITE_API_URL=http://localhost:5000/api

# Start development server
npm run dev
```

---

## 🚀 Deployment

### Backend → Render
```
1. Connect GitHub repository
2. Root Directory → server
3. Build Command → npm install
4. Start Command → node server.js
5. Add environment variables
```

### Frontend → Vercel
```
1. Connect GitHub repository
2. Root Directory → client
3. Framework → Vite
4. Add VITE_API_URL environment variable
```

---

## 🎯 Interview Story

> "I built StyleSync AI because small clothing brand owners in Pakistan have no affordable tools to manage their business intelligently.
>
> The core insight was that these owners already have the data but no way to extract decisions from it. So I built an AI assistant using Groq's LLM API that reads their actual inventory, customers and sales data and answers questions in plain English and Urdu.
>
> The most interesting challenge was prompt engineering — structuring system prompts so the AI gives specific actionable advice based on real numbers rather than generic business advice.
>
> Beyond the chat interface, I built specialized AI features: a WhatsApp win-back engine that generates personalized messages for inactive customers, an Eid season forecaster that predicts demand based on sales velocity, a ghost inventory recovery system that identifies dead stock and generates flash sale strategies, and a public B2B API that allows any business system to integrate our AI intelligence.
>
> Stack is React, Node.js, Express, MongoDB and Groq AI deployed on Vercel and Render."

---

## 👨‍💻 Developer

**Farman Ali**
- Education: BS Computer Science, NED University Karachi (2021-2025), CGPA 3.34/4.0
- Stack: React, Node.js, Express, MongoDB, PostgreSQL, Socket.IO
- Location: Karachi, Pakistan
- Goal: Junior MERN Stack Developer

---

## 📄 License

MIT License — feel free to use this project for learning and portfolio purposes.

---

*Built with ❤️ for Pakistani clothing brands by Farman Ali*