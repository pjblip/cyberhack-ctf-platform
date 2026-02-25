import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('activity_log')
export class ActivityLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'user_id', nullable: true })
    userId: string;

    @Column()
    username: string;

    @Column()
    action: string;

    @Column()
    target: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
