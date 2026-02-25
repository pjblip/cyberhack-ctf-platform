import { Controller, Post, Body } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto, SignupDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 login attempts per minute
    async login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }

    @Post('signup')
    @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 signups per minute
    async signup(@Body() dto: SignupDto) {
        return this.authService.signup(dto);
    }
}
