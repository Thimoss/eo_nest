import { PartialType } from '@nestjs/mapped-types';
import { CreateItemDto } from './create-item.dto';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateItemDto extends PartialType(CreateItemDto) {
  @IsString()
  @IsNotEmpty()
  no: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  source?: string;

  @IsString()
  @IsOptional()
  minimum?: string;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsString()
  materialPricePerUnit?: string;

  @IsOptional()
  @IsString()
  feePricePerUnit?: string;

  @IsString()
  @IsNotEmpty()
  singleItem: string;

  @IsString()
  @IsNotEmpty()
  sectorId: string;

  @IsOptional()
  file?: Express.Multer.File;
}
