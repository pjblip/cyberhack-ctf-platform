import { useState, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate, useLocation, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { getUserStats } from './utils/storage';
import Navbar from './components/Navbar';
import HomePage from './pages/Home';
import ChallengesPage from './pages/Challenges';
import ChallengeDetailPage from './pages/ChallengeDetail';
import AdminPage from './pages/Admin';
import AuthPage from './pages/Auth';
import ResourcesPage from './pages/Resources';
import NotFound from './pages/NotFound';
import { User, Challenge, Stats } from './types';
import { ShieldAlert, Wifi, Activity, Cpu } from 'lucide-react';
import Button from './components/ui/Button';
import ProfileModal from './components/ProfileModal';
import { ToastProvider, useToast } from './components/ui/Toast';
import { ACHIEVEMENTS } from './constants';
import BootSequence from './components/BootSequence';
import CursorEffect from './components/CursorEffect';
import { db } from './services/db';
import RealtimeNotifications from './components/RealtimeNotifications';
import OnlineUsers from './components/OnlineUsers';
import { unsubscribeAll } from './services/realtime';
import ErrorBoundary from './components/ErrorBoundary';
import WelcomeScreen from './components/WelcomeScreen';

// Loader component that fetches a challenge by ID when selectedCase is null (e.g. page refresh)
interface ChallengeDetailLoaderProps {
  selectedCase: Challenge | null;
  currentUser: User | null;
  onBack: () => void;
  onUpdateStats: (stats: Stats) => void;
  onSelectChallenge: (challenge: Challenge) => void;
  onSetCase: (challenge: Challenge) => void;
}

function ChallengeDetailLoader({ selectedCase, currentUser, onBack, onUpdateStats, onSelectChallenge, onSetCase }: ChallengeDetailLoaderProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!selectedCase);

  useEffect(() => {
    if (selectedCase || !id) return;
    // Challenge not in state (page refresh / direct URL) — fetch it
    import('./utils/storage').then(({ getChallenges }) => {
      getChallenges().then(challenges => {
        const found = challenges.find(c => c.id === id);
        if (found) {
          onSetCase(found);
        } else {
          navigate('/challenges', { replace: true });
        }
        setLoading(false);
      }).catch(() => {
        navigate('/challenges', { replace: true });
      });
    });
  }, [id, selectedCase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-40">
        <div className="font-mono text-cyan-500 animate-pulse text-lg">LOADING MISSION DATA...</div>
      </div>
    );
  }

  if (!selectedCase) return null;

  const pageVariants = {
    initial: { opacity: 0, filter: 'blur(10px)', scale: 0.98 },
    animate: { opacity: 1, filter: 'blur(0px)', scale: 1 },
    exit: { opacity: 0, filter: 'blur(10px)', scale: 1.02 }
  };
  const pageTransition = { duration: 0.4, ease: [0.43, 0.13, 0.23, 0.96] as [number, number, number, number] };

  return (
    <motion.div key="challenge-detail" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}>
      <ChallengeDetailPage
        challenge={selectedCase}
        currentUser={currentUser}
        onBack={onBack}
        onUpdateStats={onUpdateStats}
        onSelectChallenge={onSelectChallenge}
      />
    </motion.div>
  );
}

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedCase, setSelectedCase] = useState<Challenge | null>(null);
  const [userStats, setUserStats] = useState<Stats>({ correct: 0, total: 0, points: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const [isBooting, setIsBooting] = useState(() => {
    return !sessionStorage.getItem('cyberhack_booted');
  });

  const [showWelcome, setShowWelcome] = useState(() => {
    return !localStorage.getItem('cyberhack_welcome_seen');
  });

  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const { addToast } = useToast();
  const unlockedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const storedUser = localStorage.getItem('cyberhack_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
        getUserStats(user.id).then(stats => {
          setUserStats(stats);
        });
        setTimeout(() => {
          addToast(`Welcome back, Agent ${user.username}`, 'info');
        }, 3000);
      } catch (e) { console.error(e); }
    }
    setIsLoading(false);

    // Cleanup realtime subscriptions on unmount
    return () => {
      unsubscribeAll();
    };
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    ACHIEVEMENTS.forEach(ach => {
      if (!unlockedRef.current.has(ach.id) && ach.condition(userStats)) {
        unlockedRef.current.add(ach.id);
        addToast(`Achievement Unlocked: ${ach.title}`, 'achievement');
      }
    });
  }, [userStats, currentUser, addToast]);

  const handleLogin = async (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('cyberhack_user', JSON.stringify(user));

    const stats = await getUserStats(user.id);
    setUserStats(stats);

    addToast('Authentication Successful. Access Granted.', 'success');

    if (user.isAdmin) {
      navigate('/admin');
    } else {
      navigate('/challenges');
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('cyberhack_user');
    setCurrentUser(null);
    setUserStats({ correct: 0, total: 0, points: 0 });
    setSelectedCase(null);
    unlockedRef.current.clear();
    addToast('Session Terminated.', 'info');
    navigate('/');
  };

  const navigateTo = (page: string) => {
    navigate(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCase = (challenge: Challenge) => {
    setSelectedCase(challenge);
    // Store the difficulty in sessionStorage so we can restore it when going back
    sessionStorage.setItem('lastDifficulty', challenge.difficulty);
    navigate('/challenge/' + challenge.id);
  };

  const handleBootComplete = () => {
    sessionStorage.setItem('cyberhack_booted', 'true');
    setIsBooting(false);
  };

  if (isBooting) {
    return <BootSequence onComplete={handleBootComplete} isDataReady={!isLoading} />;
  }

  // Show welcome screen after boot sequence
  if (showWelcome) {
    return <WelcomeScreen onClose={() => setShowWelcome(false)} />;
  }

  const pageVariants = {
    initial: { opacity: 0, filter: 'blur(10px)', scale: 0.98 },
    animate: { opacity: 1, filter: 'blur(0px)', scale: 1 },
    exit: { opacity: 0, filter: 'blur(10px)', scale: 1.02 }
  };
  const pageTransition = { duration: 0.4, ease: [0.43, 0.13, 0.23, 0.96] as [number, number, number, number] };

  const currentPath = location.pathname;
  const isAuthPage = currentPath === '/login' || currentPath === '/signup';

  return (

    <div className="relative min-h-screen text-slate-100 flex flex-col overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-100">

      <div className="scanlines"></div>
      <div className="vignette"></div>
      <CursorEffect />

      {currentUser && (
        <>
          <RealtimeNotifications currentUserId={currentUser.id} />
          <OnlineUsers currentUserId={currentUser.id} currentUsername={currentUser.username} />
        </>
      )}

      {!isAuthPage && (
        <Navbar
          currentPage={currentPath}
          onNavigate={navigateTo}
          userStats={userStats}
          isLoggedIn={!!currentUser}
          onLogout={handleLogout}
          username={currentUser?.username}
          isAdmin={currentUser?.isAdmin}
          onOpenProfile={() => setIsProfileOpen(true)}
          isLiveMode={db.isLive}
        />
      )}

      {currentUser && (
        <AnimatePresence>
          {isProfileOpen && (
            <ProfileModal
              isOpen={isProfileOpen}
              onClose={() => setIsProfileOpen(false)}
              user={currentUser}
              stats={userStats}
            />
          )}
        </AnimatePresence>
      )}

      <main className="flex-grow pt-24 px-6 pb-20 w-full z-10">
        <Routes>
          <Route path="/" element={
            <motion.div key="home" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}>
              <HomePage onNavigate={navigateTo} />
            </motion.div>
          } />

          <Route path="/login" element={
            <motion.div key="login" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}>
              <AuthPage
                mode="login"
                onLogin={handleLogin}
                onNavigate={navigateTo}
              />
            </motion.div>
          } />

          <Route path="/signup" element={
            <motion.div key="signup" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}>
              <AuthPage
                mode="signup"
                onLogin={handleLogin}
                onNavigate={navigateTo}
              />
            </motion.div>
          } />

          <Route path="/challenges" element={
            <motion.div key="challenges" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}>
              <ChallengesPage
                currentUser={currentUser}
                onSelectCase={handleSelectCase}
                onNavigate={navigateTo}
              />
            </motion.div>
          } />

          <Route path="/challenge/:id" element={
            <ChallengeDetailLoader
              selectedCase={selectedCase}
              currentUser={currentUser}
              onBack={() => navigate('/challenges')}
              onUpdateStats={(newStats) => setUserStats(newStats)}
              onSelectChallenge={handleSelectCase}
              onSetCase={setSelectedCase}
            />
          } />

          <Route path="/admin" element={
            currentUser?.isAdmin ? (
              <motion.div key="admin" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}>
                <AdminPage currentUser={currentUser} onNavigate={navigateTo} />
              </motion.div>
            ) : (
              <motion.div key="access-denied" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition} className="flex flex-col items-center justify-center py-20 text-center h-[60vh]">
                <div className="relative">
                  <div className="absolute inset-0 bg-red-500 blur-xl opacity-20 animate-pulse"></div>
                  <ShieldAlert className="w-24 h-24 text-red-500 mb-6 relative z-10" />
                </div>
                <h2 className="text-5xl font-black text-white mb-4 tracking-tighter">RESTRICTED AREA</h2>
                <p className="text-slate-400 mb-8 max-w-md text-lg border-l-2 border-red-500 pl-4">
                  Security Clearance Level 5 Required.<br />
                  This incident has been logged.
                </p>
                <Button variant="danger" onClick={() => navigate('/challenges')}>Return to Safety</Button>
              </motion.div>
            )
          } />

          <Route path="/resources" element={
            <motion.div key="resources" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}>
              <ResourcesPage />
            </motion.div>
          } />

          <Route path="*" element={
            <motion.div key="404" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}>
              <NotFound onNavigate={navigateTo} />
            </motion.div>
          } />
        </Routes>
      </main>

      {/* LIVE TELEMETRY FOOTER */}
      <footer className="fixed bottom-0 left-0 right-0 h-8 bg-slate-950/90 border-t border-slate-800 backdrop-blur-sm z-50 flex items-center justify-between px-4 text-[10px] font-mono text-slate-500 select-none">
        <div className="flex items-center space-x-6">
          <div className="flex items-center">
            <Wifi className="w-3 h-3 mr-2 text-emerald-500" />
            <span>LINK_ESTABLISHED</span>
          </div>
          <div className="hidden sm:flex items-center">
            <span className="mr-2">PING:</span>
            <span className="text-cyan-400">12ms</span>
          </div>
          <div className="hidden md:flex items-center">
            <span className="mr-2">ENCRYPTION:</span>
            <span className="text-emerald-400">AES-256-GCM</span>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <Activity className="w-3 h-3 text-yellow-500 animate-pulse" />
            <span>SERVER_LOAD</span>
            <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                animate={{ width: ["30%", "45%", "60%", "40%"] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="h-full bg-yellow-500"
              />
            </div>
          </div>
          <div className="hidden sm:flex items-center">
            <Cpu className="w-3 h-3 mr-2 text-purple-500" />
            <span>MEM: 14%</span>
          </div>
          <div>
            v4.0.2
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <HashRouter>
          <AppContent />
        </HashRouter>
      </ToastProvider>
    </ErrorBoundary>
  );
}