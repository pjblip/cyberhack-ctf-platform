import { Controller, Get, Post, Param, Body, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import { ChallengesService } from './challenges.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { Request } from 'express';

@Controller('challenges')
@UseGuards(AuthGuard('jwt'))
export class ChallengesController {
    constructor(private readonly challengesService: ChallengesService) { }

    @Get()
    async list() {
        return this.challengesService.listActive();
    }

    @Get('solve-counts')
    async getSolveCounts() {
        return this.challengesService.getSolveCounts();
    }

    @Post(':id/start')
    async start(
        @CurrentUser() user: any,
        @Param('id') challengeId: string,
        @Body('duration') duration: number,
    ) {
        return this.challengesService.startChallenge(user.id, challengeId, duration || 300);
    }

    @Get(':id/attempt')
    async getAttempt(
        @CurrentUser() user: any,
        @Param('id') challengeId: string,
    ) {
        const attempt = await this.challengesService.getAttempt(user.id, challengeId);
        const lockout = await this.challengesService.getLockoutStatus(user.id, challengeId);
        return {
            ...attempt,
            lockout,
        };
    }

    @Post(':id/submit')
    @Throttle({ default: { limit: 12, ttl: 60000 } }) // 12 submissions per minute per IP
    async submit(
        @CurrentUser() user: any,
        @Param('id') challengeId: string,
        @Body('flag') flag: string,
        @Req() req: Request,
    ) {
        try {
            // Extract real client IP (from nginx X-Real-IP header or fallback)
            const ipAddress = (req.headers['x-real-ip'] as string)
                || (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim()
                || req.ip
                || 'unknown';
            
            console.log('Flag submission:', { userId: user.id, challengeId, flag, ipAddress });
            
            const result = await this.challengesService.submitFlag(user.id, challengeId, flag, ipAddress);
            
            console.log('Submission result:', result);
            
            return result;
        } catch (error) {
            console.error('Flag submission error:', error);
            throw error;
        }
    }

    @Get(':id/hints')
    async getHints(
        @CurrentUser() user: any,
        @Param('id') challengeId: string,
    ) {
        return this.challengesService.getHints(user.id, challengeId);
    }

    @Post(':id/hints/:hintIndex')
    async purchaseHint(
        @CurrentUser() user: any,
        @Param('id') challengeId: string,
        @Param('hintIndex') hintIndex: number,
    ) {
        return this.challengesService.purchaseHint(user.id, challengeId, Number(hintIndex));
    }

    @Get('stats/:userId')
    async getUserStats(
        @CurrentUser() user: any,
        @Param('userId') userId: string,
    ) {
        // Users can only view their own stats unless they're admin
        if (user.id !== userId && user.role !== 'admin') {
            throw new Error('Unauthorized');
        }
        return this.challengesService.getUserStats(userId);
    }
}
