import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export enum GenerationType {
  AUDIO = 'AUDIO',
  VIDEO = 'VIDEO',
}

export class GenerateDto {
  @IsString()
  @IsNotEmpty()
  avatarId: string;

  @IsString()
  @IsNotEmpty()
  text: string;

  // @IsNumber()
  // @Min(0.8)
  // @Max(1.0)
  // speed: number;

  @IsEnum(GenerationType)
  @IsNotEmpty()
  type: GenerationType;
}
