import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateSectorDto } from './dto/create-sector.dto';
import { UpdateSectorDto } from './dto/update-sector.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SectorService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   *
   * @param data
   * @returns
   */
  async create(data: CreateSectorDto) {
    const { no, name, source, categoryId } = data;

    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!category) {
      throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
    }

    const sectorNo = `${category.code}.${no}`;

    const existingSector = await this.prisma.sector.findFirst({
      where: { no: sectorNo },
    });

    if (existingSector) {
      throw new HttpException(
        `Sector number ${sectorNo} already exists`,
        HttpStatus.CONFLICT,
      );
    }

    const createSector = await this.prisma.sector.create({
      data: {
        no: sectorNo,
        name,
        source,
        categoryId,
      },
    });

    if (createSector) {
      return {
        statusCode: 200,
        message: 'Sector created successfully',
        data: createSector,
      };
    }
  }

  findAll() {
    return `This action returns all sector`;
  }

  findOne(id: number) {
    return `This action returns a #${id} sector`;
  }

  /**
   *
   * @param id
   * @param data
   * @returns
   */
  async update(id: number, data: UpdateSectorDto) {
    const { no, name, source, categoryId } = data;

    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
    }

    const sectorNo = `${category.code}.${no}`;

    const existingSector = await this.prisma.sector.findFirst({
      where: { no: sectorNo, NOT: { id } },
    });

    if (existingSector) {
      throw new HttpException(
        `Sector number ${sectorNo} already exists`,
        HttpStatus.CONFLICT,
      );
    }

    const updatedSector = await this.prisma.sector.update({
      where: { id },
      data: {
        no: sectorNo,
        name,
        source,
        categoryId,
      },
    });

    return {
      statusCode: 200,
      message: 'Sector updated successfully',
      data: updatedSector,
    };
  }

  /**
   *
   * @param id
   * @returns
   */
  async remove(id: number) {
    const sector = await this.prisma.sector.findUnique({
      where: { id },
    });

    if (!sector) {
      throw new HttpException('Sector not found', HttpStatus.NOT_FOUND);
    }

    await this.prisma.sector.delete({
      where: { id },
    });
    return {
      statusCode: 200,
      message: 'Sector removed successfully',
    };
  }
}
