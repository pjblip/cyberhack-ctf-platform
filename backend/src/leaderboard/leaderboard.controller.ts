import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LeaderboardService } from './leaderboard.service';

@Controller('leaderboard')
export class LeaderboardController {
    constructor(private readonly leaderboardService: LeaderboardService) { }

    @Get()
    @UseGuards(AuthGuard('jwt'))
    async getIndividual() {
        return this.leaderboardService.getIndividualLeaderboard();
    }

    @Get('teams')
    @UseGuards(AuthGuard('jwt'))
    async getTeams() {
        return this.leaderboardService.getTeamLeaderboard();
    }
}
