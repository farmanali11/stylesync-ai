import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';


import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Customers from './pages/Customers';
import AIAssistant from './pages/AIAssistant';
import EidForecast from './pages/EidForecast';
import Layout from './components/Layout';
import ProfitIntelligence from './pages/ProfitIntelligence';
import WhatsAppHub from './pages/WhatsAppHub';
import DailyBriefing from './pages/DailyBriefing';
import HealthScore from './pages/HealthScore';
import GhostInventory from './pages/GhostInventory';
import AnomalyDetection from './pages/AnomalyDetection';
import ApiDashboard from './pages/ApiDashboard';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center
                    justify-center">
      <p className="text-emerald-400">Loading...</p>
    </div>
  );
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Routes>
      <Route path="/landing" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/" element={
        <ProtectedRoute>
          <Layout><Dashboard /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/inventory" element={
        <ProtectedRoute>
          <Layout><Inventory /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/customers" element={
        <ProtectedRoute>
          <Layout><Customers /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/ai-assistant" element={
        <ProtectedRoute>
          <Layout><AIAssistant /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/eid-forecast" element={
        <ProtectedRoute>
          <Layout><EidForecast /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/profit" element={
  <ProtectedRoute>
    <Layout><ProfitIntelligence /></Layout>
  </ProtectedRoute>
} />
<Route path="/whatsapp-hub" element={
  <ProtectedRoute>
    <Layout><WhatsAppHub /></Layout>
  </ProtectedRoute>
} />

<Route path="/briefing" element={
  <ProtectedRoute>
    <Layout><DailyBriefing /></Layout>
  </ProtectedRoute>
} />

<Route path="/health-score" element={
  <ProtectedRoute>
    <Layout><HealthScore /></Layout>
  </ProtectedRoute>
} />
<Route path="/ghost-inventory" element={
  <ProtectedRoute>
    <Layout><GhostInventory /></Layout>
  </ProtectedRoute>
} />
<Route path="/anomalies" element={
  <ProtectedRoute>
    <Layout><AnomalyDetection /></Layout>
  </ProtectedRoute>
} />
<Route path="/api-dashboard" element={
  <ProtectedRoute>
    <Layout><ApiDashboard /></Layout>
  </ProtectedRoute>
} />
    </Routes>
  );
}

export default App;