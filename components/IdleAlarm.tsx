import React, { useState, useEffect, useRef } from 'react';

interface IdleAlarmProps {
  isActive: boolean; // Control whether the alarm is running
}

const ALARM_INTERVAL_MS = 60 * 1000; // 1 minute
const SNOOZE_WINDOW_MS = 10 * 1000; // 10 seconds
const ALARM_SOUND_URL = 'C:\Users\jeuzv\Lifewood-Time-Manager\Public\alarm.mp3';

const IdleAlarm: React.FC<IdleAlarmProps> = ({ isActive }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [isIdle, setIsIdle] = useState(false);
  const [idleTime, setIdleTime] = useState(0);

  const audioRef = useRef<HTMLAudioElement>(null);
  const mainTimerRef = useRef<number | null>(null);
  const snoozeTimeoutRef = useRef<number | null>(null);
  const idleTimerRef = useRef<number | null>(null);

  const resetTimers = () => {
    if (mainTimerRef.current) clearTimeout(mainTimerRef.current);
    if (snoozeTimeoutRef.current) clearTimeout(snoozeTimeoutRef.current);
    if (idleTimerRef.current) clearInterval(idleTimerRef.current);
  };

  const startMainTimer = () => {
    resetTimers();
    if (!isActive) return;

    mainTimerRef.current = window.setTimeout(() => {
      setShowPopup(true);
      const playPromise = audioRef.current?.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error("Audio playback failed:", error);
        });
      }

      snoozeTimeoutRef.current = window.setTimeout(() => {
        setIsIdle(true);
      }, SNOOZE_WINDOW_MS);
    }, ALARM_INTERVAL_MS);
  };

  useEffect(() => {
    if (isActive) {
      startMainTimer();
    } else {
      resetTimers();
      setShowPopup(false);
      setIsIdle(false);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }

    return () => {
      resetTimers();
    };
  }, [isActive]);
  
  useEffect(() => {
    if (isIdle) {
      idleTimerRef.current = window.setInterval(() => {
        setIdleTime(prev => prev + 1);
      }, 1000);
    } else {
      if (idleTimerRef.current) {
        clearInterval(idleTimerRef.current);
        idleTimerRef.current = null;
      }
      setIdleTime(0);
    }
    
    return () => {
      if (idleTimerRef.current) {
        clearInterval(idleTimerRef.current);
      }
    };
  }, [isIdle]);

  const handleSnooze = () => {
    setShowPopup(false);
    setIsIdle(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    startMainTimer();
  };

  const formatIdleTime = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds} sec`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes} min ${remainingSeconds} sec`;
  };

  return (
    <>
      <audio ref={audioRef} src={ALARM_SOUND_URL} preload="auto" loop className="hidden" />

      {showPopup && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" aria-hidden="true"></div>
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="idle-alarm-title"
          >
            <div className="relative bg-white w-full max-w-md p-8 rounded-2xl shadow-2xl text-center border-4 border-accent">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-icon-bg mb-4">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              
              {!isIdle ? (
                <>
                  <h2 id="idle-alarm-title" className="text-2xl font-bold text-text-primary">
                    Are you still there?
                  </h2>
                  <p className="mt-2 text-text-secondary">
                    Click "Snooze" to confirm you're still working.
                  </p>
                </>
              ) : (
                <>
                  <h2 id="idle-alarm-title" className="text-2xl font-bold text-red-600">
                    You are now idle
                  </h2>
                  <p className="mt-2 text-text-secondary">
                    Your session is currently marked as idle.
                  </p>
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <span className="font-mono text-xl text-red-700 tracking-wider">
                      {formatIdleTime(idleTime)}
                    </span>
                  </div>
                </>
              )}

              <div className="mt-8">
                <button
                  onClick={handleSnooze}
                  className="w-full sm:w-auto inline-flex justify-center rounded-md border border-transparent bg-primary px-8 py-3 text-base font-bold text-white shadow-sm hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-transform transform hover:scale-105"
                >
                  Snooze
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default IdleAlarm;
