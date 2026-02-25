import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Solve } from './solve.entity';
import { ChallengeAttempt } from './challenge-attempt.entity';
import { Team } from './team.entity';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    username: string;

    @Column({ unique: true })
    email: string;

    @Column({ name: 'password_hash' })
    passwordHash: string;

    @Column({ name: 'is_admin', default: false })
    isAdmin: boolean;

    @Column({ default: 0 })
    points: number;

    @Column({ default: false })
    banned: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @OneToMany(() => Solve, (solve) => solve.user)
    solves: Solve[];

    @OneToMany(() => ChallengeAttempt, (attempt) => attempt.user)
    attempts: ChallengeAttempt[];

    @Column({ name: 'team_id', nullable: true })
    teamId: string | null;

    @ManyToOne(() => Team, (team) => team.members, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'team_id' })
    team: Team;
}
