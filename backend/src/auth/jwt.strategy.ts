import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';

export interface JwtPayload {
    sub: string;
    email: string;
    isAdmin: boolean;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        config: ConfigService,
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: config.get<string>('JWT_SECRET', 'default-secret'),
        });
    }

    async validate(payload: JwtPayload) {
        const user = await this.userRepo.findOne({ where: { id: payload.sub } });
        if (!user || user.banned) {
            return null;
        }
        return {
            id: user.id,
            email: user.email,
            username: user.username,
            isAdmin: user.isAdmin,
            points: user.points,
        };
    }
}
