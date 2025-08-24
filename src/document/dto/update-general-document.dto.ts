import { PartialType } from '@nestjs/mapped-types';
import { CreateDocumentDto } from './create-document.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateGeneralDocumentDto extends PartialType(CreateDocumentDto) {
  @IsOptional()
  @IsString()
  job: string;

  @IsOptional()
  @IsString()
  location: string;

  @IsOptional()
  @IsString()
  base: string;
}
