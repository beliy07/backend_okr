import { NestjsGrammyModule } from '@grammyjs/nestjs';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BotUpdate } from './bot.update';
import { TelegramService } from './telegram.service';

@Module({
  imports: [
    NestjsGrammyModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        return {
          token: configService.getOrThrow<string>('TELEGRAM_BOT_TOKEN'),
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [TelegramService, BotUpdate],
  exports: [TelegramService],
})
export class TelegramModule {}
