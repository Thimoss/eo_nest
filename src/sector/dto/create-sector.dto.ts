import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateSectorDto {
  @IsString()
  @IsNotEmpty()
  no: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  source?: string;

  @IsInt()
  @Min(1)
  categoryId: number;
}
