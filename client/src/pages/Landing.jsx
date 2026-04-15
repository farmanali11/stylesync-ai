import { Link } from 'react-router-dom';
import { TypeAnimation } from 'react-type-animation';

const Landing = () => {
  const parseBold = (line) => {
    const parts = [];
    const regex = /\*\*(.+?)\*\*/g;
    let last = 0;
    let match;
    let idx = 0;

    while ((match = regex.exec(line)) !== null) {
      if (match.index > last) {
        parts.push(<span key={idx++}>{line.slice(last, match.index)}</span>);
      }
      parts.push(
        <span key={idx++} className="font-bold text-emerald-300">
          {match[1]}
        </span>
      );
      last = match.index + match[0].length;
    }

    if (last < line.length) {
      parts.push(<span key={idx++}>{line.slice(last)}</span>);
    }

    return parts.length ? parts : line;
  };

  const renderAIMessage = (text) => (
    <div className="space-y-1">
      {text.split('\n').map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1" />;
        if (line.startsWith('→')) {
          return (
            <div
              key={i}
              className="flex items-start gap-2 bg-white/5 rounded-lg px-3 py-1.5 border border-white/10"
            >
              <span className="text-emerald-400 font-bold text-base leading-snug">→</span>
              <span className="text-sm text-gray-200 leading-snug">
                {parseBold(line.slice(1).trim())}
              </span>
            </div>
          );
        }
        if (/^\*\*.+\*\*$/.test(line.trim()) || (line.trim().endsWith(':') && !line.includes('→'))) {
          return (
            <p key={i} className="text-xs font-bold uppercase tracking-widest text-emerald-400 mt-3 mb-1">
              {line.replace(/\*\*/g, '').replace(/:$/, '')}
            </p>
          );
        }
        if (line.includes('PKR')) {
          return (
            <p key={i} className="text-sm font-semibold text-yellow-300">
              {parseBold(line)}
            </p>
          );
        }
        if (i === 0) {
          return (
            <p key={i} className="text-base font-semibold text-white">
              {parseBold(line)}
            </p>
          );
        }
        return (
          <p key={i} className="text-sm text-gray-300 leading-relaxed">
            {parseBold(line)}
          </p>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* Navbar */}
      <nav className="border-b border-gray-800 px-6 py-4 sticky top-0 bg-gray-950/80 backdrop-blur-sm z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">
            Style<span className="text-emerald-400">Sync</span> AI
          </h1>
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-2 rounded-full mb-8">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span>AI Powered Business Assistant for Pakistan</span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
          Your clothing brand,
          <br />
          <span className="text-emerald-400">managed by AI</span>
        </h1>

        {/* Typewriter */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <span className="text-gray-400 text-xl">Ask:</span>
          <div className="text-xl font-semibold text-white min-h-8">
            <TypeAnimation
              sequence={[
                '"What should I restock?"',
                2500,
                '"Which customers are inactive?"',
                2500,
                '"Eid aa rahi hai kya karoon?"',
                2500,
                '"How were my sales this month?"',
                2500,
                '"Generate WhatsApp messages"',
                2500,
                '"What is my profit this week?"',
                2500,
              ]}
              wrapper="span"
              speed={50}
              deletionSpeed={70}
              repeat={Infinity}
              className="text-emerald-400"
            />
          </div>
        </div>

        <p className="text-gray-400 text-xl max-w-2xl mx-auto mb-10">
          StyleSync AI reads your real inventory, customers and sales data
          to give specific actionable answers in plain Urdu and English.
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            to="/signup"
            className="bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors duration-200"
          >
            Start For Free →
          </Link>
          <Link
            to="/login"
            className="border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors"
          >
            Login
          </Link>
        </div>

        <p className="text-gray-800 font-bold text-m mt-12">
          Free to use • No credit card required 
        </p>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-gray-800 py-8 bg-gray-900/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: '15+', label: 'AI Features' },
              { number: 'PKR 0', label: 'Starting Price' },
              { number: '100%', label: 'Real Data Analysis' },
              { number: '30s', label: 'Average Response Time' },
            ].map((stat, i) => (
              <div key={i}>
                <p className="text-3xl font-bold text-emerald-400">{stat.number}</p>
                <p className="text-gray-400 text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-4">Sound familiar?</h2>
        <p className="text-gray-400 text-center mb-12">
          Problems every Pakistani clothing brand owner faces daily
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: '😰',
              problem: 'Guessing what to restock',
              description: 'You order too much of one thing and run out of another. Money wasted every month on wrong stock decisions.'
            },
            {
              icon: '😔',
              problem: 'Losing customers silently',
              description: 'Customers stop buying and you have no idea. Revenue drops without warning and you never know why.'
            },
            {
              icon: '😤',
              problem: 'Manual Excel calculations',
              description: 'Hours wasted every week doing sales calculations that should take seconds with the right tool.'
            }
          ].map((item, i) => (
            <div
              key={i}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center hover:border-gray-700 transition-colors"
            >
              <p className="text-4xl mb-4">{item.icon}</p>
              <h3 className="text-white font-semibold mb-2">{item.problem}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-900 border-y border-gray-800 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4">
            StyleSync AI solves all three
          </h2>
          <p className="text-gray-400 text-center mb-12">
            15+ AI powered features built specifically for Pakistani clothing brands
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: '📦', title: 'Smart Restock Alerts', desc: 'AI calculates sales velocity and tells you exactly when and how much to restock.' },
              { icon: '📱', title: 'WhatsApp Win-Back', desc: 'Personalized Urdu/English messages for inactive customers with unique discount codes.' },
              { icon: '🕌', title: 'Eid Forecaster', desc: 'Predicts Eid demand based on your sales history with PKR revenue projections.' },
              { icon: '💰', title: 'Profit Intelligence', desc: 'Real profit not just revenue. Star products, dead weight, VIP customers identified.' },
              { icon: '🌅', title: 'Daily Briefing', desc: 'Every morning your AI reviews your entire business and tells you what to focus on.' },
              { icon: '❤️', title: 'Health Score', desc: 'Business health score out of 100 with breakdown and score booster tips.' },
              { icon: '👻', title: 'Ghost Inventory', desc: 'Finds dead stock eating your cash and generates flash sale strategies to recover it.' },
              { icon: '🔌', title: 'B2B API', desc: 'Any business can integrate StyleSync AI intelligence into their existing systems.' },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-gray-800 border border-gray-700 rounded-2xl p-5 hover:border-emerald-500/30 transition-colors duration-300"
              >
                <p className="text-3xl mb-3">{feature.icon}</p>
                <h3 className="text-white font-semibold text-sm mb-1">{feature.title}</h3>
                <p className="text-gray-400 text-xs leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Chat Demo */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-4">See it in action</h2>
        <p className="text-gray-400 text-center mb-12">
          Real AI conversations with real business data
        </p>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">

          {/* Chat Header */}
          <div className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <span className="text-xs">🤖</span>
            </div>
            <div>
              <p className="text-white text-sm font-medium">StyleSync AI</p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                <p className="text-emerald-400 text-xs">Online • Reading your data</p>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="p-6 space-y-4">
            {[
              { role: 'user', message: 'Eid aa rahi hai, kya restock karoon?' },
              {
                role: 'ai',
                message:
                  '🕌 Eid is in 23 days!\n\n**Urgent restocks needed:**\n→ Khaddar Shalwar Kameez — only 48 left, order 200 units NOW\n→ Lawn Printed Suit — 23 left, order 100 more\n\n**Projected Eid Revenue:** PKR 285,000 if you restock today\n\nYour top seller last Eid was Khaddar. Do not run out!',
              },
              { role: 'user', message: 'Which customers should I contact today?' },
              {
                role: 'ai',
                message:
                  '3 customers inactive for 60+ days:\n\n→ **Ayesha Khan** — 172 days, spent PKR 45,000 👑 VIP\n→ **Sara Malik** — 130 days, spent PKR 28,000\n→ **Bilal Ahmed** — 146 days, spent PKR 8,500\n\nTotal win-back potential: **PKR 81,500**\n\nI have generated personalized WhatsApp messages for each. Go to WhatsApp Hub to copy and send!',
              },
            ].map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'ai' && (
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                    <span className="text-xs">🤖</span>
                  </div>
                )}
                <div
                  className={
                    'max-w-lg px-4 py-3 rounded-2xl text-sm ' +
                    (msg.role === 'user'
                      ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-tr-sm shadow-lg shadow-emerald-900/40'
                      : 'bg-gray-800 text-gray-200 border border-gray-700 rounded-tl-sm')
                  }
                >
                  {msg.role === 'ai' ? renderAIMessage(msg.message) : <p>{msg.message}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Style Section */}
      <section className="bg-gray-900 border-y border-gray-800 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">
            Built for Pakistani Business Reality
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: '🇵🇰',
                title: 'Pakistani Market Aware',
                desc: 'Knows about Eid seasons, Pakistani fashion trends, PKR calculations and local business patterns.'
              },
              {
                icon: '💬',
                title: 'Urdu + English Mixed',
                desc: 'Communicates like Pakistanis actually talk. Natural code-switching between Urdu and English.'
              },
              {
                icon: '📱',
                title: 'WhatsApp First',
                desc: 'Every insight converts to a ready-to-send WhatsApp message. Because that\'s how business runs in Pakistan.'
              }
            ].map((item, i) => (
              <div
                key={i}
                className="text-center p-6"
              >
                <p className="text-5xl mb-4">{item.icon}</p>
                <h3 className="text-white font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-6 py-24 text-center">
        <h2 className="text-4xl font-bold mb-4">
          Ready to grow your brand?
        </h2>
        <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
          Join clothing brand owners across Pakistan who use
          StyleSync AI to make smarter business decisions every day.
        </p>
        <Link
          to="/signup"
          className="bg-emerald-500 hover:bg-emerald-400 text-white px-10 py-4 rounded-xl font-semibold text-lg transition-colors duration-200 inline-block"
        >
          Get Started Free →
        </Link>
        <p className="text-gray-600 text-sm mt-4">
          Takes 30 seconds to set up • No credit card needed
        </p>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 px-6 py-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <h1 className="text-lg font-bold">
            Style<span className="text-emerald-400">Sync</span> AI
          </h1>
          <div className="flex items-center gap-6">
            <Link to="/login" className="text-gray-500 hover:text-white text-sm transition-colors">Login</Link>
            <Link to="/signup" className="text-gray-500 hover:text-white text-sm transition-colors">Sign Up</Link>
          </div>
          <p className="text-gray-600 text-sm">
            Built for Pakistani clothing brands by Farman Ali 🇵🇰
          </p>
        </div>
      </footer>

    </div>
  );
};

export default Landing;