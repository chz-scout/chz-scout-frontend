import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function HomePage() {
  const { user, isAuthenticated, login, addBot, logout, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-400">CHZ Scout</h1>
          <nav>
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <button
                  onClick={addBot}
                  className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 transition-colors"
                >
                  Add Bot
                </button>
                <Link
                  to="/tags"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition-colors"
                >
                  Tag Settings
                </Link>
                <button
                  onClick={logout}
                  className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={login}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition-colors"
              >
                <DiscordIcon />
                Login with Discord
              </button>
            )}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        {isAuthenticated && user ? (
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">
              Welcome, {user.nickname}!
            </h2>
            <p className="text-gray-400 mb-8">
              Manage your stream notification preferences
            </p>
            <Link
              to="/tags"
              className="inline-block px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition-colors text-lg"
            >
              Manage Tags
            </Link>
          </div>
        ) : (
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-4">CHZ Scout</h2>
            <p className="text-xl text-gray-400 mb-8">
              AI-powered Chzzk stream recommendations for Discord
            </p>
            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <FeatureCard
                title="AI Recommendations"
                description="Get personalized stream recommendations powered by GPT"
              />
              <FeatureCard
                title="Tag Notifications"
                description="Set up tags and get notified when matching streams go live"
              />
              <FeatureCard
                title="Discord Integration"
                description="Receive notifications directly in your Discord DMs"
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-6 rounded-xl bg-gray-800 border border-gray-700">
      <h3 className="text-xl font-semibold mb-2 text-indigo-400">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}

function DiscordIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}