import { api, setToken, clearToken } from './api';

// ==============================================================================
// DATABASE SERVICE - REST API CLIENT
// Calls the NestJS backend instead of Supabase
// ==============================================================================

export const db = {
  isLive: true,

  auth: {
    login: async (email: string, password: string) => {
      try {
        const result: any = await api.post('/auth/login', { email, password });
        setToken(result.token);
        return { user: result.user, error: null };
      } catch (error: any) {
        return { user: null, error: error.message || 'Login failed' };
      }
    },

    signup: async (email: string, password: string, username: string) => {
      try {
        const result: any = await api.post('/auth/signup', { email, password, username });
        setToken(result.token);
        return { user: result.user, error: null };
      } catch (error: any) {
        return { user: null, error: error.message || 'Signup failed' };
      }
    },
  },

  challenges: {
    list: async () => {
      const challenges: any[] = await api.get('/challenges');
      return challenges;
    },

    startChallenge: async (userId: string, challengeId: string, duration: number) => {
      try {
        const result: any = await api.post(`/challenges/${challengeId}/start`, { duration });
        return result;
      } catch (error: any) {
        console.error('Failed to start challenge:', error);
        return { started: false, timeLeft: 0 };
      }
    },

    getAttempt: async (userId: string, challengeId: string) => {
      try {
        const result: any = await api.get(`/challenges/${challengeId}/attempt`);
        return result;
      } catch (error) {
        return null;
      }
    },

    submitFlag: async (userId: string, challengeId: string, guess: string) => {
      try {
        const result: any = await api.post(`/challenges/${challengeId}/submit`, { flag: guess });
        return result;
      } catch (error: any) {
        return { success: false, message: error.message || 'Submission failed.' };
      }
    },
  },

  user: {
    getData: async (userId: string) => {
      try {
        const data: any = await api.get('/users/me');
        return data;
      } catch (error) {
        console.error('Failed to get user data:', error);
        return { stats: { points: 0, correct: 0, total: 0 }, solved: [] };
      }
    },
  },

  leaderboard: {
    get: async () => {
      try {
        const data: any[] = await api.get('/leaderboard');
        return data;
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
        return [];
      }
    },
  },

  activity: {
    get: async () => {
      try {
        const data: any[] = await api.get('/activity');
        return data;
      } catch (error) {
        console.error('Failed to fetch activity:', error);
        return [];
      }
    },
  },

  admin: {
    getUsers: async () => {
      try {
        const data: any[] = await api.get('/admin/users');
        return data;
      } catch (error) {
        console.error('Failed to fetch users:', error);
        return [];
      }
    },

    deleteUser: async (targetId: string) => {
      try {
        return await api.delete<any>(`/admin/users/${targetId}`);
      } catch (error: any) {
        return { success: false, message: error.message };
      }
    },

    resetUser: async (targetId: string) => {
      try {
        return await api.patch<any>(`/admin/users/${targetId}/reset`);
      } catch (error: any) {
        return { success: false, message: error.message };
      }
    },

    promoteUser: async (targetId: string) => {
      try {
        return await api.patch<any>(`/admin/users/${targetId}/promote`);
      } catch (error: any) {
        return { success: false, message: error.message };
      }
    },

    banUser: async (targetId: string) => {
      try {
        return await api.patch<any>(`/admin/users/${targetId}/ban`);
      } catch (error: any) {
        return { success: false, message: error.message };
      }
    },

    bulkUploadChallenges: async (challenges: any[]) => {
      try {
        return await api.post<any>('/admin/challenges/bulk', challenges);
      } catch (error: any) {
        return { success: false, message: error.message };
      }
    },

    createChallenge: async (challenge: any) => {
      try {
        return await api.post<any>('/admin/challenges', challenge);
      } catch (error: any) {
        return { success: false, message: error.message };
      }
    },

    updateChallenge: async (challenge: any) => {
      try {
        return await api.put<any>(`/admin/challenges/${challenge.id}`, challenge);
      } catch (error: any) {
        return { success: false, message: error.message };
      }
    },

    deleteChallenge: async (challengeId: string) => {
      try {
        return await api.delete<any>(`/admin/challenges/${challengeId}`);
      } catch (error: any) {
        return { success: false, message: error.message };
      }
    },

    getAnalytics: async () => {
      try {
        return await api.get('/admin/analytics');
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
        return {
          totalUsers: 0,
          newUsersToday: 0,
          totalChallenges: 0,
          activeChallenges: 0,
          totalSolves: 0,
          solvesToday: 0,
          avgPoints: 0,
          topChallenges: [],
        };
      }
    },
  },
};
