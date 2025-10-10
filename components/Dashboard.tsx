import React, { useState, useEffect, useCallback } from 'react';
import type { User, AttendanceRecord } from '../types';
import { supabase } from '../services/supabaseClient';
import ClockButtons from './ClockButtons';
import SummaryCards from './SummaryCards';
import HistoryTable from './HistoryTable';
import { formatSecondsToHHMMSS, formatDateForDB, calculateDuration } from '../utils/time';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isClockedIn, setIsClockedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const fetchAttendanceData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: dbError } = await supabase
        .from('attendance')
        .select('*')
        .eq('user_id', user.userid)
        .order('created_at', { ascending: false });

      if (dbError) throw dbError;
      
      const safeData = data || [];
      setRecords(safeData);

      if (safeData.length > 0) {
        const latestRecord = safeData[0];
        setIsClockedIn(latestRecord.clock_out === null);
      } else {
        setIsClockedIn(false);
      }
    } catch (err: any) {
      setError('Failed to fetch attendance data. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [user.userid]);

  useEffect(() => {
    fetchAttendanceData();
  }, [fetchAttendanceData]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;

    if (isClockedIn && records.length > 0) {
      const openRecord = records.find(r => r.clock_out === null);
      if (openRecord) {
        const clockInTime = new Date(openRecord.clock_in).getTime();

        timer = setInterval(() => {
          const now = new Date().getTime();
          const durationSeconds = Math.floor((now - clockInTime) / 1000);
          setElapsedTime(formatSecondsToHHMMSS(durationSeconds));
        }, 1000);
      }
    }
    
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [isClockedIn, records]);

  useEffect(() => {
    const handlePageHide = () => {
      if (isClockedIn) {
        const openRecord = records.find(r => r.clock_out === null);
        if (!openRecord) return;

        // Prepare data for clocking out.
        const clockOutTime = formatDateForDB(new Date());
        const totalTime = calculateDuration(openRecord.clock_in, clockOutTime);
        const payload = {
          clock_out: clockOutTime,
          total_time: totalTime,
        };

        // Supabase connection details are hardcoded for this fire-and-forget request.
        const supabaseUrl = 'https://szifmsvutxcrcwfjbvsi.supabase.co';
        const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6aWZtc3Z1dHhjcmN3ZmpidnNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMjcwNzEsImV4cCI6MjA3NTYwMzA3MX0.hvZKMI0NDQ8IdWaDonqmiyvQu-NkCN0nRHPjn0isoCA';
        const updateUrl = `${supabaseUrl}/rest/v1/attendance?id=eq.${openRecord.id}`;
        
        // To ensure the request is authenticated and can pass RLS policies,
        // we need to retrieve the user's access token from localStorage.
        const sessionKey = 'sb-szifmsvutxcrcwfjbvsi-auth-token';
        const sessionDataString = localStorage.getItem(sessionKey);
        let accessToken = supabaseAnonKey; // Fallback to anon key

        if (sessionDataString) {
          try {
            const sessionData = JSON.parse(sessionDataString);
            if (sessionData && sessionData.access_token) {
              accessToken = sessionData.access_token;
            }
          } catch (e) {
            console.error("Error parsing Supabase session from localStorage.", e);
          }
        }
        
        const headers = {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${accessToken}`, // Use the authenticated user's token
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        };
        
        // Use `fetch` with `keepalive: true` to ensure the request is sent
        // even after the page is closed/hidden. This is a "fire and forget" request.
        try {
          fetch(updateUrl, {
            method: 'PATCH',
            headers,
            body: JSON.stringify(payload),
            keepalive: true,
          });
        } catch (e) {
          console.error("Fetch with keepalive failed during page hide.", e);
        }
      }
    };

    window.addEventListener('pagehide', handlePageHide);

    return () => {
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, [isClockedIn, records]);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    setError(null);

    if (isClockedIn) {
      const openRecord = records.find(r => r.clock_out === null);
      if (openRecord) {
        const clockOutTime = formatDateForDB(new Date());
        const totalTime = calculateDuration(openRecord.clock_in, clockOutTime);

        try {
          const { error: updateError } = await supabase
            .from('attendance')
            .update({
              clock_out: clockOutTime,
              total_time: totalTime,
            })
            .eq('id', openRecord.id);

          if (updateError) {
            throw updateError; // Propagate error to the catch block
          }
          // If clock-out is successful, proceed to logout.
          onLogout();

        } catch (error) {
          console.error("Failed to clock out during sign out:", error);
          setError("Could not clock you out. Please check your connection and try again.");
          setIsSigningOut(false); // Allow user to try again
        }
      } else {
        // This is an inconsistent state, but we should let the user log out.
        console.warn("isClockedIn is true, but no open record was found. Logging out anyway.");
        onLogout();
      }
    } else {
      // Not clocked in, so just log out.
      onLogout();
    }
  };


  const Header = () => (
    <header className="flex items-center justify-between p-4 bg-white border-b border-border-color shadow-sm sticky top-0 z-10">
      <div className="flex items-center space-x-3">
        <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <div>
            <h1 className="text-xl font-bold text-text-primary">LifeTime</h1>
            <p className="text-sm text-text-secondary">Welcome, {user.name}!</p>
        </div>
      </div>
      <button
        onClick={handleSignOut}
        disabled={isSigningOut}
        className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-50"
      >
        {isSigningOut ? 'Signing Out...' : 'Sign Out'}
      </button>
    </header>
  );

  return (
    <div className="min-h-screen">
      <Header />
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <ClockButtons 
            user={user} 
            isClockedIn={isClockedIn} 
            onUpdate={fetchAttendanceData}
            elapsedTime={elapsedTime}
          />

          {error && <div className="p-4 text-center text-red-700 bg-red-100 border border-red-200 rounded-lg">{error}</div>}

          {isLoading ? (
             <div className="flex justify-center items-center h-64">
                <div className="w-12 h-12 border-4 border-accent border-dashed rounded-full animate-spin"></div>
             </div>
          ) : (
            <>
              <SummaryCards records={records} />
              <HistoryTable records={records} />
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;