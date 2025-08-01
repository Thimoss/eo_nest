import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ItemService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   *
   * @param data
   */
  async create(data: CreateItemDto) {
    const {
      no,
      name,
      source,
      minimum,
      unit,
      materialPricePerUnit,
      feePerUnit,
      singleItem,
      sectorId,
    } = data;

    const sector = await this.prisma.sector.findUnique({
      where: { id: sectorId },
    });

    if (!sector) {
      throw new HttpException('Sector not found', HttpStatus.NOT_FOUND);
    }

    const categoryCode = sector.categoryCode;

    const itemNo = `${no}`;

    const existingItem = await this.prisma.item.findFirst({
      where: { no: itemNo },
    });

    if (existingItem) {
      throw new HttpException(
        `Item number ${itemNo} already exists`,
        HttpStatus.CONFLICT,
      );
    }

    let itemData: any = {
      no: itemNo,
      name,
      source,
      sectorId,
      singleItem,
      sectorNo: sector.no,
      categoryCode,
    };
    if (singleItem === false) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      itemData = {
        ...itemData,
        unit: null,
        minimum: null,
        materialPricePerUnit: null,
        feePerUnit: null,
      };
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      itemData = {
        ...itemData,
        minimum,
        unit,
        materialPricePerUnit,
        feePerUnit,
      };
    }

    const createItem = await this.prisma.item.create({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data: itemData,
    });

    return {
      statusCode: 200,
      message: 'Item created successfully',
      data: createItem,
    };
  }

  findAll() {
    return `This action returns all item`;
  }

  findOne(id: number) {
    return `This action returns a #${id} item`;
  }

  /**
   *
   * @param id
   * @param data
   * @returns
   */
  async update(id: number, data: UpdateItemDto) {
    const {
      no,
      name,
      source,
      minimum,
      unit,
      materialPricePerUnit,
      feePerUnit,
      singleItem,
      sectorId,
    } = data;

    const sector = await this.prisma.sector.findUnique({
      where: { id: sectorId },
    });

    if (!sector) {
      throw new HttpException('Sector not found', HttpStatus.NOT_FOUND);
    }
    const categoryCode = sector.categoryCode;
    const itemNo = `${no}`;

    const existingItem = await this.prisma.item.findFirst({
      where: { no: itemNo },
    });

    if (existingItem) {
      throw new HttpException(
        `Item number ${itemNo} already exists`,
        HttpStatus.CONFLICT,
      );
    }

    let itemData: any = {
      no: itemNo,
      name,
      source,
      sectorId,
      singleItem,
      sectorNo: sector.no,
      categoryCode,
    };
    if (singleItem === false) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      itemData = {
        ...itemData,
        unit: null,
        minimum: null,
        materialPricePerUnit: null,
        feePerUnit: null,
      };
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      itemData = {
        ...itemData,
        minimum,
        unit,
        materialPricePerUnit,
        feePerUnit,
      };
    }

    const updatedItem = await this.prisma.item.update({
      where: {
        id,
      },
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data: itemData,
    });

    return {
      statusCode: 200,
      message: 'Item updated successfully',
      data: updatedItem,
    };
  }

  async remove(id: number) {
    const item = await this.prisma.item.findUnique({
      where: { id },
    });

    if (!item) {
      throw new HttpException('Item not found', HttpStatus.NOT_FOUND);
    }

    await this.prisma.item.delete({
      where: { id },
    });
    return {
      statusCode: 200,
      message: 'Item removed successfully',
    };
  }
}
