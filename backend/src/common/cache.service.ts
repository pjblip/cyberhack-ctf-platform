import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class CacheService {
    private redis: Redis | null = null;

    constructor(private readonly config: ConfigService) {
        const host = this.config.get<string>('REDIS_HOST', 'redis');
        const port = this.config.get<number>('REDIS_PORT', 6379);

        try {
            this.redis = new Redis({
                host,
                port,
                maxRetriesPerRequest: 3,
                retryStrategy: (times) => {
                    if (times > 3) return null; // Stop retrying
                    return Math.min(times * 200, 2000);
                },
                lazyConnect: true,
            });

            this.redis.connect().catch((err) => {
                console.warn('⚠️ Redis connection failed, caching disabled:', err.message);
                this.redis = null;
            });

            this.redis.on('error', (err) => {
                console.warn('⚠️ Redis error:', err.message);
            });
        } catch (err) {
            console.warn('⚠️ Redis initialization failed, caching disabled');
            this.redis = null;
        }
    }

    async get(key: string): Promise<string | null> {
        if (!this.redis) return null;
        try {
            return await this.redis.get(key);
        } catch {
            return null;
        }
    }

    async set(key: string, value: string, ttlSeconds: number): Promise<void> {
        if (!this.redis) return;
        try {
            await this.redis.set(key, value, 'EX', ttlSeconds);
        } catch {
            // Silently fail — caching is non-critical
        }
    }

    async del(key: string): Promise<void> {
        if (!this.redis) return;
        try {
            await this.redis.del(key);
        } catch {
            // Silently fail
        }
    }
}
