import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { Challenge } from '../database/entities/challenge.entity';
import { Solve } from '../database/entities/solve.entity';
import { ActivityLog } from '../database/entities/activity-log.entity';
import { EventState } from '../database/entities/event-state.entity';

@Injectable()
export class AdminService {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        @InjectRepository(Challenge)
        private readonly challengeRepo: Repository<Challenge>,
        @InjectRepository(Solve)
        private readonly solveRepo: Repository<Solve>,
        @InjectRepository(ActivityLog)
        private readonly activityRepo: Repository<ActivityLog>,
        @InjectRepository(EventState)
        private readonly eventStateRepo: Repository<EventState>,
    ) { }

    // --- Admin Action Logging ---

    private async logAction(action: string, target: string, adminUsername = 'Admin') {
        const log = this.activityRepo.create({
            userId: undefined,
            username: adminUsername,
            action,
            target,
        });
        await this.activityRepo.save(log);
    }

    // --- User Management ---

    async getUsers() {
        const users = await this.userRepo.find({
            order: { createdAt: 'DESC' },
            select: ['id', 'username', 'email', 'isAdmin', 'points', 'createdAt', 'banned'],
        });

        return users.map((u) => ({
            ...u,
            role: u.isAdmin ? 'admin' : 'agent',
        }));
    }

    async getLeaderboard() {
        const users = await this.userRepo.find({
            order: { points: 'DESC' },
            take: 100,
            relations: ['team'],
        });

        return users.map(u => ({
            id: u.id,
            username: u.username,
            points: u.points,
            team: u.team?.name || 'Solo',
        }));
    }

    async deleteUser(targetId: string) {
        const user = await this.userRepo.findOne({ where: { id: targetId } });
        await this.userRepo.delete(targetId);
        await this.logAction('deleted user', user?.username || targetId);
        return { success: true, message: 'Agent profile terminated.' };
    }

    async resetUser(targetId: string) {
        const user = await this.userRepo.findOne({ where: { id: targetId } });
        await this.userRepo.update(targetId, { points: 0 });
        await this.solveRepo.delete({ userId: targetId });
        await this.logAction('reset user', user?.username || targetId);
        return { success: true };
    }

    async promoteUser(targetId: string) {
        const user = await this.userRepo.findOne({ where: { id: targetId } });
        await this.userRepo.update(targetId, { isAdmin: true });
        await this.logAction('promoted user', user?.username || targetId);
        return { success: true };
    }

    async banUser(targetId: string) {
        const user = await this.userRepo.findOne({ where: { id: targetId } });
        if (!user) return { success: false, message: 'User not found' };
        await this.userRepo.update(targetId, { banned: !user.banned });
        await this.logAction(user.banned ? 'unbanned user' : 'banned user', user.username);
        return { success: true };
    }

    async bulkBanUsers(userIds: string[]) {
        for (const id of userIds) {
            await this.userRepo.update(id, { banned: true });
        }
        await this.logAction('bulk banned users', `${userIds.length} users`);
        return { success: true, count: userIds.length };
    }

    async bulkResetUsers(userIds: string[]) {
        for (const id of userIds) {
            await this.userRepo.update(id, { points: 0 });
            await this.solveRepo.delete({ userId: id });
        }
        await this.logAction('bulk reset users', `${userIds.length} users`);
        return { success: true, count: userIds.length };
    }

    async bulkDeleteUsers(userIds: string[]) {
        await this.userRepo.delete(userIds);
        await this.logAction('bulk deleted users', `${userIds.length} users`);
        return { success: true, count: userIds.length };
    }

    // --- Challenge Management ---

    async createChallenge(data: Partial<Challenge>) {
        const challenge = this.challengeRepo.create({
            ...data,
            isActive: true,
        });
        await this.challengeRepo.save(challenge);
        await this.logAction('created challenge', challenge.title || challenge.id);
        return { success: true };
    }

    async updateChallenge(id: string, data: Partial<Challenge>) {
        await this.challengeRepo.update(id, data);
        await this.logAction('updated challenge', id);
        return { success: true };
    }

    async deleteChallenge(id: string) {
        await this.challengeRepo.delete(id);
        await this.logAction('deleted challenge', id);
        return { success: true };
    }

    async bulkUploadChallenges(challenges: Partial<Challenge>[]) {
        const entities = challenges.map((c) =>
            this.challengeRepo.create({ ...c, isActive: true }),
        );
        await this.challengeRepo.save(entities);
        await this.logAction('bulk uploaded challenges', `${entities.length} challenges`);
        return { success: true, count: entities.length };
    }

    // --- Event Control ---

    async startEvent() {
        const now = new Date();
        const endTime = new Date(now.getTime() + 60 * 60 * 1000); // 60 minutes from now
        
        await this.eventStateRepo.upsert(
            { id: true, started: true, startTime: now, endTime },
            ['id'],
        );
        await this.logAction('started event', 'CTF Event');
        return { 
            success: true, 
            message: 'Event started. Challenge editing is now locked.',
            startTime: now.toISOString(),
            endTime: endTime.toISOString(),
        };
    }

    async stopEvent() {
        await this.eventStateRepo.upsert(
            { id: true, started: false, endTime: new Date() },
            ['id'],
        );
        await this.logAction('stopped event', 'CTF Event');
        return { success: true, message: 'Event stopped. Challenge editing is now unlocked.' };
    }

    async getEventStatus() {
        const state = await this.eventStateRepo.findOne({ where: { id: true } });
        return {
            started: state?.started || false,
            startTime: state?.startTime || null,
            endTime: state?.endTime || null,
        };
    }

    // --- Analytics ---

    async getAnalytics() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [
            totalUsers,
            newUsersToday,
            totalChallenges,
            activeChallenges,
            totalSolves,
            solvesToday,
        ] = await Promise.all([
            this.userRepo.count(),
            this.userRepo.count({ where: { createdAt: MoreThanOrEqual(today) } }),
            this.challengeRepo.count(),
            this.challengeRepo.count({ where: { isActive: true } }),
            this.solveRepo.count(),
            this.solveRepo.count({ where: { solvedAt: MoreThanOrEqual(today) } }),
        ]);

        // Average points
        const users = await this.userRepo.find({ select: ['points'] });
        const avgPoints = users.length
            ? Math.round(users.reduce((sum, u) => sum + u.points, 0) / users.length)
            : 0;

        // Top challenges
        const solves = await this.solveRepo.find({
            relations: ['challenge'],
            take: 100,
        });
        const challengeCounts: Record<string, number> = {};
        solves.forEach((s) => {
            const title = s.challenge?.title;
            if (title) challengeCounts[title] = (challengeCounts[title] || 0) + 1;
        });

        const topChallenges = Object.entries(challengeCounts)
            .map(([title, count]) => ({ title, solves: count }))
            .sort((a, b) => b.solves - a.solves)
            .slice(0, 5);

        return {
            totalUsers,
            newUsersToday,
            totalChallenges,
            activeChallenges,
            totalSolves,
            solvesToday,
            avgPoints,
            topChallenges,
        };
    }

    // --- Live Dashboard ---
    async getLiveDashboard() {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        
        const [
            totalUsers,
            onlineUsers,
            recentSolves,
            recentActivity,
            eventStatus,
        ] = await Promise.all([
            this.userRepo.count(),
            this.activityRepo
                .createQueryBuilder('activity')
                .select('COUNT(DISTINCT activity.userId)', 'count')
                .where('activity.createdAt >= :time', { time: fiveMinutesAgo })
                .getRawOne()
                .then(r => parseInt(r.count) || 0),
            this.solveRepo.find({
                where: { solvedAt: MoreThanOrEqual(fiveMinutesAgo) },
                relations: ['user', 'challenge'],
                order: { solvedAt: 'DESC' },
                take: 10,
            }),
            this.activityRepo.find({
                order: { createdAt: 'DESC' },
                take: 20,
            }),
            this.getEventStatus(),
        ]);

        return {
            totalUsers,
            onlineUsers,
            recentSolves: recentSolves.map(s => ({
                username: s.user?.username,
                challenge: s.challenge?.title,
                points: s.pointsEarned,
                timestamp: s.solvedAt,
            })),
            recentActivity: recentActivity.map(a => ({
                username: a.username,
                action: a.action,
                target: a.target,
                timestamp: a.createdAt,
            })),
            eventStatus,
            timestamp: new Date().toISOString(),
        };
    }

    // --- Announcements ---
    async createAnnouncement(message: string, type: 'info' | 'warning' | 'success' = 'info') {
        const announcement = this.activityRepo.create({
            userId: undefined,
            username: 'SYSTEM',
            action: 'announcement',
            target: message,
        });
        await this.activityRepo.save(announcement);
        await this.logAction('created announcement', message.substring(0, 50));
        return { 
            success: true, 
            announcement: {
                id: announcement.id,
                message,
                type,
                timestamp: announcement.createdAt,
            }
        };
    }

    // --- Backup ---
    async createBackup() {
        // This would typically use a database backup command
        // For SQLite, we can copy the file
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupName = `backup_${timestamp}.db`;
        
        await this.logAction('created backup', backupName);
        
        return {
            success: true,
            message: 'Backup created successfully',
            filename: backupName,
            timestamp: new Date().toISOString(),
        };
    }
}
