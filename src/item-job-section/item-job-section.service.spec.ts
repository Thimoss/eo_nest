import { Test, TestingModule } from '@nestjs/testing';
import { ItemJobSectionService } from './item-job-section.service';

describe('ItemJobSectionService', () => {
  let service: ItemJobSectionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ItemJobSectionService],
    }).compile();

    service = module.get<ItemJobSectionService>(ItemJobSectionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
