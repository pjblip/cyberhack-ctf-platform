import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Circle, ChevronDown, ChevronUp } from 'lucide-react';
import { trackPresence, getOnlineUsers, UserStatus } from '../services/realtime';

interface OnlineUsersProps {
  currentUserId: string;
  currentUsername: string;
}

const OnlineUsers: React.FC<OnlineUsersProps> = ({ currentUserId, currentUsername }) => {
  const [onlineUsers, setOnlineUsers] = useState<UserStatus[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Track current user's presence
    let channel: any = null;
    
    trackPresence(currentUserId, currentUsername).then(ch => {
      channel = ch;
    });

    // Update online users every 2 seconds
    const interval = setInterval(() => {
      const users = getOnlineUsers();
      setOnlineUsers(users);
    }, 2000);

    return () => {
      clearInterval(interval);
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, [currentUserId, currentUsername]);

  const onlineCount = onlineUsers.length;

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl shadow-2xl overflow-hidden"
      >
        {/* Header - Always Visible */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Users className="w-5 h-5 text-cyan-400" />
              <div className="absolute -top-1 -right-1 w-2 h-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </div>
            </div>
            <div className="text-left">
              <p className="text-white font-bold text-sm">{onlineCount} Online</p>
              <p className="text-slate-500 text-[10px] font-mono uppercase">Active Agents</p>
            </div>
          </div>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {/* Expanded List */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t border-slate-800"
            >
              <div className="max-h-64 overflow-y-auto p-2 space-y-1">
                {onlineUsers.length === 0 ? (
                  <div className="text-center py-4 text-slate-500 text-xs">
                    No other users online
                  </div>
                ) : (
                  onlineUsers.map((user) => (
                    <motion.div
                      key={user.userId}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className={`flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-800/50 transition-colors ${
                        user.userId === currentUserId ? 'bg-cyan-900/20 border border-cyan-500/20' : ''
                      }`}
                    >
                      {/* Status Indicator */}
                      <div className="relative">
                        <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <Circle className="absolute -bottom-0.5 -right-0.5 w-3 h-3 text-emerald-500 fill-emerald-500 stroke-slate-900 stroke-2" />
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${
                          user.userId === currentUserId ? 'text-cyan-400' : 'text-white'
                        }`}>
                          {user.username}
                          {user.userId === currentUserId && (
                            <span className="ml-2 text-[10px] text-cyan-500">(You)</span>
                          )}
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono">
                          Active now
                        </p>
                      </div>

                      {/* Online Badge */}
                      <div className="px-2 py-0.5 bg-emerald-900/30 border border-emerald-500/30 rounded text-[10px] text-emerald-400 font-bold uppercase">
                        Online
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-slate-800 p-2">
                <div className="flex items-center justify-center space-x-2 text-[10px] text-slate-500 font-mono">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span>REAL-TIME PRESENCE TRACKING</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default OnlineUsers;
