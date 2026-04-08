import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './entities/user.entity';
import { Challenge } from './entities/challenge.entity';
import { Solve } from './entities/solve.entity';
import { ChallengeAttempt } from './entities/challenge-attempt.entity';
import { ActivityLog } from './entities/activity-log.entity';
import { Category } from './entities/category.entity';
import { Team } from './entities/team.entity';
import { Event } from './entities/event.entity';
import { FirstBlood } from './entities/first-blood.entity';
import { HintUsage } from './entities/hint-usage.entity';
import { UserProgress } from './entities/user-progress.entity';
import { Submission } from './entities/submission.entity';
import { Ban } from './entities/ban.entity';
import { Announcement } from './entities/announcement.entity';
import { EventState } from './entities/event-state.entity';
import { Lockout } from './entities/lockout.entity';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                type: 'better-sqlite3',
                database: config.get<string>('DB_PATH', './cyberhack.db'),
                entities: [
                    User, Challenge, Solve, ChallengeAttempt, ActivityLog, Category,
                    Team, Event, FirstBlood, HintUsage, UserProgress, Submission, Ban, Announcement,
                    EventState, Lockout
                ],
                synchronize: true,   // Auto-creates tables on first run — no migrations needed
                logging: false,
            }),
        }),
        TypeOrmModule.forFeature([
            User, Challenge, Solve, ChallengeAttempt, ActivityLog, Category,
            Team, Event, FirstBlood, HintUsage, UserProgress, Submission, Ban, Announcement,
            EventState, Lockout
        ]),
    ],
    exports: [TypeOrmModule],
})
export class DatabaseModule { }
