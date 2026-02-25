import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { Solve } from '../database/entities/solve.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        @InjectRepository(Solve)
        private readonly solveRepo: Repository<Solve>,
    ) { }

    async getUserData(userId: string) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        const solves = await this.solveRepo.find({ where: { userId } });

        return {
            stats: {
                points: user?.points || 0,
                correct: solves.length,
                total: solves.length,
            },
            solved: solves.map((s) => s.challengeId),
        };
    }
}
