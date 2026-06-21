import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { IncomingMessage } from 'http';
import { LoggerModule } from 'nestjs-pino';
@Module({
  imports: [
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isDev = config.get('NODE_ENV') === 'development';
        return {
          pinoHttp: {
            level: isDev ? 'debug' : 'info',
            transport: isDev
              ? {
                  target: 'pino-pretty',
                  options: {
                    singleLine: true,
                    translateTime: 'SYS:standard',
                    ignore: 'pid,hostname',
                  },
                }
              : undefined,
            //todo: add reqId
            redact: {
              paths: [
                'req.headers.authorization',
                'req.headers.cookie',
                'res.headers.set-cookie',
                'req.body.password',
              ],
              censor: '[REDACTED]',
            },
            customProps: (req: IncomingMessage) => ({
              userId: (req as IncomingMessage & { user?: { id: string } }).user
                ?.id,
            }),
          },
        };
      },
    }),
  ],
  exports: [LoggerModule],
})
export class PinoLoggerModule {}
