import { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Code, Lock, Cpu, Bitcoin, Clock, AlertTriangle, ChevronRight, Zap, PlayCircle, Shield, Radio, Globe } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import GlitchText from '../components/ui/GlitchText';
import TypewriterText from '../components/ui/TypewriterText';
import EventCountdown from '../components/EventCountdown';
import ActivityFeed from '../components/ActivityFeed';
import Terminal from '../components/Terminal';

interface HomeProps {
  onNavigate: (page: string) => void;
}

const HomePage: React.FC<HomeProps> = ({ onNavigate }) => {
  const [imgError, setImgError] = useState(false);
  const MotionDiv = motion.div as any;
  const MotionH1 = motion.h1 as any;
  const MotionP = motion.p as any;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0, filter: 'blur(10px)' },
    visible: {
      y: 0,
      opacity: 1,
      filter: 'blur(0px)',
      transition: { type: "spring", stiffness: 50, damping: 20 }
    }
  };

  return (
    <div className="relative py-8 lg:py-12">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vh] bg-cyan-500/10 rounded-full blur-[150px] -z-10 animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vh] bg-purple-500/10 rounded-full blur-[150px] -z-10 animate-pulse" style={{ animationDelay: '3s' }} />

      <MotionDiv 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-24 relative z-10"
      >
        {/* Left Column: Hero Content */}
        <div className="lg:col-span-7 flex flex-col justify-center relative">
          
          {/* Decorative lines */}
          <motion.div 
             initial={{ height: 0 }} 
             animate={{ height: "100%" }} 
             transition={{ duration: 1, delay: 0.5 }}
             className="absolute -left-8 top-0 w-[1px] bg-gradient-to-b from-transparent via-cyan-500/50 to-transparent hidden lg:block" 
          />

          {/* UNIVERSITY LOGO BADGE - HIGH TECH SCANNER STYLE */}
          <MotionDiv variants={itemVariants} className="mb-12">
            <div className="inline-block relative group perspective-1000">
                {/* Tech Frame/Bracket */}
                <div className="absolute -top-2 -left-2 w-6 h-6 border-t-2 border-l-2 border-cyan-500/50 rounded-tl-lg"></div>
                <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-2 border-r-2 border-cyan-500/50 rounded-br-lg"></div>
                
                {/* Main Container */}
                <div className="relative bg-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-xl p-1 overflow-hidden shadow-[0_0_30px_rgba(6,182,212,0.15)]">
                    
                    {/* Header Strip */}
                    <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950/80 border-b border-slate-800">
                        <div className="flex items-center space-x-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_5px_#22d3ee]"></div>
                            <span className="text-[10px] text-cyan-400 uppercase tracking-widest font-bold font-mono">
                                PRESENTED BY
                            </span>
                        </div>
                        <span className="text-[10px] text-yellow-400 font-mono font-bold tracking-wider">TX 2026</span>
                    </div>

                    {/* Logo Area with Scanner Effect */}
                    <div className="relative bg-white px-8 py-4 rounded-b-lg flex items-center justify-center min-w-[280px] overflow-hidden group-hover:bg-slate-50 transition-colors duration-500">
                        {/* The Logo */}
                        {!imgError ? (
                            <img 
                                src="https://www.gandhinagaruni.ac.in/wp-content/uploads/2022/04/footer-logo.png" 
                                alt="Gandhinagar University" 
                                className="h-20 md:h-24 w-auto object-contain relative z-10 transform group-hover:scale-105 transition-transform duration-500"
                                onError={() => setImgError(true)}
                            />
                        ) : (
                            <div className="text-center relative z-10">
                                <h2 className="text-xl font-black text-slate-900 tracking-tighter">
                                    GANDHINAGAR<br/>UNIVERSITY
                                </h2>
                            </div>
                        )}

                        {/* Scanning Line Animation */}
                        <div className="absolute top-0 left-0 w-full h-[2px] bg-cyan-500/30 blur-[1px] z-20 animate-[scan_3s_ease-in-out_infinite] pointer-events-none"></div>
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-cyan-300/10 to-transparent z-10 animate-[scan_3s_ease-in-out_infinite] pointer-events-none"></div>
                    </div>
                </div>
            </div>
          </MotionDiv>

          {/* Connection Status Pill */}
          <MotionDiv variants={itemVariants} className="flex items-center mb-6">
            <div className="inline-flex items-center space-x-3 bg-slate-900/50 border border-emerald-500/20 rounded-full pl-2 pr-4 py-1">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </div>
                <span className="text-emerald-400 text-xs font-mono font-bold tracking-widest">SYSTEM ONLINE // ENCRYPTED</span>
            </div>
          </MotionDiv>
          
          {/* Giant Hero Text */}
          <MotionH1 variants={itemVariants} className="text-6xl md:text-8xl font-black text-white mb-6 tracking-tighter leading-[0.85]">
            <span className="block text-stroke-sm text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 hover:text-cyan-400 transition-colors duration-300 cursor-default text-5xl md:text-7xl">
              MYSTIC
            </span>
            <span className="block relative">
              <span className="absolute -inset-2 blur-2xl bg-cyan-500/20 -z-10"></span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 neon-text">
                FLAG FORGE
              </span>
            </span>
          </MotionH1>
          
          {/* Animated Description */}
          <MotionP variants={itemVariants} className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl leading-relaxed border-l-4 border-cyan-500/30 pl-6 py-2 bg-gradient-to-r from-cyan-500/5 to-transparent">
            <TypewriterText 
              text="Initialize your terminal. Join the elite community of ethical hackers. Solve realistic security challenges and dominate the leaderboard in a high-fidelity simulation."
              speed={15}
              delay={800}
            />
          </MotionP>
          
          {/* Action Buttons */}
          <MotionDiv variants={itemVariants} className="flex flex-col sm:flex-row gap-5 mt-2">
            <Button 
                onClick={() => onNavigate('/challenges')} 
                icon={<Target className="w-5 h-5"/>}
                className="shadow-[0_0_30px_rgba(6,182,212,0.3)] hover:shadow-[0_0_50px_rgba(6,182,212,0.5)] transition-shadow duration-300"
            >
              Start Operation
            </Button>
            <Button 
                variant="secondary"
                onClick={() => onNavigate('/team')} 
                icon={<Globe className="w-5 h-5"/>}
            >
              View Team
            </Button>
          </MotionDiv>

           {/* Live Status Ticker */}
           <MotionDiv variants={itemVariants} className="mt-12 overflow-hidden border-t border-slate-800/50 pt-4 relative">
              <div className="flex whitespace-nowrap animate-marquee">
                  {[1,2,3].map(i => (
                      <div key={i} className="flex items-center space-x-8 text-xs font-mono text-slate-500 mx-4">
                          <span className="flex items-center"><Radio className="w-3 h-3 mr-2 text-red-500 animate-pulse"/> LIVE THREAT DETECTED: SQL INJECTION</span>
                          <span className="flex items-center"><Globe className="w-3 h-3 mr-2 text-cyan-500"/> NEW NODE CONNECTED: MUMBAI_SERVER</span>
                          <span className="flex items-center"><Shield className="w-3 h-3 mr-2 text-emerald-500"/> FIREWALL: ACTIVE</span>
                          <span className="flex items-center"><Zap className="w-3 h-3 mr-2 text-yellow-500"/> SYSTEM LOAD: 42%</span>
                      </div>
                  ))}
              </div>
              <div className="absolute top-0 right-0 w-20 h-full bg-gradient-to-l from-[#020617] to-transparent z-10"></div>
              <div className="absolute top-0 left-0 w-20 h-full bg-gradient-to-r from-[#020617] to-transparent z-10"></div>
           </MotionDiv>
        </div>

        {/* Right Column: Interactive Dashboard */}
        <div className="lg:col-span-5 flex flex-col gap-6 relative">
           {/* Floating Background Elements */}
           <motion.div 
             animate={{ rotate: 360 }}
             transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
             className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border border-dashed border-slate-800 rounded-full -z-10 opacity-30"
           />

           <MotionDiv variants={itemVariants} className="relative z-20 transform hover:scale-[1.02] transition-transform duration-500">
             <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
             <Terminal onNavigate={onNavigate} />
           </MotionDiv>
           
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
             <MotionDiv variants={itemVariants}>
               <EventCountdown />
             </MotionDiv>
             <MotionDiv variants={itemVariants} className="h-full">
               <ActivityFeed />
             </MotionDiv>
           </div>
        </div>
      </MotionDiv>

      {/* Protocols / Rules Section - Glassmorphism */}
      <MotionDiv 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="mb-24 relative"
      >
        {/* Glowing border effect */}
        <div className="absolute -inset-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent rounded-3xl opacity-50 blur-sm"></div>
        
        <div className="relative bg-slate-900/60 backdrop-blur-xl rounded-3xl p-8 md:p-12 overflow-hidden border border-white/5 shadow-2xl">
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-900/20 via-slate-900/0 to-transparent pointer-events-none" />
          
          <div className="absolute -top-24 -right-24 p-4 opacity-[0.03] transform rotate-12 pointer-events-none">
            <Bitcoin className="w-96 h-96 text-white" />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center mb-10">
                <div className="p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/20 mr-4 shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                    <AlertTriangle className="w-8 h-8 text-yellow-500" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">MISSION PROTOCOLS</h2>
                    <p className="text-slate-400 text-sm font-mono mt-1">READ CAREFULLY BEFORE ENGAGEMENT</p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <motion.div whileHover={{ y: -5 }} className="space-y-4 group">
                <div className="flex items-center text-cyan-400 font-bold text-lg mb-2 group-hover:text-white transition-colors">
                  <Target className="w-5 h-5 mr-3" /> 
                  DIFFICULTY TIERS
                </div>
                <p className="text-slate-400 text-sm leading-relaxed border-l-2 border-slate-700 pl-4 group-hover:border-cyan-500 transition-colors">
                  Operations are strict. 
                  <span className="text-emerald-400 font-bold block mt-1">🔰 RECRUIT (1 MIN)</span>
                  <span className="text-yellow-400 font-bold block">⚠️ OPERATIVE (3 MIN)</span>
                  <span className="text-red-400 font-bold block">💀 BLACK OPS (5-6 MIN)</span>
                </p>
              </motion.div>

              <motion.div whileHover={{ y: -5 }} className="space-y-4 group">
                <div className="flex items-center text-purple-400 font-bold text-lg mb-2 group-hover:text-white transition-colors">
                  <Clock className="w-5 h-5 mr-3" /> 
                  TIME CONSTRAINTS
                </div>
                <p className="text-slate-400 text-sm leading-relaxed border-l-2 border-slate-700 pl-4 group-hover:border-purple-500 transition-colors">
                  Time is your most valuable asset. Complete challenges within the designated windows to maximize your efficiency rating. Failure results in immediate lockout.
                </p>
              </motion.div>

              <motion.div whileHover={{ y: -5 }} className="space-y-4 group">
                <div className="flex items-center text-pink-400 font-bold text-lg mb-2 group-hover:text-white transition-colors">
                  <Zap className="w-5 h-5 mr-3" /> 
                  CRYPTO ECONOMY
                </div>
                <p className="text-slate-400 text-sm leading-relaxed border-l-2 border-slate-700 pl-4 group-hover:border-pink-500 transition-colors">
                  Your bounty currency is your lifeline. Earn points by solving cases and 
                  <span className="text-white font-bold"> exchange currency</span> to purchase critical intelligence hints when you are stuck.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </MotionDiv>

      {/* Categories Grid */}
      <MotionDiv 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={{
            visible: { transition: { staggerChildren: 0.1 } }
        }}
        className="grid grid-cols-1 md:grid-cols-3 gap-8"
      >
        <MotionDiv variants={itemVariants}>
            <Card hoverEffect className="border-t-4 border-t-cyan-500 h-full">
            <div className="h-14 w-14 bg-cyan-900/30 rounded-2xl flex items-center justify-center mb-6 text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                <Code className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">
                <GlitchText text="Web Security" />
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">Master XSS, SQL Injection, and authentication bypass techniques in simulated environments.</p>
            <div className="mt-auto flex items-center text-cyan-500 text-xs font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                Access Module <ChevronRight className="w-3 h-3 ml-1" />
            </div>
            </Card>
        </MotionDiv>
        
        <MotionDiv variants={itemVariants}>
            <Card hoverEffect className="border-t-4 border-t-purple-500 h-full">
            <div className="h-14 w-14 bg-purple-900/30 rounded-2xl flex items-center justify-center mb-6 text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                <Lock className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-purple-400 transition-colors">
                <GlitchText text="Cryptography" />
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">Crack ciphers, analyze hash collisions, and decrypt secret communications.</p>
            <div className="mt-auto flex items-center text-purple-500 text-xs font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                Access Module <ChevronRight className="w-3 h-3 ml-1" />
            </div>
            </Card>
        </MotionDiv>
        
        <MotionDiv variants={itemVariants}>
            <Card hoverEffect className="border-t-4 border-t-pink-500 h-full">
            <div className="h-14 w-14 bg-pink-900/30 rounded-2xl flex items-center justify-center mb-6 text-pink-400 shadow-[0_0_20px_rgba(236,72,153,0.2)]">
                <Cpu className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-pink-400 transition-colors">
                <GlitchText text="Binary Exploitation" />
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">Dive deep into memory corruption, buffer overflows, and reverse engineering.</p>
            <div className="mt-auto flex items-center text-pink-500 text-xs font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                Access Module <ChevronRight className="w-3 h-3 ml-1" />
            </div>
            </Card>
        </MotionDiv>
      </MotionDiv>
    </div>
  );
};

export default HomePage;