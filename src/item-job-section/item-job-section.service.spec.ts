import { HttpException } from '@nestjs/common';
import { DocumentStatus } from '@prisma/client';
import { ItemJobSectionService } from './item-job-section.service';

describe('ItemJobSectionService', () => {
  const prismaMock = {
    itemJobSection: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };

  const service = new ItemJobSectionService(prismaMock as any);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('updates volume without duplicate conflict', async () => {
    prismaMock.itemJobSection.findUnique.mockResolvedValue({
      id: 1,
      name: 'Beton',
      volume: 10,
      minimumVolume: 1,
      materialPricePerUnit: 100,
      feePricePerUnit: 50,
      unit: 'm3',
      information: null,
      jobSectionId: 2,
      jobSection: {
        document: {
          createdById: 99,
          status: DocumentStatus.IN_PROGRESS,
        },
      },
    });

    prismaMock.itemJobSection.update.mockResolvedValue({
      id: 1,
      name: 'Beton',
      volume: 20,
      minimumVolume: 1,
      materialPricePerUnit: 100,
      feePricePerUnit: 50,
      unit: 'm3',
      information: null,
      jobSectionId: 2,
      totalMaterialPrice: 2000,
      totalFeePrice: 1000,
    });

    await expect(service.update(1, { volume: 20 } as any, 99)).resolves.toEqual(
      expect.objectContaining({
        statusCode: 200,
        message: 'Item job section updated successfully',
      }),
    );

    expect(prismaMock.itemJobSection.findFirst).not.toHaveBeenCalled();
    expect(prismaMock.itemJobSection.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: {
        volume: 20,
        totalMaterialPrice: 2000,
        totalFeePrice: 1000,
      },
    });
  });

  it('throws 409 when renaming to a duplicate name in the same section', async () => {
    prismaMock.itemJobSection.findUnique.mockResolvedValue({
      id: 1,
      name: 'Beton',
      volume: 10,
      minimumVolume: 1,
      materialPricePerUnit: 100,
      feePricePerUnit: 50,
      unit: 'm3',
      information: null,
      jobSectionId: 2,
      jobSection: {
        document: {
          createdById: 99,
          status: DocumentStatus.IN_PROGRESS,
        },
      },
    });

    prismaMock.itemJobSection.findFirst.mockResolvedValue({ id: 123 });

    try {
      await service.update(1, { name: 'Beton Baru' } as any, 99);
      fail('Expected update() to throw');
    } catch (err) {
      expect(err).toBeInstanceOf(HttpException);
      expect((err as HttpException).getStatus()).toBe(409);
    }

    expect(prismaMock.itemJobSection.update).not.toHaveBeenCalled();
  });

  it('throws 404 when item does not exist', async () => {
    prismaMock.itemJobSection.findUnique.mockResolvedValue(null);

    try {
      await service.update(1, { volume: 20 } as any, 99);
      fail('Expected update() to throw');
    } catch (err) {
      expect(err).toBeInstanceOf(HttpException);
      expect((err as HttpException).getStatus()).toBe(404);
    }
  });
});
