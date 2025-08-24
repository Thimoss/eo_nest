import { Test, TestingModule } from '@nestjs/testing';
import { JobSectionController } from './job-section.controller';
import { JobSectionService } from './job-section.service';

describe('JobSectionController', () => {
  let controller: JobSectionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobSectionController],
      providers: [JobSectionService],
    }).compile();

    controller = module.get<JobSectionController>(JobSectionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
