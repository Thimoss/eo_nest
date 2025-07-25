import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}
  /**
   *
   * @param data
   * @returns
   */
  async create(data: CreateCategoryDto) {
    //buat dulu slug dari nama. lalu cek
    const generatedSlug: string = this.generateSlug(data.name);

    const checkCategoryExist = await this.prisma.category.findFirst({
      where: { slug: generatedSlug },
    });
    return 'This action adds a new category';
  }

  findAll() {
    return `This action returns all category`;
  }

  findOne(id: number) {
    return `This action returns a #${id} category`;
  }

  update(id: number, updateCategoryDto: UpdateCategoryDto) {
    return `This action updates a #${id} category`;
  }

  remove(id: number) {
    return `This action removes a #${id} category`;
  }
}
