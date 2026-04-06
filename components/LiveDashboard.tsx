import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Users, Zap, Clock, TrendingUp, Radio } from 'lucide-react';
import { db } from '../services/db';
import Card from './ui/Card';

const LiveDashboard = () => {
  const [dashboard, setDashboard] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboard = async () => {
    const data = await db.admin.getLiveDashboard();
    setDashboard(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchDashboard();
    
    // Auto-refresh every 5 seconds
    const interval = setInterval(fetchDashboard, 5000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto"></div>
        <p className="text-slate-400 mt-4">Loading live data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </div>
          <h2 className="text-2xl font-bold text-white">Live Dashboard</h2>
        </div>
        <div className="text-xs text-slate-500 font-mono">
          Last updated: {new Date(dashboard?.timestamp).toLocaleTimeString()}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-cyan-900/20 to-cyan-800/10 border-cyan-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Total Users</p>
                <p className="text-3xl font-bold text-white">{dashboard?.totalUsers || 0}</p>
              </div>
              <Users className="w-10 h-10 text-cyan-400 opacity-50" />
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-emerald-900/20 to-emerald-800/10 border-emerald-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Online Now</p>
                <p className="text-3xl font-bold text-white">{dashboard?.onlineUsers || 0}</p>
              </div>
              <Radio className="w-10 h-10 text-emerald-400 opacity-50 animate-pulse" />
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 border-purple-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Recent Solves (5m)</p>
                <p className="text-3xl font-bold text-white">{dashboard?.recentSolves?.length || 0}</p>
              </div>
              <Zap className="w-10 h-10 text-purple-400 opacity-50" />
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className={`bg-gradient-to-br ${
            dashboard?.eventStatus?.started 
              ? 'from-emerald-900/20 to-emerald-800/10 border-emerald-500/30' 
              : 'from-slate-900/20 to-slate-800/10 border-slate-500/30'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Event Status</p>
                <p className="text-xl font-bold text-white">
                  {dashboard?.eventStatus?.started ? 'RUNNING' : 'STOPPED'}
                </p>
              </div>
              <Activity className={`w-10 h-10 opacity-50 ${
                dashboard?.eventStatus?.started ? 'text-emerald-400 animate-pulse' : 'text-slate-400'
              }`} />
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-white">Recent Solves</h3>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {dashboard?.recentSolves?.length > 0 ? (
              dashboard.recentSolves.map((solve: any, idx: number) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:border-cyan-500/50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="text-white font-medium">{solve.username}</p>
                    <p className="text-slate-400 text-sm">{solve.challenge}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-cyan-400 font-bold">+{solve.points}</p>
                    <p className="text-slate-500 text-xs">
                      {new Date(solve.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </motion.div>
              ))
            ) : (
              <p className="text-slate-500 text-center py-8">No recent solves</p>
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-2 mb-4">
            <Clock className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-bold text-white">Activity Feed</h3>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {dashboard?.recentActivity?.length > 0 ? (
              dashboard.recentActivity.map((activity: any, idx: number) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-white">
                        <span className="font-medium text-cyan-400">{activity.username}</span>
                        {' '}<span className="text-slate-400">{activity.action}</span>
                        {' '}<span className="text-white">{activity.target}</span>
                      </p>
                    </div>
                    <p className="text-slate-500 text-xs whitespace-nowrap ml-2">
                      {new Date(activity.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </motion.div>
              ))
            ) : (
              <p className="text-slate-500 text-center py-8">No recent activity</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LiveDashboard;
