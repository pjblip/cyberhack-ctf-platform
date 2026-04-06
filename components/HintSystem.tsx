import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Lock, Coins, AlertTriangle, Check } from 'lucide-react';
import { db } from '../services/db';
import Button from './ui/Button';
import Card from './ui/Card';

interface Hint {
  index: number;
  cost: number;
  purchased: boolean;
  content: string | null;
}

interface HintSystemProps {
  challengeId: string;
  userPoints: number;
  onPointsUpdate: (newPoints: number) => void;
}

const HintSystem: React.FC<HintSystemProps> = ({ challengeId, userPoints, onPointsUpdate }) => {
  const [hints, setHints] = useState<Hint[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchHints = async () => {
    try {
      const data: any = await db.challenges.getHints(challengeId);
      setHints(data.hints || []);
    } catch (err) {
      console.error('Failed to fetch hints:', err);
      setError('Failed to load hints');
    } finally {
      setLoading(false);
    }
  };

  const purchaseHint = async (hintIndex: number) => {
    setPurchasing(hintIndex);
    setError(null);
    
    try {
      const data: any = await db.challenges.purchaseHint(challengeId, hintIndex);
      
      // Update hints
      setHints(prev => prev.map(hint => 
        hint.index === hintIndex 
          ? { ...hint, purchased: true, content: data.hint }
          : hint
      ));
      
      // Update user points
      onPointsUpdate(data.remainingPoints);
      
      // Clear error on success
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to purchase hint');
    } finally {
      setPurchasing(null);
    }
  };

  useEffect(() => {
    fetchHints();
  }, [challengeId]);

  if (loading) {
    return (
      <Card className="border-slate-700 bg-slate-900/50">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-slate-700 rounded w-1/2"></div>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-slate-800 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  if (hints.length === 0) {
    return (
      <Card className="border-slate-700 bg-slate-900/50">
        <div className="p-6 text-center">
          <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
            <Lightbulb className="w-6 h-6 text-slate-500" />
          </div>
          <p className="text-slate-400 text-sm">No hints available for this challenge</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-slate-700 bg-gradient-to-br from-slate-900/90 to-slate-900/50 relative overflow-hidden">
      {/* Background Glow Effect */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl"></div>
      
      <div className="relative p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <div className="w-8 h-8 bg-yellow-900/30 rounded-lg flex items-center justify-center">
              <Lightbulb className="w-4 h-4 text-yellow-400" />
            </div>
            Intelligence System
          </h3>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
            <Coins className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-400 font-mono font-bold text-sm">{userPoints}</span>
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 mb-4"
          >
            <div className="flex items-center text-red-400 text-sm">
              <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />
              {error}
            </div>
          </motion.div>
        )}

        <div className="space-y-3">
          <AnimatePresence>
            {hints.map((hint, index) => {
              // Check if previous hint is purchased (for sequential unlocking)
              const isPreviousHintPurchased = index === 0 || hints[index - 1]?.purchased;
              const isLocked = !hint.purchased && !isPreviousHintPurchased;
              const canPurchase = !hint.purchased && isPreviousHintPurchased && userPoints >= hint.cost;
              
              return (
                <motion.div
                  key={hint.index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`border rounded-xl transition-all ${
                    hint.purchased 
                      ? 'border-emerald-500/40 bg-gradient-to-br from-emerald-950/40 to-emerald-950/10' 
                      : isLocked
                      ? 'border-slate-800 bg-slate-900/30 opacity-60'
                      : 'border-slate-700 bg-slate-800/30 hover:border-slate-600 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                          hint.purchased 
                            ? 'bg-emerald-900/50 text-emerald-400' 
                            : isLocked
                            ? 'bg-slate-800 text-slate-600'
                            : 'bg-slate-700 text-slate-400'
                        }`}>
                          {hint.index + 1}
                        </div>
                        <span className={`text-xs font-mono uppercase tracking-wider ${
                          isLocked ? 'text-slate-600' : 'text-slate-500'
                        }`}>
                          Hint {hint.index + 1}
                        </span>
                        {hint.purchased && (
                          <div className="flex items-center gap-1 text-emerald-400 text-xs font-semibold px-2 py-1 bg-emerald-900/30 rounded">
                            <Check className="w-3 h-3" />
                            Unlocked
                          </div>
                        )}
                        {isLocked && (
                          <div className="flex items-center gap-1 text-slate-600 text-xs font-semibold px-2 py-1 bg-slate-800/30 rounded">
                            <Lock className="w-3 h-3" />
                            Locked
                          </div>
                        )}
                      </div>
                      
                      {!hint.purchased && (
                        <div className="flex items-center gap-2">
                          <div className={`flex items-center gap-1 font-mono font-bold text-sm px-2 py-1 rounded ${
                            isLocked 
                              ? 'text-slate-600 bg-slate-800/20'
                              : 'text-yellow-400 bg-yellow-900/20'
                          }`}>
                            <Coins className="w-3 h-3" />
                            {hint.cost}
                          </div>
                          <Button
                            onClick={() => purchaseHint(hint.index)}
                            disabled={isLocked || userPoints < hint.cost || purchasing === hint.index}
                            variant={canPurchase ? "primary" : "secondary"}
                            className="text-xs px-3 py-1.5 h-auto"
                          >
                            {purchasing === hint.index ? (
                              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : isLocked ? (
                              <Lock className="w-3 h-3" />
                            ) : canPurchase ? (
                              'Unlock'
                            ) : (
                              <Lock className="w-3 h-3" />
                            )}
                          </Button>
                        </div>
                      )}
                    </div>

                    {hint.purchased && hint.content && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="text-slate-300 text-sm leading-relaxed bg-slate-950/50 rounded-lg p-4 border border-slate-800"
                      >
                        <div className="flex items-start gap-2">
                          <Lightbulb className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                          <p>{hint.content}</p>
                        </div>
                      </motion.div>
                    )}

                    {!hint.purchased && (
                      <div className={`text-xs italic flex items-center gap-2 mt-2 ${
                        isLocked ? 'text-slate-600' : 'text-slate-500'
                      }`}>
                        <Lock className="w-3 h-3" />
                        {isLocked 
                          ? `Unlock Hint ${index} first to access this hint`
                          : 'Hint content will be revealed after purchase'
                        }
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800">
          <p className="text-xs text-slate-500 text-center flex items-center justify-center gap-2">
            <AlertTriangle className="w-3 h-3" />
            Hints cost points but can help you solve challenges faster
          </p>
        </div>
      </div>
    </Card>
  );
};

export default HintSystem;