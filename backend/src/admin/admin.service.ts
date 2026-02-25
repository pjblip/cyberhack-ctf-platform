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
        await this.eventStateRepo.upsert(
            { id: true, started: true, startTime: new Date() },
            ['id'],
        );
        await this.logAction('started event', 'CTF Event');
        return { success: true, message: 'Event started. Challenge editing is now locked.' };
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
}
