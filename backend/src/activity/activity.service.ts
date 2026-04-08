import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityLog } from '../database/entities/activity-log.entity';

@Injectable()
export class ActivityService {
    constructor(
        @InjectRepository(ActivityLog)
        private readonly activityRepo: Repository<ActivityLog>,
    ) { }

    async getRecent() {
        const activities = await this.activityRepo.find({
            order: { createdAt: 'DESC' },
            take: 50, // Backend returns 50, frontend will limit to 10 for display
        });

        return activities.map((a) => ({
            id: a.id,
            user: a.username,
            action: a.action,
            target: a.target,
            timestamp: a.createdAt,
        }));
    }
}
