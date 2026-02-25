import { useEffect, useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, TrendingUp, TrendingDown, Minus, Crown, Medal, Award } from 'lucide-react';
import { subscribeLeaderboard, LeaderboardUpdate } from '../services/realtime';

interface LeaderboardEntry extends LeaderboardUpdate {
  rank: number;
  previousRank?: number;
}

interface RealtimeLeaderboardProps {
  initialData: LeaderboardUpdate[];
  currentUserId?: string;
}

const RealtimeLeaderboard: React.FC<RealtimeLeaderboardProps> = ({ initialData, currentUserId }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  // Initialize leaderboard with ranks
  useEffect(() => {
    const sorted = [...initialData]
      .sort((a, b) => b.points - a.points || b.solves - a.solves)
      .map((entry, index) => ({
        ...entry,
        rank: index + 1
      }));
    setLeaderboard(sorted);
  }, [initialData]);

  // Subscribe to real-time updates
  useEffect(() => {
    const channel = subscribeLeaderboard((update) => {
      setLeaderboard(prev => {
        // Find existing entry
        const existingIndex = prev.findIndex(e => e.userId === update.userId);

        let updated: LeaderboardEntry[];
        if (existingIndex >= 0) {
          // Update existing entry, preserve previous rank
          updated = [...prev];
          updated[existingIndex] = {
            ...update,
            rank: prev[existingIndex].rank,
            previousRank: prev[existingIndex].rank
          };
        } else {
          // Add new entry
          updated = [...prev, { ...update, rank: prev.length + 1 }];
        }

        // Re-sort and update ranks
        const sorted = updated
          .sort((a, b) => b.points - a.points || b.solves - a.solves)
          .map((entry, index) => ({
            ...entry,
            rank: index + 1
          }));

        return sorted;
      });
    });

    return () => {
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, []);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-slate-300" />;
    if (rank === 3) return <Award className="w-5 h-5 text-amber-600" />;
    return <span className="text-slate-500 font-mono text-sm">#{rank}</span>;
  };

  const getRankChange = (entry: LeaderboardEntry) => {
    if (!entry.previousRank || entry.previousRank === entry.rank) {
      return <Minus className="w-4 h-4 text-slate-600" />;
    }
    if (entry.previousRank > entry.rank) {
      return <TrendingUp className="w-4 h-4 text-emerald-500" />;
    }
    return <TrendingDown className="w-4 h-4 text-red-500" />;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-500/20 to-transparent border-yellow-500/30';
    if (rank === 2) return 'from-slate-400/20 to-transparent border-slate-400/30';
    if (rank === 3) return 'from-amber-600/20 to-transparent border-amber-600/30';
    return 'from-slate-800/20 to-transparent border-slate-700/30';
  };

  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {leaderboard.slice(0, 10).map((entry, index) => (
          <motion.div
            key={entry.userId}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`relative bg-gradient-to-r ${getRankColor(entry.rank)} backdrop-blur-sm border rounded-lg p-4 overflow-hidden group ${entry.userId === currentUserId ? 'ring-2 ring-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.3)]' : ''
              }`}
          >
            {/* Animated Background on Hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            {/* Content */}
            <div className="relative z-10 flex items-center justify-between">
              {/* Left: Rank & User */}
              <div className="flex items-center space-x-4 flex-1">
                {/* Rank Icon */}
                <div className="flex items-center justify-center w-10">
                  {getRankIcon(entry.rank)}
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3 className={`font-bold truncate ${entry.userId === currentUserId ? 'text-cyan-400' : 'text-white'
                      }`}>
                      {entry.username}
                    </h3>
                    {entry.userId === currentUserId && (
                      <span className="px-2 py-0.5 bg-cyan-900/30 border border-cyan-500/30 rounded text-[10px] text-cyan-400 font-bold uppercase">
                        YOU
                      </span>
                    )}
                  </div>
                  <p className="text-slate-500 text-xs font-mono">
                    {entry.solves} {entry.solves === 1 ? 'solve' : 'solves'}
                  </p>
                </div>
              </div>

              {/* Right: Points & Trend */}
              <div className="flex items-center space-x-4">
                {/* Rank Change */}
                <div className="hidden sm:flex items-center justify-center w-6">
                  {getRankChange(entry)}
                </div>

                {/* Points */}
                <div className="text-right">
                  <motion.div
                    key={entry.points}
                    initial={{ scale: 1.2, color: '#22d3ee' }}
                    animate={{ scale: 1, color: '#f59e0b' }}
                    transition={{ duration: 0.3 }}
                    className="font-black text-lg font-mono text-amber-500"
                  >
                    {entry.points}
                  </motion.div>
                  <p className="text-slate-500 text-[10px] uppercase tracking-wider">
                    POINTS
                  </p>
                </div>
              </div>
            </div>

            {/* Rank Badge for Top 3 */}
            {entry.rank <= 3 && (
              <div className="absolute top-0 right-0 w-16 h-16 opacity-10 pointer-events-none">
                <Trophy className="w-full h-full" />
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Live Indicator */}
      <div className="flex items-center justify-center space-x-2 text-xs text-slate-500 font-mono pt-2">
        <div className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
        </div>
        <span>LIVE UPDATES ACTIVE</span>
      </div>
    </div>
  );
};

// Fix 7: memo prevents re-render when parent App state changes (profile open, toasts, etc.)
export default memo(RealtimeLeaderboard);
