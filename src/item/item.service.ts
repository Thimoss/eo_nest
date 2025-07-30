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

    const itemNo = `${sector.no}.${no}`;

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

  update(id: number, updateItemDto: UpdateItemDto) {
    return `This action updates a #${id} item`;
  }

  remove(id: number) {
    return `This action removes a #${id} item`;
  }
}
