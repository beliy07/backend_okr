import { InjectBot } from '@grammyjs/nestjs';
import { Injectable, Logger } from '@nestjs/common';
import { Bot, InputFile } from 'grammy';

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);

  constructor(@InjectBot() private readonly bot: Bot) {}

  async sendAudio(userId: string, audioBuffer: Buffer, caption?: string) {
    try {
      const audioFile = new InputFile(audioBuffer, 'audio.mp3');
      await this.bot.api.sendAudio(Number(userId), audioFile, {
        caption: caption,
      });
      this.logger.log(`Аудио отправлено пользователю ${userId}`);
    } catch (error) {
      this.logger.error(
        `Ошибка отправки аудио пользователю ${userId}: ${error.message}`,
      );
    }
  }

  async sendVideoByUrl(userId: string, videoUrl: string, caption?: string) {
    try {
      await this.bot.api.sendVideo(Number(userId), videoUrl, {
        caption: caption,
      });
      this.logger.log(`Видео отправлено пользователю ${userId}`);
    } catch (error) {
      this.logger.error(
        `Ошибка отправки видео пользователю ${userId}: ${error.message}`,
      );
    }
  }

  async sendMessage(userId: string, text: string) {
    try {
      await this.bot.api.sendMessage(Number(userId), text);
    } catch (error) {
      this.logger.error(
        `Ошибка отправки сообщения пользователю ${userId}: ${error.message}`,
      );
    }
  }
}
