import { PartialType } from '@nestjs/mapped-types';
import { CreateDocumentDto } from './create-document.dto';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateDocumentDto extends PartialType(CreateDocumentDto) {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  checkedById?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  confirmedById?: number;
}
