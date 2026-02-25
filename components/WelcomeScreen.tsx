import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wifi, Shield, Trophy, Clock, Flag, Zap, ChevronRight } from 'lucide-react';
import Button from './ui/Button';

interface WelcomeScreenProps {
  onClose: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      localStorage.setItem('cyberhack_welcome_seen', 'true');
      onClose();
    }, 300);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-xl"
        >
          {/* Animated Background Effects */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          </div>

          {/* Main Content Card */}
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25 }}
            className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900/90 border-2 border-cyan-500/30 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.3)] overflow-hidden"
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Scrollable Content */}
            <div className="overflow-y-auto max-h-[90vh] custom-scrollbar">
              {/* Header */}
              <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 border-b-2 border-cyan-500/30">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.05)_1px,transparent_1px)] bg-[size:20px_20px]" />
                
                <div className="relative z-10 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="inline-block mb-4"
                  >
                    <div className="relative">
                      <div className="absolute inset-0 bg-cyan-500/20 blur-2xl rounded-full animate-pulse" />
                      <Shield className="w-20 h-20 text-cyan-400 relative z-10" />
                    </div>
                  </motion.div>

                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-5xl font-black text-white mb-2 tracking-tight"
                  >
                    <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                      MYSTIC FLAG FORCE 2.0
                    </span>
                  </motion.h1>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-2"
                  >
                    <p className="text-xl text-cyan-400 font-bold font-mono">CyberHack CTF Platform</p>
                    <p className="text-slate-400 text-sm">Gandhinagar University</p>
                    <div className="flex items-center justify-center space-x-2 text-yellow-400 text-sm font-mono mt-3">
                      <Clock className="w-4 h-4" />
                      <span>Event Duration: 1 Hour</span>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Content Sections */}
              <div className="p-8 space-y-6">
                {/* WiFi Connection */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-slate-800/50 border border-cyan-500/20 rounded-xl p-6"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <Wifi className="w-6 h-6 text-cyan-400" />
                    <h3 className="text-xl font-bold text-white">Network Connection</h3>
                  </div>
                  <div className="space-y-2 text-slate-300 font-mono text-sm">
                    <p><span className="text-cyan-400">WiFi Name:</span> CyberHack_CTF</p>
                    <p><span className="text-cyan-400">Password:</span> Ask organizers</p>
                    <p><span className="text-cyan-400">Platform URL:</span> <span className="text-yellow-400">http://192.168.0.101:3002</span></p>
                  </div>
                </motion.div>

                {/* Getting Started */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-slate-800/50 border border-purple-500/20 rounded-xl p-6"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <Zap className="w-6 h-6 text-purple-400" />
                    <h3 className="text-xl font-bold text-white">Getting Started</h3>
                  </div>
                  <ol className="space-y-3 text-slate-300 text-sm">
                    <li className="flex items-start">
                      <span className="text-purple-400 font-bold mr-3">1.</span>
                      <span>Click <span className="text-cyan-400 font-bold">"Register"</span> to create your account</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-400 font-bold mr-3">2.</span>
                      <span>Choose a unique username (visible on leaderboard)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-400 font-bold mr-3">3.</span>
                      <span>Navigate to <span className="text-cyan-400 font-bold">"Challenges"</span> to see all missions</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-400 font-bold mr-3">4.</span>
                      <span>Select a difficulty tier and start solving!</span>
                    </li>
                  </ol>
                </motion.div>

                {/* Flag Format */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                  className="bg-slate-800/50 border border-emerald-500/20 rounded-xl p-6"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <Flag className="w-6 h-6 text-emerald-400" />
                    <h3 className="text-xl font-bold text-white">Flag Format</h3>
                  </div>
                  <div className="space-y-3">
                    <p className="text-slate-300 text-sm">All flags follow this format:</p>
                    <div className="bg-slate-950/50 border border-emerald-500/30 rounded-lg p-4 font-mono">
                      <span className="text-emerald-400 text-lg">flag&#123;your_answer_here&#125;</span>
                    </div>
                    <p className="text-slate-400 text-xs">
                      ⚠️ Flags are case-sensitive. Copy exactly as shown in challenges.
                    </p>
                  </div>
                </motion.div>

                {/* Points System */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                  className="bg-slate-800/50 border border-yellow-500/20 rounded-xl p-6"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <Trophy className="w-6 h-6 text-yellow-400" />
                    <h3 className="text-xl font-bold text-white">Points System</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-700">
                          <th className="text-left py-2 text-slate-400 font-mono">Difficulty</th>
                          <th className="text-center py-2 text-slate-400 font-mono">Points</th>
                          <th className="text-center py-2 text-slate-400 font-mono">Count</th>
                          <th className="text-right py-2 text-slate-400 font-mono">Time Limit</th>
                        </tr>
                      </thead>
                      <tbody className="font-mono">
                        <tr className="border-b border-slate-800">
                          <td className="py-3 text-emerald-400 font-bold">EASY</td>
                          <td className="text-center text-white">10 pts</td>
                          <td className="text-center text-slate-400">5</td>
                          <td className="text-right text-slate-400">5 min</td>
                        </tr>
                        <tr className="border-b border-slate-800">
                          <td className="py-3 text-yellow-400 font-bold">MEDIUM</td>
                          <td className="text-center text-white">50 pts</td>
                          <td className="text-center text-slate-400">4</td>
                          <td className="text-right text-slate-400">10 min</td>
                        </tr>
                        <tr>
                          <td className="py-3 text-red-400 font-bold">HARD</td>
                          <td className="text-center text-white">250 pts</td>
                          <td className="text-center text-slate-400">1</td>
                          <td className="text-right text-slate-400">30 min</td>
                        </tr>
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 border-cyan-500/30">
                          <td className="py-3 text-cyan-400 font-bold">TOTAL</td>
                          <td className="text-center text-cyan-400 font-bold">500 pts</td>
                          <td className="text-center text-cyan-400 font-bold">10</td>
                          <td className="text-right text-slate-400">-</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </motion.div>

                {/* Rules */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 }}
                  className="bg-slate-800/50 border border-red-500/20 rounded-xl p-6"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <Shield className="w-6 h-6 text-red-400" />
                    <h3 className="text-xl font-bold text-white">Rules & Guidelines</h3>
                  </div>
                  <ul className="space-y-2 text-slate-300 text-sm">
                    <li className="flex items-start">
                      <span className="text-red-400 mr-2">•</span>
                      <span>No attacking the platform or other participants</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-400 mr-2">•</span>
                      <span>No sharing flags or solutions with others</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-400 mr-2">•</span>
                      <span>Timer starts when you open a challenge</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-400 mr-2">•</span>
                      <span>3 wrong attempts = 60 second lockout</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-400 mr-2">•</span>
                      <span>Download challenge files from the "Files" page</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-400 mr-2">•</span>
                      <span>Ask organizers if you need help or hints</span>
                    </li>
                  </ul>
                </motion.div>

                {/* Tips */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.0 }}
                  className="bg-gradient-to-r from-cyan-900/20 to-purple-900/20 border border-cyan-500/30 rounded-xl p-6"
                >
                  <h3 className="text-lg font-bold text-cyan-400 mb-3">💡 Pro Tips</h3>
                  <ul className="space-y-2 text-slate-300 text-sm">
                    <li>✓ Start with EASY challenges to warm up</li>
                    <li>✓ Read challenge descriptions carefully</li>
                    <li>✓ Use browser DevTools (F12) for web challenges</li>
                    <li>✓ Check the Files page for downloadable resources</li>
                    <li>✓ Watch the leaderboard to track your progress</li>
                  </ul>
                </motion.div>

                {/* Useful Tools */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.1 }}
                  className="bg-slate-800/50 border border-cyan-500/20 rounded-xl p-6"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <Zap className="w-6 h-6 text-cyan-400" />
                    <h3 className="text-xl font-bold text-white">Useful Free Tools</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-700">
                          <th className="text-left py-2 text-slate-400 font-mono">Tool</th>
                          <th className="text-left py-2 text-slate-400 font-mono">Use For</th>
                          <th className="text-left py-2 text-slate-400 font-mono">Website</th>
                        </tr>
                      </thead>
                      <tbody className="font-mono text-xs">
                        <tr className="border-b border-slate-800 hover:bg-slate-700/30 transition-colors">
                          <td className="py-3 text-cyan-400 font-bold">CyberChef</td>
                          <td className="text-slate-300">Encoding / Decoding</td>
                          <td className="text-slate-400">
                            <a href="https://gchq.github.io/CyberChef" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">
                              gchq.github.io/CyberChef
                            </a>
                          </td>
                        </tr>
                        <tr className="border-b border-slate-800 hover:bg-slate-700/30 transition-colors">
                          <td className="py-3 text-emerald-400 font-bold">Base64decode.org</td>
                          <td className="text-slate-300">Base64 Decode</td>
                          <td className="text-slate-400">
                            <a href="https://www.base64decode.org" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">
                              base64decode.org
                            </a>
                          </td>
                        </tr>
                        <tr className="border-b border-slate-800 hover:bg-slate-700/30 transition-colors">
                          <td className="py-3 text-yellow-400 font-bold">rot13.com</td>
                          <td className="text-slate-300">ROT13 Cipher</td>
                          <td className="text-slate-400">
                            <a href="https://rot13.com" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">
                              rot13.com
                            </a>
                          </td>
                        </tr>
                        <tr className="border-b border-slate-800 hover:bg-slate-700/30 transition-colors">
                          <td className="py-3 text-purple-400 font-bold">HxD Hex Editor</td>
                          <td className="text-slate-300">Fix corrupted files</td>
                          <td className="text-slate-400">
                            <a href="https://mh-nexus.de/en/hxd" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">
                              mh-nexus.de/en/hxd
                            </a>
                          </td>
                        </tr>
                        <tr className="border-b border-slate-800 hover:bg-slate-700/30 transition-colors">
                          <td className="py-3 text-pink-400 font-bold">dcode.fr</td>
                          <td className="text-slate-300">Caesar / All ciphers</td>
                          <td className="text-slate-400">
                            <a href="https://www.dcode.fr" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">
                              dcode.fr
                            </a>
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-700/30 transition-colors">
                          <td className="py-3 text-slate-400 font-bold">Notepad / VS Code</td>
                          <td className="text-slate-300">View HTML source</td>
                          <td className="text-slate-400">Already installed</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="text-slate-500 text-xs mt-3 italic">
                    💡 Tip: These tools will help you solve crypto and forensics challenges!
                  </p>
                </motion.div>
              </div>

              {/* Footer Button */}
              <div className="sticky bottom-0 bg-gradient-to-t from-slate-900 via-slate-900 to-transparent p-6 border-t border-cyan-500/30">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 }}
                >
                  <Button
                    onClick={handleClose}
                    variant="primary"
                    className="w-full py-4 text-lg font-bold group relative overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center justify-center">
                      ENTER THE ARENA
                      <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomeScreen;
