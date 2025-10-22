import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { JobSectionService } from './job-section.service';
import { CreateJobSectionDto } from './dto/create-job-section.dto';
import { UpdateJobSectionDto } from './dto/update-job-section.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('job-section')
@UseGuards(AuthGuard)
export class JobSectionController {
  constructor(private readonly jobSectionService: JobSectionService) {}

  @Post('create')
  create(@Body() createJobSectionDto: CreateJobSectionDto) {
    return this.jobSectionService.create(createJobSectionDto);
  }

  @Patch('update/:id')
  update(
    @Param('id') id: string,
    @Body() updateJobSectionDto: UpdateJobSectionDto,
  ) {
    return this.jobSectionService.update(+id, updateJobSectionDto);
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.jobSectionService.remove(+id);
  }
}
