import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Challenge } from './challenge.entity';
import { Team } from './team.entity';

@Entity('submissions')
export class Submission {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'user_id' })
    userId: string;

    @Column({ name: 'challenge_id' })
    challengeId: string;

    @Column({ name: 'team_id', nullable: true })
    teamId: string | null;

    @Column({ name: 'flag_submitted' })
    flagSubmitted: string;

    @Column({ name: 'ip_address', nullable: true })
    ipAddress: string;

    @Column({ name: 'is_correct' })
    isCorrect: boolean;

    @CreateDateColumn({ name: 'submitted_at' })
    submittedAt: Date;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Team, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'team_id' })
    team: Team;

    @ManyToOne(() => Challenge, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'challenge_id' })
    challenge: Challenge;
}
