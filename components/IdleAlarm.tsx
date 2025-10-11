import React, { useState, useEffect, useRef } from 'react';

interface IdleAlarmProps {
  isActive: boolean; // Control whether the alarm is running
}

const ALARM_INTERVAL_MS = 60 * 1000; // 1 minute
const SNOOZE_WINDOW_MS = 10 * 1000; // 10 seconds

// Request notification permission when the app starts
if (typeof window !== 'undefined' && 'Notification' in window) {
  Notification.requestPermission();
}

const IdleAlarm: React.FC<IdleAlarmProps> = ({ isActive }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [isIdle, setIsIdle] = useState(false);
  const [idleTime, setIdleTime] = useState(0);

  const mainTimerRef = useRef<number | null>(null);
  const snoozeTimeoutRef = useRef<number | null>(null);
  const idleTimerRef = useRef<number | null>(null);
  const notificationRef = useRef<Notification | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const soundIntervalRef = useRef<number | null>(null);

  // Function to play a ringing sound
  const playRingingSound = async () => {
    try {
      // If context doesn't exist or is suspended, create/resume it
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      const context = audioContextRef.current;
      
      // Create a more distinctive dual-tone ring (like a phone)
      const createTone = (frequency: number) => {
        const osc = context.createOscillator();
        const gain = context.createGain();
        
        osc.connect(gain);
        gain.connect(context.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(frequency, context.currentTime);
        
        // Create a more phone-like envelope
        gain.gain.setValueAtTime(0, context.currentTime);
        gain.gain.linearRampToValueAtTime(0.15, context.currentTime + 0.1);
        gain.gain.linearRampToValueAtTime(0.15, context.currentTime + 0.3);
        gain.gain.linearRampToValueAtTime(0, context.currentTime + 0.4);
        
        osc.start(context.currentTime);
        osc.stop(context.currentTime + 0.4);
        
        return { oscillator: osc, gainNode: gain };
      };

      // Create two tones for a more traditional ring sound
      const tone1 = createTone(1550);
      const tone2 = createTone(1900);

      // Cleanup after the sound plays
      setTimeout(() => {
        tone1.gainNode.disconnect();
        tone2.gainNode.disconnect();
      }, 500);

    } catch (error) {
      console.error('Error playing sound:', error);
      // Try alternative simpler sound if the first attempt fails
      try {
        const simpleContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = simpleContext.createOscillator();
        osc.connect(simpleContext.destination);
        osc.start(0);
        osc.stop(0.1);
      } catch (fallbackError) {
        console.error('Fallback sound also failed:', fallbackError);
      }
    }
  };

  // Function to start repeating ring
  const startRepeatingRing = async () => {
    // Ensure we have user interaction first
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      // Resume the audio context if it's suspended
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      
      // Play the first sound
      await playRingingSound();
      
      // Then set up the interval
      soundIntervalRef.current = window.setInterval(playRingingSound, 2000);
    } catch (error) {
      console.error('Error starting ring sequence:', error);
    }
  };

  // Function to stop repeating ring
  const stopRepeatingRing = () => {
    if (soundIntervalRef.current) {
      clearInterval(soundIntervalRef.current);
      soundIntervalRef.current = null;
    }
    // Don't close the audio context, just disconnect any active nodes
    if (audioContextRef.current) {
      const destination = audioContextRef.current.destination;
      // Disconnect all nodes connected to the destination
      if (typeof destination.disconnect === 'function') {
        destination.disconnect();
      }
    }
  };

  // Function to show notification with stock sound
  const showNotification = () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        // Close any existing notification
        if (notificationRef.current) {
          notificationRef.current.close();
        }
        // Create a new notification
        notificationRef.current = new Notification('Idle Alert', {
          body: 'Are you still there? Click to confirm you\'re working.',
          icon: '/favicon.ico', // You can add your app's icon here
          requireInteraction: true, // Notification won't auto-dismiss
          silent: false // This ensures the default notification sound plays
        });
      }
    }
  };

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
      showNotification(); // Show notification with stock sound

      snoozeTimeoutRef.current = window.setTimeout(async () => {
        setIsIdle(true);
        // Try to start the audio context with user interaction
        if (audioContextRef.current?.state === 'suspended') {
          try {
            await audioContextRef.current.resume();
          } catch (error) {
            console.error('Failed to resume audio context:', error);
          }
        }
        startRepeatingRing(); // Start the ringing sound when user becomes idle
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
      stopRepeatingRing(); // Stop the ringing sound
      if (notificationRef.current) {
        notificationRef.current.close();
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
    if (notificationRef.current) {
      notificationRef.current.close();
    }
    stopRepeatingRing(); // Stop the ringing sound
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