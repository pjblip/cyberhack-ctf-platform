import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { AdminSeedService } from './admin-seed.service';
import { AdminController } from './admin.controller';
import { User } from '../database/entities/user.entity';
import { Challenge } from '../database/entities/challenge.entity';
import { Solve } from '../database/entities/solve.entity';
import { ActivityLog } from '../database/entities/activity-log.entity';
import { EventState } from '../database/entities/event-state.entity';
import { EventLockGuard } from '../common/guards/event-lock.guard';

@Module({
    imports: [TypeOrmModule.forFeature([User, Challenge, Solve, ActivityLog, EventState])],
    controllers: [AdminController],
    providers: [AdminService, AdminSeedService, EventLockGuard],
})
export class AdminModule { }
