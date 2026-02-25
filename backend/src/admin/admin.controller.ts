import { Controller, Get, Post, Put, Delete, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from '../common/guards/admin.guard';
import { EventLockGuard } from '../common/guards/event-lock.guard';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(AuthGuard('jwt'), AdminGuard)
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    // --- User Management ---

    @Get('leaderboard')
    async getLeaderboard() {
        return this.adminService.getLeaderboard();
    }

    @Get('users')
    async getUsers() {
        return this.adminService.getUsers();
    }

    @Delete('users/:id')
    async deleteUser(@Param('id') id: string) {
        return this.adminService.deleteUser(id);
    }

    @Patch('users/:id/reset')
    async resetUser(@Param('id') id: string) {
        return this.adminService.resetUser(id);
    }

    @Patch('users/:id/promote')
    async promoteUser(@Param('id') id: string) {
        return this.adminService.promoteUser(id);
    }

    @Patch('users/:id/ban')
    async banUser(@Param('id') id: string) {
        return this.adminService.banUser(id);
    }

    // --- Challenge Management (locked during event) ---

    @Post('challenges')
    @UseGuards(EventLockGuard)
    async createChallenge(@Body() data: any) {
        return this.adminService.createChallenge(data);
    }

    @Put('challenges/:id')
    @UseGuards(EventLockGuard)
    async updateChallenge(@Param('id') id: string, @Body() data: any) {
        return this.adminService.updateChallenge(id, data);
    }

    @Delete('challenges/:id')
    @UseGuards(EventLockGuard)
    async deleteChallenge(@Param('id') id: string) {
        return this.adminService.deleteChallenge(id);
    }

    @Post('challenges/bulk')
    @UseGuards(EventLockGuard)
    async bulkUpload(@Body() challenges: any[]) {
        return this.adminService.bulkUploadChallenges(challenges);
    }

    // --- Event Control ---

    @Post('event/start')
    async startEvent() {
        return this.adminService.startEvent();
    }

    @Post('event/stop')
    async stopEvent() {
        return this.adminService.stopEvent();
    }

    @Get('event/status')
    async getEventStatus() {
        return this.adminService.getEventStatus();
    }

    // --- Analytics ---

    @Get('analytics')
    async getAnalytics() {
        return this.adminService.getAnalytics();
    }
}
