import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
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
    const generatedSlug: string = this.generateSlug(data.name);

    const checkCategoryExist = await this.prisma.category.findFirst({
      where: { slug: generatedSlug },
    });

    if (checkCategoryExist) {
      throw new HttpException('Category already registered', HttpStatus.FOUND);
    }

    const checkCategoryExistByCode = await this.prisma.category.findFirst({
      where: { code: data.code },
    });

    if (checkCategoryExistByCode) {
      throw new HttpException(
        'Category with this code already registered',
        HttpStatus.FOUND,
      );
    }
    const newCategory = await this.prisma.category.create({
      data: {
        ...data,
        slug: generatedSlug,
      },
    });
    if (newCategory) {
      return {
        statusCode: 200,
        message: 'Register Successfull',
        data: {
          id: newCategory.id,
          name: newCategory.name,
          slug: newCategory.slug,
          code: newCategory.code,
          reference: newCategory.reference,
          location: newCategory.location,
          createdAt: newCategory.createdAt,
          updatedAt: newCategory.updatedAt,
          deletedAt: newCategory.deletedAt,
        },
      };
    }
  }

  /**
   *
   * @param name
   * @returns
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  /**
   *
   * @param filter
   * @returns
   */
  async findAll(filter: { name?: string; page?: number; pageSize?: number }) {
    const page = filter.page || 1;
    const pageSize = filter.pageSize || 10;
    const categories = await this.prisma.category.findMany({
      where: {
        name: filter.name
          ? { contains: filter.name, mode: 'insensitive' }
          : undefined,
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const totalCount = await this.prisma.category.count({
      where: {
        name: filter.name
          ? { contains: filter.name, mode: 'insensitive' }
          : undefined,
      },
    });

    return {
      statusCode: 200,
      message: 'Categories fetched successfully',
      data: {
        list: categories,
        pagination: {
          currentPage: page,
          pageSize: pageSize,
          totalItems: totalCount,
          totalPages: Math.ceil(totalCount / pageSize),
        },
      },
    };
  }

  /**
   *
   * @param id
   * @returns
   */
  async findOne(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        sectors: {
          orderBy: {
            no: 'asc', // Order sectors by 'no' in ascending order
          },
          include: {
            items: {
              orderBy: {
                no: 'asc', // Order items by 'no' in ascending order within each sector
              },
            },
          },
        },
      },
    });

    if (!category) {
      throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
    }

    return {
      statusCode: 200,
      message: 'Category details fetched successfully',
      data: category,
    };
  }

  /**
   *
   * @param id
   * @param data
   * @returns
   */
  async update(id: number, data: UpdateCategoryDto) {
    const generatedSlug: string = this.generateSlug(data.name);

    const checkCategoryExistBySlug = await this.prisma.category.findFirst({
      where: {
        slug: generatedSlug,
        NOT: { id },
      },
    });

    if (checkCategoryExistBySlug) {
      throw new HttpException(
        'Category with this name already registered',
        HttpStatus.CONFLICT,
      );
    }

    const checkCategoryExistByCode = await this.prisma.category.findFirst({
      where: {
        code: data.code,
        NOT: { id },
      },
    });

    if (checkCategoryExistByCode) {
      throw new HttpException(
        'Category with this code already registered',
        HttpStatus.CONFLICT,
      );
    }

    const updatedCategory = await this.prisma.category.update({
      where: { id },
      data: {
        ...data,
        slug: generatedSlug,
      },
    });

    if (updatedCategory) {
      await this.prisma.sector.updateMany({
        where: { categoryId: id },
        data: { categoryCode: updatedCategory.code },
      });

      await this.prisma.item.updateMany({
        where: {
          sector: {
            categoryId: id,
          },
        },
        data: {
          categoryCode: updatedCategory.code,
        },
      });

      return {
        statusCode: 200,
        message: 'Update Successful',
        data: updatedCategory,
      };
    }
  }

  /**
   *
   * @param id
   * @returns
   */
  async remove(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
    }

    await this.prisma.category.delete({
      where: { id },
    });

    return {
      statusCode: 200,
      message: 'Category deleted successfully',
    };
  }
}
