import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { Challenge } from './challenge.entity';
import { Team } from './team.entity';

@Entity('solves')
export class Solve {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'user_id' })
    userId: string;

    @Column({ name: 'challenge_id' })
    challengeId: string;

    @Column({ name: 'points_earned' })
    pointsEarned: number;

    @CreateDateColumn({ name: 'solved_at' })
    solvedAt: Date;

    @Column({ name: 'ip_address', nullable: true })
    ipAddress: string;

    @ManyToOne(() => User, (user) => user.solves, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Team, (team) => team.solves, { nullable: true })
    @JoinColumn({ name: 'team_id' })
    team: Team;

    @Column({ name: 'team_id', nullable: true })
    teamId: string | null;

    @ManyToOne(() => Challenge, (challenge) => challenge.solves, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'challenge_id' })
    challenge: Challenge;
}
