// Real-time Service using Server-Sent Events (SSE) from NestJS backend

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Types
export interface SolveNotification {
  id: string;
  username: string;
  challengeTitle: string;
  points: number;
  timestamp: string;
}

export interface LeaderboardUpdate {
  userId: string;
  username: string;
  points: number;
  solves: number;
}

export interface ActivityUpdate {
  id: string;
  username: string;
  action: string;
  target: string;
  timestamp: string;
}

export interface UserStatus {
  userId: string;
  username: string;
  status: 'online' | 'offline';
  lastSeen: string;
}

// SSE-based Realtime Manager
class RealtimeManager {
  private eventSource: EventSource | null = null;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private isEnabled: boolean = true;

  constructor() {
    // Will be connected when subscriptions are made
  }

  private ensureConnection() {
    if (this.eventSource) return;

    const token = localStorage.getItem('auth_token');
    if (!token) {
      this.isEnabled = false;
      return;
    }

    // EventSource doesn't support custom headers, so pass token as query param
    this.eventSource = new EventSource(`${API_BASE}/events/stream?token=${token}`);

    this.eventSource.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        this.dispatch(parsed.type || 'message', parsed.data || parsed);
      } catch {
        // ignore non-JSON messages
      }
    };

    // Handle named event types
    ['solve', 'leaderboard_update', 'activity', 'user_update', 'heartbeat'].forEach((type) => {
      this.eventSource!.addEventListener(type, (event: any) => {
        try {
          const data = JSON.parse(event.data);
          this.dispatch(type, data);
        } catch {
          // ignore
        }
      });
    });

    this.eventSource.onerror = () => {
      // Reconnect after 5 seconds
      setTimeout(() => {
        this.disconnect();
        this.ensureConnection();
      }, 5000);
    };
  }

  private dispatch(type: string, data: any) {
    const callbacks = this.listeners.get(type);
    if (callbacks) {
      callbacks.forEach((cb) => cb(data));
    }
  }

  private addListener(type: string, callback: (data: any) => void) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(callback);
    this.ensureConnection();
  }

  private removeListener(type: string, callback: (data: any) => void) {
    const callbacks = this.listeners.get(type);
    if (callbacks) {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.listeners.delete(type);
      }
    }
  }

  // Subscribe to solve notifications
  subscribeSolves(callback: (notification: SolveNotification) => void) {
    this.addListener('solve', callback);
    return {
      unsubscribe: () => this.removeListener('solve', callback)
    };
  }

  // Subscribe to leaderboard updates
  subscribeLeaderboard(callback: (update: LeaderboardUpdate) => void) {
    this.addListener('leaderboard_update', callback);
    return {
      unsubscribe: () => this.removeListener('leaderboard_update', callback)
    };
  }

  // Subscribe to activity feed
  subscribeActivity(callback: (activity: ActivityUpdate) => void) {
    this.addListener('activity', callback);
    return {
      unsubscribe: () => this.removeListener('activity', callback)
    };
  }

  // Track user presence (simplified - no true presence tracking without WebSocket)
  async trackPresence(userId: string, username: string) {
    // Presence tracking would require WebSocket; SSE is one-directional
    // For now, users are considered "online" while connected to SSE
    return {
      unsubscribe: () => { }
    };
  }

  // Get online users (simplified)
  getOnlineUsers(): UserStatus[] {
    // Without WebSocket, we can't track presence accurately
    // Return empty for now
    return [];
  }

  // Unsubscribe from a channel type (Legacy support, though not used internally anymore)
  unsubscribe(channelName: string) {
    this.listeners.delete(channelName);
  }

  // Disconnect and unsubscribe from everything
  private disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  // Unsubscribe from all
  unsubscribeAll() {
    this.listeners.clear();
    this.disconnect();
  }

  // Check if realtime is enabled
  isRealtimeEnabled(): boolean {
    return this.isEnabled;
  }
}

// Export singleton instance
export const realtimeManager = new RealtimeManager();

// Convenience functions (same API as before)
export const subscribeSolves = (callback: (notification: SolveNotification) => void) =>
  realtimeManager.subscribeSolves(callback);

export const subscribeLeaderboard = (callback: (update: LeaderboardUpdate) => void) =>
  realtimeManager.subscribeLeaderboard(callback);

export const subscribeActivity = (callback: (activity: ActivityUpdate) => void) =>
  realtimeManager.subscribeActivity(callback);

export const trackPresence = (userId: string, username: string) =>
  realtimeManager.trackPresence(userId, username);

export const getOnlineUsers = () =>
  realtimeManager.getOnlineUsers();

export const unsubscribeAll = () =>
  realtimeManager.unsubscribeAll();
