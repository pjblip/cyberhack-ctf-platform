import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('bans')
export class Ban {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'user_id' })
    userId: string;

    @Column()
    reason: string;

    @Column({ name: 'banned_by' })
    bannedBy: string;

    @CreateDateColumn({ name: 'banned_at' })
    bannedAt: Date;

    @Column({ name: 'expires_at', nullable: true })
    expiresAt: Date;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;
}
