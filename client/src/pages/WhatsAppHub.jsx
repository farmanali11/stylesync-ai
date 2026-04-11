import { useState } from 'react';
import api from '../utils/api';

const urgencyConfig = {
  urgent: 'border-red-500/30 bg-red-500/5 text-red-400',
  high: 'border-orange-500/30 bg-orange-500/5 text-orange-400',
  medium: 'border-yellow-500/30 bg-yellow-500/5 text-yellow-400',
  low: 'border-gray-600 bg-gray-800/50 text-gray-400'
};

const urgencyBadge = {
  urgent: 'bg-red-500/20 text-red-400 border border-red-500/30',
  high: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  low: 'bg-gray-700 text-gray-400'
};

const MessageCard = ({ msg, onCopy, copied }) => (
  <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
    <div className="flex items-center justify-between mb-2">
      <div>
        <p className="text-white text-sm font-medium">
          {msg.recipientName}
        </p>
        {msg.recipientPhone && (
          <p className="text-gray-500 text-xs">{msg.recipientPhone}</p>
        )}
      </div>
      <button
        onClick={() => onCopy(msg.message, msg.recipientName)}
        className={`text-xs px-3 py-1.5 rounded-lg transition-colors
                   flex items-center gap-1 ${
                     copied === msg.recipientName
                       ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                       : 'bg-green-600 hover:bg-green-500 text-white'
                   }`}
      >
        {copied === msg.recipientName ? '✓ Copied' : '📋 Copy'}
      </button>
    </div>
    <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
      <p className="text-gray-300 text-xs leading-relaxed whitespace-pre-wrap">
        {msg.message}
      </p>
    </div>
    {msg.recipientPhone && (
      <a href={`https://wa.me/${msg.recipientPhone.replace(/^0/, '92')}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 mt-3
                 bg-green-600 hover:bg-green-500 text-white text-xs
                 py-2 rounded-lg transition-colors w-full"
      >
        <span>📱</span>
        Open in WhatsApp
      </a>
    )}
  </div>
);

const CampaignCard = ({ campaign, onCopyAll, copiedName }) => {
  const [expanded, setExpanded] = useState(false);
  const config = urgencyConfig[campaign.urgency] || urgencyConfig.low;
  const badge = urgencyBadge[campaign.urgency] || urgencyBadge.low;

  return (
    <div className={`border rounded-2xl overflow-hidden ${config}`}>
      {/* Campaign Header */}
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{campaign.icon}</span>
            <div>
              <h3 className="text-white font-semibold">
                {campaign.title}
              </h3>
              <p className="text-gray-400 text-xs mt-0.5">
                {campaign.description}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className={`text-xs px-2 py-1 rounded-full ${badge}`}>
              {campaign.urgency?.toUpperCase()}
            </span>
            <span className="text-gray-500 text-xs">
              {campaign.recipientCount} recipient
              {campaign.recipientCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300
                     hover:text-white text-xs py-2 rounded-lg
                     transition-colors"
          >
            {expanded ? 'Hide Messages ▲' : 'View Messages ▼'}
          </button>
          <button
            onClick={() => onCopyAll(campaign.messages)}
            className="bg-green-600 hover:bg-green-500 text-white
                     text-xs px-4 py-2 rounded-lg transition-colors
                     flex items-center gap-1"
          >
            📋 Copy All
          </button>
        </div>
      </div>

      {/* Messages */}
      {expanded && (
        <div className="border-t border-gray-700/50 p-4 space-y-3
                      bg-gray-900/50">
          {campaign.messages.map((msg, i) => (
            <MessageCard
              key={i}
              msg={msg}
              onCopy={onCopyAll}
              copied={copiedName}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const WhatsAppHub = () => {
  const [hub, setHub] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [copiedName, setCopiedName] = useState('');
  const [totalCopied, setTotalCopied] = useState(0);

  const generateHub = async () => {
    setLoading(true);
    try {
      const res = await api.get('/chat/whatsapp-hub');
      setHub(res.data.hub);
      setGenerated(true);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (message, name) => {
    if (Array.isArray(message)) {
      const allMessages = message
        .map(m => `To: ${m.recipientName}\n${m.message}`)
        .join('\n\n---\n\n');
      navigator.clipboard.writeText(allMessages);
      setCopiedName('all');
    } else {
      navigator.clipboard.writeText(message);
      setCopiedName(name);
    }
    setTotalCopied(prev => prev + 1);
    setTimeout(() => setCopiedName(''), 2000);
  };

  const totalMessages = hub?.campaigns?.reduce(
    (sum, c) => sum + c.messages.length, 0
  ) || 0;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            📱 WhatsApp Hub
          </h1>
          <p className="text-gray-400 mt-1">
            AI generated campaigns ready to send
          </p>
        </div>
        <button
          onClick={generateHub}
          disabled={loading}
          className="bg-green-600 hover:bg-green-500 text-white
                   px-6 py-2 rounded-lg text-sm font-medium
                   transition-colors duration-200
                   disabled:opacity-50 disabled:cursor-not-allowed
                   flex items-center gap-2"
        >
          {loading ? (
            <>
              <span className="animate-spin">⏳</span>
              Generating...
            </>
          ) : (
            <>
              <span>📱</span>
              {generated ? 'Regenerate Hub' : 'Generate WhatsApp Hub'}
            </>
          )}
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-gray-900 border border-gray-800
                      rounded-2xl p-16 text-center">
          <p className="text-5xl mb-4 animate-pulse">📱</p>
          <p className="text-white font-semibold text-lg mb-2">
            AI is preparing your campaigns...
          </p>
          <p className="text-gray-400 text-sm">
            Analyzing customers, inventory and sales data
            to generate personalized messages
          </p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !hub && (
        <div className="bg-gray-900 border border-gray-800
                      rounded-2xl p-16 text-center">
          <p className="text-6xl mb-4">📱</p>
          <p className="text-white font-semibold text-xl mb-2">
            Your WhatsApp Marketing Manager
          </p>
          <p className="text-gray-400 text-sm max-w-lg mx-auto mb-3">
            AI generates complete WhatsApp campaigns for your
            inactive customers, suppliers, VIP customers and Eid
            promotion — all personalized, all ready to send.
          </p>
          <p className="text-emerald-400 text-sm mb-6">
            Worth PKR 30,000/month from a marketing agency.
            Free with StyleSync AI.
          </p>
          <button
            onClick={generateHub}
            className="bg-green-600 hover:bg-green-500 text-white
                     px-8 py-3 rounded-xl font-medium transition-colors"
          >
            Generate My Campaigns →
          </button>
        </div>
      )}

      {/* Hub Results */}
      {!loading && hub && (
        <>
          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-900 border border-gray-800
                          rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-white">
                {hub.campaigns?.length || 0}
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Campaigns Ready
              </p>
            </div>
            <div className="bg-gray-900 border border-gray-800
                          rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-emerald-400">
                {totalMessages}
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Messages Generated
              </p>
            </div>
            <div className="bg-gray-900 border border-gray-800
                          rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-green-400">
                {totalCopied}
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Messages Copied
              </p>
            </div>
          </div>

          {/* Summary */}
          {hub.hubSummary && (
            <div className="bg-green-500/10 border border-green-500/20
                          rounded-xl px-5 py-3">
              <p className="text-green-300 text-sm">
                📊 {hub.hubSummary}
              </p>
            </div>
          )}

          {/* Campaigns */}
          <div className="space-y-4">
            {hub.campaigns?.map((campaign, i) => (
              <CampaignCard
                key={i}
                campaign={campaign}
                onCopyAll={handleCopy}
                copiedName={copiedName}
              />
            ))}
          </div>

          {/* Footer Tip */}
          <div className="bg-gray-900 border border-gray-800
                        rounded-2xl p-5 text-center">
            <p className="text-gray-400 text-sm">
              💡 Click <span className="text-white">View Messages</span> on
              any campaign to see individual messages.
              Use <span className="text-green-400">Open in WhatsApp</span> to
              send directly from your browser.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default WhatsAppHub;