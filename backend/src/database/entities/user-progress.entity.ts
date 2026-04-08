import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { User } from './user.entity';
import { Challenge } from './challenge.entity';

@Entity('user_progress')
@Unique(['userId', 'challengeId'])
export class UserProgress {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'user_id' })
    userId: string;

    @Column({ name: 'challenge_id' })
    challengeId: string;

    @Column({ default: 'not_started' }) // 'not_started', 'attempted', 'solved'
    status: string;

    @Column({ name: 'first_attempt_at', nullable: true })
    firstAttemptAt: Date;

    @Column({ name: 'solved_at', nullable: true })
    solvedAt: Date;

    @Column({ name: 'attempt_count', default: 0 })
    attemptCount: number;

    @Column({ name: 'hints_used', default: 0 })
    hintsUsed: number;

    @Column({ name: 'time_spent', default: 0 }) // in seconds
    timeSpent: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Challenge, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'challenge_id' })
    challenge: Challenge;
}