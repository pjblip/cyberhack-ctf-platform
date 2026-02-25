import { Entity, PrimaryColumn, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Solve } from './solve.entity';
import { ChallengeAttempt } from './challenge-attempt.entity';
import { Category } from './category.entity';

@Entity('challenges')
export class Challenge {
    @PrimaryColumn()
    id: string;

    @Column()
    title: string;

    @Column('text')
    description: string;

    @Column()
    difficulty: string; // 'easy' | 'medium' | 'hard'

    @Column()
    points: number;

    @Column('simple-array', { nullable: true })
    hints: string[];

    @Column({ nullable: true })
    flag: string;

    @Column({ name: 'category_id', nullable: true })
    categoryId: string;

    @ManyToOne(() => Category, (cat) => cat.challenges, { nullable: true })
    @JoinColumn({ name: 'category_id' })
    category: Category;

    @Column({ name: 'estimated_time', nullable: true })
    estimatedTime: string;

    @Column({ default: 300 })
    duration: number;

    @Column({ name: 'file_url', nullable: true })
    fileUrl: string;

    @Column({ name: 'is_active', default: true })
    isActive: boolean;

    @OneToMany(() => Solve, (solve) => solve.challenge)
    solves: Solve[];

    @OneToMany(() => ChallengeAttempt, (attempt) => attempt.challenge)
    attempts: ChallengeAttempt[];
}
