import { db } from '../services/db';
import { Stats, Challenge } from '../types';

// WRAPPER FOR BACKWARD COMPATIBILITY & LOCAL STATE MANAGEMENT

export const getChallenges = async (): Promise<Challenge[]> => {
    return await db.challenges.list();
};

export const getSolvedCases = async (userId: string): Promise<string[]> => {
    const data = await db.user.getData(userId);
    return data.solved;
};

export const saveSolvedCase = async (userId: string, caseId: string) => {
   // Handled by backend in submitFlag
   // We can optimistically update local storage if needed, but for now we rely on fetch
};

export const getUserStats = async (userId: string): Promise<Stats> => {
    const data = await db.user.getData(userId);
    return data.stats;
};

export const saveStats = async (userId: string, stats: Stats) => {
    // Only used in Mock mode or for purchasing hints
    // Real stats are updated by submitFlag on server
};

export const getChallengeSolveCounts = async (): Promise<Record<string, number>> => {
    return {}; // Not implemented in Sheets yet to save bandwidth
};

// HINTS (Local Storage Only for now to save Sheet Calls)
export const getUnlockedHints = async (userId: string): Promise<string[]> => {
    try {
        const stored = localStorage.getItem(`hints_${userId}`);
        return stored ? JSON.parse(stored) : [];
    } catch { return []; }
};

export const saveUnlockedHint = async (userId: string, challengeId: string) => {
    const current = await getUnlockedHints(userId);
    if (!current.includes(challengeId)) {
        current.push(challengeId);
        localStorage.setItem(`hints_${userId}`, JSON.stringify(current));
    }
};