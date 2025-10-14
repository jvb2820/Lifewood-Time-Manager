
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { User, AttendanceRecord, IdleRecord } from '../types';
import { supabase } from '../services/supabaseClient';
import SummaryCards from './SummaryCards';
import HistoryTable from './HistoryTable';
import IdleHistoryTable from './IdleHistoryTable';
import DateFilter from './DateFilter';
import RealTimeClock from './RealTimeClock';
import IdleAlarm from './IdleAlarm';
import ClockButtons from './ClockButtons';
import ConfirmationModal from './ConfirmationModal';
import { formatSecondsToHHMMSS, formatDateForDB, calculateDuration, parseDurationToMinutes, formatMinutesToHoursMinutes } from '../utils/time';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [idleRecords, setIdleRecords] = useState<IdleRecord[]>([]);
  const [isClockedIn, setIsClockedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isConfirmingSignOut, setIsConfirmingSignOut] = useState(false);
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [activeTab, setActiveTab] = useState<'attendance' | 'idle'>('attendance');

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch both attendance and idle records concurrently
      const [attendanceRes, idleRes] = await Promise.all([
        supabase
          .from('attendance')
          .select('*')
          .eq('user_id', user.userid)
          .order('created_at', { ascending: false }),
        supabase
          .from('idle_time')
          .select('*')
          .eq('user_id', user.userid)
          .order('created_at', { ascending: false }),
      ]);
      
      if (attendanceRes.error) throw attendanceRes.error;
      if (idleRes.error) throw idleRes.error;

      const safeAttendanceData = attendanceRes.data || [];
      setRecords(safeAttendanceData);
      setIdleRecords(idleRes.data || []);

      if (safeAttendanceData.length > 0) {
        const latestRecord = safeAttendanceData[0];
        setIsClockedIn(latestRecord.clock_out === null);
      } else {
        setIsClockedIn(false);
      }
    } catch (err: any) {
      setError('Failed to fetch data. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [user.userid]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
    } else {
        setElapsedTime(null);
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

        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        const updateUrl = `${supabaseUrl}/rest/v1/attendance?id=eq.${openRecord.id}`;
        
        const headers = {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`, // Use anon key
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
    setIsLoggingOut(true);
    setError(null);

    const performSignOut = () => {
      onLogout();
    };

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

          if (updateError) throw updateError;
          performSignOut();

        } catch (error) {
          console.error("Failed to clock out during sign out:", error);
          setError("Could not clock you out. Please check your connection and try again.");
          setIsLoggingOut(false);
          setIsConfirmingSignOut(false);
        }
      } else {
        console.warn("isClockedIn is true, but no open record was found. Signing out anyway.");
        performSignOut();
      }
    } else {
      performSignOut();
    }
  };
  
  const filterRecordsByDateRange = <T extends { clock_in?: string; idle_start?: string }>(recordsToFilter: T[], dateRange: { start: string; end: string }): T[] => {
    const { start, end } = dateRange;
    if (!start && !end) {
      return recordsToFilter;
    }

    let startDate: Date | null = null;
    if (start) {
        const [year, month, day] = start.split('-').map(Number);
        startDate = new Date(year, month - 1, day, 0, 0, 0, 0);
    }
    
    let endDate: Date | null = null;
    if (end) {
        const [year, month, day] = end.split('-').map(Number);
        endDate = new Date(year, month - 1, day, 23, 59, 59, 999);
    }

    return recordsToFilter.filter(record => {
      const recordDateStr = record.clock_in || record.idle_start;
      if (!recordDateStr) return false;

      const recordDate = new Date(recordDateStr);
      const isAfterStart = startDate ? recordDate >= startDate : true;
      const isBeforeEnd = endDate ? recordDate <= endDate : true;
      return isAfterStart && isBeforeEnd;
    });
  };

  const filteredRecords = useMemo(() => {
    return filterRecordsByDateRange<AttendanceRecord>(records, dateRange);
  }, [records, dateRange]);

  const filteredIdleRecords = useMemo(() => {
     return filterRecordsByDateRange<IdleRecord>(idleRecords, dateRange);
  }, [idleRecords, dateRange]);


  const filteredDateSummary = useMemo(() => {
    if (!dateRange.start && !dateRange.end) return null;
    const totalMinutes = filteredRecords.reduce((acc, record) => {
      return acc + parseDurationToMinutes(record.total_time);
    }, 0);
    return formatMinutesToHoursMinutes(totalMinutes);
  }, [filteredRecords, dateRange]);

  const formatDateRangeForDisplay = (start: string, end: string): string => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' };
    const startDate = start ? new Date(start).toLocaleDateString('en-US', options) : null;
    const endDate = end ? new Date(end).toLocaleDateString('en-US', options) : null;

    if (startDate && endDate) {
        if (startDate === endDate) return startDate;
        return `${startDate} to ${endDate}`;
    }
    if (startDate) return `from ${startDate}`;
    if (endDate) return `until ${endDate}`;
    return 'the selected period';
  }

  const currentAttendanceId = useMemo(() => {
    if (!isClockedIn) return null;
    const openRecord = records.find(r => r.clock_out === null);
    return openRecord ? openRecord.id : null;
  }, [isClockedIn, records]);

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
        onClick={() => setIsConfirmingSignOut(true)}
        disabled={isLoggingOut}
        className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-50"
      >
        Sign Out
      </button>
    </header>
  );

  const TabButton: React.FC<{tabName: 'attendance' | 'idle', label: string}> = ({tabName, label}) => {
    const isActive = activeTab === tabName;
    return (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`px-4 py-2 text-sm font-semibold rounded-t-md transition-colors focus:outline-none ${
                isActive 
                ? 'border-b-2 border-primary text-primary'
                : 'text-text-secondary hover:text-text-primary'
            }`}
            aria-current={isActive ? 'page' : undefined}
        >
            {label}
        </button>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {error && <div className="p-4 text-center text-red-700 bg-red-100 border border-red-200 rounded-lg">{error}</div>}

          {isLoading ? (
             <div className="flex justify-center items-center h-64">
                <div className="w-12 h-12 border-4 border-accent border-dashed rounded-full animate-spin"></div>
             </div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                  <div className="lg:col-span-2">
                    <SummaryCards records={records} />
                  </div>
                  <div className="lg:col-span-1">
                     <RealTimeClock elapsedTime={elapsedTime} />
                  </div>
              </div>

              <DateFilter 
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
                onClear={() => setDateRange({ start: '', end: '' })}
              />

              {(dateRange.start || dateRange.end) && (
                <div className="bg-white p-6 rounded-xl border border-primary-hover shadow-lg flex items-center space-x-4">
                     <div className="p-3 rounded-full bg-icon-bg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                     </div>
                     <div>
                        <p className="text-text-secondary text-sm">
                            Total time for {formatDateRangeForDisplay(dateRange.start, dateRange.end)}
                        </p>
                        <p className="text-2xl font-bold text-text-primary">{filteredDateSummary}</p>
                     </div>
                </div>
              )}
              
                <div className="bg-white p-4 sm:p-6 rounded-xl border border-border-color shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                        <h2 className="text-xl font-semibold text-text-primary">
                            {activeTab === 'attendance' ? 'Attendance History' : 'Idle Time History'}
                        </h2>
                        <ClockButtons 
                            user={user} 
                            isClockedIn={isClockedIn} 
                            onUpdate={fetchData}
                        />
                    </div>
                    <div className="border-b border-border-color">
                        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                            <TabButton tabName="attendance" label="Attendance" />
                            <TabButton tabName="idle" label="Idle Time" />
                        </nav>
                    </div>
                    <div className="mt-4">
                        {activeTab === 'attendance' ? (
                            <HistoryTable records={filteredRecords} />
                        ) : (
                            <IdleHistoryTable records={filteredIdleRecords} />
                        )}
                    </div>
                </div>
            </>
          )}
        </div>
      </main>
      <IdleAlarm 
        isActive={isClockedIn}
        user={user}
        currentAttendanceId={currentAttendanceId}
      />
      <ConfirmationModal
        isOpen={isConfirmingSignOut}
        onClose={() => setIsConfirmingSignOut(false)}
        onConfirm={handleSignOut}
        title="Confirm Sign Out"
        message={isClockedIn ? "You are currently clocked in. Signing out will automatically clock you out. Are you sure?" : "Are you sure you want to sign out?"}
        isLoading={isLoggingOut}
        confirmText="Yes, Sign Out"
        cancelText="No, Cancel"
      />
    </div>
  );
};

export default Dashboard;
