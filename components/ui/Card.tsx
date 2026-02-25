import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className = '', onClick, hoverEffect = false }) => {
  const ref = useRef<HTMLDivElement>(null);

  // Motion values for mouse position
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth springs for rotation
  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  // Map mouse position to rotation degrees
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["5deg", "-5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-5deg", "5deg"]);
  
  // Dynamic gloss/shine effect based on mouse position
  const glossX = useTransform(mouseXSpring, [-0.5, 0.5], ["0%", "100%"]);
  const glossY = useTransform(mouseYSpring, [-0.5, 0.5], ["0%", "100%"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!hoverEffect || !ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    
    // Calculate normalized position (-0.5 to 0.5)
    const width = rect.width;
    const height = rect.height;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    if (!hoverEffect) return;
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      style={{
        rotateX: hoverEffect ? rotateX : 0,
        rotateY: hoverEffect ? rotateY : 0,
        transformStyle: "preserve-3d",
      }}
      initial={{ scale: 1 }}
      whileHover={hoverEffect ? { scale: 1.02 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={`
        relative group 
        bg-slate-900/40 backdrop-blur-xl 
        border border-slate-800 
        rounded-xl p-6 
        shadow-xl
        overflow-hidden
        ${onClick ? 'cursor-pointer' : ''} 
        ${className}
      `}
    >
      {/* 3D Depth Layer - Background */}
      <div 
        className="absolute inset-0 bg-slate-900/80 rounded-xl transform translate-z-[-10px] shadow-2xl transition-all" 
      />

      {/* TACTICAL CORNERS (HUD STYLE) */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-slate-600 group-hover:border-cyan-400 transition-colors z-20 rounded-tl-md"></div>
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-slate-600 group-hover:border-cyan-400 transition-colors z-20 rounded-tr-md"></div>
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-slate-600 group-hover:border-cyan-400 transition-colors z-20 rounded-bl-md"></div>
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-slate-600 group-hover:border-cyan-400 transition-colors z-20 rounded-br-md"></div>

      {/* SCANNING LASER EFFECT (On Hover) */}
      {hoverEffect && (
        <div className="absolute inset-0 z-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
             <div className="absolute top-0 left-0 w-full h-[50%] bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent -translate-y-full group-hover:animate-[scan_2s_linear_infinite]" />
        </div>
      )}

      {/* Gloss/Reflection Gradient */}
      {hoverEffect && (
        <motion.div 
            style={{ 
                background: `radial-gradient(circle at ${glossX} ${glossY}, rgba(255,255,255,0.07), transparent 60%)` 
            }}
            className="absolute inset-0 rounded-xl z-20 pointer-events-none"
        />
      )}
      
      {/* Content - Pushed forward in 3D space */}
      <div className="relative z-10 transform translate-z-[20px]">
        {children}
      </div>
    </motion.div>
  );
};

export default Card;