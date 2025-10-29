import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Express } from 'express';

export class CreateItemDto {
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
