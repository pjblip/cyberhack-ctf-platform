import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityService } from './activity.service';
import { ActivityController } from './activity.controller';
import { ActivityLog } from '../database/entities/activity-log.entity';

@Module({
    imports: [TypeOrmModule.forFeature([ActivityLog])],
    controllers: [ActivityController],
    providers: [ActivityService],
})
export class ActivityModule { }
