import { useState } from 'react';
import { Megaphone, Send, AlertCircle, Info, CheckCircle } from 'lucide-react';
import Button from './ui/Button';
import Card from './ui/Card';
import { db } from '../services/db';

const AnnouncementPanel = () => {
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'info' | 'warning' | 'success'>('info');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const handleBroadcast = async () => {
    if (!message.trim()) {
      setStatusMessage('Please enter a message');
      return;
    }

    setIsLoading(true);
    const result = await db.admin.createAnnouncement(message, type);
    
    if (result.success) {
      setStatusMessage('✅ Announcement broadcasted to all users!');
      setMessage('');
      setTimeout(() => setStatusMessage(''), 3000);
    } else {
      setStatusMessage('❌ Failed to broadcast announcement');
    }
    
    setIsLoading(false);
  };

  const getIcon = () => {
    switch (type) {
      case 'info': return <Info className="w-5 h-5 text-cyan-400" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      case 'success': return <CheckCircle className="w-5 h-5 text-emerald-400" />;
    }
  };

  return (
    <Card>
      <div className="flex items-center space-x-3 mb-6">
        <Megaphone className="w-6 h-6 text-cyan-400" />
        <h3 className="text-xl font-bold text-white">Broadcast Announcement</h3>
      </div>

      <div className="space-y-4">
        {/* Type Selector */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Announcement Type
          </label>
          <div className="flex space-x-2">
            <button
              onClick={() => setType('info')}
              className={`flex-1 px-4 py-2 rounded-lg border transition-all ${
                type === 'info'
                  ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
              }`}
            >
              <Info className="w-4 h-4 inline mr-2" />
              Info
            </button>
            <button
              onClick={() => setType('warning')}
              className={`flex-1 px-4 py-2 rounded-lg border transition-all ${
                type === 'warning'
                  ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
              }`}
            >
              <AlertCircle className="w-4 h-4 inline mr-2" />
              Warning
            </button>
            <button
              onClick={() => setType('success')}
              className={`flex-1 px-4 py-2 rounded-lg border transition-all ${
                type === 'success'
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
              }`}
            >
              <CheckCircle className="w-4 h-4 inline mr-2" />
              Success
            </button>
          </div>
        </div>

        {/* Message Input */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your announcement here..."
            rows={4}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors resize-none"
          />
          <p className="text-slate-500 text-sm mt-1">
            {message.length} / 500 characters
          </p>
        </div>

        {/* Preview */}
        {message && (
          <div className="p-4 rounded-lg border bg-slate-800/50" style={{
            borderColor: type === 'info' ? '#22d3ee' : type === 'warning' ? '#eab308' : '#10b981'
          }}>
            <div className="flex items-start space-x-3">
              {getIcon()}
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-300 mb-1">Preview:</p>
                <p className="text-white">{message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Broadcast Button */}
        <Button
          onClick={handleBroadcast}
          disabled={isLoading || !message.trim()}
          icon={<Send className="w-4 h-4" />}
          className="w-full"
        >
          {isLoading ? 'Broadcasting...' : 'Broadcast to All Users'}
        </Button>

        {/* Status Message */}
        {statusMessage && (
          <div className={`p-3 rounded-lg text-center ${
            statusMessage.includes('✅') 
              ? 'bg-emerald-500/20 text-emerald-400' 
              : 'bg-red-500/20 text-red-400'
          }`}>
            {statusMessage}
          </div>
        )}

        {/* Quick Templates */}
        <div className="pt-4 border-t border-slate-700">
          <p className="text-sm font-medium text-slate-400 mb-2">Quick Templates:</p>
          <div className="space-y-2">
            <button
              onClick={() => setMessage('Event will start in 5 minutes. Get ready!')}
              className="w-full text-left px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded text-sm text-slate-300 transition-colors"
            >
              📢 Event starting soon
            </button>
            <button
              onClick={() => setMessage('15 minutes remaining. Finish your challenges!')}
              className="w-full text-left px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded text-sm text-slate-300 transition-colors"
            >
              ⏰ Time warning
            </button>
            <button
              onClick={() => setMessage('Great job everyone! Keep up the excellent work!')}
              className="w-full text-left px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded text-sm text-slate-300 transition-colors"
            >
              🎉 Encouragement
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AnnouncementPanel;
