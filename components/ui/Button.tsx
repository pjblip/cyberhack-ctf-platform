import { motion } from 'framer-motion';
import { playClickSound, playHoverSound } from '../../utils/audio';
import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  children: ReactNode;
  icon?: ReactNode;
}

const Button: React.FC<ButtonProps> = ({ variant = 'primary', children, icon, className = '', onClick, ...props }) => {
  const baseStyles = "relative overflow-hidden inline-flex items-center justify-center px-6 py-3 rounded-lg font-bold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed group";
  
  const variants = {
    primary: "bg-cyan-600 text-black border border-cyan-400/50",
    secondary: "bg-slate-800 text-cyan-400 border border-slate-600",
    danger: "bg-red-600 text-white border border-red-400/50",
    ghost: "bg-transparent text-slate-400 hover:text-white"
  };

  // Cyberpunk scanline effect for primary/danger buttons
  const showScanline = variant === 'primary' || variant === 'danger';

  const MotionButton = motion.button as any;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    playClickSound();
    if (onClick) onClick(e);
  };

  return (
    <MotionButton
      whileHover={{ 
        scale: 1.02,
        boxShadow: variant === 'primary' 
          ? "0 0 20px rgba(8, 145, 178, 0.6)" 
          : variant === 'danger' 
            ? "0 0 20px rgba(220, 38, 38, 0.6)"
            : "none",
        backgroundColor: variant === 'primary' ? '#06b6d4' : undefined // cyan-500
      }}
      whileTap={{ scale: 0.96 }}
      onMouseEnter={() => playHoverSound()}
      onClick={handleClick}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {showScanline && (
        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-shimmer" />
      )}
      <div className="relative flex items-center z-10">
        {icon && <span className="mr-2 group-hover:rotate-12 transition-transform duration-300">{icon}</span>}
        {children}
      </div>
    </MotionButton>
  );
};

export default Button;