import { fal } from '@fal-ai/client';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FalAiService {
  constructor(private readonly configService: ConfigService) {
    fal.config({
      credentials: this.configService.getOrThrow<string>('FAL_API_KEY'),
    });
  }

  async uploadFile(file: Buffer | Blob) {
    try {
      const blob: Blob =
        file instanceof Buffer
          ? new Blob([new Uint8Array(file)])
          : (file as Blob);
      const url = await fal.storage.upload(blob);
      return url;
    } catch (error) {
      throw new Error(`Ошибка при загрузке файла: ${error.message}`);
    }
  }

  async generateLipsyncVideo(videoUrl: string, audioUrl: string) {
    try {
      const result = await fal.subscribe(
        'fal-ai/kling-video/lipsync/audio-to-video',
        {
          input: {
            video_url: videoUrl,
            audio_url: audioUrl,
          },
          logs: true,
          onQueueUpdate: (update) => {
            if (update.status === 'IN_PROGRESS') {
              update.logs?.map((log) => log.message).forEach(console.log);
            }
          },
        },
      );

      return {
        videoUrl: result.data.video.url,
      };
    } catch (error) {
      throw new Error(`Ошибка при генерации видео: ${error.message}`);
    }
  }
}
