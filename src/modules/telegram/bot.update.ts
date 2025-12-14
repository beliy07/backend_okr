import { Command, Ctx, InjectBot, Update } from '@grammyjs/nestjs';
import { ConfigService } from '@nestjs/config';
import { Bot, Context, InlineKeyboard } from 'grammy';

const WELCOME_TEXT =
  '🎄 Ты — режиссер новогоднего прикола! Создай поздравление для друга от знаменитостей. Ты вводишь текст от себя, а бот мастерски озвучит его голосами Нагиева, Литвина, Ди Каприо и других звезд. Готовый шедевр — в два клика!';

@Update()
export class BotUpdate {
  constructor(
    @InjectBot() private readonly bot: Bot,
    private readonly configService: ConfigService,
  ) {}

  @Command('start')
  async onStart(@Ctx() ctx: Context) {
    if (!ctx.from) {
      return;
    }

    const appUrl = this.configService.get<string>('TMA_URL');

    const keyboard = new InlineKeyboard();
    if (appUrl) {
      keyboard.webApp('Открыть приложение', appUrl);
    }

    const messageOptions: any = {
      reply_markup: keyboard,
    };

    const welcomeImageUrl = this.configService.get<string>('WELCOME_IMAGE_URL');

    if (welcomeImageUrl) {
      messageOptions.caption = WELCOME_TEXT;
      await ctx.replyWithPhoto(welcomeImageUrl, messageOptions);
    } else {
      await ctx.reply(WELCOME_TEXT, messageOptions);
    }
  }
}
