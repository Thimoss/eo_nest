import { PartialType } from '@nestjs/mapped-types';
import { CreateItemJobSectionDto } from './create-item-job-section.dto';

export class UpdateItemJobSectionDto extends PartialType(
  CreateItemJobSectionDto,
) {
}
