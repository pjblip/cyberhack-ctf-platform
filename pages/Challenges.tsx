import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, Lock, Clock, Shield, AlertTriangle, Skull, ArrowLeft, Users, Search, Activity, Server, Database, BarChart3 } from 'lucide-react';
import { getSolvedCases, getChallenges, getChallengeSolveCounts } from '../utils/storage';
import Card from '../components/ui/Card';
import MatrixBackground from '../components/MatrixBackground';
import Button from '../components/ui/Button';
import ChallengeFilters from '../components/ChallengeFilters';
import ProgressIndicator from '../components/ProgressIndicator';
import PersonalStats from '../components/PersonalStats';
import { Challenge, User } from '../types';
import { SkeletonChallenge } from '../components/ui/Skeleton';

interface ChallengesPageProps {
  currentUser: User | null;
  onSelectCase: (challenge: Challenge) => void;
  onNavigate: (page: string) => void;
}

const ChallengesPage: React.FC<ChallengesPageProps> = ({ currentUser, onSelectCase, onNavigate }) => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [solvedCases, setSolvedCases] = useState<string[]>([]);
  const [solveCounts, setSolveCounts] = useState<Record<string, number>>({});
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard' | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showStats, setShowStats] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const MotionDiv = motion.div as any;

  const refreshData = async () => {
    if (!currentUser) return;
    setError(null);
    try {
      const [solved, loadedChallenges, counts] = await Promise.all([
        getSolvedCases(currentUser.id),
        getChallenges(),
        getChallengeSolveCounts()
      ]);
      setSolvedCases(solved);
      setChallenges(loadedChallenges);
      setSolveCounts(counts);
      
      // Restore the last difficulty filter if user is coming back from a challenge
      const lastDifficulty = sessionStorage.getItem('lastDifficulty');
      if (lastDifficulty && (lastDifficulty === 'easy' || lastDifficulty === 'medium' || lastDifficulty === 'hard')) {
        setSelectedDifficulty(lastDifficulty);
        // Clear it after restoring so it doesn't persist forever
        sessionStorage.removeItem('lastDifficulty');
      }
    } catch (err: any) {
      console.error('Failed to load challenges:', err);
      setError(err.message || 'Failed to connect to the server. Is the backend running?');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [currentUser]);

  if (!currentUser) {
    return (
      <>
        <MatrixBackground />
        <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-6rem)] px-4">
          <div className="w-full max-w-md">
            <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl relative">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-purple-500/10 rounded-2xl blur-xl"></div>

              <div className="relative z-10">
                {/* Icon */}
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full animate-pulse"></div>
                    <div className="relative bg-red-900/30 p-6 rounded-full border-2 border-red-500/50">
                      <Lock className="w-12 h-12 text-red-500" />
                    </div>
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-3xl font-black text-white mb-3 text-center tracking-tight">
                  ACCESS DENIED
                </h2>

                {/* Description */}
                <p className="text-slate-400 text-center mb-8 leading-relaxed">
                  You must be logged in to access the classified challenge database.
                </p>

                {/* Button */}
                <div className="flex justify-center">
                  <Button onClick={() => onNavigate('/login')} variant="primary" className="w-full">
                    Authenticate Now
                  </Button>
                </div>

                {/* Footer */}
                <div className="mt-6 pt-6 border-t border-slate-700/50">
                  <p className="text-center text-slate-500 text-xs font-mono">
                    SECURITY_LEVEL: CLASSIFIED
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (isLoading) {
    return (
      <div className="relative">
        <MatrixBackground />
        <div className="relative z-10 py-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-white mb-2 tracking-tight">
              LOADING OPERATIONS
            </h2>
            <div className="h-1 w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent mb-4"></div>
            <p className="text-slate-400 max-w-xl mx-auto font-mono text-sm animate-pulse">
              DECRYPTING MISSION FILES...
            </p>
          </div>
          <SkeletonChallenge />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative">
        <MatrixBackground />
        <div className="relative z-10 py-8">
          <div className="max-w-lg mx-auto text-center">
            <div className="bg-slate-900/95 backdrop-blur-xl border border-red-500/30 rounded-2xl p-8 shadow-2xl">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full animate-pulse"></div>
                  <div className="relative bg-red-900/30 p-6 rounded-full border-2 border-red-500/50">
                    <AlertTriangle className="w-12 h-12 text-red-500" />
                  </div>
                </div>
              </div>
              <h2 className="text-2xl font-black text-white mb-3 tracking-tight">CONNECTION FAILED</h2>
              <p className="text-slate-400 text-sm mb-2 font-mono">ERROR: {error}</p>
              <p className="text-slate-500 text-xs mb-6">Ensure the backend server is running on port 3001.</p>
              <Button onClick={() => { setIsLoading(true); refreshData(); }} variant="primary">
                RETRY CONNECTION
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    show: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  if (!selectedDifficulty) {
    // Show stats view if requested
    if (showStats) {
      return (
        <div className="relative">
          <MatrixBackground />
          <div className="relative z-10 py-8 w-full max-w-[1200px] mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-4xl font-black text-white tracking-tight">
                AGENT STATISTICS
              </h2>
              <Button 
                onClick={() => setShowStats(false)}
                variant="secondary"
                className="flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Challenges
              </Button>
            </div>
            <PersonalStats currentUser={currentUser} />
          </div>
        </div>
      );
    }

    return (
      <div className="relative">
        <MatrixBackground />
        <div className="relative z-10 py-8 w-full max-w-[1200px] mx-auto px-4">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block"
            >
              <h2 className="text-4xl font-black text-white mb-2 tracking-tight">
                SELECT OPERATION TIER
              </h2>
              <div className="h-1 w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent mb-4"></div>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-slate-400 max-w-xl mx-auto font-mono text-sm"
            >
              Choose your clearance level. Higher tiers require advanced cryptographic knowledge and rapid response times.
            </motion.p>
            
            {/* Stats Button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-6"
            >
              <Button 
                onClick={() => setShowStats(true)}
                variant="secondary"
                className="flex items-center mx-auto"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                View Personal Stats
              </Button>
            </motion.div>
          </div>

          <MotionDiv
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full"
          >
            {/* Easy Card */}
            <MotionDiv variants={item} className="h-full">
              <Card
                onClick={() => setSelectedDifficulty('easy')}
                className="group h-full flex flex-col items-center text-center p-8 border-t-4 border-t-emerald-500 hover:bg-emerald-900/10 transition-all cursor-pointer relative overflow-hidden"
                hoverEffect
              >
                <div className="w-24 h-24 bg-emerald-900/20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform relative z-10 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                  <Shield className="w-12 h-12 text-emerald-400" />
                </div>
                <h3 className="text-2xl font-black text-white mb-2 relative z-10">RECRUIT</h3>
                <div className="flex items-center space-x-2 text-emerald-400 font-mono font-bold text-xs tracking-widest mb-2 relative z-10">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                  <span>CLEARANCE LEVEL 1</span>
                </div>
                <p className="text-emerald-300 text-xs font-mono mb-6 relative z-10">5 Challenges • 10 pts each</p>
                <p className="text-slate-400 text-sm mb-8 leading-relaxed relative z-10">
                  Introductory protocols for new agents. Basic web vulnerabilities, source code analysis, and decoding tasks.
                </p>
                <div className="mt-auto flex items-center text-emerald-300 font-mono text-xs border border-emerald-500/30 bg-emerald-950/50 px-4 py-2 rounded relative z-10">
                  <Clock className="w-4 h-4 mr-2" />
                  EST. TIME: 3 MIN
                </div>
              </Card>
            </MotionDiv>

            {/* Medium Card */}
            <MotionDiv variants={item} className="h-full">
              <Card
                onClick={() => setSelectedDifficulty('medium')}
                className="group h-full flex flex-col items-center text-center p-8 border-t-4 border-t-yellow-500 hover:bg-yellow-900/10 transition-all cursor-pointer relative overflow-hidden"
                hoverEffect
              >
                <div className="w-24 h-24 bg-yellow-900/20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform relative z-10 border border-yellow-500/30 shadow-[0_0_20px_rgba(234,179,8,0.2)]">
                  <AlertTriangle className="w-12 h-12 text-yellow-400" />
                </div>
                <h3 className="text-2xl font-black text-white mb-2 relative z-10">OPERATIVE</h3>
                <div className="flex items-center space-x-2 text-yellow-400 font-mono font-bold text-xs tracking-widest mb-2 relative z-10">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                  <span>CLEARANCE LEVEL 2</span>
                </div>
                <p className="text-yellow-300 text-xs font-mono mb-6 relative z-10">4 Challenges • 50 pts each</p>
                <p className="text-slate-400 text-sm mb-8 leading-relaxed relative z-10">
                  Standard field operations. SQL injection, buffer overflows, and complex logic errors.
                </p>
                <div className="mt-auto flex items-center text-yellow-300 font-mono text-xs border border-yellow-500/30 bg-yellow-950/50 px-4 py-2 rounded relative z-10">
                  <Clock className="w-4 h-4 mr-2" />
                  EST. TIME: 10 MIN EACH
                </div>
              </Card>
            </MotionDiv>

            {/* Hard Card */}
            <MotionDiv variants={item} className="h-full">
              <Card
                onClick={() => setSelectedDifficulty('hard')}
                className="group h-full flex flex-col items-center text-center p-8 border-t-4 border-t-red-500 hover:bg-red-900/10 transition-all cursor-pointer relative overflow-hidden"
                hoverEffect
              >
                <div className="w-24 h-24 bg-red-900/20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform relative z-10 border border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                  <Skull className="w-12 h-12 text-red-400" />
                </div>
                <h3 className="text-2xl font-black text-white mb-2 relative z-10">BLACK OPS</h3>
                <div className="flex items-center space-x-2 text-red-400 font-mono font-bold text-xs tracking-widest mb-2 relative z-10">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  <span>CLEARANCE LEVEL 3</span>
                </div>
                <p className="text-red-300 text-xs font-mono mb-6 relative z-10">1 Challenge • 250 pts</p>
                <p className="text-slate-400 text-sm mb-8 leading-relaxed relative z-10">
                  Elite level challenges. Advanced RSA, binary exploitation, and zero-day research.
                </p>
                <div className="mt-auto flex items-center text-red-300 font-mono text-xs border border-red-500/30 bg-red-950/50 px-4 py-2 rounded relative z-10">
                  <Clock className="w-4 h-4 mr-2" />
                  EST. TIME: 30 MIN
                </div>
              </Card>
            </MotionDiv>
          </MotionDiv>
        </div>
      </div>
    );
  }

  const filteredCases = challenges
    .filter(c => {
      // Difficulty filter (when a specific difficulty is selected)
      if (selectedDifficulty && c.difficulty?.toString().trim().toLowerCase() !== selectedDifficulty) {
        return false;
      }
      
      // Multi-difficulty filter (when using advanced filters)
      if (!selectedDifficulty && selectedDifficulties.length > 0) {
        if (!selectedDifficulties.includes(c.difficulty?.toString().trim().toLowerCase())) {
          return false;
        }
      }
      
      // Category filter
      if (selectedCategories.length > 0) {
        const challengeCategory = c.category?.name?.toLowerCase() || 'web'; // default to web
        if (!selectedCategories.some(cat => challengeCategory.includes(cat))) {
          return false;
        }
      }
      
      // Status filter
      if (statusFilter !== 'all') {
        const isSolved = solvedCases.includes(c.id);
        const isAttempted = false; // TODO: Add attempt tracking
        
        switch (statusFilter) {
          case 'solved':
            if (!isSolved) return false;
            break;
          case 'attempted':
            if (!isAttempted || isSolved) return false;
            break;
          case 'not_started':
            if (isSolved || isAttempted) return false;
            break;
        }
      }
      
      // Search filter
      return (c.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
             (c.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    });

  const totalPoints = challenges.filter(c => c.difficulty?.toString().trim().toLowerCase() === selectedDifficulty).reduce((acc, curr) => acc + curr.points, 0);
  const userPointsInTier = challenges.filter(c => c.difficulty?.toString().trim().toLowerCase() === selectedDifficulty)
    .filter(c => solvedCases.includes(c.id))
    .reduce((acc, curr) => acc + curr.points, 0);
  const progressPercent = totalPoints > 0 ? (userPointsInTier / totalPoints) * 100 : 0;

  const getThemeColor = () => {
    if (selectedDifficulty === 'easy') return 'emerald';
    if (selectedDifficulty === 'medium') return 'yellow';
    return 'red';
  };
  const theme = getThemeColor();

  return (
    <div className="relative">
      <MatrixBackground />
      <div className="relative z-10 py-6 w-full px-6">
        {/* MISSION CONTROL DASHBOARD */}
        <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-6 mb-8 backdrop-blur-md relative overflow-hidden">
          {/* Animated Background Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.5)_1px,transparent_1px)] bg-[size:20px_20px] opacity-20 pointer-events-none"></div>

          <div className="flex flex-col lg:flex-row gap-6 relative z-10">
            {/* Left: Controls */}
            <div className="flex-grow">
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-xl font-black uppercase tracking-widest flex items-center text-${theme}-400`}>
                  <Activity className="w-5 h-5 mr-2" />
                  MISSION CONTROL: {selectedDifficulty}
                </h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowStats(true)}
                    className="text-xs font-mono text-slate-400 hover:text-white flex items-center border border-slate-700 hover:border-slate-500 px-3 py-1 rounded transition-all"
                  >
                    <BarChart3 className="w-3 h-3 mr-1" /> STATS
                  </button>
                  <button
                    onClick={() => setSelectedDifficulty(null)}
                    className="text-xs font-mono text-slate-400 hover:text-white flex items-center border border-slate-700 hover:border-slate-500 px-3 py-1 rounded transition-all"
                  >
                    <ArrowLeft className="w-3 h-3 mr-1" /> CHANGE TIER
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Metrics */}
            <div className="lg:w-1/3 border-l border-slate-700 pl-6 flex flex-col justify-center space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                  <span>SECTOR PROGRESS</span>
                  <span>{Math.round(progressPercent)}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    className={`h-full bg-${theme}-500 shadow-[0_0_10px_currentColor]`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950/50 p-2 rounded border border-slate-800 flex items-center">
                  <Server className="w-4 h-4 text-slate-500 mr-2" />
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase">Nodes Active</div>
                    <div className="text-xs font-bold text-white font-mono">14/14</div>
                  </div>
                </div>
                <div className="bg-slate-950/50 p-2 rounded border border-slate-800 flex items-center">
                  <Database className="w-4 h-4 text-slate-500 mr-2" />
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase">Missions</div>
                    <div className="text-xs font-bold text-white font-mono">{filteredCases.length}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        <ChallengeFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCategories={selectedCategories}
          onCategoryChange={setSelectedCategories}
          selectedDifficulties={selectedDifficulties}
          onDifficultyChange={setSelectedDifficulties}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          totalChallenges={challenges.filter(c => c.difficulty?.toString().trim().toLowerCase() === selectedDifficulty).length}
          filteredCount={filteredCases.length}
        />

        <div className="w-full">
          <MotionDiv
            layout
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full"
          >
            <AnimatePresence>
              {filteredCases.length === 0 ? (
                <div className="col-span-full text-center py-20 text-slate-500 border border-dashed border-slate-800 rounded-xl bg-slate-900/20">
                  <Search className="w-10 h-10 mx-auto mb-4 opacity-50" />
                  <p>No active missions match your search parameters.</p>
                </div>
              ) : filteredCases.map((challenge) => {
                const isSolved = solvedCases.includes(challenge.id);
                const solvedCount = solveCounts[challenge.id] || 0;
                const status = isSolved ? 'solved' : 'not_started'; // TODO: Add 'attempted' logic

                return (
                  <MotionDiv key={challenge.id} variants={item} layout>
                    <Card
                      onClick={() => onSelectCase(challenge)}
                      className={`group h-full flex flex-col justify-between transition-all duration-300 relative overflow-hidden ${isSolved
                        ? 'border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.1)] bg-emerald-950/10'
                        : 'hover:border-cyan-500/50'
                        }`}
                      hoverEffect
                    >
                      {isSolved && (
                        <div className="absolute top-0 right-0 p-2 opacity-10 pointer-events-none">
                          <Check className="w-32 h-32 text-emerald-500" />
                        </div>
                      )}

                      <div>
                        {/* Progress Indicator */}
                        <ProgressIndicator
                          status={status}
                          difficulty={challenge.difficulty as 'easy' | 'medium' | 'hard'}
                          estimatedTime={challenge.estimatedTime}
                          className="mb-4 relative z-10"
                        />

                        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors line-clamp-1 relative z-10 tracking-tight">
                          {challenge.title}
                        </h3>
                        <p className="text-slate-400 text-xs leading-relaxed mb-6 line-clamp-3 relative z-10 font-mono opacity-80">
                          {challenge.description}
                        </p>
                      </div>

                      <div className="flex justify-between items-center mt-auto pt-4 border-t border-slate-800/50 relative z-10">
                        <div className="flex items-center space-x-3">
                          <span className="text-slate-600 text-[10px] font-mono flex items-center uppercase" title={`${solvedCount} agents solved this`}>
                            <Users className="w-3 h-3 mr-1" /> {solvedCount}
                          </span>
                          <span className="text-cyan-400 font-mono font-bold text-xs">
                            {challenge.points} PTS
                          </span>
                        </div>
                        <div className={`flex items-center text-xs font-bold transition-colors ${isSolved ? 'text-emerald-500' : 'text-slate-500 group-hover:text-white'}`}>
                          {isSolved ? 'REVIEW INTEL' : 'INITIATE'} <ChevronRight className="w-3 h-3 ml-1 transform group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </Card>
                  </MotionDiv>
                );
              })}
            </AnimatePresence>
          </MotionDiv>
        </div>
      </div>
    </div>
  );
};

export default ChallengesPage;