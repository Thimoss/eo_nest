import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateItemJobSectionDto {
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
//   @IsNotEmpty()
//   @IsNumber()
//   totalMaterialPrice: number;

//   @IsNotEmpty()
//   @IsNumber()
//   totalFeePrice: number;
