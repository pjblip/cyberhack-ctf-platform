import { Controller, Sse, Query, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { EventsService, AppEvent } from './events.service';

interface MessageEvent {
    data: string | object;
    type?: string;
}

@Controller('events')
export class EventsController {
    constructor(
        private readonly eventsService: EventsService,
        private readonly jwtService: JwtService,
    ) { }

    @Sse('stream')
    stream(@Query('token') token: string): Observable<MessageEvent> {
        // Verify JWT token from query parameter (EventSource can't set headers)
        if (!token) {
            throw new UnauthorizedException('Token required');
        }

        try {
            this.jwtService.verify(token);
        } catch {
            throw new UnauthorizedException('Invalid token');
        }

        return new Observable((subscriber) => {
            const unsubscribe = this.eventsService.subscribe((event: AppEvent) => {
                subscriber.next({
                    type: event.type,
                    data: event.data,
                });
            });

            // Heartbeat every 30 seconds to keep connection alive
            const heartbeat = setInterval(() => {
                subscriber.next({ type: 'heartbeat', data: { timestamp: Date.now() } });
            }, 30000);

            return () => {
                unsubscribe();
                clearInterval(heartbeat);
            };
        });
    }
}
