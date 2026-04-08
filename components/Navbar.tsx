import { useState, useEffect } from 'react';
import { Shield, Trophy, Target, LogOut, User as UserIcon, Wifi, Menu, X, Volume2, VolumeX, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Stats } from '../types';
import { playHoverSound, playClickSound, toggleAudio, getAudioStatus } from '../utils/audio';
import EventCountdown from './EventCountdown';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  userStats: Stats;
  isLoggedIn: boolean;
  onLogout: () => void;
  username?: string;
  isAdmin?: boolean;
  onOpenProfile?: () => void;
  isLiveMode?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate, userStats, isLoggedIn, onLogout, username, isAdmin, onOpenProfile, isLiveMode = false }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(getAudioStatus());
  const [imgError, setImgError] = useState(false);

  const handleToggleMute = () => {
    const newState = toggleAudio();
    setIsMuted(newState);
    if (!newState) playClickSound();
  };

  const NavItem = ({ page, label, icon: Icon, onClick, danger }: { page: string; label: string; icon?: React.ElementType, onClick?: () => void, danger?: boolean }) => {
    const isActive = currentPage === page || (page === '/challenges' && currentPage.startsWith('/challenge'));
    return (
      <button
        onClick={() => {
          playClickSound();
          onNavigate(page);
          if (onClick) onClick();
        }}
        onMouseEnter={() => playHoverSound()}
        className={`relative flex items-center px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 z-10 w-full md:w-auto ${isActive ? 'text-white' : danger ? 'text-red-400 hover:text-red-300' : 'text-slate-400 hover:text-cyan-200'
          }`}
      >
        {isActive && (
          <motion.div
            layoutId="navbar-active"
            className={`absolute inset-0 bg-gradient-to-r ${danger ? 'from-red-900/40 to-red-600/20 border-red-500/30' : 'from-cyan-500/20 to-purple-500/20 border-cyan-500/30'} border rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.15)]`}
            initial={false}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
        <span className="relative z-10 flex items-center">
          {Icon && <Icon className="w-4 h-4 mr-2" />}
          {label}
        </span>
      </button>
    );
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#020617]/80 backdrop-blur-xl">
      {/* Gradient Line at Bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-6">
            <div
              className="flex items-center cursor-pointer group"
              onClick={() => { playClickSound(); onNavigate('/'); }}
              onMouseEnter={() => playHoverSound()}
            >
              {/* White Background Container for Logo Visibility */}
              <div className="bg-white/95 px-3 py-1.5 rounded-md shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:bg-white transition-colors duration-300">
                {!imgError ? (
                  <img
                    src="https://www.gandhinagaruni.ac.in/wp-content/uploads/2022/04/footer-logo.png"
                    alt="Gandhinagar University"
                    className="h-8 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <span className="text-cyan-900 font-bold font-mono text-sm tracking-tighter">
                    GANDHINAGAR UNI
                  </span>
                )}
              </div>
            </div>

            {/* Network Status Indicator */}
            <div className={`hidden lg:flex items-center text-[10px] font-mono border px-2 py-1 rounded-full ${isLiveMode ? 'border-emerald-500/30 bg-emerald-900/10 text-emerald-400' : 'border-yellow-500/30 bg-yellow-900/10 text-yellow-400'}`}>
              <div className={`w-1.5 h-1.5 rounded-full mr-2 ${isLiveMode ? 'bg-emerald-500' : 'bg-yellow-500'} animate-pulse`} />
              {isLiveMode ? 'NET: LIVE' : 'NET: SIM'}
            </div>

            {/* Event Countdown Timer */}
            <div className="hidden lg:block">
              <EventCountdown
                eventDuration={60}
                eventStartTime={(() => {
                  const stored = localStorage.getItem('cyberhack_event_start');
                  if (stored) return parseInt(stored);
                  const now = Date.now();
                  localStorage.setItem('cyberhack_event_start', now.toString());
                  return now;
                })()}
              />
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {!isAdmin && <NavItem page="/" label="Home" />}
            {!isAdmin && <NavItem page="/challenges" label="Challenges" icon={Target} />}
            {!isAdmin && <NavItem page="/resources" label="Training" icon={BookOpen} />}
            {isAdmin && <NavItem page="/admin" label="Admin Panel" icon={Shield} danger />}
          </div>

          <div className="flex items-center space-x-4">
            {/* Audio Toggle */}
            <button
              onClick={handleToggleMute}
              className="p-2 text-slate-400 hover:text-cyan-400 transition-colors"
              title={isMuted ? "Unmute Audio" : "Mute Audio"}
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>

            {isLoggedIn ? (
              <>
                <button
                  onClick={() => { playClickSound(); onOpenProfile && onOpenProfile(); }}
                  onMouseEnter={() => playHoverSound()}
                  className="hidden sm:flex items-center px-3 py-1 bg-slate-900/50 rounded-full border border-slate-700 hover:border-purple-500/50 transition-colors group"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center mr-2 border border-slate-600 group-hover:border-purple-500">
                    <UserIcon className="w-3 h-3 text-slate-400 group-hover:text-purple-400" />
                  </div>
                  <span className="text-xs font-mono text-slate-300 mr-3 group-hover:text-white transition-colors">{username}</span>
                  <div className="h-4 w-px bg-slate-700 mr-3"></div>
                  <span className="text-sm font-bold text-cyan-400 font-mono">{userStats.points} PTS</span>
                </button>
                <button
                  onClick={() => { playClickSound(); onLogout(); }}
                  onMouseEnter={() => playHoverSound()}
                  className="hidden sm:block p-2 text-slate-400 hover:text-red-400 transition-colors hover:bg-red-900/10 rounded-full"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <div className="hidden sm:flex space-x-2">
                <button
                  onClick={() => { playClickSound(); onNavigate('/login'); }}
                  onMouseEnter={() => playHoverSound()}
                  className="text-sm font-semibold text-slate-300 hover:text-white px-3 py-2 transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => { playClickSound(); onNavigate('/signup'); }}
                  onMouseEnter={() => playHoverSound()}
                  className="text-sm font-semibold bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white px-4 py-2 rounded-lg transition-all shadow-[0_0_10px_rgba(168,85,247,0.3)] hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] border border-white/10"
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-slate-400 hover:text-white"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-slate-950/95 border-b border-slate-800 backdrop-blur-xl overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              {!isAdmin && <NavItem page="/" label="Home" onClick={() => setIsMobileMenuOpen(false)} />}
              {!isAdmin && <NavItem page="/challenges" label="Challenges" icon={Target} onClick={() => setIsMobileMenuOpen(false)} />}
              {!isAdmin && <NavItem page="/resources" label="Training" icon={BookOpen} onClick={() => setIsMobileMenuOpen(false)} />}
              {isAdmin && <NavItem page="/admin" label="Admin Panel" icon={Shield} onClick={() => setIsMobileMenuOpen(false)} danger />}

              {/* Mobile Auth Buttons */}
              <div className="border-t border-slate-800 mt-4 pt-4 flex flex-col space-y-3">
                {isLoggedIn ? (
                  <>
                    <div className="flex items-center justify-between px-4">
                      <span className="text-slate-400">{username}</span>
                      <span className="text-cyan-400 font-bold">{userStats.points} PTS</span>
                    </div>
                    <button
                      onClick={() => { onLogout(); setIsMobileMenuOpen(false); }}
                      className="flex items-center justify-center w-full p-2 text-red-400 hover:bg-red-900/10 rounded-lg"
                    >
                      <LogOut className="w-4 h-4 mr-2" /> Logout
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col space-y-2 px-4">
                    <button
                      onClick={() => { onNavigate('/login'); setIsMobileMenuOpen(false); }}
                      className="w-full text-center py-2 text-slate-300 border border-slate-700 rounded-lg"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => { onNavigate('/signup'); setIsMobileMenuOpen(false); }}
                      className="w-full text-center py-2 bg-gradient-to-r from-cyan-600 to-purple-600 text-white rounded-lg"
                    >
                      Sign Up
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;