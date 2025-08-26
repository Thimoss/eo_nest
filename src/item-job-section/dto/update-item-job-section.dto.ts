import { PartialType } from '@nestjs/mapped-types';
import { CreateItemJobSectionDto } from './create-item-job-section.dto';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdateItemJobSectionDto extends PartialType(
  CreateItemJobSectionDto,
) {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  volume: number;

  @IsNotEmpty()
  @IsNumber()
  minimumVolume: number;

  @IsNotEmpty()
  @IsNumber()
  materialPricePerUnit: number;

  @IsNotEmpty()
  @IsNumber()
  feePricePerUnit: number;

  @IsString()
  @IsNotEmpty()
  unit: string;

  @IsNotEmpty()
  @IsString()
  information?: string;

  @IsNotEmpty()
  @IsNumber()
  jobSectionId: number;
}
