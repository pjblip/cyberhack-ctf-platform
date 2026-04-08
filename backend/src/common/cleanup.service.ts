import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { ChallengeAttempt } from '../database/entities/challenge-attempt.entity';
import { Lockout } from '../database/entities/lockout.entity';

@Injectable()
export class CleanupService {
    private readonly logger = new Logger(CleanupService.name);

    constructor(
        @InjectRepository(ChallengeAttempt)
        private readonly attemptRepo: Repository<ChallengeAttempt>,
        @InjectRepository(Lockout)
        private readonly lockoutRepo: Repository<Lockout>,
    ) {}

    // Run every 10 minutes
    @Cron(CronExpression.EVERY_10_MINUTES)
    async cleanupExpiredAttempts() {
        try {
            const now = new Date();
            const result = await this.attemptRepo.delete({
                expiresAt: LessThan(now),
                completed: false,
            });

            if (result.affected && result.affected > 0) {
                this.logger.log(`Cleaned up ${result.affected} expired challenge attempts`);
            }
        } catch (error) {
            this.logger.error('Failed to cleanup expired attempts', error);
        }
    }

    // Run every 5 minutes
    @Cron(CronExpression.EVERY_5_MINUTES)
    async cleanupExpiredLockouts() {
        try {
            const now = new Date();
            const result = await this.lockoutRepo.delete({
                lockedUntil: LessThan(now),
            });

            if (result.affected && result.affected > 0) {
                this.logger.log(`Cleaned up ${result.affected} expired lockouts`);
            }
        } catch (error) {
            this.logger.error('Failed to cleanup expired lockouts', error);
        }
    }

    // Manual cleanup method for admin use
    async cleanupAll() {
        const [attempts, lockouts] = await Promise.all([
            this.cleanupExpiredAttempts(),
            this.cleanupExpiredLockouts(),
        ]);

        return {
            success: true,
            message: 'Cleanup completed',
        };
    }
}
