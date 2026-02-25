import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
  count?: number;
  animate?: boolean;
}

const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  variant = 'rectangular',
  width,
  height,
  count = 1,
  animate = true
}) => {
  const baseClasses = 'bg-slate-800/50 overflow-hidden relative';
  
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
    card: 'rounded-xl'
  };

  const style: React.CSSProperties = {
    width: width || '100%',
    height: height || (variant === 'text' ? '1rem' : variant === 'circular' ? '3rem' : '12rem')
  };

  const SkeletonElement = () => (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    >
      {animate && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-700/30 to-transparent"
          animate={{
            x: ['-100%', '100%']
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'linear'
          }}
        />
      )}
    </div>
  );

  if (count === 1) {
    return <SkeletonElement />;
  }

  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonElement key={index} />
      ))}
    </div>
  );
};

// Preset skeleton components
export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-slate-900/50 border border-slate-800 rounded-xl p-6 ${className}`}>
    <div className="flex items-center justify-between mb-4">
      <Skeleton variant="text" width="30%" />
      <Skeleton variant="circular" width={40} height={40} />
    </div>
    <Skeleton variant="text" width="80%" className="mb-2" />
    <Skeleton variant="text" width="60%" className="mb-4" />
    <div className="flex justify-between items-center pt-4 border-t border-slate-800">
      <Skeleton variant="text" width="25%" />
      <Skeleton variant="text" width="20%" />
    </div>
  </div>
);

export const SkeletonTable: React.FC<{ rows?: number; columns?: number }> = ({ 
  rows = 5, 
  columns = 4 
}) => (
  <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
    <div className="p-4 border-b border-slate-800 flex gap-4">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} variant="text" width={`${100 / columns}%`} />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="p-4 border-b border-slate-800/50 flex gap-4">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton key={colIndex} variant="text" width={`${100 / columns}%`} />
        ))}
      </div>
    ))}
  </div>
);

export const SkeletonLeaderboard: React.FC = () => (
  <div className="space-y-3">
    {Array.from({ length: 10 }).map((_, index) => (
      <div 
        key={index}
        className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 flex items-center gap-4"
      >
        <Skeleton variant="circular" width={40} height={40} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="40%" />
          <Skeleton variant="text" width="20%" />
        </div>
        <Skeleton variant="text" width="15%" />
      </div>
    ))}
  </div>
);

export const SkeletonChallenge: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: 6 }).map((_, index) => (
      <SkeletonCard key={index} />
    ))}
  </div>
);

export default Skeleton;
