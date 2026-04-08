import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security: Helmet sets various HTTP headers
  app.use(helmet({
    contentSecurityPolicy: false, // Disabled for SPA compatibility
  }));

  // CORS: Allow all origins (LAN devices must reach this API from any IP)
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: '*',
    credentials: true,
  });

  // Global validation pipe (class-validator)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`\n🚀 Mystic Flag Forge API running on http://0.0.0.0:${port}`);
  console.log(`📡 SSE stream available at http://localhost:${port}/events/stream`);
  console.log(`🔑 Auth endpoints: POST /auth/login, POST /auth/signup`);
  console.log(`🛡️  Security: Helmet enabled, CORS: open (all origins)`);
  console.log(`⚡ Rate limiting: 60 req/min global\n`);
}
bootstrap();
