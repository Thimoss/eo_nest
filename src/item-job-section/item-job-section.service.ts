import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateItemJobSectionDto } from './dto/create-item-job-section.dto';
import { UpdateItemJobSectionDto } from './dto/update-item-job-section.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ItemJobSectionService {
  constructor(private prisma: PrismaService) {}

  async create(createItemJobSectionDto: CreateItemJobSectionDto) {
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
    });
    if (!jobSection) {
      throw new HttpException('Job Section not found', HttpStatus.NOT_FOUND);
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

  async update(id: number, updateItemJobSectionDto: UpdateItemJobSectionDto) {
    const {
      name,
      volume,
      minimumVolume,
      materialPricePerUnit,
      feePricePerUnit,
      unit,
      information,
      jobSectionId,
    } = updateItemJobSectionDto;

    const itemJobSection = await this.prisma.itemJobSection.findUnique({
      where: { id },
    });

    if (!itemJobSection) {
      throw new HttpException(
        'Item job section not found',
        HttpStatus.NOT_FOUND,
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

    const updateItemJobSection = await this.prisma.itemJobSection.update({
      where: { id },
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

  async remove(id: number) {
    const itemJobSection = await this.prisma.itemJobSection.findUnique({
      where: { id },
    });

    if (!itemJobSection) {
      throw new HttpException(
        'Item job section not found',
        HttpStatus.NOT_FOUND,
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
