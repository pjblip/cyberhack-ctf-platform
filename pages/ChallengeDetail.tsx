import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Flag, Terminal as TerminalIcon, CheckCircle2, XCircle, Coins, Timer, Download, FileCode, ArrowRight, Info } from 'lucide-react';
import { Challenge, User, Stats } from '../types';
import { getSolvedCases, saveSolvedCase, saveStats, getUserStats, getChallenges } from '../utils/storage';
import { db } from '../services/db';
import { generateChallengeFile } from '../utils/mockFileGenerator';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import GlitchText from '../components/ui/GlitchText';
import TerminalComponent from '../components/Terminal';
import HintSystem from '../components/HintSystem';
import { playSuccessSound, playErrorSound, playClickSound } from '../utils/audio';
import { useToast } from '../components/ui/Toast';

interface ChallengeDetailProps {
  challenge: Challenge;
  currentUser: User | null;
  onBack: () => void;
  onUpdateStats: (stats: Stats) => void;
  onSelectChallenge: (challenge: Challenge) => void;
}

const ChallengeDetailPage: React.FC<ChallengeDetailProps> = ({ 
  challenge, 
  currentUser, 
  onBack, 
  onUpdateStats, 
  onSelectChallenge 
}) => {
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info' | null; message: string }>({ 
    type: null, 
    message: '' 
  });
  const [isSolved, setIsSolved] = useState(false);
  const [stats, setStats] = useState<Stats>({ correct: 0, total: 0, points: 0 });
  const [timeLeft, setTimeLeft] = useState(challenge.duration || 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attemptLoaded, setAttemptLoaded] = useState(false);
  const [nextChallenge, setNextChallenge] = useState<Challenge | null>(null);

  const { addToast } = useToast();
  const MotionDiv = motion.div as any;

  // Format challenge description with special styling
  const formatChallengeDescription = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      if (line.match(/(https?:\/\/[^\s]+)/g)) {
        const parts = line.split(/(https?:\/\/[^\s]+)/g);
        return (
          <p key={idx} className="mb-2">
            {parts.map((part, i) => 
              part.match(/^https?:\/\//) ? (
                <span key={i} className="inline-block bg-cyan-900/30 border border-cyan-500/50 text-cyan-300 px-3 py-1 rounded font-mono text-sm">
                  {part}
                </span>
              ) : <span key={i}>{part}</span>
            )}
          </p>
        );
      }

      if (line.includes('flag{') || line.includes('Example:')) {
        return (
          <p key={idx} className="font-mono text-emerald-400 bg-emerald-900/20 border border-emerald-500/30 px-3 py-2 rounded my-2">
            {line}
          </p>
        );
      }

      if (line.match(/^(Start here:|Download|Make a request to:)/i)) {
        return <p key={idx} className="font-bold text-cyan-400 mt-3 mb-2">{line}</p>;
      }

      return line.trim() ? <p key={idx} className="mb-2">{line}</p> : <br key={idx} />;
    });
  };

  // Initialize challenge data
  useEffect(() => {
    const init = async () => {
      if (currentUser) {
        const solved = await getSolvedCases(currentUser.id);
        setIsSolved(solved.includes(challenge.id));

        const currentStats = await getUserStats(currentUser.id);
        setStats(currentStats);

        const challenges = await getChallenges();
        const sameTierChallenges = challenges
          .filter(c => c.difficulty === challenge.difficulty)
          .sort((a, b) => a.id.localeCompare(b.id));

        const currentIndex = sameTierChallenges.findIndex(c => c.id === challenge.id);
        if (currentIndex !== -1 && currentIndex < sameTierChallenges.length - 1) {
          setNextChallenge(sameTierChallenges[currentIndex + 1]);
        }

        if (!solved.includes(challenge.id)) {
          const attemptData = await db.challenges.getAttempt(currentUser.id, challenge.id);
          if (attemptData && typeof attemptData.timeLeft === 'number') {
            setTimeLeft(attemptData.timeLeft);
          } else {
            const newAttempt = await db.challenges.startChallenge(
              currentUser.id,
              challenge.id,
              challenge.duration || 300
            );
            if (newAttempt && typeof newAttempt.timeLeft === 'number') {
              setTimeLeft(newAttempt.timeLeft);
            } else {
              // Fallback to challenge duration
              setTimeLeft(challenge.duration || 300);
            }
          }
        } else {
          // Challenge is already solved, set time to 0
          setTimeLeft(0);
        }

        setAttemptLoaded(true);
      }
    };
    init();
  }, [currentUser, challenge.id]);

  // Timer logic
  useEffect(() => {
    if (isSolved || !attemptLoaded) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          addToast('Time expired!', 'error');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSolved, attemptLoaded]);

  const formatTime = (seconds: number) => {
    // Handle NaN or invalid values
    if (isNaN(seconds) || seconds === null || seconds === undefined) {
      return '00:00';
    }
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (timeLeft === 0 && !isSolved) {
      playErrorSound();
      setFeedback({ type: 'error', message: 'Time Expired!' });
      return;
    }

    const sanitizedAnswer = answer.trim();
    if (!sanitizedAnswer) return;

    if (!/^flag\{.*\}$/i.test(sanitizedAnswer)) {
      playErrorSound();
      setFeedback({
        type: 'error',
        message: 'Invalid format! Flags must be: flag{your_answer}'
      });
      return;
    }

    if (isSolved) {
      setFeedback({ type: 'success', message: 'Already completed!' });
      return;
    }

    setIsSubmitting(true);

    const result = await db.challenges.submitFlag(currentUser.id, challenge.id, sanitizedAnswer);
    const currentStats = await getUserStats(currentUser.id);
    let newStats = { ...currentStats };

    setIsSubmitting(false);

    if (result.success) {
      await saveSolvedCase(currentUser.id, challenge.id);
      newStats.correct += 1;
      newStats.points = result.points || (currentStats.points + challenge.points);
      await saveStats(currentUser.id, newStats);

      playSuccessSound();
      onUpdateStats(newStats);
      setIsSolved(true);
      setFeedback({ type: 'success', message: `Correct! +${challenge.points} points` });
    } else {
      playErrorSound();
      setFeedback({ type: 'error', message: result.message });
    }
    setAnswer('');
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    playClickSound();

    if (challenge.fileUrl && challenge.fileUrl !== 'mock') {
      try {
        const filePath = challenge.fileUrl.startsWith('http') || challenge.fileUrl.startsWith('/')
          ? challenge.fileUrl
          : `/challenge-files/${challenge.fileUrl}`;

        const response = await fetch(filePath);
        if (!response.ok) throw new Error('Download failed');

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = challenge.fileUrl.split('/').pop() || 'download';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        addToast('File downloaded successfully', 'success');
        return;
      } catch (err) {
        console.error("Download error:", err);
      }
    }

    const fileData = generateChallengeFile(challenge.id);
    if (!fileData) {
      addToast('File not available', 'error');
      return;
    }

    const blob = new Blob([fileData.content], { type: fileData.mimeType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileData.filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    addToast('File generated', 'info');
  };

  const getTimerColor = () => {
    if (isSolved) return 'text-emerald-400 border-emerald-500/50 bg-emerald-900/20';
    if (timeLeft === 0) return 'text-red-500 border-red-500/50 bg-red-900/20 animate-pulse';
    if (timeLeft < 30) return 'text-orange-400 border-orange-500/50 bg-orange-900/20';
    return 'text-cyan-400 border-cyan-500/30 bg-cyan-900/20';
  };

  const getDifficultyColor = () => {
    switch (challenge.difficulty) {
      case 'easy': return 'bg-emerald-900/30 text-emerald-400 border-emerald-500/30';
      case 'medium': return 'bg-yellow-900/30 text-yellow-400 border-yellow-500/30';
      case 'hard': return 'bg-red-900/30 text-red-400 border-red-500/30';
      default: return 'bg-slate-800 text-slate-300 border-slate-600';
    }
  };

  return (
    <MotionDiv
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
    >
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-xl">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => { playClickSound(); onBack(); }}
              className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-all font-mono text-sm group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Challenges
            </button>

            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-3 px-6 py-2.5 rounded-lg border font-mono text-lg font-bold shadow-lg transition-all ${getTimerColor()}`}>
                <Timer className={`w-5 h-5 ${timeLeft < 30 && !isSolved ? 'animate-bounce' : ''}`} />
                {isSolved ? 'COMPLETED' : (isNaN(timeLeft) ? 'Loading...' : formatTime(timeLeft))}
              </div>

              {isSolved && nextChallenge && (
                <button
                  onClick={() => { playClickSound(); onSelectChallenge(nextChallenge); }}
                  className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-all font-mono text-sm bg-emerald-900/20 border border-emerald-500/30 px-4 py-2.5 rounded-lg hover:bg-emerald-900/40 group"
                >
                  Next Challenge
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Left Column - Challenge Content */}
          <div className="xl:col-span-2 space-y-6">
            
            {/* Challenge Info Card */}
            <Card className="border-slate-700 bg-slate-900/50 overflow-hidden">
              <div className="p-8">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                  <span className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border ${getDifficultyColor()}`}>
                    {challenge.difficulty}
                  </span>
                  <div className="flex items-center gap-2 text-cyan-400 font-mono font-bold text-lg">
                    <Coins className="w-5 h-5" />
                    {challenge.points} PTS
                  </div>
                  {challenge.category && (
                    <span className="px-3 py-1 bg-slate-800/50 text-slate-400 text-xs font-mono rounded border border-slate-700 capitalize">
                      {challenge.category}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h1 className="text-4xl font-bold text-white mb-6 tracking-tight">
                  <GlitchText text={challenge.title} />
                </h1>

                {/* Description */}
                <div className="text-slate-300 text-base leading-relaxed space-y-2">
                  {formatChallengeDescription(challenge.description)}
                </div>
              </div>
            </Card>

            {/* Mission Assets */}
            {challenge.fileUrl && (
              <Card className="border-slate-700 bg-slate-900/50">
                <div className="p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <FileCode className="w-5 h-5 text-cyan-400" />
                    Mission Assets
                  </h3>
                  <div className="flex items-center bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-cyan-500/50 transition-all group">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-900/30 to-cyan-900/10 rounded-lg flex items-center justify-center mr-4">
                      <FileCode className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div className="flex-grow">
                      <div className="text-white font-mono text-sm font-semibold">
                        mission_asset_{challenge.id.substring(0, 8)}.dat
                      </div>
                      <div className="text-xs text-slate-500 mt-1">Binary Execution / Analysis Required</div>
                    </div>
                    <button
                      onClick={handleDownload}
                      className="px-5 py-2.5 bg-cyan-900/20 text-cyan-400 border border-cyan-500/30 rounded-lg flex items-center gap-2 hover:bg-cyan-500 hover:text-black transition-all text-sm font-bold"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                </div>
              </Card>
            )}

            {/* Terminal for Hard Challenges */}
            {challenge.difficulty === 'hard' && (
              <Card className="border-slate-700 bg-slate-900/50">
                <div className="p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <TerminalIcon className="w-5 h-5 text-cyan-400" />
                    Challenge Terminal
                  </h3>
                  <div className="bg-black/40 border border-slate-700 rounded-lg overflow-hidden">
                    <TerminalComponent challengeMode={true} challengeId={challenge.id} />
                  </div>
                  <p className="text-xs text-slate-500 mt-3 italic flex items-center gap-2">
                    <Info className="w-3 h-3" />
                    Use commands like 'ls', 'cat', 'decrypt' to analyze files
                  </p>
                </div>
              </Card>
            )}

            {/* Flag Submission */}
            <Card className="border-slate-700 bg-slate-900/50 relative overflow-hidden">
              <AnimatePresence>
                {isSubmitting && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-slate-900/95 z-20 flex flex-col items-center justify-center backdrop-blur-sm"
                  >
                    <div className="font-mono text-cyan-400 mb-4 animate-pulse text-lg">VERIFYING HASH...</div>
                    <div className="w-64 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 1.0 }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="p-8">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 bg-cyan-900/30 rounded-lg flex items-center justify-center">
                    <Flag className="w-5 h-5 text-cyan-400" />
                  </div>
                  Submit Flag
                </h3>

                {isSolved ? (
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-gradient-to-br from-emerald-900/30 to-emerald-900/10 border-2 border-emerald-500/50 rounded-xl p-8 text-center"
                  >
                    <div className="inline-flex p-4 rounded-full bg-emerald-900/50 text-emerald-400 mb-6">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h4 className="text-2xl font-bold text-emerald-400 mb-3">Challenge Conquered!</h4>
                    <p className="text-emerald-200/70 mb-8 text-lg">Excellent work, agent.</p>
                    <Button
                      onClick={() => { playClickSound(); onBack(); }}
                      variant="primary"
                      className="w-full py-3"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" /> Return to Challenges
                    </Button>
                  </motion.div>
                ) : (
                  <div className="space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2 font-mono">
                          Enter Flag
                        </label>
                        <Input
                          placeholder="flag{...}"
                          value={answer}
                          onChange={(e) => setAnswer(e.target.value)}
                          className="font-mono text-base h-12"
                          disabled={timeLeft === 0 || isSubmitting}
                        />
                        <p className="text-xs text-slate-500 mt-2 font-mono">
                          Format: flag&#123;your_answer_here&#125;
                        </p>
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full py-3 text-base font-bold" 
                        disabled={timeLeft === 0 || isSubmitting}
                      >
                        {timeLeft === 0 ? 'TIME EXPIRED' : isSubmitting ? 'PROCESSING...' : 'VERIFY FLAG'}
                      </Button>
                    </form>

                    {feedback.message && !isSolved && !isSubmitting && (
                      <MotionDiv
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-lg flex items-center font-bold ${
                          feedback.type === 'error' 
                            ? 'bg-red-900/30 text-red-200 border-2 border-red-500/50' 
                            : feedback.type === 'success' 
                            ? 'bg-emerald-900/30 text-emerald-200 border-2 border-emerald-500/50' 
                            : 'bg-cyan-900/20 text-cyan-300 border border-cyan-500/20'
                        }`}
                      >
                        {feedback.type === 'error' ? <XCircle className="w-5 h-5 mr-3" /> :
                          feedback.type === 'success' ? <CheckCircle2 className="w-5 h-5 mr-3" /> :
                          <Info className="w-5 h-5 mr-3" />}
                        <span className="text-sm">{feedback.message}</span>
                      </MotionDiv>
                    )}
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            
            {/* Hint System */}
            <HintSystem 
              challengeId={challenge.id}
              userPoints={stats.points}
              onPointsUpdate={(newPoints) => {
                const newStats = { ...stats, points: newPoints };
                setStats(newStats);
                onUpdateStats(newStats);
              }}
            />

            {/* Challenge Metadata */}
            <Card className="border-slate-700 bg-slate-900/50">
              <div className="p-6">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
                  Challenge Info
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-slate-800">
                    <span className="text-slate-500 text-sm">Category</span>
                    <span className="text-slate-300 text-sm font-semibold capitalize">
                      {challenge.category || 'General'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-800">
                    <span className="text-slate-500 text-sm">Difficulty</span>
                    <span className={`text-sm font-bold uppercase ${
                      challenge.difficulty === 'easy' ? 'text-emerald-400' :
                      challenge.difficulty === 'medium' ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {challenge.difficulty}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-800">
                    <span className="text-slate-500 text-sm">Time Limit</span>
                    <span className="text-cyan-400 text-sm font-bold">
                      {challenge.duration ? Math.round(challenge.duration / 60) + ' min' : challenge.estimatedTime}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-500 text-sm">Reward</span>
                    <span className="text-emerald-400 text-sm font-bold flex items-center gap-1">
                      <Coins className="w-4 h-4" />
                      +{challenge.points} PTS
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* User Wallet */}
            <Card className="border-slate-700 bg-gradient-to-br from-yellow-900/20 to-yellow-900/5">
              <div className="p-6">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Coins className="w-4 h-4 text-yellow-400" />
                  Your Wallet
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">Balance</span>
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-400 font-mono font-bold text-2xl">{stats.points}</span>
                    <span className="text-yellow-400/60 font-mono text-sm">PTS</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Progress Stats */}
            <Card className="border-slate-700 bg-slate-900/50">
              <div className="p-6">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
                  Your Progress
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-sm">Solved</span>
                    <span className="text-emerald-400 font-bold">{stats.correct}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-sm">Total Attempts</span>
                    <span className="text-cyan-400 font-bold">{stats.total}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-sm">Success Rate</span>
                    <span className="text-yellow-400 font-bold">
                      {stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </MotionDiv>
  );
};

export default ChallengeDetailPage;
