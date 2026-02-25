import { motion } from 'framer-motion';
import { AlertCircle, Home, ArrowLeft, Search } from 'lucide-react';
import Button from '../components/ui/Button';

interface NotFoundProps {
  onNavigate?: (page: string) => void;
}

const NotFound: React.FC<NotFoundProps> = ({ onNavigate }) => {
  const handleGoHome = () => {
    if (onNavigate) {
      onNavigate('/');
    } else {
      window.location.href = '/';
    }
  };

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        {/* Error Code */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative mb-8"
        >
          <h1 className="text-[150px] md:text-[200px] font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 leading-none tracking-tighter">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className="w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl"
            />
          </div>
        </motion.div>

        {/* Icon */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center mb-6"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-cyan-500/20 blur-2xl rounded-full" />
            <div className="relative bg-slate-900/80 p-6 rounded-full border-2 border-cyan-500/50">
              <AlertCircle className="w-16 h-16 text-cyan-500" />
            </div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight"
        >
          PAGE NOT FOUND
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-slate-400 text-lg mb-8 max-w-md mx-auto"
        >
          The classified file you're looking for has been moved, deleted, or never existed in our database.
        </motion.p>

        {/* Error Code */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 mb-8 max-w-md mx-auto"
        >
          <div className="flex items-center justify-between text-sm font-mono">
            <span className="text-slate-500">ERROR_CODE:</span>
            <span className="text-cyan-400">404_NOT_FOUND</span>
          </div>
          <div className="flex items-center justify-between text-sm font-mono mt-2">
            <span className="text-slate-500">TIMESTAMP:</span>
            <span className="text-cyan-400">{new Date().toISOString()}</span>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            onClick={handleGoBack}
            variant="secondary"
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            Go Back
          </Button>
          <Button
            onClick={handleGoHome}
            variant="primary"
            icon={<Home className="w-4 h-4" />}
          >
            Return Home
          </Button>
        </motion.div>

        {/* Help Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 pt-8 border-t border-slate-800"
        >
          <p className="text-slate-600 text-sm font-mono flex items-center justify-center gap-2">
            <Search className="w-4 h-4" />
            Try searching from the navigation menu
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
