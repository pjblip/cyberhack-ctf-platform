import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../services/db';

interface ActivityItem {
  id: string | number;
  user: string;
  action: string;
  target: string;
  type: string; // 'easy', 'medium', 'hard' usually mapped from challenge difficulty
  timestamp: string;
}

const ActivityFeed: React.FC = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  const fetchActivity = async () => {
    const data = await db.activity.get();
    if (data && data.length > 0) {
      // Map backend data to UI format if needed, but db service already formats it mostly
      // We add 'type' if missing based on target name or just default
      const formatted = data.map((item: any) => ({
        ...item,
        type: 'medium' // Default color
      }));
      setActivities(formatted);
    }
  };

  useEffect(() => {
    fetchActivity();

    // Simple polling every 30 seconds for Google Sheets
    const interval = setInterval(fetchActivity, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-4 overflow-hidden h-full">
      <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-2">
        <div className="flex items-center">
          <div className="relative mr-2">
            <div className={`w-2 h-2 rounded-full ${db.isLive ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`}></div>
            <div className={`absolute inset-0 w-2 h-2 rounded-full ${db.isLive ? 'bg-green-500' : 'bg-yellow-500'} animate-ping opacity-75`}></div>
          </div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            {db.isLive ? 'Live Network Traffic' : 'Simulated Traffic'}
          </h3>
        </div>
      </div>

      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {activities.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20, height: 0 }}
              animate={{ opacity: 1, x: 0, height: 'auto' }}
              exit={{ opacity: 0, x: 20, height: 0 }}
              className="flex flex-col sm:flex-row sm:items-center text-sm font-mono border-l-2 border-slate-800 pl-3 py-1 hover:border-cyan-500 transition-colors"
            >
              <span className="text-slate-600 text-xs mr-2 w-16 flex-shrink-0">
                {item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'NOW'}
              </span>
              <div className="flex items-center flex-wrap">
                <span className="text-cyan-400 font-bold mr-2">{item.user}</span>
                <span className="text-slate-400 mr-2 text-xs uppercase">{item.action}</span>
                <span className="truncate font-bold text-emerald-400">
                  {item.target}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {activities.length === 0 && (
          <div className="text-slate-600 text-xs text-center py-4 italic">Waiting for incoming signals...</div>
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;