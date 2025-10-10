import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import type { User } from '../types';

interface SignInProps {
  onLogin: (user: User) => void;
}

const SignIn: React.FC<SignInProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!username.trim()) {
      setError('Username cannot be empty.');
      setIsLoading(false);
      return;
    }

    try {
      const { data, error: dbError } = await supabase
        .from('users')
        .select('*')
        .eq('userid', username.trim())
        .single();

      if (dbError || !data) {
        setError('User not found. Please contact your administrator.');
        return;
      }
      
      onLogin(data as User);

    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-text-primary">LifeTime</h1>
        <p className="text-text-secondary">Lifewood Time Manager</p>
      </div>
      <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-xl shadow-lg border border-border-color">
        <form onSubmit={handleSignIn} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-text-secondary mb-1">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-input-bg border border-border-color rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
            />
          </div>

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Sign In'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignIn;