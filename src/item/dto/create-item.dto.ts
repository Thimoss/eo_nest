import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

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

  @IsInt()
  @IsOptional()
  minimum?: number;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsNumber()
  materialPricePerUnit?: number;

  @IsOptional()
  @IsNumber()
  feePerUnit?: number;

  @IsBoolean()
  @IsNotEmpty()
  singleItem: boolean;

  @IsInt()
  @IsNotEmpty()
  sectorId: number;
}
