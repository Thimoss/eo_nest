import { Test, TestingModule } from '@nestjs/testing';
import { ItemJobSectionController } from './item-job-section.controller';
import { ItemJobSectionService } from './item-job-section.service';

describe('ItemJobSectionController', () => {
  let controller: ItemJobSectionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ItemJobSectionController],
      providers: [ItemJobSectionService],
    }).compile();

    controller = module.get<ItemJobSectionController>(ItemJobSectionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
