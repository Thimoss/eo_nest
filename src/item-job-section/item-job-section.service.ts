import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateItemJobSectionDto } from './dto/create-item-job-section.dto';
import { UpdateItemJobSectionDto } from './dto/update-item-job-section.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { DocumentStatus } from '@prisma/client';

@Injectable()
export class ItemJobSectionService {
  constructor(private prisma: PrismaService) {}

  /**
   *
   * @param createItemJobSectionDto
   * @param userId
   * @returns
   */
  async create(
    createItemJobSectionDto: CreateItemJobSectionDto,
    userId: number,
  ) {
    const {
      name,
      volume,
      minimumVolume,
      materialPricePerUnit,
      feePricePerUnit,
      unit,
      information,
      jobSectionId,
    } = createItemJobSectionDto;

    const jobSection = await this.prisma.jobSection.findUnique({
      where: { id: jobSectionId },
      include: {
        document: true,
      },
    });

    if (!jobSection) {
      throw new HttpException('Job Section not found', HttpStatus.NOT_FOUND);
    }

    if (jobSection.document.createdById !== userId) {
      throw new HttpException(
        'You do not have permission to create item job section for this document',
        HttpStatus.FORBIDDEN,
      );
    }

    if (jobSection.document.status !== DocumentStatus.IN_PROGRESS) {
      throw new HttpException(
        'Cannot create item job section for document that has been submitted for review',
        HttpStatus.BAD_REQUEST,
      );
    }

    const existingItemJobSection = await this.prisma.itemJobSection.findFirst({
      where: {
        name: name,
        jobSectionId: jobSectionId,
      },
    });

    if (existingItemJobSection) {
      throw new HttpException(
        `Item already exists in this job section`,
        HttpStatus.CONFLICT,
      );
    }

    const totalMaterialPrice = (materialPricePerUnit / minimumVolume) * volume;
    const totalFeePrice = (feePricePerUnit / minimumVolume) * volume;

    const createItemJobSection = await this.prisma.itemJobSection.create({
      data: {
        name,
        volume,
        minimumVolume,
        materialPricePerUnit,
        feePricePerUnit,
        totalMaterialPrice,
        totalFeePrice,
        unit,
        information,
        jobSectionId,
      },
    });

    if (createItemJobSection) {
      return {
        statusCode: 200,
        message: 'Item job section created successfully',
        data: createItemJobSection,
      };
    }
  }

  /**
   *
   * @param id
   * @param updateItemJobSectionDto
   * @param userId
   * @returns
   */
  async update(
    id: number,
    updateItemJobSectionDto: UpdateItemJobSectionDto,
    userId: number,
  ) {
    const {
      name,
      volume,
      minimumVolume,
      materialPricePerUnit,
      feePricePerUnit,
      unit,
      information,
    } = updateItemJobSectionDto;

    const itemJobSection = await this.prisma.itemJobSection.findUnique({
      where: { id },
      include: {
        jobSection: {
          include: {
            document: true,
          },
        },
      },
    });

    if (!itemJobSection) {
      throw new HttpException(
        'Item job section not found',
        HttpStatus.NOT_FOUND,
      );
    }

    if (itemJobSection.jobSection.document.createdById !== userId) {
      throw new HttpException(
        'You do not have permission to update this item job section',
        HttpStatus.FORBIDDEN,
      );
    }

    if (
      itemJobSection.jobSection.document.status !== DocumentStatus.IN_PROGRESS
    ) {
      throw new HttpException(
        'Cannot update item job section for document that has been submitted for review',
        HttpStatus.BAD_REQUEST,
      );
    }

    const nextName = name ?? itemJobSection.name;
    const nextVolume = volume ?? itemJobSection.volume;
    const nextMinimumVolume = minimumVolume ?? itemJobSection.minimumVolume;
    const nextMaterialPricePerUnit =
      materialPricePerUnit ?? itemJobSection.materialPricePerUnit;
    const nextFeePricePerUnit =
      feePricePerUnit ?? itemJobSection.feePricePerUnit;

    // Only check duplicates if the name is being changed; otherwise a partial
    // update (e.g. volume only) should not be blocked by the duplicate check.
    if (name !== undefined && nextName !== itemJobSection.name) {
      const existingItemJobSection =
        await this.prisma.itemJobSection.findFirst({
          where: {
            name: nextName,
            jobSectionId: itemJobSection.jobSectionId,
            NOT: { id },
          },
        });

      if (existingItemJobSection) {
        throw new HttpException(
          `Item already exists in this job section`,
          HttpStatus.CONFLICT,
        );
      }
    }

    const totalMaterialPrice =
      (nextMaterialPricePerUnit / nextMinimumVolume) * nextVolume;
    const totalFeePrice = (nextFeePricePerUnit / nextMinimumVolume) * nextVolume;

    const updateItemJobSection = await this.prisma.itemJobSection.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name: nextName } : {}),
        ...(volume !== undefined ? { volume: nextVolume } : {}),
        ...(minimumVolume !== undefined
          ? { minimumVolume: nextMinimumVolume }
          : {}),
        ...(materialPricePerUnit !== undefined
          ? { materialPricePerUnit: nextMaterialPricePerUnit }
          : {}),
        ...(feePricePerUnit !== undefined
          ? { feePricePerUnit: nextFeePricePerUnit }
          : {}),
        totalMaterialPrice,
        totalFeePrice,
        ...(unit !== undefined ? { unit } : {}),
        ...(information !== undefined ? { information } : {}),
      },
    });

    if (updateItemJobSection) {
      return {
        statusCode: 200,
        message: 'Item job section updated successfully',
        data: updateItemJobSection,
      };
    }
  }

  async remove(id: number, userId: number) {
    const itemJobSection = await this.prisma.itemJobSection.findUnique({
      where: { id },
      include: {
        jobSection: {
          include: {
            document: true,
          },
        },
      },
    });

    if (!itemJobSection) {
      throw new HttpException(
        'Item job section not found',
        HttpStatus.NOT_FOUND,
      );
    }

    if (itemJobSection.jobSection.document.createdById !== userId) {
      throw new HttpException(
        'You do not have permission to delete this item job section',
        HttpStatus.FORBIDDEN,
      );
    }

    if (
      itemJobSection.jobSection.document.status !== DocumentStatus.IN_PROGRESS
    ) {
      throw new HttpException(
        'Cannot delete item job section for document that has been submitted for review',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.prisma.itemJobSection.delete({
      where: { id },
    });

    return {
      statusCode: 200,
      message: 'Item job section removed successfully',
    };
  }
}
