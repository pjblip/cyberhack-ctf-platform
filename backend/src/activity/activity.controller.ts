import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ActivityService } from './activity.service';

@Controller('activity')
@UseGuards(AuthGuard('jwt'))
export class ActivityController {
    constructor(private readonly activityService: ActivityService) { }

    @Get()
    async get() {
        return this.activityService.getRecent();
    }
}
