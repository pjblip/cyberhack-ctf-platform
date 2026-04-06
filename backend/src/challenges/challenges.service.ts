import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Challenge } from '../database/entities/challenge.entity';
import { Solve } from '../database/entities/solve.entity';
import { ChallengeAttempt } from '../database/entities/challenge-attempt.entity';
import { User } from '../database/entities/user.entity';
import { ActivityLog } from '../database/entities/activity-log.entity';
import { Submission } from '../database/entities/submission.entity';
import { HintUsage } from '../database/entities/hint-usage.entity';
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
        @InjectRepository(HintUsage)
        private readonly hintUsageRepo: Repository<HintUsage>,
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

    async getSolveCounts() {
        const challenges = await this.challengeRepo.find({
            where: { isActive: true },
            select: ['id', 'title'],
        });

        const solveCounts = await Promise.all(
            challenges.map(async (challenge) => {
                const count = await this.solveRepo.count({
                    where: { challengeId: challenge.id },
                });
                return {
                    challengeId: challenge.id,
                    title: challenge.title,
                    solveCount: count,
                };
            })
        );

        return solveCounts;
    }

    async getLockoutStatus(userId: string, challengeId: string) {
        // Check for recent failed attempts (lockout logic)
        const recentAttempts = await this.submissionRepo.find({
            where: {
                userId,
                challengeId,
                isCorrect: false,
            },
            order: { submittedAt: 'DESC' },
            take: 3,
        });

        if (recentAttempts.length >= 3) {
            const lastAttempt = recentAttempts[0];
            const lockoutEnd = new Date(lastAttempt.submittedAt.getTime() + 60 * 1000); // 60 seconds
            const now = new Date();

            if (now < lockoutEnd) {
                const remainingTime = Math.ceil((lockoutEnd.getTime() - now.getTime()) / 1000);
                return {
                    isLocked: true,
                    remainingTime,
                    message: `Too many failed attempts. Try again in ${remainingTime} seconds.`,
                };
            }
        }

        return { isLocked: false };
    }

    async getHints(userId: string, challengeId: string) {
        const challenge = await this.challengeRepo.findOne({
            where: { id: challengeId },
            select: ['hints', 'hintCosts'],
        });

        if (!challenge || !challenge.hints) {
            return { hints: [] };
        }

        // Get purchased hints for this user
        const purchasedHints = await this.hintUsageRepo.find({
            where: { userId, challengeId },
            select: ['hintIndex'],
        });

        const purchasedIndices = new Set(purchasedHints.map(h => h.hintIndex));

        // Parse hint costs - handle both array and comma-separated string
        let costs = [5, 10, 15]; // default progressive costs
        if (challenge.hintCosts) {
            try {
                if (Array.isArray(challenge.hintCosts)) {
                    costs = challenge.hintCosts;
                } else {
                    const costsStr = String(challenge.hintCosts);
                    costs = costsStr.split(',').map(c => parseInt(c.trim()));
                }
            } catch (e) {
                console.error('Error parsing hint costs:', e);
                // Use default costs
            }
        }

        return {
            hints: challenge.hints.map((hint, index) => ({
                index,
                cost: costs[index] || 5,
                purchased: purchasedIndices.has(index),
                content: purchasedIndices.has(index) ? hint : null,
            })),
        };
    }

    async purchaseHint(userId: string, challengeId: string, hintIndex: number) {
        const challenge = await this.challengeRepo.findOne({
            where: { id: challengeId },
            select: ['hints', 'hintCosts'],
        });

        if (!challenge || !challenge.hints || !challenge.hints[hintIndex]) {
            throw new BadRequestException('Hint not found');
        }

        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) {
            throw new BadRequestException('User not found');
        }

        // Check if hint already purchased
        const existingPurchase = await this.hintUsageRepo.findOne({
            where: { userId, challengeId, hintIndex },
        });

        if (existingPurchase) {
            return {
                success: true,
                hint: challenge.hints[hintIndex],
                remainingPoints: user.points,
                message: 'Hint already purchased',
            };
        }

        // SEQUENTIAL UNLOCKING: Check if previous hint is purchased (except for first hint)
        if (hintIndex > 0) {
            const previousHintPurchased = await this.hintUsageRepo.findOne({
                where: { userId, challengeId, hintIndex: hintIndex - 1 },
            });

            if (!previousHintPurchased) {
                throw new BadRequestException(`You must unlock Hint ${hintIndex} before unlocking Hint ${hintIndex + 1}`);
            }
        }

        // Parse hint costs - handle both array and comma-separated string
        let costs = [5, 10, 15]; // default progressive costs
        if (challenge.hintCosts) {
            try {
                if (Array.isArray(challenge.hintCosts)) {
                    costs = challenge.hintCosts;
                } else {
                    const costsStr = String(challenge.hintCosts);
                    costs = costsStr.split(',').map(c => parseInt(c.trim()));
                }
            } catch (e) {
                console.error('Error parsing hint costs:', e);
                // Use default costs
            }
        }

        const hintCost = costs[hintIndex] || 5;

        if (user.points < hintCost) {
            throw new BadRequestException('Insufficient points for hint');
        }

        // Deduct points
        await this.userRepo.update(userId, { points: user.points - hintCost });

        // Record hint purchase
        const hintUsage = this.hintUsageRepo.create({
            userId,
            challengeId,
            hintIndex,
            cost: hintCost,
        });
        await this.hintUsageRepo.save(hintUsage);

        return {
            success: true,
            hint: challenge.hints[hintIndex],
            remainingPoints: user.points - hintCost,
        };
    }

    async getUserStats(userId: string) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) {
            throw new BadRequestException('User not found');
        }

        const solves = await this.solveRepo.find({
            where: { userId },
            relations: ['challenge'],
            order: { solvedAt: 'DESC' },
        });

        const attempts = await this.attemptRepo.find({
            where: { userId },
            relations: ['challenge'],
        });

        const hintUsages = await this.hintUsageRepo.find({
            where: { userId },
        });

        // Calculate stats by difficulty
        const statsByDifficulty = {
            easy: { solved: 0, attempted: 0, totalPoints: 0 },
            medium: { solved: 0, attempted: 0, totalPoints: 0 },
            hard: { solved: 0, attempted: 0, totalPoints: 0 },
        };

        solves.forEach(solve => {
            const difficulty = solve.challenge?.difficulty?.toLowerCase();
            if (difficulty && statsByDifficulty[difficulty]) {
                statsByDifficulty[difficulty].solved++;
                statsByDifficulty[difficulty].totalPoints += solve.pointsEarned || 0;
            }
        });

        attempts.forEach(attempt => {
            const difficulty = attempt.challenge?.difficulty?.toLowerCase();
            if (difficulty && statsByDifficulty[difficulty]) {
                statsByDifficulty[difficulty].attempted++;
            }
        });

        // Calculate average solve time from attempts
        const completedAttempts = attempts.filter(a => {
            return solves.some(s => s.challengeId === a.challengeId);
        });
        
        const solveTimes = completedAttempts
            .map(attempt => {
                const solve = solves.find(s => s.challengeId === attempt.challengeId);
                if (solve && attempt.startedAt) {
                    const startTime = new Date(attempt.startedAt).getTime();
                    const endTime = new Date(solve.solvedAt).getTime();
                    return Math.floor((endTime - startTime) / 1000); // seconds
                }
                return null;
            })
            .filter((time): time is number => time !== null && time > 0);

        const averageSolveTime = solveTimes.length > 0
            ? Math.round(solveTimes.reduce((a, b) => a + b, 0) / solveTimes.length)
            : 0;

        // Calculate total hint cost
        const totalHintCost = hintUsages.reduce((sum, usage) => sum + (usage.cost || 0), 0);

        return {
            user: {
                id: user.id,
                username: user.username,
                score: user.points || 0,
                role: user.isAdmin ? 'admin' : 'user',
            },
            stats: {
                totalSolves: solves.length,
                totalAttempts: attempts.length,
                totalHintsUsed: hintUsages.length,
                totalHintCost,
                averageSolveTime,
                statsByDifficulty,
                recentSubmissions: [],
            },
            solves: solves.map(solve => {
                const attempt = attempts.find(a => a.challengeId === solve.challengeId);
                let solveTime = 0;
                if (attempt && attempt.startedAt) {
                    const startTime = new Date(attempt.startedAt).getTime();
                    const endTime = new Date(solve.solvedAt).getTime();
                    solveTime = Math.floor((endTime - startTime) / 1000);
                }
                
                return {
                    challengeId: solve.challengeId,
                    challengeTitle: solve.challenge?.title || 'Unknown',
                    difficulty: solve.challenge?.difficulty || 'unknown',
                    points: solve.pointsEarned || 0,
                    solvedAt: solve.solvedAt,
                    solveTime: solveTime > 0 ? solveTime : 0,
                };
            }),
        };
    }
}
