import { motion } from 'framer-motion';
import { Check, Clock, Play, Trophy, Target } from 'lucide-react';

interface ProgressIndicatorProps {
  status: 'not_started' | 'attempted' | 'solved';
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime?: number; // in minutes
  solveTime?: number; // in seconds
  className?: string;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  status,
  difficulty,
  estimatedTime,
  solveTime,
  className = ''
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'solved':
        return {
          icon: Check,
          text: 'COMPLETED',
          color: 'emerald',
          bgColor: 'bg-emerald-950/20',
          borderColor: 'border-emerald-500/30'
        };
      case 'attempted':
        return {
          icon: Clock,
          text: 'IN PROGRESS',
          color: 'yellow',
          bgColor: 'bg-yellow-950/20',
          borderColor: 'border-yellow-500/30'
        };
      default:
        return {
          icon: Play,
          text: 'NOT STARTED',
          color: 'slate',
          bgColor: 'bg-slate-950/20',
          borderColor: 'border-slate-700'
        };
    }
  };

  const getDifficultyConfig = () => {
    switch (difficulty) {
      case 'easy':
        return { color: 'emerald', label: 'EASY' };
      case 'medium':
        return { color: 'yellow', label: 'MEDIUM' };
      case 'hard':
        return { color: 'red', label: 'HARD' };
      default:
        return { color: 'slate', label: 'UNKNOWN' };
    }
  };

  const statusConfig = getStatusConfig();
  const difficultyConfig = getDifficultyConfig();
  const StatusIcon = statusConfig.icon;

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  };

  return (
    <div className={`flex items-center justify-between ${className}`}>
      {/* Status Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`flex items-center px-2 py-1 rounded-lg border ${statusConfig.bgColor} ${statusConfig.borderColor}`}
      >
        <StatusIcon className={`w-3 h-3 mr-1.5 text-${statusConfig.color}-400`} />
        <span className={`text-xs font-bold text-${statusConfig.color}-400 uppercase tracking-wide`}>
          {statusConfig.text}
        </span>
      </motion.div>

      {/* Difficulty & Time Info */}
      <div className="flex items-center space-x-2">
        {/* Difficulty Badge */}
        <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border border-${difficultyConfig.color}-500/20 bg-${difficultyConfig.color}-950/10 text-${difficultyConfig.color}-400`}>
          {difficultyConfig.label}
        </div>

        {/* Time Information */}
        {status === 'solved' && solveTime ? (
          <div className="flex items-center text-emerald-400 text-xs">
            <Trophy className="w-3 h-3 mr-1" />
            {formatTime(solveTime)}
          </div>
        ) : estimatedTime ? (
          <div className="flex items-center text-slate-500 text-xs">
            <Target className="w-3 h-3 mr-1" />
            ~{estimatedTime}m
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ProgressIndicator;