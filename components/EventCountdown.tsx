import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface EventCountdownProps {
  eventDuration?: number; // in minutes, default 60
  eventStartTime?: number | null; // timestamp when event started
}

const EventCountdown: React.FC<EventCountdownProps> = ({ 
  eventDuration = 60,
  eventStartTime = null 
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(eventDuration * 60); // in seconds

  useEffect(() => {
    if (!eventStartTime) {
      // Event hasn't started yet
      setTimeLeft(eventDuration * 60);
      return;
    }

    const calculateTimeLeft = () => {
      const now = Date.now();
      const elapsed = Math.floor((now - eventStartTime) / 1000); // seconds elapsed
      const remaining = (eventDuration * 60) - elapsed;
      return Math.max(0, remaining);
    };

    setTimeLeft(calculateTimeLeft());

    const interval = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [eventStartTime, eventDuration]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isUrgent = timeLeft > 0 && timeLeft <= 300; // Under 5 minutes
  const isEnded = timeLeft === 0;

  if (!eventStartTime) {
    return null; // Don't show timer if event hasn't started
  }

  return (
    <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border font-mono text-sm font-bold ${
      isEnded 
        ? 'bg-slate-800 border-slate-600 text-slate-400'
        : isUrgent 
        ? 'bg-red-900/30 border-red-500/50 text-red-400 animate-pulse'
        : 'bg-cyan-900/20 border-cyan-500/30 text-cyan-400'
    }`}>
      <Clock className={`w-4 h-4 ${isUrgent && !isEnded ? 'animate-pulse' : ''}`} />
      <span>
        {isEnded ? 'EVENT ENDED' : formatTime(timeLeft)}
      </span>
    </div>
  );
};

export default EventCountdown;
