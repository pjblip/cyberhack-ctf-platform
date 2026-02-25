import { Injectable } from '@nestjs/common';
import { EventEmitter } from 'events';

export interface AppEvent {
    type: 'solve' | 'leaderboard_update' | 'activity' | 'user_update';
    data: any;
}

@Injectable()
export class EventsService {
    private emitter = new EventEmitter();

    constructor() {
        this.emitter.setMaxListeners(100); // Support many concurrent SSE clients
    }

    emit(event: AppEvent) {
        this.emitter.emit('app_event', event);
    }

    subscribe(listener: (event: AppEvent) => void) {
        this.emitter.on('app_event', listener);
        return () => this.emitter.removeListener('app_event', listener);
    }
}
