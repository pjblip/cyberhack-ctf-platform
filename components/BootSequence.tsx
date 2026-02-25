import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Terminal } from 'lucide-react';

const BOOT_STEPS = [
  { text: "BIOS CHECK", status: "OK", time: 200 },
  { text: "LOADING KERNEL", status: "LOADED", time: 400 },
  { text: "MOUNTING VOLUMES", status: "MOUNTED", time: 600 },
  { text: "CRYPTOGRAPHY ENGINE", status: "ACTIVE", time: 800 },
  { text: "NETWORK INTERFACE", status: "UP", time: 1000 },
  { text: "ESTABLISHING VPN", status: "SECURE", time: 1400 },
  { text: "USER PROFILE", status: "VERIFIED", time: 1800 },
];

interface BootSequenceProps {
  onComplete: () => void;
  isDataReady: boolean;
}

const BootSequence: React.FC<BootSequenceProps> = ({ onComplete, isDataReady }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const completionTriggered = useRef(false);
  
  useEffect(() => {
    // Progress Bar Animation
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2; // Speed up loading
      });
    }, 30);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Step Animation
    if (currentStep < BOOT_STEPS.length) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 250); // Faster steps
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  useEffect(() => {
    // Only complete if progress is done, steps are shown, data is ready, AND we haven't triggered yet.
    if (progress === 100 && currentStep === BOOT_STEPS.length && isDataReady && !completionTriggered.current) {
      completionTriggered.current = true;
      const timer = setTimeout(onComplete, 800); // Short pause at 100%
      return () => clearTimeout(timer);
    }
  }, [progress, currentStep, isDataReady, onComplete]);

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center font-mono text-cyan-500">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
      
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-lg p-8 relative z-10"
      >
        <div className="flex items-center justify-center mb-12">
           <Terminal className="w-12 h-12 text-cyan-400 mr-4 animate-pulse" />
           <div>
             <h1 className="text-2xl font-bold text-white tracking-widest">GU_SEC<span className="text-cyan-500">_OS</span></h1>
             <div className="text-xs text-slate-500">v4.0.2 GANDHINAGAR_EDITION</div>
           </div>
        </div>

        <div className="space-y-2 mb-8 h-48 overflow-hidden font-bold text-xs md:text-sm">
           {BOOT_STEPS.map((step, i) => (
             <motion.div 
               key={i}
               initial={{ opacity: 0, x: -10 }}
               animate={{ opacity: i <= currentStep ? 1 : 0, x: 0 }}
               className="flex justify-between border-b border-slate-900/50 pb-1"
             >
               <span className="text-cyan-600">&gt; {step.text}...</span>
               <span className={i === currentStep ? "text-yellow-500 animate-pulse" : "text-emerald-500"}>
                 [{i === currentStep ? "WORKING" : step.status}]
               </span>
             </motion.div>
           ))}
        </div>

        {/* Loading Bar */}
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-2">
           <motion.div 
             className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)]"
             style={{ width: `${progress}%` }}
           />
        </div>
        <div className="flex justify-between text-xs text-slate-500">
           <span>SYSTEM INTEGRITY</span>
           <span>{progress}%</span>
        </div>
      </motion.div>

      {/* Decorative Corners */}
      <div className="absolute top-8 left-8 w-16 h-16 border-t-2 border-l-2 border-cyan-500/30"></div>
      <div className="absolute top-8 right-8 w-16 h-16 border-t-2 border-r-2 border-cyan-500/30"></div>
      <div className="absolute bottom-8 left-8 w-16 h-16 border-b-2 border-l-2 border-cyan-500/30"></div>
      <div className="absolute bottom-8 right-8 w-16 h-16 border-b-2 border-r-2 border-cyan-500/30"></div>
    </div>
  );
};

export default BootSequence;