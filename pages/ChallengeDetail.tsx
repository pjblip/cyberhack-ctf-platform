import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Flag, AlertTriangle, Terminal, CheckCircle2, XCircle, Coins, Timer, Download, FileCode, ArrowRight } from 'lucide-react';
import { Challenge, User, Stats } from '../types';
import { getSolvedCases, saveSolvedCase, saveStats, getUserStats, getUnlockedHints, saveUnlockedHint, getChallenges } from '../utils/storage';
import { db } from '../services/db';
import { generateChallengeFile } from '../utils/mockFileGenerator';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import GlitchText from '../components/ui/GlitchText';
import { playSuccessSound, playErrorSound, playClickSound } from '../utils/audio';
import { useToast } from '../components/ui/Toast';

interface ChallengeDetailProps {
  challenge: Challenge;
  currentUser: User | null;
  onBack: () => void;
  onUpdateStats: (stats: Stats) => void;
  onSelectChallenge: (challenge: Challenge) => void;
}

const HINT_COST = 50;
const SUBMISSION_COOLDOWN_MS = 2000;
const MAX_WRONG_ATTEMPTS = 3;
const LOCKOUT_DURATION_MS = 60000; // 60 seconds

const ChallengeDetailPage: React.FC<ChallengeDetailProps> = ({ challenge, currentUser, onBack, onUpdateStats, onSelectChallenge }) => {
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info' | null; message: string }>({ type: null, message: '' });
  const [isSolved, setIsSolved] = useState(false);
  const [isHintUnlocked, setIsHintUnlocked] = useState(false);
  const [stats, setStats] = useState<Stats>({ correct: 0, total: 0, points: 0 });
  const [timeLeft, setTimeLeft] = useState(challenge.duration || 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastAttemptTime, setLastAttemptTime] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const [lockoutTimeLeft, setLockoutTimeLeft] = useState(0);
  const [attemptLoaded, setAttemptLoaded] = useState(false);
  const [nextChallenge, setNextChallenge] = useState<Challenge | null>(null);

  const { addToast } = useToast();
  const MotionDiv = motion.div as any;

  // Generate localStorage keys for this user and challenge
  const getLockoutKey = () => `lockout_${currentUser?.id}_${challenge.id}`;
  const getAttemptsKey = () => `attempts_${currentUser?.id}_${challenge.id}`;

  // Load lockout state from localStorage on mount
  useEffect(() => {
    if (!currentUser) return;

    const lockoutKey = getLockoutKey();
    const attemptsKey = getAttemptsKey();

    const storedLockout = localStorage.getItem(lockoutKey);
    const storedAttempts = localStorage.getItem(attemptsKey);

    if (storedLockout) {
      const lockoutTime = parseInt(storedLockout);
      if (Date.now() < lockoutTime) {
        // Lockout still active
        setLockoutUntil(lockoutTime);
        setWrongAttempts(parseInt(storedAttempts || '0'));
        const remaining = Math.ceil((lockoutTime - Date.now()) / 1000);
        addToast(`Still locked out. ${remaining}s remaining.`, 'error');
      } else {
        // Lockout expired, clear it
        localStorage.removeItem(lockoutKey);
        localStorage.removeItem(attemptsKey);
      }
    }
  }, [currentUser, challenge.id]);

  // Lockout countdown
  useEffect(() => {
    if (!lockoutUntil) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((lockoutUntil - now) / 1000));
      setLockoutTimeLeft(remaining);

      if (remaining === 0) {
        setLockoutUntil(null);
        setWrongAttempts(0);
        setFeedback({ type: 'info', message: 'Lockout expired. You can try again.' });

        // Clear from localStorage
        if (currentUser) {
          localStorage.removeItem(getLockoutKey());
          localStorage.removeItem(getAttemptsKey());
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lockoutUntil, currentUser, challenge.id]);

  // Format challenge description with highlighting
  const formatChallengeDescription = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      // Check if line contains URL
      const urlMatch = line.match(/(https?:\/\/[^\s]+)/g);
      if (urlMatch) {
        const parts = line.split(/(https?:\/\/[^\s]+)/g);
        return (
          <p key={idx}>
            {parts.map((part, i) => {
              if (part.match(/^https?:\/\//)) {
                return (
                  <span key={i} className="inline-block bg-cyan-900/30 border border-cyan-500/50 text-cyan-300 px-3 py-1 rounded font-mono text-base my-1 hover:bg-cyan-500/20 transition-colors">
                    {part}
                  </span>
                );
              }
              return <span key={i}>{part}</span>;
            })}
          </p>
        );
      }

      // Check if line contains hex code (like: 1b 07 1f 1b 42...)
      const hexMatch = line.match(/^Ciphertext.*:|^[0-9a-f\s]{20,}$/i);
      if (hexMatch || line.includes('Ciphertext (hex):')) {
        if (line.includes('Ciphertext (hex):')) {
          return (
            <p key={idx} className="font-bold text-yellow-400">
              {line}
            </p>
          );
        }
        return (
          <div key={idx} className="bg-slate-950/80 border border-yellow-500/30 rounded-lg p-4 font-mono text-yellow-300 text-sm my-2 overflow-x-auto">
            {line}
          </div>
        );
      }

      // Check if line contains flag format example
      if (line.includes('flag{') || line.includes('Example:')) {
        return (
          <p key={idx} className="font-mono text-emerald-400 bg-emerald-900/20 border border-emerald-500/30 px-3 py-2 rounded my-1">
            {line}
          </p>
        );
      }

      // Check if line starts with "Start here:" or similar important markers
      if (line.match(/^(Start here:|Download|Make a request to:|Their GitHub username)/i)) {
        return (
          <p key={idx} className="font-bold text-cyan-400 mt-3">
            {line}
          </p>
        );
      }

      // Regular line
      return line.trim() ? <p key={idx}>{line}</p> : <br key={idx} />;
    });
  };

  // Initialize Data and Timer
  useEffect(() => {
    const init = async () => {
      if (currentUser) {
        const solved = await getSolvedCases(currentUser.id);
        setIsSolved(solved.includes(challenge.id));

        const currentStats = await getUserStats(currentUser.id);
        setStats(currentStats);

        const unlocked = await getUnlockedHints(currentUser.id);
        setIsHintUnlocked(unlocked.includes(challenge.id));

        // Load all challenges to find next one
        const challenges = await getChallenges();

        // Find next challenge in same difficulty tier
        const sameTierChallenges = challenges
          .filter(c => c.difficulty === challenge.difficulty)
          .sort((a, b) => a.id.localeCompare(b.id)); // Sort by ID

        const currentIndex = sameTierChallenges.findIndex(c => c.id === challenge.id);
        if (currentIndex !== -1 && currentIndex < sameTierChallenges.length - 1) {
          setNextChallenge(sameTierChallenges[currentIndex + 1]);
        } else {
          setNextChallenge(null); // No next challenge in this tier
        }

        // Check if challenge was already started
        if (!solved.includes(challenge.id)) {
          const attempt = await db.challenges.getAttempt(currentUser.id, challenge.id);

          if (attempt) {
            // Challenge already started - use remaining time
            setTimeLeft(attempt.timeLeft);
            if (attempt.timeLeft === 0) {
              addToast('Time expired for this challenge', 'error');
            }
          } else {
            // Start new challenge attempt
            const newAttempt = await db.challenges.startChallenge(
              currentUser.id,
              challenge.id,
              challenge.duration || 60
            );
            setTimeLeft(newAttempt.timeLeft);
          }
        }

        setAttemptLoaded(true);
      }
    };
    init();
  }, [currentUser, challenge.id]);

  // Timer Logic - only run if attempt is loaded
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
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    // Check if locked out
    if (lockoutUntil && Date.now() < lockoutUntil) {
      setFeedback({ type: 'error', message: `Locked out. Try again in: ${lockoutTimeLeft}s` });
      return;
    }

    // Rate Limiting Check
    const now = Date.now();
    if (now - lastAttemptTime < SUBMISSION_COOLDOWN_MS) {
      setFeedback({ type: 'error', message: `Cooldown Active. Wait...` });
      return;
    }

    if (timeLeft === 0 && !isSolved) {
      playErrorSound();
      setFeedback({ type: 'error', message: 'Mission Failed. Time Limit Exceeded.' });
      return;
    }

    const sanitizedAnswer = answer.trim();
    if (!sanitizedAnswer) return;

    if (isSolved) {
      setFeedback({ type: 'success', message: 'Challenge already completed.' });
      return;
    }

    setLastAttemptTime(now);
    setIsSubmitting(true);

    // Call Google Sheet Backend
    const result = await db.challenges.submitFlag(currentUser.id, challenge.id, sanitizedAnswer);

    // Refresh local stats
    const currentStats = await getUserStats(currentUser.id);
    let newStats = { ...currentStats };

    setIsSubmitting(false);

    if (result.success) {
      // Success - reset wrong attempts and clear localStorage
      setWrongAttempts(0);
      setLockoutUntil(null);

      // Clear lockout data from localStorage
      localStorage.removeItem(getLockoutKey());
      localStorage.removeItem(getAttemptsKey());

      await saveSolvedCase(currentUser.id, challenge.id); // Update local cache

      // Update local stats display based on backend result
      newStats.correct += 1;
      newStats.points = result.points || (currentStats.points + challenge.points);

      // Update cache
      await saveStats(currentUser.id, newStats);

      playSuccessSound();
      onUpdateStats(newStats);
      setIsSolved(true);
      setFeedback({ type: 'success', message: `Access Granted. +${challenge.points} Points.` });
    } else {
      // Failure - increment wrong attempts and save to localStorage
      const newWrongAttempts = wrongAttempts + 1;
      setWrongAttempts(newWrongAttempts);

      // Save attempts to localStorage
      localStorage.setItem(getAttemptsKey(), newWrongAttempts.toString());

      playErrorSound();

      if (newWrongAttempts >= MAX_WRONG_ATTEMPTS) {
        // Lock out the user
        const lockoutTime = Date.now() + LOCKOUT_DURATION_MS;
        setLockoutUntil(lockoutTime);
        setLockoutTimeLeft(60);

        // Save lockout time to localStorage
        localStorage.setItem(getLockoutKey(), lockoutTime.toString());

        setFeedback({ type: 'error', message: `Too many wrong attempts! Locked for 60 seconds.` });
      } else {
        const attemptsLeft = MAX_WRONG_ATTEMPTS - newWrongAttempts;
        setFeedback({ type: 'error', message: `Invalid flag. ${attemptsLeft} attempt${attemptsLeft !== 1 ? 's' : ''} left before lockout.` });
      }
    }
    setAnswer('');
  };

  const purchaseHint = async () => {
    if (!currentUser) return;
    playClickSound();

    if (stats.points >= HINT_COST) {
      const newStats = { ...stats, points: stats.points - HINT_COST };
      // Ideally we update this on backend too, but for Sheets simplicity we handle points locally for hints
      await saveStats(currentUser.id, newStats);
      await saveUnlockedHint(currentUser.id, challenge.id);

      setStats(newStats);
      onUpdateStats(newStats);
      setIsHintUnlocked(true);
      addToast(`Intelligence Decrypted. -${HINT_COST} Credits`, 'info');
    } else {
      playErrorSound();
      addToast(`Insufficient Funds. Required: ${HINT_COST} PTS`, 'error');
    }
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    playClickSound();

    // Check if challenge has a real file URL (that is not 'mock')
    if (challenge.fileUrl && challenge.fileUrl !== 'mock') {
      try {
        // Construct path - assuming files are in /challenge-files/
        // If the URL is absolute or has a different path, this might need adjustment,
        // but for now we assume fileUrl is just the filename like "web001.html"
        const filePath = challenge.fileUrl.startsWith('http') || challenge.fileUrl.startsWith('/')
          ? challenge.fileUrl
          : `/challenge-files/${challenge.fileUrl}`;

        const response = await fetch(filePath);
        if (!response.ok) throw new Error('File download failed');

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = challenge.fileUrl.split('/').pop() || 'download';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        setFeedback({ type: 'info', message: 'Asset downloaded from archives.' });
        return;
      } catch (err) {
        console.error("Download error:", err);
        // Fallback to mock generator if real download fails? 
        // Or just show error? Let's try mock as fallback if it exists.
      }
    }

    // Fallback: Use Mock Generator
    const fileData = generateChallengeFile(challenge.id);

    if (!fileData) {
      setFeedback({ type: 'error', message: 'Error: Data fragment corrupted. File unavailable.' });
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

    setFeedback({ type: 'info', message: 'Asset generated from virtual storage.' });
  };

  const getTimerColor = () => {
    if (isSolved) return 'text-emerald-500 border-emerald-500/50 bg-emerald-900/20';
    if (timeLeft === 0) return 'text-red-600 border-red-600/50 bg-red-900/20 animate-pulse';
    if (timeLeft < 30) return 'text-red-500 border-red-500/50 bg-red-900/20 animate-pulse';
    return 'text-cyan-400 border-cyan-500/30 bg-cyan-900/20';
  };

  const handleNextChallenge = () => {
    if (nextChallenge) {
      playClickSound();
      onSelectChallenge(nextChallenge);
    }
  };

  return (
    <MotionDiv
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-4xl mx-auto py-8"
    >
      <div className="flex justify-between items-center mb-8">
        <button
          onClick={() => { playClickSound(); onBack(); }}
          className="flex items-center text-slate-400 hover:text-cyan-400 transition-colors font-mono text-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> GO PREVIOUS QUESTION ({challenge.difficulty.toUpperCase()})
        </button>

        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-3 px-6 py-2 rounded-lg border font-mono text-xl font-bold shadow-lg ${getTimerColor()}`}>
            <Timer className={`w-6 h-6 ${timeLeft < 30 && !isSolved ? 'animate-bounce' : ''}`} />
            {isSolved ? 'COMPLETE' : formatTime(timeLeft)}
          </div>

          {isSolved && nextChallenge && (
            <button
              onClick={handleNextChallenge}
              className="flex items-center text-emerald-400 hover:text-emerald-300 transition-colors font-mono text-sm bg-emerald-900/20 border border-emerald-500/30 px-4 py-2 rounded-lg hover:bg-emerald-900/30"
            >
              NEXT_CHALLENGE <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Terminal className="w-32 h-32 text-cyan-500" />
            </div>

            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-slate-800 text-slate-300 text-xs font-bold uppercase rounded border border-slate-600">
                {challenge.difficulty}
              </span>
              <span className="text-cyan-400 font-mono font-bold">{challenge.points} PTS</span>
            </div>

            <h1 className="text-3xl font-bold text-white mb-4"><GlitchText text={challenge.title} /></h1>
            <div className="text-slate-300 text-lg leading-relaxed mb-8 space-y-4">
              {formatChallengeDescription(challenge.description)}
            </div>

            {challenge.fileUrl && (
              <div className="mb-8">
                <h4 className="text-sm font-bold text-slate-400 uppercase mb-3 flex items-center">
                  <FileCode className="w-4 h-4 mr-2" /> Mission Assets
                </h4>
                <div className="flex items-center bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-cyan-500/50 transition-colors group">
                  <div className="w-10 h-10 bg-slate-800 rounded flex items-center justify-center mr-4 group-hover:bg-cyan-900/30 transition-colors">
                    <FileCode className="w-6 h-6 text-cyan-500" />
                  </div>
                  <div className="flex-grow">
                    <div className="text-white font-mono text-sm">mission_asset_{challenge.id}.dat</div>
                    <div className="text-xs text-slate-500">Binary Execution / Analysis Required</div>
                  </div>
                  <button
                    onClick={handleDownload}
                    className="px-4 py-2 bg-cyan-900/20 text-cyan-400 border border-cyan-500/30 rounded flex items-center hover:bg-cyan-500 hover:text-black transition-all text-sm font-bold cursor-pointer"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    DOWNLOAD
                  </button>
                </div>
              </div>
            )}

            <div className={`bg-black/40 rounded-lg p-6 border-l-4 ${isHintUnlocked ? 'border-yellow-500' : 'border-slate-700'} transition-all duration-300`}>
              <h3 className={`${isHintUnlocked ? 'text-yellow-500' : 'text-slate-400'} font-bold mb-2 flex items-center transition-colors`}>
                <AlertTriangle className="w-5 h-5 mr-2" /> INTELLIGENCE HINTS
              </h3>

              <AnimatePresence mode="wait">
                {isHintUnlocked ? (
                  <motion.div
                    key="unlocked"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="space-y-2 mt-2 pt-2 border-t border-slate-700/50">
                      {(challenge.hints || [challenge.hint]).filter(Boolean).map((hint, idx) => (
                        <p key={idx} className="text-slate-400 font-mono text-sm">
                          <span className="text-yellow-500 mr-2">└─</span>{hint}
                        </p>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="locked"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-start gap-3"
                  >
                    <p className="text-slate-500 font-mono text-sm italic">
                      [ENCRYPTED CONTENT] Purchase decryption key to view {(challenge.hints?.length || 1)} intelligence hint(s).
                    </p>
                    <Button
                      onClick={purchaseHint}
                      variant="ghost"
                      className="bg-yellow-900/10 text-yellow-500 border border-yellow-500/30 hover:bg-yellow-500 hover:text-black transition-all text-xs py-2 px-4 shadow-[0_0_10px_rgba(234,179,8,0.1)] hover:shadow-[0_0_15px_rgba(234,179,8,0.4)]"
                    >
                      <Coins className="w-4 h-4 mr-2" />
                      DECRYPT HINTS (-{HINT_COST} PTS)
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-8 relative overflow-hidden">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <Flag className="w-6 h-6 mr-3 text-cyan-500" />
              Submit Flag
            </h3>

            <AnimatePresence>
              {isSubmitting && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-slate-900/95 z-20 flex flex-col items-center justify-center"
                >
                  <div className="font-mono text-cyan-500 mb-4 animate-pulse">VERIFYING HASH...</div>
                  <div className="w-48 h-2 bg-slate-800 rounded overflow-hidden">
                    <motion.div
                      className="h-full bg-cyan-500"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 1.0, ease: "easeInOut" }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {isSolved ? (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-6 text-center"
              >
                <div className="inline-flex p-3 rounded-full bg-emerald-900/50 text-emerald-400 mb-4 shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold text-emerald-400 mb-2">Challenge Conquered</h4>
                <p className="text-emerald-200/70 mb-6">Flag captured successfully. Good work, agent.</p>
                <Button
                  onClick={() => { playClickSound(); onBack(); }}
                  variant="primary"
                  className="w-full"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to Challenges
                </Button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  placeholder="flag{...}"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="font-mono"
                  disabled={timeLeft === 0 || isSubmitting}
                />
                <Button type="submit" className="w-full" disabled={timeLeft === 0 || isSubmitting}>
                  {timeLeft === 0 ? 'TIME EXPIRED' : isSubmitting ? 'PROCESSING...' : 'VERIFY FLAG'}
                </Button>
              </form>
            )}

            {(feedback.message && !isSolved && !isSubmitting) && (
              <MotionDiv
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  x: feedback.type === 'error' ? [0, -10, 10, -10, 10, 0] : 0
                }}
                transition={{
                  duration: feedback.type === 'error' ? 0.5 : 0.3,
                  x: { duration: 0.4 }
                }}
                className={`mt-6 p-4 rounded-lg flex items-center font-bold ${feedback.type === 'error' ? 'bg-red-900/30 text-red-200 border-2 border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.3)]' :
                  feedback.type === 'success' ? 'bg-emerald-900/30 text-emerald-200 border-2 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.3)]' :
                    'bg-cyan-900/20 text-cyan-300 border border-cyan-500/20'
                  }`}
              >
                {feedback.type === 'error' ? <XCircle className="w-5 h-5 mr-3 flex-shrink-0 animate-pulse" /> :
                  feedback.type === 'success' ? <CheckCircle2 className="w-5 h-5 mr-3 flex-shrink-0" /> :
                    <FileCode className="w-5 h-5 mr-3 flex-shrink-0" />}
                <span className="uppercase tracking-wide text-sm">
                  {feedback.type === 'error' ? '❌ INVALID FLAG' : feedback.type === 'success' ? '✅ ACCESS GRANTED' : feedback.message}
                </span>
              </MotionDiv>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Metadata</h3>
            <div className="space-y-4 font-mono text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">ID</span>
                <span className="text-slate-300">{challenge.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Category</span>
                <span className="text-slate-300 capitalize">
                  {challenge.category || 'General'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Time Limit</span>
                <span className="text-cyan-400">{challenge.duration ? Math.round(challenge.duration / 60) + ' min' : challenge.estimatedTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Reward</span>
                <span className="text-emerald-400">+{challenge.points} PTS</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Wallet</h3>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Current Balance</span>
              <span className="text-yellow-400 font-mono font-bold text-lg">{stats.points} PTS</span>
            </div>
          </div>
        </div>
      </div>
    </MotionDiv>
  );
};

export default ChallengeDetailPage;