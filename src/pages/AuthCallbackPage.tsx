import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get('code');
    const guildId = searchParams.get('guild_id');

    if (!code) {
      setError('Authorization code not found');
      return;
    }

    handleCallback(code, guildId);
  }, [searchParams]);

  const handleCallback = async (code: string, guildId: string | null) => {
    try {
      const response = await api.post('/api/v1/auth/discord/callback', {
        code,
        guildId,
      });

      const { accessToken, refreshToken } = response.data.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      navigate('/', { replace: true });
    } catch (err) {
      console.error('OAuth callback failed:', err);
      setError('Login failed. Please try again.');
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">{error}</div>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
        <p className="text-white text-lg">Logging in with Discord...</p>
      </div>
    </div>
  );
}