import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CleanupService } from './cleanup.service';
import { ChallengeAttempt } from '../database/entities/challenge-attempt.entity';
import { Lockout } from '../database/entities/lockout.entity';

@Module({
    imports: [TypeOrmModule.forFeature([ChallengeAttempt, Lockout])],
    providers: [CleanupService],
    exports: [CleanupService],
})
export class CleanupModule {}
