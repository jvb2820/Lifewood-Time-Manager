
import React, { useState, useEffect } from 'react';
import { supabase } from './services/supabaseClient';
import type { User } from './types';
import SignIn from './components/SignIn';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sessionUser = localStorage.getItem('timeTrackerUser');
    if (sessionUser) {
      setUser(JSON.parse(sessionUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (loggedInUser: User) => {
    localStorage.setItem('timeTrackerUser', JSON.stringify(loggedInUser));
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('timeTrackerUser');
    setUser(null);
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-saffaron border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {user ? (
        <Dashboard user={user} onLogout={handleLogout} />
      ) : (
        <SignIn onLogin={handleLogin} />
      )}
    </div>
  );
};

export default App;
