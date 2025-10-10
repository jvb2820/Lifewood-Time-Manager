import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import type { User } from '../types';
import { formatDateForDB, calculateDuration } from '../utils/time';

interface ClockButtonsProps {
  user: User;
  isClockedIn: boolean;
  onUpdate: () => void;
  elapsedTime: string | null;
}

const ClockButtons: React.FC<ClockButtonsProps> = ({ user, isClockedIn, onUpdate, elapsedTime }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleClockIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const clockInTime = formatDateForDB(new Date());
      const { error: dbError } = await supabase.from('attendance').insert({
        user_id: user.userid,
        clock_in: clockInTime,
      });

      if (dbError) throw dbError;
      onUpdate();
    } catch (err: any) {
      setError('Clock in failed. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClockOut = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data: openRecord, error: findError } = await supabase
        .from('attendance')
        .select('id, clock_in')
        .eq('user_id', user.userid)
        .is('clock_out', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (findError) throw new Error('Could not find an open clock-in record.');

      const clockOutTime = formatDateForDB(new Date());
      const totalTime = calculateDuration(openRecord.clock_in, clockOutTime);

      const { error: updateError } = await supabase
        .from('attendance')
        .update({
          clock_out: clockOutTime,
          total_time: totalTime,
        })
        .eq('id', openRecord.id);
        
      if (updateError) throw updateError;
      onUpdate();

    } catch (err: any) {
      const message = (err && typeof (err as any).message === 'string')
        ? (err as any).message
        : 'An unexpected error occurred during clock-out.';
      setError(message);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const ClockButton: React.FC<{onClick: () => void; text: string; className: string; icon: React.ReactElement}> = ({onClick, text, className, icon}) => (
     <button
        onClick={onClick}
        disabled={isLoading}
        className={`flex items-center justify-center space-x-3 w-full sm:w-48 px-6 py-4 text-lg font-bold rounded-lg shadow-sm transition transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${className}`}
      >
        {isLoading ? <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin"></div> : icon}
        <span>{text}</span>
      </button>
  )

  return (
    <div className="bg-white p-6 rounded-xl border border-border-color shadow-sm">
      {isClockedIn && elapsedTime && (
        <div className="text-center mb-6">
          <p className="text-sm text-text-secondary uppercase tracking-wider">Current Session Time</p>
          <p className="text-5xl lg:text-6xl font-mono font-bold text-text-primary tracking-wider py-2">
            {elapsedTime}
          </p>
        </div>
      )}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        {!isClockedIn ? (
          <ClockButton 
            onClick={handleClockIn}
            text="Clock In"
            className="text-white bg-primary hover:bg-primary-hover"
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>}
          />
        ) : (
          <ClockButton 
            onClick={handleClockOut}
            text="Clock Out"
            className="text-text-primary bg-accent hover:bg-accent-hover"
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>}
          />
        )}
      </div>
       {error && <p className="mt-4 text-center text-red-600">{error}</p>}
    </div>
  );
};

export default ClockButtons;