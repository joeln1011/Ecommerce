import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './config/env.validation';
import { PinoLoggerModule } from './config/logger/logger.module';
import { AppThrottlerModule } from './config/throttler/throttler.module';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';

const envFile =
  process.env.NODE_ENV === 'production'
    ? ['.env.prod', '.env']
    : ['.env.dev', '.env'];
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // make ConfigService available globally
      cache: true, // cache the validated config for performance
      validate: validateEnv, // validate and transform env variables
      envFilePath: envFile, // load .env.dev in development, .env.prod in production
    }),
    PinoLoggerModule,
    AppThrottlerModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
