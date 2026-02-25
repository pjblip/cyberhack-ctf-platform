import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('event_state')
export class EventState {
    @PrimaryColumn({ type: 'boolean', default: true })
    id: boolean;

    @Column({ default: false })
    started: boolean;

    @Column({ name: 'start_time', type: 'datetime', nullable: true })
    startTime: Date | null;

    @Column({ name: 'end_time', type: 'datetime', nullable: true })
    endTime: Date | null;
}
