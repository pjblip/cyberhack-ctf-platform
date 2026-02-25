import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventState } from '../../database/entities/event-state.entity';

@Injectable()
export class EventLockGuard implements CanActivate {
    constructor(
        @InjectRepository(EventState)
        private readonly eventStateRepo: Repository<EventState>,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const state = await this.eventStateRepo.findOne({ where: { id: true } });
        if (state?.started) {
            throw new ForbiddenException(
                'Event is in progress. Challenge modifications are locked.',
            );
        }
        return true;
    }
}
