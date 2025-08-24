import { PartialType } from '@nestjs/mapped-types';
import { CreateJobSectionDto } from './create-job-section.dto';

export class UpdateJobSectionDto extends PartialType(CreateJobSectionDto) {}
