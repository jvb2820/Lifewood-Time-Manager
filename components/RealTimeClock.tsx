import React, { useState, useEffect } from 'react';

interface RealTimeClockProps {
  elapsedTime: string | null;
}

const RealTimeClock: React.FC<RealTimeClockProps> = ({ elapsedTime }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timerId);
  }, []);

  const getRotationStyle = (unit: 'hours' | 'minutes' | 'seconds') => {
    const seconds = time.getSeconds();
    const minutes = time.getMinutes();
    const hours = time.getHours();
    let deg = 0;

    switch (unit) {
      case 'seconds':
        deg = (seconds / 60) * 360;
        break;
      case 'minutes':
        deg = (minutes / 60) * 360 + (seconds / 60) * 6;
        break;
      case 'hours':
        deg = (hours / 12) * 360 + (minutes / 60) * 30;
        break;
    }
    // Add 90deg offset because the hands start at 90deg
    return { transform: `rotate(${deg + 90}deg)` };
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-border-color shadow-sm flex flex-col items-center justify-center space-y-4">
      <div className="w-40 h-40 relative flex items-center justify-center">
        {/* Clock face */}
        <div className="absolute w-full h-full rounded-full border-4 border-primary bg-icon-bg"></div>
        {/* Hour markers */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-full h-full flex justify-center"
            style={{ transform: `rotate(${i * 30}deg)` }}
          >
            <div className="bg-text-secondary" style={{ width: i % 3 === 0 ? '4px' : '2px', height: '12px' }}></div>
          </div>
        ))}
        {/* Center dot */}
        <div className="absolute w-3 h-3 bg-primary rounded-full z-10"></div>
        {/* Hands */}
        <div className="absolute w-1/2 h-1 top-1/2 left-0 origin-right transition-transform duration-300 ease-elastic" style={getRotationStyle('hours')}>
          <div className="bg-text-primary h-full" style={{width: '60%', marginLeft: '40%'}}></div>
        </div>
        <div className="absolute w-1/2 h-0.5 top-1/2 left-0 origin-right transition-transform duration-300 ease-elastic" style={getRotationStyle('minutes')}>
            <div className="bg-text-secondary h-full" style={{width: '80%', marginLeft: '20%'}}></div>
        </div>
        <div className="absolute w-1/2 h-0.5 top-1/2 left-0 origin-right transition-transform" style={getRotationStyle('seconds')}>
            <div className="bg-accent h-full" style={{width: '90%', marginLeft: '10%'}}></div>
        </div>
      </div>
      
      {/* Digital Clock */}
      <div className="text-center">
        <p className="text-3xl font-mono font-bold text-text-primary">
            {time.toLocaleTimeString('en-US')}
        </p>
      </div>

      {/* Session Timer */}
      {elapsedTime && (
        <div className="text-center pt-2 border-t border-border-color w-full">
          <p className="text-sm text-text-secondary uppercase tracking-wider">Session Time</p>
          <p className="text-2xl font-mono font-bold text-primary tracking-wider">
            {elapsedTime}
          </p>
        </div>
      )}
    </div>
  );
};

export default RealTimeClock;
