import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateSectorDto } from './dto/create-sector.dto';
import { UpdateSectorDto } from './dto/update-sector.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SectorService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createSectorDto: CreateSectorDto) {
    const { no, name, source, categoryId } = createSectorDto;

    // Cek apakah sudah ada sektor dengan 'no' yang sama dalam kategori yang sama
    const existingSector = await this.prisma.sector.findUnique({
      where: {
        no_categoryId: {
          no,
          categoryId, // Menggunakan kombinasi 'no' dan 'categoryId'
        },
      },
    });

    if (existingSector) {
      throw new HttpException(
        `Sector with no '${no}' already exists in this category.`,
        HttpStatus.FOUND,
      );
    }

    // Jika tidak ada sektor dengan 'no' yang sama, lanjutkan untuk membuat sektor baru
    return await this.prisma.sector.create({
      data: {
        no,
        name,
        source,
        categoryId,
      },
    });
  }

  findAll() {
    return `This action returns all sector`;
  }

  findOne(id: number) {
    return `This action returns a #${id} sector`;
  }

  update(id: number, updateSectorDto: UpdateSectorDto) {
    return `This action updates a #${id} sector`;
  }

  remove(id: number) {
    return `This action removes a #${id} sector`;
  }
}
