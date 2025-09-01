'use client';

import { useEffect, useState } from 'react';

interface TimeBasedBackgroundProps {
  children: React.ReactNode;
}

export function TimeBasedBackground({ children }: TimeBasedBackgroundProps) {
  const [timeOfDay, setTimeOfDay] = useState<'dawn' | 'morning' | 'afternoon' | 'sunset' | 'night'>('morning');
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTimeOfDay = () => {
      // Get current time in IST
      const now = new Date();
      const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000)); // IST offset
      const hours = istTime.getHours();
      const minutes = istTime.getMinutes();

      // Format time for display
      setCurrentTime(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} IST`
      );

      // Set time of day
      if (hours >= 5 && hours < 7) {
        setTimeOfDay('dawn');
      } else if (hours >= 7 && hours < 12) {
        setTimeOfDay('morning');
      } else if (hours >= 12 && hours < 16) {
        setTimeOfDay('afternoon');
      } else if (hours >= 16 && hours < 19) {
        setTimeOfDay('sunset');
      } else {
        setTimeOfDay('night');
      }
    };

    // Update immediately and then every minute
    updateTimeOfDay();
    const interval = setInterval(updateTimeOfDay, 60000);

    return () => clearInterval(interval);
  }, []);

  const backgroundStyles = {
    dawn: {
      background: "linear-gradient(to bottom, #FF7F50, #FFB6C1, #87CEEB)",
      boxShadow: "inset 0 0 100px rgba(255, 127, 80, 0.5)",
    },
    morning: {
      background: "linear-gradient(to bottom, #87CEEB, #E0FFFF, #98FB98)",
      boxShadow: "inset 0 0 100px rgba(135, 206, 235, 0.5)",
    },
    afternoon: {
      background: "linear-gradient(to bottom, #4169E1, #87CEEB, #FFFFFF)",
      boxShadow: "inset 0 0 100px rgba(65, 105, 225, 0.5)",
    },
    sunset: {
      background: "linear-gradient(to bottom, #FF4500, #FF7F50, #4B0082)",
      boxShadow: "inset 0 0 100px rgba(255, 69, 0, 0.5)",
    },
    night: {
      background: "linear-gradient(to bottom, #191970, #000080, #4B0082)",
      boxShadow: "inset 0 0 100px rgba(25, 25, 112, 0.5)",
    },
  };

  return (
    <div
      className="relative min-h-screen overflow-hidden transition-all duration-1000"
      style={backgroundStyles[timeOfDay]}
    >
      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="stars" />
        <div className="twinkling" />
        {timeOfDay === 'sunset' && <div className="clouds" />}
      </div>

      {/* Time display */}
      <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 text-white shadow-lg">
        {currentTime}
      </div>

      {/* Main content */}
      <div className="relative z-10">
        {children}
      </div>

      <style jsx>{`
        @keyframes twinkle {
          0% { opacity: 0; }
          50% { opacity: 1; }
          100% { opacity: 0; }
        }

        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }

        @keyframes drift {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .stars {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: ${timeOfDay === 'night' ? 
            'radial-gradient(2px 2px at 20px 30px, #eee, rgba(0,0,0,0)),' +
            'radial-gradient(2px 2px at 40px 70px, #fff, rgba(0,0,0,0)),' +
            'radial-gradient(2px 2px at 50px 160px, #ddd, rgba(0,0,0,0)),' +
            'radial-gradient(2px 2px at 90px 40px, #fff, rgba(0,0,0,0)),' +
            'radial-gradient(2px 2px at 130px 80px, #fff, rgba(0,0,0,0)),' +
            'radial-gradient(2px 2px at 160px 120px, #ddd, rgba(0,0,0,0))' : 'none'};
          background-repeat: repeat;
          background-size: 200px 200px;
          animation: twinkle 4s infinite;
          opacity: ${timeOfDay === 'night' ? 1 : 0};
          transition: opacity 1s ease-in-out;
        }

        .twinkling {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 50% 50%, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 60%);
          animation: float 6s infinite ease-in-out;
        }

        .clouds {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(to right, 
            rgba(255,255,255,0) 0%,
            rgba(255,255,255,0.3) 50%,
            rgba(255,255,255,0) 100%);
          animation: drift 20s infinite linear;
        }
      `}</style>
    </div>
  );
} 