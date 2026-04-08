import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, AlertTriangle, Trash2, RefreshCw, Terminal, Activity, Lock, Upload, Download, Edit, Plus, BarChart3, UserCog, Crown, Radio, Megaphone, Database } from 'lucide-react';
import { db } from '../services/db';
import { User } from '../types';
import Button from '../components/ui/Button';
import GlitchText from '../components/ui/GlitchText';
import LeaderboardPage from './Leaderboard';
import { SkeletonTable } from '../components/ui/Skeleton';
import LiveDashboard from '../components/LiveDashboard';
import AnnouncementPanel from '../components/AnnouncementPanel';

interface AdminPageProps {
  currentUser: User | null;
  onNavigate: (page: string) => void;
}

const AdminPage: React.FC<AdminPageProps> = ({ currentUser, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'live' | 'users' | 'challenges' | 'analytics' | 'leaderboard' | 'control' | 'logs'>('live');
  const [users, setUsers] = useState<any[]>([]);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [showChallengeEditor, setShowChallengeEditor] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<any>(null);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [eventStatus, setEventStatus] = useState<'not_started' | 'running' | 'ended'>('not_started');
  const [systemLogs, setSystemLogs] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Protect Route
  if (!currentUser?.isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Lock className="w-20 h-20 text-red-600 mb-6" />
        <h1 className="text-4xl font-extrabold text-white mb-2">UNAUTHORIZED</h1>
        <p className="text-slate-400">Level 5 Clearance Required. Access attempt logged.</p>
      </div>
    );
  }

  const fetchUsers = async () => {
    setIsLoading(true);
    const data = await db.admin.getUsers();
    setUsers(data);
    setIsLoading(false);
  };

  const fetchChallenges = async () => {
    setIsLoading(true);
    const data = await db.challenges.list();
    setChallenges(data);
    setIsLoading(false);
  };

  const fetchAnalytics = async () => {
    setIsLoading(true);
    const data = await db.admin.getAnalytics();
    setAnalytics(data);
    setIsLoading(false);
  };

  const fetchSystemLogs = async () => {
    setIsLoading(true);
    const activity = await db.activity.get();
    setSystemLogs(activity);
    setIsLoading(false);
  };

  const addSystemLog = (message: string) => {
    const log = {
      id: Date.now(),
      user: currentUser?.username || 'Admin',
      action: message,
      target: 'System',
      timestamp: new Date().toISOString()
    };
    setSystemLogs([log, ...systemLogs]);
  };

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'challenges') {
      fetchChallenges();
    } else if (activeTab === 'analytics') {
      fetchAnalytics();
    } else if (activeTab === 'logs') {
      fetchSystemLogs();
    }
  }, [activeTab]);



  const handleStartEvent = () => {
    if (confirm('Start the CTF event? Timer will begin for all challenges.')) {
      setEventStatus('running');
      setStatusMessage('Event started! Timer is now running.');
      addSystemLog('Event started by admin');
    }
  };

  const handleStopEvent = () => {
    if (confirm('Stop the CTF event? No more submissions will be accepted.')) {
      setEventStatus('ended');
      setStatusMessage('Event stopped. Submissions are now closed.');
      addSystemLog('Event stopped by admin');
    }
  };

  const handleResetEvent = () => {
    if (confirm('⚠️ DANGER: Reset entire event? This will delete ALL user progress, scores, and submissions. This cannot be undone!')) {
      if (confirm('Are you ABSOLUTELY sure? Type YES in the next prompt to confirm.')) {
        setEventStatus('not_started');
        setStatusMessage('Event reset. All data cleared.');
        addSystemLog('Event reset by admin - ALL DATA CLEARED');
      }
    }
  };



  const handleDeleteUser = async (userId: string, username: string) => {
    if (confirm(`WARNING: Are you sure you want to PERMANENTLY DELETE agent "${username}"? This cannot be undone.`)) {
      setIsLoading(true);
      const res = await db.admin.deleteUser(userId);
      if (res.success) {
        setStatusMessage(`User ${username} terminated.`);
        fetchUsers();
      } else {
        setStatusMessage(`Error: ${res.message}`);
        setIsLoading(false);
      }
    }
  };

  const handleResetUser = async (userId: string, username: string) => {
    if (confirm(`Confirm reset score for agent "${username}" to 0?`)) {
      setIsLoading(true);
      const res = await db.admin.resetUser(userId);
      if (res.success) {
        setStatusMessage(`User ${username} reset.`);
        fetchUsers();
      } else {
        setStatusMessage(`Error: ${res.message}`);
        setIsLoading(false);
      }
    }
  };

  const handlePromoteUser = async (userId: string, username: string) => {
    if (confirm(`Promote "${username}" to ADMIN? They will have full system access.`)) {
      setIsLoading(true);
      const res = await db.admin.promoteUser(userId);
      if (res.success) {
        setStatusMessage(`${username} promoted to admin.`);
        fetchUsers();
      } else {
        setStatusMessage(`Error: ${res.message}`);
        setIsLoading(false);
      }
    }
  };

  const handleBanUser = async (userId: string, username: string) => {
    if (confirm(`BAN user "${username}"? They will not be able to login.`)) {
      setIsLoading(true);
      const res = await db.admin.banUser(userId);
      if (res.success) {
        setStatusMessage(`${username} has been banned.`);
        fetchUsers();
      } else {
        setStatusMessage(`Error: ${res.message}`);
        setIsLoading(false);
      }
    }
  };

  // Bulk Actions
  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(u => u.id));
    }
  };

  const handleBulkBan = async () => {
    if (selectedUsers.length === 0) return;
    if (confirm(`Ban ${selectedUsers.length} selected users?`)) {
      setIsLoading(true);
      const res = await db.admin.bulkBanUsers(selectedUsers);
      if (res.success) {
        setStatusMessage(`✅ Banned ${res.count} users`);
        setSelectedUsers([]);
        fetchUsers();
      } else {
        setStatusMessage('❌ Failed to ban users');
        setIsLoading(false);
      }
    }
  };

  const handleBulkReset = async () => {
    if (selectedUsers.length === 0) return;
    if (confirm(`Reset progress for ${selectedUsers.length} selected users? This will set their points to 0 and remove all solves.`)) {
      setIsLoading(true);
      const res = await db.admin.bulkResetUsers(selectedUsers);
      if (res.success) {
        setStatusMessage(`✅ Reset ${res.count} users`);
        setSelectedUsers([]);
        fetchUsers();
      } else {
        setStatusMessage('❌ Failed to reset users');
        setIsLoading(false);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) return;
    if (confirm(`⚠️ PERMANENTLY DELETE ${selectedUsers.length} selected users? This CANNOT be undone!`)) {
      if (confirm('Are you ABSOLUTELY sure? This will delete all their data.')) {
        setIsLoading(true);
        const res = await db.admin.bulkDeleteUsers(selectedUsers);
        if (res.success) {
          setStatusMessage(`✅ Deleted ${res.count} users`);
          setSelectedUsers([]);
          fetchUsers();
        } else {
          setStatusMessage('❌ Failed to delete users');
          setIsLoading(false);
        }
      }
    }
  };

  const handleBackup = async () => {
    setIsLoading(true);
    const res = await db.admin.createBackup();
    if (res.success) {
      setStatusMessage(`✅ Backup created: ${res.filename}`);
    } else {
      setStatusMessage('❌ Failed to create backup');
    }
    setIsLoading(false);
  };

  // Filter users based on search
  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExportLeaderboard = async () => {
    const leaderboard = await db.leaderboard.get();
    const csv = [
      ['Rank', 'Username', 'Points', 'Solves'].join(','),
      ...leaderboard.map((user: any, idx: number) =>
        [idx + 1, user.username, user.points, user.correct].join(',')
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leaderboard_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    setStatusMessage('Leaderboard exported successfully.');
  };

  const handleBulkUpload = async (jsonData: string) => {
    try {
      const challenges = JSON.parse(jsonData);
      setIsLoading(true);
      const res = await db.admin.bulkUploadChallenges(challenges);
      if (res.success) {
        setStatusMessage(`${res.count} challenges uploaded successfully.`);
        setShowBulkUpload(false);
        fetchChallenges();
      } else {
        setStatusMessage(`Error: ${res.message}`);
        setIsLoading(false);
      }
    } catch (e) {
      setStatusMessage('Invalid JSON format.');
      setIsLoading(false);
    }
  };

  const handleSaveChallenge = async (challenge: any) => {
    setIsLoading(true);
    const res = editingChallenge
      ? await db.admin.updateChallenge(challenge)
      : await db.admin.createChallenge(challenge);

    if (res.success) {
      setStatusMessage(editingChallenge ? 'Challenge updated.' : 'Challenge created.');
      setShowChallengeEditor(false);
      setEditingChallenge(null);
      fetchChallenges();
    } else {
      setStatusMessage(`Error: ${res.message}`);
      setIsLoading(false);
    }
  };

  const handleDeleteChallenge = async (challengeId: string, title: string) => {
    if (confirm(`Delete challenge "${title}"? All associated solves will be removed.`)) {
      setIsLoading(true);
      const res = await db.admin.deleteChallenge(challengeId);
      if (res.success) {
        setStatusMessage(`Challenge "${title}" deleted.`);
        fetchChallenges();
      } else {
        setStatusMessage(`Error: ${res.message}`);
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="py-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-10 flex items-center justify-between border-b border-red-900/50 pb-6">
        <div className="flex items-center">
          <div className="p-3 bg-red-950/50 rounded-lg border border-red-500/50 mr-4">
            <Shield className="w-8 h-8 text-red-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-wider flex items-center">
              <GlitchText text="COMMAND CENTER" />
              <span className="ml-3 text-xs bg-red-600 text-black font-bold px-2 py-0.5 rounded">ADMIN</span>
            </h1>
            <p className="text-red-400 font-mono text-sm mt-1">
              System Control & User Management
            </p>
          </div>
        </div>

        {statusMessage && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-slate-800 text-cyan-400 px-4 py-2 rounded border border-cyan-500/30 font-mono text-sm flex items-center"
          >
            <Terminal className="w-4 h-4 mr-2" />
            {statusMessage}
          </motion.div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-4 mb-8 overflow-x-auto">
        <button
          onClick={() => setActiveTab('control')}
          className={`flex items-center px-6 py-3 rounded-t-lg font-bold transition-all border-t-2 whitespace-nowrap ${activeTab === 'control' ? 'bg-slate-900 border-red-500 text-white' : 'bg-slate-900/30 border-transparent text-slate-500 hover:text-red-400'}`}
        >
          <Terminal className="w-5 h-5 mr-2" /> Event Control
        </button>
        <button
          onClick={() => setActiveTab('live')}
          className={`flex items-center px-6 py-3 rounded-t-lg font-bold transition-all border-t-2 whitespace-nowrap ${activeTab === 'live' ? 'bg-slate-900 border-emerald-500 text-white' : 'bg-slate-900/30 border-transparent text-slate-500 hover:text-emerald-400'}`}
        >
          <Radio className="w-5 h-5 mr-2" /> Live Dashboard
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center px-6 py-3 rounded-t-lg font-bold transition-all border-t-2 whitespace-nowrap ${activeTab === 'users' ? 'bg-slate-900 border-cyan-500 text-white' : 'bg-slate-900/30 border-transparent text-slate-500 hover:text-cyan-400'}`}
        >
          <Users className="w-5 h-5 mr-2" /> User Management
        </button>
        <button
          onClick={() => setActiveTab('challenges')}
          className={`flex items-center px-6 py-3 rounded-t-lg font-bold transition-all border-t-2 whitespace-nowrap ${activeTab === 'challenges' ? 'bg-slate-900 border-purple-500 text-white' : 'bg-slate-900/30 border-transparent text-slate-500 hover:text-purple-400'}`}
        >
          <Edit className="w-5 h-5 mr-2" /> Challenge Editor
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center px-6 py-3 rounded-t-lg font-bold transition-all border-t-2 whitespace-nowrap ${activeTab === 'analytics' ? 'bg-slate-900 border-green-500 text-white' : 'bg-slate-900/30 border-transparent text-slate-500 hover:text-green-400'}`}
        >
          <BarChart3 className="w-5 h-5 mr-2" /> Analytics
        </button>
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`flex items-center px-6 py-3 rounded-t-lg font-bold transition-all border-t-2 whitespace-nowrap ${activeTab === 'leaderboard' ? 'bg-slate-900 border-yellow-500 text-white' : 'bg-slate-900/30 border-transparent text-slate-500 hover:text-yellow-400'}`}
        >
          <Activity className="w-5 h-5 mr-2" /> Live Leaderboard
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center px-6 py-3 rounded-t-lg font-bold transition-all border-t-2 whitespace-nowrap ${activeTab === 'logs' ? 'bg-slate-900 border-orange-500 text-white' : 'bg-slate-900/30 border-transparent text-slate-500 hover:text-orange-400'}`}
        >
          <Terminal className="w-5 h-5 mr-2" /> System Logs
        </button>
      </div>

      {/* Content Area */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-b-xl rounded-tr-xl p-6 min-h-[500px]">
        {activeTab === 'live' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <LiveDashboard />
          </motion.div>
        )}

        {activeTab === 'control' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h3 className="text-xl font-bold text-white flex items-center mb-6">
              <Terminal className="w-5 h-5 mr-2 text-red-500" />
              Event Control Center
            </h3>

            {/* Announcement Panel */}
            <div className="mb-8">
              <AnnouncementPanel />
            </div>

            {/* Backup Button */}
            <div className="mb-8">
              <Button
                onClick={handleBackup}
                icon={<Database className="w-4 h-4" />}
                disabled={isLoading}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isLoading ? 'Creating Backup...' : 'Create Database Backup'}
              </Button>
              <p className="text-slate-400 text-sm mt-2">
                Creates a backup of the entire database. Recommended before making major changes.
              </p>
            </div>

            {/* Event Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className={`p-6 rounded-lg border-2 ${eventStatus === 'running' ? 'bg-green-900/20 border-green-500' : eventStatus === 'ended' ? 'bg-red-900/20 border-red-500' : 'bg-slate-800/50 border-slate-700'}`}>
                <h4 className="text-sm uppercase text-slate-400 mb-2">Event Status</h4>
                <p className={`text-2xl font-bold ${eventStatus === 'running' ? 'text-green-400' : eventStatus === 'ended' ? 'text-red-400' : 'text-slate-400'}`}>
                  {eventStatus === 'running' ? '🟢 RUNNING' : eventStatus === 'ended' ? '🔴 ENDED' : '⚪ NOT STARTED'}
                </p>
              </div>
              <div className="p-6 rounded-lg border-2 bg-slate-800/50 border-slate-700">
                <h4 className="text-sm uppercase text-slate-400 mb-2">Active Users</h4>
                <p className="text-2xl font-bold text-cyan-400">{users.length}</p>
              </div>
              <div className="p-6 rounded-lg border-2 bg-slate-800/50 border-slate-700">
                <h4 className="text-sm uppercase text-slate-400 mb-2">Total Challenges</h4>
                <p className="text-2xl font-bold text-purple-400">{challenges.length}</p>
              </div>
            </div>

            {/* Event Controls */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 mb-6">
              <h4 className="text-lg font-bold text-white mb-4">Event Actions</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  variant="primary"
                  onClick={handleStartEvent}
                  disabled={eventStatus === 'running'}
                  className="w-full"
                >
                  <Activity className="w-4 h-4 mr-2" /> Start Event
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleStopEvent}
                  disabled={eventStatus !== 'running'}
                  className="w-full"
                >
                  <Lock className="w-4 h-4 mr-2" /> Stop Event
                </Button>
                <Button
                  variant="danger"
                  onClick={handleResetEvent}
                  className="w-full"
                >
                  <RefreshCw className="w-4 h-4 mr-2" /> Reset Event
                </Button>
              </div>
            </div>

            {/* Announcement System */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 mb-6">
              <h4 className="text-lg font-bold text-white mb-4">Broadcast Announcement</h4>
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Type announcement message..."
                  className="flex-1 bg-slate-950 border border-slate-700 rounded px-4 py-2 text-white focus:border-cyan-500 focus:outline-none"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const message = (e.target as HTMLInputElement).value;
                      if (message) {
                        setStatusMessage(`📢 Announcement sent: ${message}`);
                        addSystemLog(`Broadcast: ${message}`);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }
                  }}
                />
                <Button variant="primary">
                  <Upload className="w-4 h-4 mr-2" /> Send to All
                </Button>
              </div>
              <p className="text-xs text-slate-500 mt-2">Press Enter or click Send to broadcast message to all participants</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                <p className="text-xs text-slate-400 uppercase mb-1">Total Submissions</p>
                <p className="text-xl font-bold text-white">{analytics?.totalSolves || 0}</p>
              </div>
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                <p className="text-xs text-slate-400 uppercase mb-1">Avg Score</p>
                <p className="text-xl font-bold text-white">{analytics?.avgPoints || 0}</p>
              </div>
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                <p className="text-xs text-slate-400 uppercase mb-1">Top Score</p>
                <p className="text-xl font-bold text-white">{users[0]?.points || 0}</p>
              </div>
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                <p className="text-xs text-slate-400 uppercase mb-1">Completion Rate</p>
                <p className="text-xl font-bold text-white">
                  {challenges.length > 0 ? Math.round(((analytics?.totalSolves || 0) / (users.length * challenges.length)) * 100) : 0}%
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'users' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="overflow-x-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white flex items-center">
                <Users className="w-5 h-5 mr-2 text-cyan-500" />
                Registered Agents ({users.length})
              </h3>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={fetchUsers} disabled={isLoading}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
                </Button>
                <Button variant="primary" onClick={handleExportLeaderboard}>
                  <Download className="w-4 h-4 mr-2" /> Export CSV
                </Button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search users by username or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            {/* Bulk Actions */}
            {selectedUsers.length > 0 && (
              <div className="mb-4 p-4 bg-cyan-900/20 border border-cyan-500/30 rounded-lg flex items-center justify-between">
                <span className="text-white font-medium">
                  {selectedUsers.length} user(s) selected
                </span>
                <div className="flex gap-2">
                  <Button
                    onClick={handleBulkBan}
                    disabled={isLoading}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    <UserCog className="w-4 h-4 mr-2" /> Ban Selected
                  </Button>
                  <Button
                    onClick={handleBulkReset}
                    disabled={isLoading}
                    className="bg-yellow-600 hover:bg-yellow-700"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" /> Reset Selected
                  </Button>
                  <Button
                    onClick={handleBulkDelete}
                    disabled={isLoading}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Delete Selected
                  </Button>
                  <Button
                    onClick={() => setSelectedUsers([])}
                    variant="secondary"
                  >
                    Clear Selection
                  </Button>
                </div>
              </div>
            )}

            {isLoading ? (
              <SkeletonTable rows={8} columns={7} />
            ) : (
              <table className="w-full text-left border-collapse font-mono text-sm">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 uppercase tracking-wider">
                    <th className="p-4 border-b border-slate-800">
                      <input
                        type="checkbox"
                        checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500"
                      />
                    </th>
                    <th className="p-4 border-b border-slate-800">Username</th>
                    <th className="p-4 border-b border-slate-800">Email</th>
                    <th className="p-4 border-b border-slate-800">Points</th>
                    <th className="p-4 border-b border-slate-800">Role</th>
                    <th className="p-4 border-b border-slate-800">Status</th>
                    <th className="p-4 border-b border-slate-800 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => toggleUserSelection(user.id)}
                          className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500"
                        />
                      </td>
                      <td className="p-4 font-bold text-white">{user.username}</td>
                      <td className="p-4 text-slate-400">{user.email}</td>
                      <td className="p-4 text-cyan-400">{user.points}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs uppercase font-bold ${user.role === 'admin' ? 'bg-red-900/50 text-red-400' : 'bg-slate-800 text-slate-400'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs uppercase font-bold ${user.banned ? 'bg-red-900/50 text-red-400' : 'bg-green-900/50 text-green-400'}`}>
                          {user.banned ? 'BANNED' : 'ACTIVE'}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        {user.role !== 'admin' && (
                          <>
                            <button
                              onClick={() => handlePromoteUser(user.id, user.username)}
                              className="p-2 text-purple-500 hover:bg-purple-900/20 rounded border border-transparent hover:border-purple-500/30 transition-colors"
                              title="Promote to Admin"
                            >
                              <Crown className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleBanUser(user.id, user.username)}
                              className="p-2 text-orange-500 hover:bg-orange-900/20 rounded border border-transparent hover:border-orange-500/30 transition-colors"
                              title={user.banned ? "Unban User" : "Ban User"}
                            >
                              <UserCog className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleResetUser(user.id, user.username)}
                              className="p-2 text-yellow-500 hover:bg-yellow-900/20 rounded border border-transparent hover:border-yellow-500/30 transition-colors"
                              title="Reset Score"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id, user.username)}
                              className="p-2 text-red-500 hover:bg-red-900/20 rounded border border-transparent hover:border-red-500/30 transition-colors"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </motion.div>
        )}

        {activeTab === 'challenges' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white flex items-center">
                <Edit className="w-5 h-5 mr-2 text-purple-500" />
                Challenge Management ({challenges.length})
              </h3>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setShowBulkUpload(true)}>
                  <Upload className="w-4 h-4 mr-2" /> Bulk Upload
                </Button>
                <Button variant="primary" onClick={() => { setEditingChallenge(null); setShowChallengeEditor(true); }}>
                  <Plus className="w-4 h-4 mr-2" /> New Challenge
                </Button>
              </div>
            </div>

            {showBulkUpload && <BulkUploadModal onClose={() => setShowBulkUpload(false)} onUpload={handleBulkUpload} />}
            {showChallengeEditor && <ChallengeEditorModal challenge={editingChallenge} onClose={() => { setShowChallengeEditor(false); setEditingChallenge(null); }} onSave={handleSaveChallenge} />}

            <div className="grid gap-4">
              {challenges.map((challenge: any) => (
                <div key={challenge.id} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-purple-500/50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-bold text-white">{challenge.title}</h4>
                        <span className={`px-2 py-1 rounded text-xs uppercase font-bold ${challenge.difficulty === 'easy' ? 'bg-green-900/50 text-green-400' :
                          challenge.difficulty === 'medium' ? 'bg-yellow-900/50 text-yellow-400' :
                            'bg-red-900/50 text-red-400'
                          }`}>
                          {challenge.difficulty}
                        </span>
                        <span className="text-cyan-400 font-mono text-sm">{challenge.points} pts</span>
                      </div>
                      <p className="text-slate-400 text-sm mb-2">{challenge.description}</p>
                      <div className="flex gap-4 text-xs text-slate-500 font-mono">
                        <span>ID: {challenge.id}</span>
                        {challenge.estimatedTime && <span>Time: {challenge.estimatedTime}</span>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setEditingChallenge(challenge); setShowChallengeEditor(true); }}
                        className="p-2 text-blue-500 hover:bg-blue-900/20 rounded border border-transparent hover:border-blue-500/30 transition-colors"
                        title="Edit Challenge"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteChallenge(challenge.id, challenge.title)}
                        className="p-2 text-red-500 hover:bg-red-900/20 rounded border border-transparent hover:border-red-500/30 transition-colors"
                        title="Delete Challenge"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'analytics' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h3 className="text-xl font-bold text-white flex items-center mb-6">
              <BarChart3 className="w-5 h-5 mr-2 text-green-500" />
              Platform Analytics
            </h3>
            {analytics && <AnalyticsDashboard data={analytics} />}
          </motion.div>
        )}

        {activeTab === 'leaderboard' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-yellow-900/10 border border-yellow-500/20 p-4 rounded-lg mb-6 flex items-start">
              <AlertTriangle className="w-5 h-5 text-yellow-500 mr-3 mt-0.5" />
              <div>
                <h4 className="text-yellow-400 font-bold text-sm uppercase">Read Only View</h4>
                <p className="text-slate-400 text-sm">This is the live view seen by participants. To manage users, switch to the "User Management" tab.</p>
              </div>
            </div>
            <LeaderboardPage currentUser={currentUser} onNavigate={onNavigate} />
          </motion.div>
        )}

        {activeTab === 'logs' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white flex items-center">
                <Terminal className="w-5 h-5 mr-2 text-orange-500" />
                System Activity Logs ({systemLogs.length})
              </h3>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={fetchSystemLogs} disabled={isLoading}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
                </Button>
                <Button variant="primary" onClick={() => {
                  const csv = [
                    ['Timestamp', 'User', 'Action', 'Target'].join(','),
                    ...systemLogs.map((log: any) =>
                      [log.timestamp, log.user, log.action, log.target].join(',')
                    )
                  ].join('\n');
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `system_logs_${new Date().toISOString().split('T')[0]}.csv`;
                  a.click();
                  setStatusMessage('Logs exported successfully.');
                }}>
                  <Download className="w-4 h-4 mr-2" /> Export Logs
                </Button>
              </div>
            </div>

            {isLoading ? (
              <SkeletonTable rows={10} columns={4} />
            ) : (
              <div className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden">
                <div className="max-h-[600px] overflow-y-auto">
                  <table className="w-full text-left border-collapse font-mono text-sm">
                    <thead className="sticky top-0 bg-slate-900 z-10">
                      <tr className="text-slate-400 uppercase tracking-wider">
                        <th className="p-4 border-b border-slate-800">Timestamp</th>
                        <th className="p-4 border-b border-slate-800">User</th>
                        <th className="p-4 border-b border-slate-800">Action</th>
                        <th className="p-4 border-b border-slate-800">Target</th>
                      </tr>
                    </thead>
                    <tbody>
                      {systemLogs.map((log: any) => (
                        <tr key={log.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                          <td className="p-4 text-slate-500 text-xs">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td className="p-4 text-cyan-400">{log.user}</td>
                          <td className="p-4 text-white">{log.action}</td>
                          <td className="p-4 text-slate-400">{log.target}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {systemLogs.length === 0 && (
                  <div className="p-8 text-center text-slate-500">
                    <Terminal className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No activity logs yet</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

// Bulk Upload Modal Component
const BulkUploadModal: React.FC<{ onClose: () => void; onUpload: (data: string) => void }> = ({ onClose, onUpload }) => {
  const [jsonData, setJsonData] = useState('');
  const [csvData, setCsvData] = useState('');
  const [mode, setMode] = useState<'json' | 'csv'>('json');

  const handleUpload = () => {
    if (mode === 'json') {
      onUpload(jsonData);
    } else {
      // Convert CSV to JSON
      const lines = csvData.trim().split('\n');
      const headers = lines[0].split(',');
      const challenges = lines.slice(1).map(line => {
        const values = line.split(',');
        const obj: any = {};
        headers.forEach((header, idx) => {
          obj[header.trim()] = values[idx]?.trim();
        });
        return obj;
      });
      onUpload(JSON.stringify(challenges));
    }
  };

  const exampleJSON = `[
  {
    "id": "web003",
    "title": "SQL Injection",
    "description": "Find the admin password",
    "difficulty": "medium",
    "points": 50,
    "hint": "Try ' OR 1=1--",
    "flag": "flag{sql_injection_master}",
    "estimated_time": "10 min",
    "duration": 600
  }
]`;

  const exampleCSV = `id,title,description,difficulty,points,hint,flag,estimated_time,duration
web003,SQL Injection,Find the admin password,medium,50,Try ' OR 1=1--,flag{sql_injection_master},10 min,600`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-slate-900 border border-purple-500/50 rounded-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-white flex items-center">
            <Upload className="w-6 h-6 mr-2 text-purple-500" />
            Bulk Upload Challenges
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        <div className="flex gap-4 mb-4">
          <button
            onClick={() => setMode('json')}
            className={`px-4 py-2 rounded font-bold ${mode === 'json' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'}`}
          >
            JSON Format
          </button>
          <button
            onClick={() => setMode('csv')}
            className={`px-4 py-2 rounded font-bold ${mode === 'csv' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'}`}
          >
            CSV Format
          </button>
        </div>

        {mode === 'json' ? (
          <>
            <label className="block text-sm font-bold text-slate-300 mb-2">Paste JSON Array:</label>
            <textarea
              value={jsonData}
              onChange={(e) => setJsonData(e.target.value)}
              className="w-full h-64 bg-slate-950 border border-slate-700 rounded p-4 text-slate-300 font-mono text-sm focus:border-purple-500 focus:outline-none"
              placeholder={exampleJSON}
            />
          </>
        ) : (
          <>
            <label className="block text-sm font-bold text-slate-300 mb-2">Paste CSV Data:</label>
            <textarea
              value={csvData}
              onChange={(e) => setCsvData(e.target.value)}
              className="w-full h-64 bg-slate-950 border border-slate-700 rounded p-4 text-slate-300 font-mono text-sm focus:border-purple-500 focus:outline-none"
              placeholder={exampleCSV}
            />
          </>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleUpload}>
            <Upload className="w-4 h-4 mr-2" /> Upload Challenges
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Challenge Editor Modal Component
const ChallengeEditorModal: React.FC<{ challenge: any; onClose: () => void; onSave: (challenge: any) => void }> = ({ challenge, onClose, onSave }) => {
  const [formData, setFormData] = useState(challenge || {
    id: '',
    title: '',
    description: '',
    difficulty: 'easy',
    points: 10,
    hint: '',
    flag: '',
    estimated_time: '',
    duration: 300,
    file_url: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-slate-900 border border-purple-500/50 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-white flex items-center">
            <Edit className="w-6 h-6 mr-2 text-purple-500" />
            {challenge ? 'Edit Challenge' : 'Create New Challenge'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">Challenge ID *</label>
              <input
                type="text"
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
                required
                disabled={!!challenge}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">Difficulty *</label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full h-24 bg-slate-950 border border-slate-700 rounded px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">Points *</label>
              <input
                type="number"
                value={formData.points}
                onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">Duration (seconds)</label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">Flag *</label>
            <input
              type="text"
              value={formData.flag}
              onChange={(e) => setFormData({ ...formData, flag: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded px-4 py-2 text-white focus:border-purple-500 focus:outline-none font-mono"
              placeholder="flag{example_flag}"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">Hint</label>
            <input
              type="text"
              value={formData.hint}
              onChange={(e) => setFormData({ ...formData, hint: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">Estimated Time</label>
              <input
                type="text"
                value={formData.estimated_time}
                onChange={(e) => setFormData({ ...formData, estimated_time: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
                placeholder="10 min"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">File URL</label>
              <input
                type="text"
                value={formData.file_url}
                onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="secondary" onClick={onClose} type="button">Cancel</Button>
            <Button variant="primary" type="submit">
              {challenge ? 'Update Challenge' : 'Create Challenge'}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// Analytics Dashboard Component
const AnalyticsDashboard: React.FC<{ data: any }> = ({ data }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-slate-800/50 border border-green-500/30 rounded-lg p-6">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-slate-400 text-sm uppercase">Total Users</h4>
          <Users className="w-5 h-5 text-green-500" />
        </div>
        <p className="text-3xl font-bold text-white">{data.totalUsers}</p>
        <p className="text-xs text-slate-500 mt-1">+{data.newUsersToday} today</p>
      </div>

      <div className="bg-slate-800/50 border border-purple-500/30 rounded-lg p-6">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-slate-400 text-sm uppercase">Total Challenges</h4>
          <Activity className="w-5 h-5 text-purple-500" />
        </div>
        <p className="text-3xl font-bold text-white">{data.totalChallenges}</p>
        <p className="text-xs text-slate-500 mt-1">{data.activeChallenges} active</p>
      </div>

      <div className="bg-slate-800/50 border border-cyan-500/30 rounded-lg p-6">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-slate-400 text-sm uppercase">Total Solves</h4>
          <BarChart3 className="w-5 h-5 text-cyan-500" />
        </div>
        <p className="text-3xl font-bold text-white">{data.totalSolves}</p>
        <p className="text-xs text-slate-500 mt-1">{data.solvesToday} today</p>
      </div>

      <div className="bg-slate-800/50 border border-yellow-500/30 rounded-lg p-6">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-slate-400 text-sm uppercase">Avg Points</h4>
          <Activity className="w-5 h-5 text-yellow-500" />
        </div>
        <p className="text-3xl font-bold text-white">{data.avgPoints}</p>
        <p className="text-xs text-slate-500 mt-1">per user</p>
      </div>

      <div className="col-span-full bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <h4 className="text-lg font-bold text-white mb-4">Most Solved Challenges</h4>
        <div className="space-y-3">
          {data.topChallenges?.map((ch: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between">
              <span className="text-slate-300">{ch.title}</span>
              <div className="flex items-center gap-3">
                <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-500"
                    style={{ width: `${(ch.solves / data.totalUsers) * 100}%` }}
                  />
                </div>
                <span className="text-cyan-400 font-mono text-sm w-12 text-right">{ch.solves}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;