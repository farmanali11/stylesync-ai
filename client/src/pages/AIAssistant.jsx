import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../utils/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const suggestedQuestions = [
  "What should I restock?",
  "Which customers are inactive?",
  "How were my sales this month?",
  "Which product is selling the most?",
  "Generate WhatsApp messages for inactive customers",
  "What is my total revenue this month?",
];

/* ── Markdown renderer only used for AI messages ── */
const MarkdownContent = ({ content }) => (
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    className="prose prose-invert prose-sm max-w-none"
    components={{
      p: ({ children }) => (
        <p className="mb-2 last:mb-0 text-gray-200 leading-relaxed">{children}</p>
      ),
      strong: ({ children }) => (
        <strong className="text-emerald-400 font-semibold">{children}</strong>
      ),
      em: ({ children }) => (
        <em className="text-gray-300 italic">{children}</em>
      ),
      ul: ({ children }) => (
        <ul className="my-2 space-y-1 pl-1">{children}</ul>
      ),
      ol: ({ children }) => (
        <ol className="my-2 space-y-1 pl-1 list-decimal list-inside">{children}</ol>
      ),
      li: ({ children }) => (
        <li className="flex gap-2 text-gray-200">
          <span className="text-emerald-400 mt-0.5 flex-shrink-0">•</span>
          <span>{children}</span>
        </li>
      ),
      code: ({ inline, children }) =>
        inline ? (
          <code className="bg-gray-700 text-emerald-300 px-1.5 py-0.5 rounded text-xs font-mono">
            {children}
          </code>
        ) : (
          <pre className="bg-gray-900 border border-gray-700 rounded-lg p-3 my-2 overflow-x-auto">
            <code className="text-emerald-300 text-xs font-mono">{children}</code>
          </pre>
        ),
      blockquote: ({ children }) => (
        <blockquote className="border-l-2 border-emerald-500 pl-3 my-2 text-gray-400 italic">
          {children}
        </blockquote>
      ),
      h1: ({ children }) => (
        <h1 className="text-white font-bold text-base mb-2 mt-3 first:mt-0">{children}</h1>
      ),
      h2: ({ children }) => (
        <h2 className="text-white font-semibold text-sm mb-1.5 mt-3 first:mt-0">{children}</h2>
      ),
      h3: ({ children }) => (
        <h3 className="text-emerald-400 font-semibold text-sm mb-1 mt-2 first:mt-0">{children}</h3>
      ),
      table: ({ children }) => (
        <div className="overflow-x-auto my-2">
          <table className="w-full text-xs border-collapse">{children}</table>
        </div>
      ),
      th: ({ children }) => (
        <th className="bg-gray-700 text-emerald-400 font-semibold px-3 py-2 text-left border border-gray-600">
          {children}
        </th>
      ),
      td: ({ children }) => (
        <td className="px-3 py-2 text-gray-300 border border-gray-700">{children}</td>
      ),
      hr: () => <hr className="border-gray-700 my-3" />,
    }}
  >
    {content}
  </ReactMarkdown>
);

const AIAssistant = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => { fetchChatHistory(); }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  /* Auto-resize textarea */
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [input]);

  const fetchChatHistory = async () => {
    try {
      const res = await api.get('/chat/history');
      // .slice() prevents mutation of original array
      const history = res.data.chats
        .slice()
        .reverse()
        .flatMap((chat) => [
          { role: 'user', content: chat.userMessage },
          { role: 'ai',   content: chat.aiMessage   },
        ]);
      setMessages(history);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const sendMessage = useCallback(async (messageText) => {
    const text = (messageText ?? input).trim();
    if (!text || loading) return;

    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/chat', { message: text });
      setMessages(prev => [...prev, { role: 'ai', content: res.data.message }]);
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'ai', content: '⚠️ Something went wrong. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loadingHistory) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex gap-1.5 items-center">
          {[0, 150, 300].map((delay) => (
            <div
              key={delay}
              className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-bounce"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
          <span className="text-emerald-400 ml-3 text-sm">Loading chat history…</span>
        </div>
      </div>
    );
  }

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">

      {/* ── Header ── */}
      <div className="mb-4 flex-shrink-0">
        <h1 className="text-2xl font-bold text-white">AI Assistant</h1>
        <p className="text-gray-400 mt-1 text-sm">Ask anything about your business</p>
      </div>

      {/* ── Suggested questions (only when no messages) ── */}
      {isEmpty && (
        <div className="mb-4 flex-shrink-0">
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-3">Try asking:</p>
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

      {/* ── Message list ── */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-4 mb-4
                      scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20
                            flex items-center justify-center mb-4">
              <span className="text-3xl">🤖</span>
            </div>
            <p className="text-white font-semibold text-lg">StyleSync AI is ready</p>
            <p className="text-gray-500 text-sm mt-2 max-w-sm leading-relaxed">
              Ask me about your inventory, customers, or sales.
              I have access to your real business data.
            </p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              className={`flex items-end gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {/* AI avatar */}
              {msg.role === 'ai' && (
                <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/30
                                flex items-center justify-center flex-shrink-0 mb-0.5">
                  <span className="text-xs">🤖</span>
                </div>
              )}

              {/* Bubble */}
              <div
                className={`
                  max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed
                  ${msg.role === 'user'
                    ? 'bg-emerald-500 text-white rounded-br-sm'
                    : 'bg-gray-800 text-gray-200 rounded-bl-sm border border-gray-700/80'}
                `}
              >
                {msg.role === 'user'
                  /* Plain text for user — no markdown, no conflicts */
                  ? <p className="text-white text-sm leading-relaxed">{msg.content}</p>
                  /* Rich markdown only for AI */
                  : <MarkdownContent content={msg.content} />
                }
              </div>

              {/* User avatar */}
              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center
                                justify-center flex-shrink-0 mb-0.5">
                  <span className="text-xs text-white font-bold">U</span>
                </div>
              )}
            </div>
          ))
        )}

        {/* Typing indicator */}
        {loading && (
          <div className="flex items-end gap-2.5 justify-start">
            <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/30
                            flex items-center justify-center flex-shrink-0">
              <span className="text-xs">🤖</span>
            </div>
            <div className="bg-gray-800 border border-gray-700/80 px-4 py-3.5 rounded-2xl rounded-bl-sm">
              <div className="flex gap-1.5 items-center h-4">
                {[0, 150, 300].map((delay) => (
                  <div
                    key={delay}
                    className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${delay}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Input bar ── */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-3 flex-shrink-0">
        <div className="flex gap-3 items-end">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your inventory, customers, or sales…"
            rows={1}
            className="flex-1 bg-gray-800 border border-gray-700 text-white
                       rounded-xl px-4 py-2.5 text-sm focus:outline-none
                       focus:border-emerald-500 placeholder-gray-600
                       resize-none transition-colors duration-200
                       scrollbar-thin scrollbar-thumb-gray-600"
            style={{ minHeight: '42px', maxHeight: '160px' }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40
                       disabled:cursor-not-allowed text-white p-2.5 rounded-xl
                       transition-all duration-200 flex-shrink-0 active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          </button>
        </div>
        <p className="text-gray-600 text-xs mt-2 text-center">
          Enter to send · Shift+Enter for new line
        </p>
      </div>

    </div>
  );
};

export default AIAssistant;