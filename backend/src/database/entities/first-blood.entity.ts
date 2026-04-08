import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Challenge } from './challenge.entity';
import { Team } from './team.entity';

@Entity('first_bloods')
export class FirstBlood {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'challenge_id' })
    challengeId: string;

    @Column({ name: 'user_id' })
    userId: string;

    @Column({ name: 'team_id', nullable: true })
    teamId: string | null;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @ManyToOne(() => Challenge, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'challenge_id' })
    challenge: Challenge;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Team, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'team_id' })
    team: Team;
}
