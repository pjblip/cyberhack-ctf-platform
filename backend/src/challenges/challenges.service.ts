import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Challenge } from '../database/entities/challenge.entity';
import { Solve } from '../database/entities/solve.entity';
import { ChallengeAttempt } from '../database/entities/challenge-attempt.entity';
import { User } from '../database/entities/user.entity';
import { ActivityLog } from '../database/entities/activity-log.entity';
import { Submission } from '../database/entities/submission.entity';
import { EventsService } from '../events/events.service';

// Flag submission cooldown in seconds
const SUBMISSION_COOLDOWN_SECONDS = 5;

@Injectable()
export class ChallengesService {
    constructor(
        @InjectRepository(Challenge)
        private readonly challengeRepo: Repository<Challenge>,
        @InjectRepository(Solve)
        private readonly solveRepo: Repository<Solve>,
        @InjectRepository(ChallengeAttempt)
        private readonly attemptRepo: Repository<ChallengeAttempt>,
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        @InjectRepository(ActivityLog)
        private readonly activityRepo: Repository<ActivityLog>,
        @InjectRepository(Submission)
        private readonly submissionRepo: Repository<Submission>,
        private readonly eventsService: EventsService,
    ) { }

    async listActive() {
        const challenges = await this.challengeRepo.find({
            where: { isActive: true },
            order: { difficulty: 'ASC' },
        });

        // Strip flag from response (security)
        return challenges.map((c) => ({
            id: c.id,
            title: c.title,
            description: c.description,
            difficulty: c.difficulty,
            points: c.points,
            hints: c.hints,
            hint: c.hints?.[0] || null,
            category: c.category,
            estimatedTime: c.estimatedTime || '5-10 min',
            duration: c.duration || 300,
            fileUrl: c.fileUrl,
        }));
    }

    async startChallenge(userId: string, challengeId: string, duration: number) {
        // Check if already started
        const existing = await this.attemptRepo.findOne({
            where: { userId, challengeId },
        });

        if (existing) {
            const now = new Date();
            const timeLeft = Math.max(0, Math.floor((existing.expiresAt.getTime() - now.getTime()) / 1000));
            return {
                started: true,
                startedAt: existing.startedAt.toISOString(),
                expiresAt: existing.expiresAt.toISOString(),
                timeLeft,
                completed: existing.completed,
            };
        }

        const now = new Date();
        const expiresAt = new Date(now.getTime() + duration * 1000);

        const attempt = this.attemptRepo.create({
            userId,
            challengeId,
            startedAt: now,
            expiresAt,
            completed: false,
        });

        await this.attemptRepo.save(attempt);

        return {
            started: true,
            startedAt: now.toISOString(),
            expiresAt: expiresAt.toISOString(),
            timeLeft: duration,
            completed: false,
        };
    }

    async getAttempt(userId: string, challengeId: string) {
        const attempt = await this.attemptRepo.findOne({
            where: { userId, challengeId },
        });

        if (!attempt) return null;

        const now = new Date();
        const timeLeft = Math.max(0, Math.floor((attempt.expiresAt.getTime() - now.getTime()) / 1000));

        return {
            started: true,
            startedAt: attempt.startedAt.toISOString(),
            expiresAt: attempt.expiresAt.toISOString(),
            timeLeft,
            completed: attempt.completed,
        };
    }

    async submitFlag(userId: string, challengeId: string, guess: string, ipAddress: string) {
        // --- Cooldown check: prevent rapid-fire submissions ---
        const cooldownThreshold = new Date(Date.now() - SUBMISSION_COOLDOWN_SECONDS * 1000);
        const recentSubmission = await this.submissionRepo.findOne({
            where: {
                userId,
                submittedAt: MoreThan(cooldownThreshold),
            },
            order: { submittedAt: 'DESC' },
        });

        if (recentSubmission) {
            const waitTime = Math.ceil(
                (recentSubmission.submittedAt.getTime() + SUBMISSION_COOLDOWN_SECONDS * 1000 - Date.now()) / 1000,
            );
            return {
                success: false,
                message: `Cooldown active. Wait ${waitTime} second(s) before submitting again.`,
            };
        }

        // Check timer
        const attempt = await this.attemptRepo.findOne({
            where: { userId, challengeId },
        });

        if (attempt) {
            const now = new Date();
            if (now > attempt.expiresAt && !attempt.completed) {
                return { success: false, message: 'Time Expired. Challenge Failed.' };
            }
        }

        // Get challenge
        const challenge = await this.challengeRepo.findOne({
            where: { id: challengeId },
        });

        if (!challenge) {
            throw new BadRequestException('Error: Challenge ID invalid.');
        }

        // Case-insensitive flag comparison
        const isCorrect = guess.toLowerCase() === challenge.flag.toLowerCase();

        // Get user for team_id and username
        const user = await this.userRepo.findOne({ where: { id: userId } });

        // --- Record every submission attempt (correct or incorrect) ---
        const submission = this.submissionRepo.create({
            userId,
            challengeId,
            teamId: user?.teamId || null,
            flagSubmitted: guess,
            ipAddress,
            isCorrect,
        });
        await this.submissionRepo.save(submission);

        if (!isCorrect) {
            return { success: false, message: 'Hash Mismatch. Flag Incorrect.' };
        }

        // Check already solved (prevent duplicate points)
        const existingSolve = await this.solveRepo.findOne({
            where: { userId, challengeId },
        });

        if (existingSolve) {
            return { success: false, message: 'Flag already captured.' };
        }

        // Mark attempt completed
        if (attempt) {
            attempt.completed = true;
            await this.attemptRepo.save(attempt);
        }

        // Record solve with IP address
        const solve = this.solveRepo.create({
            userId,
            challengeId,
            pointsEarned: challenge.points,
            ipAddress,
        });
        await this.solveRepo.save(solve);

        // Update user points
        const newPoints = (user?.points || 0) + challenge.points;
        await this.userRepo.update(userId, { points: newPoints });

        // Log activity
        const activity = this.activityRepo.create({
            userId,
            username: user?.username || 'Unknown',
            action: 'captured flag',
            target: challenge.title,
        });
        await this.activityRepo.save(activity);

        // Emit realtime events
        this.eventsService.emit({
            type: 'solve',
            data: {
                id: solve.id,
                username: user?.username,
                challengeTitle: challenge.title,
                points: challenge.points,
                timestamp: new Date().toISOString(),
            },
        });

        this.eventsService.emit({
            type: 'leaderboard_update',
            data: {
                userId,
                username: user?.username,
                points: newPoints,
            },
        });

        this.eventsService.emit({
            type: 'activity',
            data: {
                id: activity.id,
                username: user?.username,
                action: 'captured flag',
                target: challenge.title,
                timestamp: activity.createdAt,
            },
        });

        return { success: true, points: newPoints, message: 'Flag Accepted.' };
    }
}
