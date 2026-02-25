import { motion } from 'framer-motion';
import { Loader2, Terminal, Zap, Shield } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'dots' | 'pulse' | 'terminal' | 'cyber';
  text?: string;
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md',
  variant = 'spinner',
  text,
  fullScreen = false
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className="flex space-x-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className={`${sizeClasses[size]} bg-cyan-500 rounded-full`}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              />
            ))}
          </div>
        );

      case 'pulse':
        return (
          <motion.div
            className={`${sizeClasses[size]} bg-cyan-500 rounded-full`}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity
            }}
          />
        );

      case 'terminal':
        return (
          <div className="flex items-center space-x-3">
            <Terminal className={`${sizeClasses[size]} text-cyan-500`} />
            <motion.div
              className="flex space-x-1"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <span className="text-cyan-500 font-mono">.</span>
              <span className="text-cyan-500 font-mono">.</span>
              <span className="text-cyan-500 font-mono">.</span>
            </motion.div>
          </div>
        );

      case 'cyber':
        return (
          <div className="relative">
            <motion.div
              className={`${sizeClasses[size]} border-4 border-cyan-500/30 rounded-full`}
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <div className="absolute top-0 left-1/2 w-1 h-1/2 bg-cyan-500 origin-bottom" />
            </motion.div>
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <Shield className="w-1/2 h-1/2 text-cyan-500" />
            </motion.div>
          </div>
        );

      default: // spinner
        return (
          <Loader2 
            className={`${sizeClasses[size]} text-cyan-500 animate-spin`}
          />
        );
    }
  };

  const content = (
    <div className="flex flex-col items-center justify-center space-y-4">
      {renderSpinner()}
      {text && (
        <motion.p
          className={`${textSizeClasses[size]} text-cyan-400 font-mono font-bold tracking-wider uppercase`}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="relative">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-cyan-500/20 blur-3xl rounded-full" />
          <div className="relative z-10">
            {content}
          </div>
        </div>
      </div>
    );
  }

  return content;
};

// Preset loading components
export const LoadingPage: React.FC<{ text?: string }> = ({ text = 'Loading...' }) => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <LoadingSpinner size="xl" variant="cyber" text={text} />
  </div>
);

export const LoadingOverlay: React.FC<{ text?: string }> = ({ text }) => (
  <LoadingSpinner size="lg" variant="spinner" text={text} fullScreen />
);

export const LoadingInline: React.FC<{ text?: string }> = ({ text }) => (
  <div className="flex items-center justify-center py-8">
    <LoadingSpinner size="md" variant="terminal" text={text} />
  </div>
);

export default LoadingSpinner;
