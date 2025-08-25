import { PartialType } from '@nestjs/mapped-types';
import { CreateJobSectionDto } from './create-job-section.dto';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class UpdateJobSectionDto extends PartialType(CreateJobSectionDto) {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsInt()
  @Min(1)
  documentId: number;
}
