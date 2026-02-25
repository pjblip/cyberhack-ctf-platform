import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from '../database/entities/user.entity';
import { Solve } from '../database/entities/solve.entity';

@Module({
    imports: [TypeOrmModule.forFeature([User, Solve])],
    controllers: [UsersController],
    providers: [UsersService],
})
export class UsersModule { }
