import { PartialType } from '@nestjs/mapped-types';
import { CreateJobSectionDto } from './create-job-section.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateJobSectionDto extends PartialType(CreateJobSectionDto) {
  @IsNotEmpty()
  @IsString()
  name: string;
}
