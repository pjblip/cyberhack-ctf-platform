import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { Team } from '../database/entities/team.entity';
import { Solve } from '../database/entities/solve.entity';
import { CacheService } from '../common/cache.service';

@Injectable()
export class LeaderboardService {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        @InjectRepository(Team)
        private readonly teamRepo: Repository<Team>,
        private readonly dataSource: DataSource,
        private readonly cacheService: CacheService,
    ) { }

    async getIndividualLeaderboard() {
        // Check cache first
        const cached = await this.cacheService.get('leaderboard:individual');
        if (cached) {
            return JSON.parse(cached);
        }

        const query = `
            SELECT 
                u.id, 
                u.username, 
                t.name as team_name,
                COALESCE(SUM(s.points_earned), 0) as total_points,
                MAX(s.solved_at) as last_solve
            FROM users u
            LEFT JOIN solves s ON u.id = s.user_id
            LEFT JOIN teams t ON u.team_id = t.id
            WHERE u.is_admin = false AND u.banned = false
            GROUP BY u.id, u.username, t.name
            ORDER BY total_points DESC, last_solve ASC NULLS FIRST
            LIMIT 100
        `;

        const result = await this.dataSource.query(query);
        const leaderboard = result.map((row, index) => ({
            rank: index + 1,
            ...row,
        }));

        // Cache for 5 seconds
        await this.cacheService.set('leaderboard:individual', JSON.stringify(leaderboard), 5);

        return leaderboard;
    }

    async getTeamLeaderboard() {
        // Check cache first
        const cached = await this.cacheService.get('leaderboard:teams');
        if (cached) {
            return JSON.parse(cached);
        }

        const query = `
            SELECT 
                t.id, 
                t.name, 
                COALESCE(SUM(s.points_earned), 0) as total_points,
                MAX(s.solved_at) as last_solve
            FROM teams t
            LEFT JOIN users u ON t.id = u.team_id
            LEFT JOIN solves s ON u.id = s.user_id
            GROUP BY t.id, t.name
            ORDER BY total_points DESC, last_solve ASC NULLS FIRST
            LIMIT 50
        `;

        const result = await this.dataSource.query(query);
        const leaderboard = result.map((row, index) => ({
            rank: index + 1,
            ...row,
        }));

        // Cache for 5 seconds
        await this.cacheService.set('leaderboard:teams', JSON.stringify(leaderboard), 5);

        return leaderboard;
    }
}
