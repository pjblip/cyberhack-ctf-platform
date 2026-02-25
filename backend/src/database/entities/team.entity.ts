import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { Solve } from './solve.entity';

@Entity('teams')
export class Team {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    name: string;

    @Column({ name: 'join_code', unique: true })
    joinCode: string;

    @Column({ default: 0 })
    points: number;

    @Column({ nullable: true })
    captainId: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @OneToMany(() => User, (user) => user.team)
    members: User[];

    @OneToMany(() => Solve, (solve) => solve.team)
    solves: Solve[];
}
