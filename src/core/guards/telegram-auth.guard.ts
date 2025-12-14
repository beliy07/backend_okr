import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { parse, validate } from '@telegram-apps/init-data-node';

@Injectable()
export class TelegramAuthGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const initDataRaw = request.headers.authorization;

    if (!initDataRaw) {
      throw new UnauthorizedException();
    }

    try {
      const botToken =
        this.configService.getOrThrow<string>('TELEGRAM_BOT_TOKEN');

      validate(initDataRaw, botToken);

      const initData = parse(initDataRaw);

      const userId = initData.user?.id;

      if (!userId) {
        throw new UnauthorizedException();
      }

      request['userId'] = userId.toString();

      return true;
    } catch (error) {
      throw new UnauthorizedException();
    }
  }
}
