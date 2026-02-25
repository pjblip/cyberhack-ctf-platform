import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaderboardService } from './leaderboard.service';
import { LeaderboardController } from './leaderboard.controller';
import { User } from '../database/entities/user.entity';
import { Solve } from '../database/entities/solve.entity';
import { Team } from '../database/entities/team.entity';

@Module({
    imports: [TypeOrmModule.forFeature([User, Solve, Team])],
    controllers: [LeaderboardController],
    providers: [LeaderboardService],
    exports: [LeaderboardService],
})
export class LeaderboardModule { }
