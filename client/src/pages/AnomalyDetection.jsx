import { useState, useEffect } from 'react';
import api from '../utils/api';

const severityConfig = {
  critical: {
    border: 'border-red-500/30',
    bg: 'bg-red-500/5',
    badge: 'bg-red-500/20 text-red-400',
    icon: '🚨'
  },
  high: {
    border: 'border-orange-500/30',
    bg: 'bg-orange-500/5',
    badge: 'bg-orange-500/20 text-orange-400',
    icon: '⚠️'
  },
  medium: {
    border: 'border-yellow-500/30',
    bg: 'bg-yellow-500/5',
    badge: 'bg-yellow-500/20 text-yellow-400',
    icon: '🔍'
  }
};

const AnomalyDetection = () => {
  const [audit, setAudit] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    runAudit();
  }, []);

  const runAudit = async () => {
    setLoading(true);
    try {
      const res = await api.get('/chat/anomalies');
      setAudit(res.data.audit);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const integrityColor = audit
    ? audit.dataIntegrityScore >= 80
      ? 'text-emerald-400 border-emerald-500'
      : audit.dataIntegrityScore >= 50
      ? 'text-yellow-400 border-yellow-500'
      : 'text-red-400 border-red-500'
    : 'text-gray-400 border-gray-700';

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center
                    h-64 gap-4">
        <div className="w-16 h-16 rounded-full border-4
                      border-emerald-500 border-t-transparent
                      animate-spin" />
        <p className="text-white font-semibold">
          Running data integrity audit...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            🔍 Anomaly Detection
          </h1>
          <p className="text-gray-400 mt-1">
            Data integrity audit and self-correction system
          </p>
        </div>
        <button
          onClick={runAudit}
          className="bg-gray-800 hover:bg-gray-700 text-gray-300
                   hover:text-white px-4 py-2 rounded-lg text-sm
                   transition-colors flex items-center gap-2"
        >
          🔄 Re-Run Audit
        </button>
      </div>

      {audit && (
        <>
          {/* Integrity Score */}
          <div className="bg-gray-900 border border-gray-800
                        rounded-2xl p-8">
            <div className="flex flex-col md:flex-row
                          items-center gap-8">
              <div className={`w-36 h-36 rounded-full border-8
                             ${integrityColor} flex flex-col
                             items-center justify-center bg-gray-800
                             flex-shrink-0`}>
                <p className={`text-4xl font-bold ${integrityColor
                  .split(' ')[0]}`}>
                  {audit.dataIntegrityScore}
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  integrity
                </p>
              </div>
              <div>
                <p className="text-white font-bold text-xl mb-1">
                  {audit.systemStatus}
                </p>
                <p className="text-gray-400 text-sm mb-3">
                  {audit.statusMessage}
                </p>
                <div className="flex gap-3">
                  <div className="bg-red-500/10 border
                                border-red-500/20 rounded-lg
                                px-3 py-2 text-center">
                    <p className="text-red-400 font-bold">
                      {audit.criticalCount}
                    </p>
                    <p className="text-gray-500 text-xs">Critical</p>
                  </div>
                  <div className="bg-orange-500/10 border
                                border-orange-500/20 rounded-lg
                                px-3 py-2 text-center">
                    <p className="text-orange-400 font-bold">
                      {audit.highCount}
                    </p>
                    <p className="text-gray-500 text-xs">High</p>
                  </div>
                  <div className="bg-yellow-500/10 border
                                border-yellow-500/20 rounded-lg
                                px-3 py-2 text-center">
                    <p className="text-yellow-400 font-bold">
                      {audit.mediumCount}
                    </p>
                    <p className="text-gray-500 text-xs">Medium</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Clean State */}
          {audit.totalAnomalies === 0 && (
            <div className="bg-emerald-500/10 border
                          border-emerald-500/20 rounded-2xl
                          p-12 text-center">
              <p className="text-5xl mb-3">✅</p>
              <p className="text-white font-semibold text-lg mb-2">
                No Anomalies Detected
              </p>
              <p className="text-emerald-400 text-sm">
                Your data is clean. Integrity score: 100/100
              </p>
            </div>
          )}

          {/* Anomaly List */}
          {audit.anomalies?.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-white font-semibold">
                Detected Anomalies
              </h2>
              {audit.anomalies.map((anomaly, i) => {
                const config = severityConfig[anomaly.severity]
                  || severityConfig.medium;
                return (
                  <div
                    key={i}
                    className={`border ${config.border} ${config.bg}
                               rounded-2xl p-5`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{config.icon}</span>
                        <p className="text-white font-medium">
                          {anomaly.title}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {anomaly.autoFixable && (
                          <span className="bg-emerald-500/20
                                         text-emerald-400 text-xs
                                         px-2 py-1 rounded-full">
                            Auto-fixable
                          </span>
                        )}
                        <span className={`text-xs px-2 py-1
                                        rounded-full ${config.badge}`}>
                          {anomaly.severity?.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm mb-2">
                      {anomaly.description}
                    </p>
                    <p className="text-gray-400 text-xs mb-3">
                      Impact: {anomaly.impact}
                    </p>
                    <div className="bg-gray-800/50 rounded-lg
                                  px-4 py-2">
                      <p className="text-emerald-400 text-xs">
                        🔧 Fix: {anomaly.fix}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Recommendation */}
          <div className="bg-gray-900 border border-gray-800
                        rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">💡</span>
              <h2 className="text-white font-semibold">
                AI Recommendation
              </h2>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              {audit.recommendation}
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default AnomalyDetection;