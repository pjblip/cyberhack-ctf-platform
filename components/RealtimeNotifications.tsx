import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Zap, Bell, X, Users } from 'lucide-react';
import { subscribeSolves, SolveNotification } from '../services/realtime';
import { playSuccessSound } from '../utils/audio';

interface RealtimeNotificationsProps {
  currentUserId?: string;
}

const RealtimeNotifications: React.FC<RealtimeNotificationsProps> = ({ currentUserId }) => {
  const [notifications, setNotifications] = useState<(SolveNotification & { id: string })[]>([]);
  const [isEnabled, setIsEnabled] = useState(true);

  useEffect(() => {
    if (!isEnabled) return;

    const channel = subscribeSolves((notification) => {
      // Don't show notification for current user's own solves
      if (currentUserId && notification.username === currentUserId) return;

      // Add notification with unique ID
      const notif = {
        ...notification,
        id: `${notification.id}-${Date.now()}`
      };

      setNotifications(prev => [notif, ...prev].slice(0, 5)); // Keep last 5

      // Play sound
      playSuccessSound();

      // Auto-remove after 5 seconds
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notif.id));
      }, 5000);
    });

    return () => {
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, [currentUserId, isEnabled]);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (!isEnabled) return null;

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm">
      {/* Toggle Button */}
      <button
        onClick={() => setIsEnabled(!isEnabled)}
        className="ml-auto flex items-center space-x-2 bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-400 hover:text-white hover:border-cyan-500 transition-all"
        title={isEnabled ? "Disable notifications" : "Enable notifications"}
      >
        <Bell className={`w-4 h-4 ${isEnabled ? 'text-cyan-500' : 'text-slate-500'}`} />
        <span>{isEnabled ? 'ON' : 'OFF'}</span>
      </button>

      {/* Notifications */}
      <AnimatePresence>
        {notifications.map((notif) => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative bg-gradient-to-r from-slate-900/95 to-slate-800/95 backdrop-blur-md border border-cyan-500/30 rounded-lg p-4 shadow-[0_0_20px_rgba(6,182,212,0.2)] overflow-hidden group"
          >
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            {/* Glow Effect */}
            <div className="absolute -top-10 -right-10 w-20 h-20 bg-cyan-500/20 rounded-full blur-2xl" />

            {/* Content */}
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-cyan-900/30 rounded-lg border border-cyan-500/30">
                    <Trophy className="w-4 h-4 text-cyan-400" />
                  </div>
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                    FLAG CAPTURED
                  </span>
                </div>
                <button
                  onClick={() => removeNotification(notif.id)}
                  className="text-slate-500 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1">
                <p className="text-white font-bold text-sm">
                  {notif.username}
                </p>
                <p className="text-slate-400 text-xs line-clamp-1">
                  solved <span className="text-white font-mono">{notif.challengeTitle}</span>
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-700/50">
                  <span className="text-emerald-400 font-mono font-bold text-xs flex items-center">
                    <Zap className="w-3 h-3 mr-1" />
                    +{notif.points} PTS
                  </span>
                  <span className="text-slate-500 text-[10px] font-mono">
                    {new Date(notif.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <motion.div
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 5, ease: "linear" }}
              className="absolute bottom-0 left-0 h-0.5 bg-cyan-500"
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default RealtimeNotifications;
