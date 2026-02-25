import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('events')
export class Event {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ name: 'start_time', type: 'datetime' })
    startTime: Date;

    @Column({ name: 'end_time', type: 'datetime' })
    endTime: Date;

    @Column({ name: 'is_paused', default: false })
    isPaused: boolean;
}
