import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Challenge } from './challenge.entity';

@Entity('challenge_attempts')
export class ChallengeAttempt {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'user_id' })
    userId: string;

    @Column({ name: 'challenge_id' })
    challengeId: string;

    @Column({ name: 'started_at' })
    startedAt: Date;

    @Column({ name: 'expires_at' })
    expiresAt: Date;

    @Column({ default: false })
    completed: boolean;

    @ManyToOne(() => User, (user) => user.attempts, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Challenge, (challenge) => challenge.attempts, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'challenge_id' })
    challenge: Challenge;
}
