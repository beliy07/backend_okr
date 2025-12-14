import { Controller, Get, UseGuards } from '@nestjs/common';
import { TelegramAuthGuard } from 'src/core/guards/telegram-auth.guard';
import { AvatarsService } from './avatars.service';

@Controller('avatars')
@UseGuards(TelegramAuthGuard)
export class AvatarsController {
  constructor(private readonly avatarsService: AvatarsService) {}

  @Get()
  findAll() {
    return this.avatarsService.findAll();
  }
}
