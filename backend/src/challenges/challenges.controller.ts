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
        return this.challengesService.getAttempt(user.id, challengeId);
    }

    @Post(':id/submit')
    @Throttle({ default: { limit: 12, ttl: 60000 } }) // 12 submissions per minute per IP
    async submit(
        @CurrentUser() user: any,
        @Param('id') challengeId: string,
        @Body('flag') flag: string,
        @Req() req: Request,
    ) {
        // Extract real client IP (from nginx X-Real-IP header or fallback)
        const ipAddress = (req.headers['x-real-ip'] as string)
            || (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim()
            || req.ip
            || 'unknown';
        return this.challengesService.submitFlag(user.id, challengeId, flag, ipAddress);
    }
}
