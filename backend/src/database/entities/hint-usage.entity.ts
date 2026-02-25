import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Challenge } from './challenge.entity';

@Entity('hint_usage')
export class HintUsage {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'user_id' })
    userId: string;

    @Column({ name: 'challenge_id' })
    challengeId: string;

    @Column({ name: 'hint_index' })
    hintIndex: number;

    @Column()
    cost: number;

    @CreateDateColumn({ name: 'used_at' })
    usedAt: Date;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Challenge)
    @JoinColumn({ name: 'challenge_id' })
    challenge: Challenge;
}
