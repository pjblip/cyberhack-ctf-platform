import { motion } from 'framer-motion';
import { X, User, Target, Trophy, Hash } from 'lucide-react';
import { User as UserType, Stats } from '../types';
import { ACHIEVEMENTS } from '../constants';
import GlitchText from './ui/GlitchText';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType;
  stats: Stats;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, user, stats }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl bg-slate-900 border border-cyan-500/30 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.15)]"
      >
        {/* Header - Holographic ID Card style */}
        <div className="relative bg-gradient-to-r from-slate-900 to-slate-800 p-8 border-b border-slate-700">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500" />
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
          
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 rounded-xl bg-slate-800 border-2 border-cyan-500/50 flex items-center justify-center relative overflow-hidden group">
               <User className="w-12 h-12 text-cyan-400" />
               <div className="absolute inset-0 bg-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
               {/* Scanline */}
               <div className="absolute top-0 left-0 w-full h-[2px] bg-cyan-400 opacity-50 animate-[scan_2s_ease-in-out_infinite]" />
            </div>
            
            <div>
              <div className="text-xs font-mono text-cyan-500 mb-1">OPERATIVE ID: {user.id.substring(0, 8).toUpperCase()}</div>
              <h2 className="text-3xl font-bold text-white mb-2"><GlitchText text={user.username} /></h2>
              <div className="flex space-x-4">
                 <div className="flex items-center text-sm text-slate-300 bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700">
                    <Trophy className="w-3 h-3 text-yellow-500 mr-2" />
                    {stats.points} PTS
                 </div>
                 <div className="flex items-center text-sm text-slate-300 bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700">
                    <Target className="w-3 h-3 text-emerald-500 mr-2" />
                    {stats.correct} SOLVES
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 bg-slate-950/50">
           <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center">
             <Hash className="w-4 h-4 mr-2" /> Achievements
           </h3>
           
           <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {ACHIEVEMENTS.map((achievement) => {
                const isUnlocked = achievement.condition(stats);
                
                return (
                  <div 
                    key={achievement.id}
                    className={`
                      relative p-4 rounded-xl border transition-all duration-300
                      ${isUnlocked 
                        ? 'bg-cyan-950/20 border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)]' 
                        : 'bg-slate-900/50 border-slate-800 opacity-60 grayscale'}
                    `}
                  >
                    <div className="text-3xl mb-3">{achievement.icon}</div>
                    <h4 className={`font-bold text-sm mb-1 ${isUnlocked ? 'text-cyan-400' : 'text-slate-500'}`}>
                      {achievement.title}
                    </h4>
                    <p className="text-xs text-slate-500 leading-tight">
                      {achievement.description}
                    </p>
                    {isUnlocked && (
                      <div className="absolute top-2 right-2 w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_5px_#22d3ee]" />
                    )}
                  </div>
                );
              })}
           </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfileModal;