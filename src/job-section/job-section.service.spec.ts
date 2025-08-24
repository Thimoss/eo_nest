import { Test, TestingModule } from '@nestjs/testing';
import { JobSectionService } from './job-section.service';

describe('JobSectionService', () => {
  let service: JobSectionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JobSectionService],
    }).compile();

    service = module.get<JobSectionService>(JobSectionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
