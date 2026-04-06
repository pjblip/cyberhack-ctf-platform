import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Clock, Target, Lightbulb, TrendingUp, Award, Zap, Brain } from 'lucide-react';
import Card from './ui/Card';
import { User } from '../types';
import { api } from '../services/api';

interface PersonalStatsProps {
  currentUser: User | null;
}

interface UserStats {
  user: {
    id: string;
    username: string;
    score: number;
    role: string;
  };
  stats: {
    totalSolves: number;
    totalAttempts: number;
    totalHintsUsed: number;
    totalHintCost: number;
    averageSolveTime: number;
    statsByDifficulty: {
      easy: { solved: number; attempted: number; totalPoints: number };
      medium: { solved: number; attempted: number; totalPoints: number };
      hard: { solved: number; attempted: number; totalPoints: number };
    };
    recentSubmissions: Array<{
      challengeId: string;
      correct: boolean;
      submittedAt: string;
    }>;
  };
  solves: Array<{
    challengeId: string;
    challengeTitle: string;
    difficulty: string;
    points: number;
    solvedAt: string;
    solveTime: number;
  }>;
}

const PersonalStats: React.FC<PersonalStatsProps> = ({ currentUser }) => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const data = await api.get<UserStats>(`/challenges/stats/${currentUser.id}`);
      setStats(data);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch stats:', err);
      setError(err.message || 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

  if (!currentUser) {
    return (
      <Card className="p-6 text-center">
        <Trophy className="w-8 h-8 text-slate-500 mx-auto mb-2" />
        <p className="text-slate-400">Please log in to view your stats</p>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-700 rounded w-1/3"></div>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 bg-slate-800 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (error || !stats) {
    return (
      <Card className="p-6 text-center">
        <Trophy className="w-8 h-8 text-red-500 mx-auto mb-2" />
        <p className="text-red-400">{error || 'Failed to load stats'}</p>
      </Card>
    );
  }

  const successRate = stats.stats.totalAttempts > 0 
    ? Math.round((stats.stats.totalSolves / stats.stats.totalAttempts) * 100)
    : 0;

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Personal Dashboard</h2>
            <p className="text-slate-400 text-sm">Agent: {stats.user.username}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-cyan-400">{stats.user.score}</div>
            <div className="text-xs text-slate-500 uppercase">Total Points</div>
          </div>
        </div>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-4 text-center border-emerald-500/20 bg-emerald-950/10">
            <Trophy className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <div className="text-xl font-bold text-white">{stats.stats.totalSolves}</div>
            <div className="text-xs text-slate-400 uppercase">Challenges Solved</div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-4 text-center border-blue-500/20 bg-blue-950/10">
            <Target className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <div className="text-xl font-bold text-white">{successRate}%</div>
            <div className="text-xs text-slate-400 uppercase">Success Rate</div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-4 text-center border-yellow-500/20 bg-yellow-950/10">
            <Clock className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <div className="text-xl font-bold text-white">
              {formatTime(stats.stats.averageSolveTime)}
            </div>
            <div className="text-xs text-slate-400 uppercase">Avg Solve Time</div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-4 text-center border-purple-500/20 bg-purple-950/10">
            <Lightbulb className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <div className="text-xl font-bold text-white">{stats.stats.totalHintsUsed}</div>
            <div className="text-xs text-slate-400 uppercase">Hints Used</div>
          </Card>
        </motion.div>
      </div>

      {/* Difficulty Breakdown */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-cyan-400" />
          Performance by Difficulty
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(stats.stats.statsByDifficulty).map(([difficulty, data]) => {
            const color = {
              easy: 'emerald',
              medium: 'yellow', 
              hard: 'red'
            }[difficulty] || 'slate';
            
            return (
              <div key={difficulty} className={`border border-${color}-500/20 bg-${color}-950/10 rounded-lg p-4`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-${color}-400 font-bold uppercase text-sm`}>
                    {difficulty}
                  </span>
                  <span className={`text-${color}-300 text-sm`}>
                    {data.totalPoints} pts
                  </span>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Solved:</span>
                    <span className="text-white font-mono">{data.solved}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Attempted:</span>
                    <span className="text-white font-mono">{data.attempted}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Recent Solves */}
      {stats.solves.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center">
            <Award className="w-5 h-5 mr-2 text-cyan-400" />
            Recent Achievements
          </h3>
          
          <div className="space-y-3">
            {stats.solves.slice(0, 5).map((solve, index) => {
              const difficultyColor = {
                easy: 'emerald',
                medium: 'yellow',
                hard: 'red'
              }[solve.difficulty] || 'slate';
              
              return (
                <motion.div
                  key={solve.challengeId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-800"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 bg-${difficultyColor}-500 rounded-full`}></div>
                    <div>
                      <div className="text-white font-medium text-sm">{solve.challengeTitle}</div>
                      <div className="text-slate-400 text-xs">
                        {new Date(solve.solvedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-${difficultyColor}-400 font-bold text-sm`}>
                      +{solve.points} pts
                    </div>
                    <div className="text-slate-500 text-xs">
                      {formatTime(solve.solveTime)}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Achievements */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center">
          <Zap className="w-5 h-5 mr-2 text-cyan-400" />
          Achievements
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* First Blood */}
          {stats.solves.length > 0 && (
            <div className="text-center p-3 bg-red-950/20 border border-red-500/20 rounded-lg">
              <Brain className="w-6 h-6 text-red-400 mx-auto mb-1" />
              <div className="text-xs text-red-400 font-bold">FIRST SOLVE</div>
            </div>
          )}
          
          {/* Speed Demon */}
          {stats.stats.averageSolveTime < 300 && stats.stats.totalSolves > 0 && (
            <div className="text-center p-3 bg-yellow-950/20 border border-yellow-500/20 rounded-lg">
              <Zap className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
              <div className="text-xs text-yellow-400 font-bold">SPEED DEMON</div>
            </div>
          )}
          
          {/* No Hints */}
          {stats.stats.totalSolves > 0 && stats.stats.totalHintsUsed === 0 && (
            <div className="text-center p-3 bg-purple-950/20 border border-purple-500/20 rounded-lg">
              <Brain className="w-6 h-6 text-purple-400 mx-auto mb-1" />
              <div className="text-xs text-purple-400 font-bold">PURE SKILL</div>
            </div>
          )}
          
          {/* High Scorer */}
          {stats.user.score >= 100 && (
            <div className="text-center p-3 bg-emerald-950/20 border border-emerald-500/20 rounded-lg">
              <Trophy className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
              <div className="text-xs text-emerald-400 font-bold">HIGH SCORER</div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default PersonalStats;