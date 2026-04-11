import { useState, useEffect, useRef } from 'react';
import api from '../utils/api';

const suggestedQuestions = [
  "What should I restock?",
  "Which customers are inactive?",
  "How were my sales this month?",
  "Which product is selling the most?",
  "Generate WhatsApp messages for inactive customers",
  "What is my total revenue this month?",
];

const AIAssistant = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchChatHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChatHistory = async () => {
    try {
      const res = await api.get('/chat/history');
      const history = res.data.chats.reverse().map((chat) => ([
        { role: 'user', content: chat.userMessage },
        { role: 'ai', content: chat.aiMessage }
      ])).flat();
      setMessages(history);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const sendMessage = async (messageText) => {
    const text = messageText || input.trim();
    if (!text || loading) return;

    const userMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/chat', { message: text });
      const aiMessage = { role: 'ai', content: res.data.message };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = {
        role: 'ai',
        content: 'Sorry, something went wrong. Please try again.'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loadingHistory) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-emerald-400">Loading chat history...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">

      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white">AI Assistant</h1>
        <p className="text-gray-400 mt-1">
          Ask anything about your business
        </p>
      </div>

      {/* Suggested Questions */}
      {messages.length === 0 && (
        <div className="mb-4">
          <p className="text-gray-500 text-sm mb-3">
            Try asking:
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className="bg-gray-800 hover:bg-gray-700 text-gray-300
                         hover:text-white text-sm px-4 py-2 rounded-full
                         border border-gray-700 hover:border-emerald-500
                         transition-all duration-200"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4
                      scrollbar-thin scrollbar-thumb-gray-700">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center 
                         h-full text-center">
            <p className="text-6xl mb-4">🤖</p>
            <p className="text-white font-semibold text-lg">
              StyleSync AI is ready
            </p>
            <p className="text-gray-500 text-sm mt-2 max-w-md">
              Ask me about your inventory, customers, or sales.
              I have access to your real business data.
            </p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'user' 
                ? 'justify-end' 
                : 'justify-start'}`}
            >
              {msg.role === 'ai' && (
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 
                              border border-emerald-500/30 flex items-center 
                              justify-center mr-3 mt-1 flex-shrink-0">
                  <span className="text-xs">🤖</span>
                </div>
              )}
              <div
                className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm
                           leading-relaxed whitespace-pre-wrap
                           ${msg.role === 'user'
                             ? 'bg-emerald-500 text-white rounded-tr-sm'
                             : 'bg-gray-800 text-gray-200 rounded-tl-sm border border-gray-700'
                           }`}
              >
                {msg.content}
              </div>
            </div>
          ))
        )}

        {/* Loading indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20
                          border border-emerald-500/30 flex items-center
                          justify-center mr-3 mt-1 flex-shrink-0">
              <span className="text-xs">🤖</span>
            </div>
            <div className="bg-gray-800 border border-gray-700 
                          px-4 py-3 rounded-2xl rounded-tl-sm">
              <div className="flex gap-1 items-center">
                <div className="w-2 h-2 bg-emerald-400 rounded-full 
                              animate-bounce" />
                <div className="w-2 h-2 bg-emerald-400 rounded-full 
                              animate-bounce delay-100" />
                <div className="w-2 h-2 bg-emerald-400 rounded-full 
                              animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
        <div className="flex gap-3 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your inventory, customers, or sales..."
            rows={1}
            className="flex-1 bg-gray-800 border border-gray-700
                     text-white rounded-xl px-4 py-3 text-sm
                     focus:outline-none focus:border-emerald-500
                     placeholder-gray-600 resize-none"
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="bg-emerald-500 hover:bg-emerald-400 text-white
                     p-3 rounded-xl transition-colors duration-200
                     disabled:opacity-50 disabled:cursor-not-allowed
                     flex-shrink-0"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          </button>
        </div>
        <p className="text-gray-600 text-xs mt-2 text-center">
          Press Enter to send • Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};

export default AIAssistant;