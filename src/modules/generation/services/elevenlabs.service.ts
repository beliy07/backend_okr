import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ElevenLabsService {
  private client: ElevenLabsClient;

  constructor(private readonly configService: ConfigService) {
    this.client = new ElevenLabsClient({
      apiKey: this.configService.getOrThrow<string>('ELEVENLABS_API_KEY'),
      environment: 'https://api.elevenlabs.io',
    });
  }

  async generateVoice(voiceId: string, text: string) {
    try {
      const audioStream = await this.client.textToSpeech.convert(voiceId, {
        outputFormat: 'mp3_44100_128',
        text: text,
        modelId: 'eleven_multilingual_v2',
      });

      const chunks: Uint8Array[] = [];
      for await (const chunk of audioStream) {
        chunks.push(chunk);
      }
      const audioBuffer = Buffer.from(
        Buffer.concat(chunks.map((chunk) => Buffer.from(chunk))),
      );

      return audioBuffer;
    } catch (error) {
      throw new Error(`Ошибка при генерации голоса: ${error.message}`);
    }
  }
}
