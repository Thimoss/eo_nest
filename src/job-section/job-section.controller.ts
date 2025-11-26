/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
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
  create(@Body() createJobSectionDto: CreateJobSectionDto, @Request() req) {
    const userId = req.user.sub;
    return this.jobSectionService.create(createJobSectionDto, userId);
  }

  @Patch('update/:id')
  update(
    @Param('id') id: string,
    @Body() updateJobSectionDto: UpdateJobSectionDto,
    @Request() req,
  ) {
    const userId = req.user.sub;
    return this.jobSectionService.update(+id, updateJobSectionDto, userId);
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string, @Request() req) {
    const userId = req.user.sub;
    return this.jobSectionService.remove(+id, userId);
  }
}
