import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../database/entities/user.entity';
import { LoginDto, SignupDto } from './dto/auth.dto';
import { JwtPayload } from './jwt.strategy';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        private readonly jwtService: JwtService,
    ) { }

    async login(dto: LoginDto) {
        const user = await this.userRepo.findOne({ where: { email: dto.email } });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials. Access Denied.');
        }

        if (user.banned) {
            throw new UnauthorizedException('Account has been suspended.');
        }

        const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!passwordValid) {
            throw new UnauthorizedException('Invalid credentials. Access Denied.');
        }

        const payload: JwtPayload = {
            sub: user.id,
            email: user.email,
            isAdmin: user.isAdmin,
        };

        return {
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                isAdmin: user.isAdmin,
                points: user.points,
            },
            token: this.jwtService.sign(payload),
        };
    }

    async signup(dto: SignupDto) {
        // Check existing email
        const existingEmail = await this.userRepo.findOne({ where: { email: dto.email } });
        if (existingEmail) {
            throw new ConflictException('Email already registered.');
        }

        // Check existing username
        const existingUsername = await this.userRepo.findOne({ where: { username: dto.username } });
        if (existingUsername) {
            throw new ConflictException('Username taken.');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(dto.password, salt);

        const user = this.userRepo.create({
            email: dto.email,
            username: dto.username,
            passwordHash: hashedPassword,
            isAdmin: false,
            points: 0,
        });

        const saved = await this.userRepo.save(user);

        const payload: JwtPayload = {
            sub: saved.id,
            email: saved.email,
            isAdmin: saved.isAdmin,
        };

        return {
            user: {
                id: saved.id,
                username: saved.username,
                email: saved.email,
                isAdmin: saved.isAdmin,
                points: saved.points,
            },
            token: this.jwtService.sign(payload),
        };
    }
}
