import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChallengesService } from './challenges.service';
import { ChallengesController } from './challenges.controller';
import { FilesController } from './files.controller';
import { Challenge } from '../database/entities/challenge.entity';
import { Solve } from '../database/entities/solve.entity';
import { ChallengeAttempt } from '../database/entities/challenge-attempt.entity';
import { User } from '../database/entities/user.entity';
import { ActivityLog } from '../database/entities/activity-log.entity';
import { Category } from '../database/entities/category.entity';
import { Submission } from '../database/entities/submission.entity';
import { EventState } from '../database/entities/event-state.entity';
import { Lockout } from '../database/entities/lockout.entity';
import { HintUsage } from '../database/entities/hint-usage.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Challenge, Solve, ChallengeAttempt, User, ActivityLog, Category, Submission, EventState, Lockout, HintUsage]),
    ],
    controllers: [ChallengesController, FilesController],
    providers: [ChallengesService],
})
export class ChallengesModule { }

