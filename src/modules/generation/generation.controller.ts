import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { GenerateDto } from './dto/generate.dto';
import { GenerationService } from './generation.service';
import { LimitsService } from './services/limits.service';
import { TelegramAuthGuard } from 'src/core/guards/telegram-auth.guard';

@Controller()
@UseGuards(TelegramAuthGuard)
export class GenerationController {
  constructor(
    private readonly generationService: GenerationService,
    private readonly limitsService: LimitsService,
  ) {}

  @Post('generate')
  create(@Body() dto: GenerateDto, @Req() req: Request) {
    return this.generationService.createTask(dto, req['userId']);
  }

  @Get('generations')
  findAll(@Req() req: Request) {
    return this.generationService.findAll(req['userId']);
  }

  @Get('generations/:id')
  findOne(@Param('id') id: string) {
    return this.generationService.findOne(id);
  }

  @Get('limits')
  async getLimits(@Req() req: Request) {
    return this.limitsService.getUserLimits(req['userId']);
  }
}
