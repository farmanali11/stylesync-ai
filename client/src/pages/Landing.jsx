import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* Navbar */}
      <nav className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">
            Style<span className="text-emerald-400">Sync</span> AI
          </h1>
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-gray-400 hover:text-white text-sm
                       transition-colors"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="bg-emerald-500 hover:bg-emerald-400 text-white
                       px-4 py-2 rounded-lg text-sm font-medium
                       transition-colors"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-emerald-500/10
                      border border-emerald-500/20 text-emerald-400
                      text-sm px-4 py-2 rounded-full mb-8">
          <span>🤖</span>
          <span>AI Powered Business Assistant</span>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
          Run Your Clothing Brand
          <span className="text-emerald-400"> Smarter</span>
        </h1>

        <p className="text-gray-400 text-xl max-w-2xl mx-auto mb-10">
          StyleSync AI tells you what to restock, which customers
          to win back, and how your sales are performing —
          all in simple Urdu and English.
        </p>

        <div className="flex items-center justify-center gap-4">
          <Link
            to="/signup"
            className="bg-emerald-500 hover:bg-emerald-400 text-white
                     px-8 py-4 rounded-xl font-semibold text-lg
                     transition-colors duration-200"
          >
            Start For Free →
          </Link>
          <Link
            to="/login"
            className="border border-gray-700 hover:border-gray-500
                     text-gray-300 hover:text-white px-8 py-4
                     rounded-xl font-semibold text-lg transition-colors"
          >
            Login
          </Link>
        </div>

        <p className="text-gray-600 text-sm mt-6">
          Free to use • No credit card required • Made for Pakistan
        </p>
      </section>

      {/* Problem Section */}
      <section className="bg-gray-900 border-y border-gray-800 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4">
            Sound familiar?
          </h2>
          <p className="text-gray-400 text-center mb-12">
            Problems every Pakistani clothing brand owner faces daily
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: '😰',
                problem: 'Guessing what to restock',
                description: 'You order too much of one thing and run out of another. Money wasted every month.'
              },
              {
                icon: '😔',
                problem: 'Losing customers silently',
                description: 'Customers stop buying and you have no idea. Revenue drops without warning.'
              },
              {
                icon: '😤',
                problem: 'Manual Excel calculations',
                description: 'Hours wasted every week doing sales calculations that should take seconds.'
              }
            ].map((item, i) => (
              <div
                key={i}
                className="bg-gray-800 border border-gray-700
                         rounded-2xl p-6 text-center"
              >
                <p className="text-4xl mb-4">{item.icon}</p>
                <h3 className="text-white font-semibold mb-2">
                  {item.problem}
                </h3>
                <p className="text-gray-400 text-sm">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-4">
          StyleSync AI solves all three
        </h2>
        <p className="text-gray-400 text-center mb-12">
          Powered by real AI that reads your actual business data
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              icon: '📦',
              title: 'Smart Restock Alerts',
              description: 'AI analyzes your sales velocity and tells you exactly which products to restock and how many units to order before you run out.',
              color: 'emerald'
            },
            {
              icon: '📱',
              title: 'WhatsApp Win-Back Engine',
              description: 'Automatically identifies inactive customers and generates personalized WhatsApp messages in Urdu with unique discount codes.',
              color: 'green'
            },
            {
              icon: '📊',
              title: 'AI Sales Reports',
              description: 'Ask in plain language and get instant sales reports. Monthly revenue, top products, customer trends — all in seconds.',
              color: 'blue'
            },
            {
              icon: '🤖',
              title: 'Business Chat Assistant',
              description: 'Ask anything about your business. "Eid aa rahi hai kya karoon?" and get specific actionable advice based on your real data.',
              color: 'purple'
            }
          ].map((feature, i) => (
            <div
              key={i}
              className="bg-gray-900 border border-gray-800
                       rounded-2xl p-6 hover:border-emerald-500/30
                       transition-colors duration-300"
            >
              <p className="text-4xl mb-4">{feature.icon}</p>
              <h3 className="text-white font-semibold text-lg mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Chat Demo Section */}
      <section className="bg-gray-900 border-y border-gray-800 py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4">
            See it in action
          </h2>
          <p className="text-gray-400 text-center mb-12">
            Real conversations with real business data
          </p>
          <div className="bg-gray-950 border border-gray-800
                        rounded-2xl p-6 space-y-4">
            {[
              {
                role: 'user',
                message: 'Eid aa rahi hai, kya restock karoon?'
              },
              {
                role: 'ai',
                message: 'Eid is in 23 days! Based on your sales data:\n\n🚨 Khaddar Shalwar Kameez — only 48 left, restock 200 units immediately\n⚠️ Lawn Dupatta — 23 left, order 100 more\n\nYour top seller last Eid was Khaddar. Do not run out!'
              },
              {
                role: 'user',
                message: 'Which customers should I contact today?'
              },
              {
                role: 'ai',
                message: '3 customers have not purchased in 60+ days:\n\n• Sara Malik — 130 days inactive, spent PKR 12,000\n• Bilal Ahmed — 146 days inactive, spent PKR 8,500\n• Ayesha Khan — 172 days inactive, spent PKR 25,000\n\nI have generated personalized WhatsApp messages for each. Click Win-Back to copy and send!'
              }
            ].map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user'
                  ? 'justify-end'
                  : 'justify-start'}`}
              >
                <div
                  className={`max-w-lg px-4 py-3 rounded-2xl text-sm
                             whitespace-pre-wrap
                             ${msg.role === 'user'
                               ? 'bg-emerald-500 text-white'
                               : 'bg-gray-800 text-gray-200 border border-gray-700'
                             }`}
                >
                  {msg.message}
                </div>
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
        <p className="text-gray-400 text-lg mb-8">
          Join clothing brand owners across Pakistan who use
          StyleSync AI to make smarter business decisions.
        </p>
        <Link
          to="/signup"
          className="bg-emerald-500 hover:bg-emerald-400 text-white
                   px-10 py-4 rounded-xl font-semibold text-lg
                   transition-colors duration-200 inline-block"
        >
          Get Started Free →
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 px-6 py-8">
        <div className="max-w-6xl mx-auto flex items-center
                      justify-between">
          <h1 className="text-lg font-bold">
            Style<span className="text-emerald-400">Sync</span> AI
          </h1>
          <p className="text-gray-600 text-sm">
            Built for Pakistani clothing brands by Farman Ali
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;