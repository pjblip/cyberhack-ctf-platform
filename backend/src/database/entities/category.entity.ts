import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Challenge } from './challenge.entity';

@Entity('categories')
export class Category {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    name: string;

    @Column({ unique: true })
    slug: string;

    @OneToMany(() => Challenge, (challenge) => challenge.category)
    challenges: Challenge[];
}
