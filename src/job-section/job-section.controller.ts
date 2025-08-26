import { Controller, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { JobSectionService } from './job-section.service';
import { CreateJobSectionDto } from './dto/create-job-section.dto';
import { UpdateJobSectionDto } from './dto/update-job-section.dto';

@Controller('job-section')
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
