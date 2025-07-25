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

    // Check if the category with the same code already exists
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
      .replace(/[^a-z0-9\s-]/g, '') // Hapus karakter selain alfanumerik dan spasi
      .replace(/\s+/g, '-') // Ganti spasi dengan tanda hubung
      .replace(/-+/g, '-'); // Ganti tanda hubung berlebih dengan satu tanda hubung
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
      skip: (page - 1) * pageSize, // Calculate the offset based on the current page
      take: pageSize,
    });

    // Get the total count of categories for pagination metadata
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
      data: categories,
      pagination: {
        currentPage: page,
        pageSize: pageSize,
        totalItems: totalCount,
        totalPages: Math.ceil(totalCount / pageSize), // Calculate total pages
      },
    };
  }

  /**
   *
   * @param id
   * @returns
   */
  findOne(id: number) {
    return `This action returns a #${id} category`;
  }

  /**
   *
   * @param id
   * @param data
   * @returns
   */
  async update(id: number, data: UpdateCategoryDto) {
    const generatedSlug: string = this.generateSlug(data.name);
    // Check if the category with the same slug already exists, excluding the current one
    const checkCategoryExistBySlug = await this.prisma.category.findFirst({
      where: {
        slug: generatedSlug,
        NOT: { id },
      },
    });

    if (checkCategoryExistBySlug) {
      throw new HttpException(
        'Category with this name already registered',
        HttpStatus.FOUND,
      );
    }

    // Check if the category with the same code already exists, excluding the current one
    const checkCategoryExistByCode = await this.prisma.category.findFirst({
      where: {
        code: data.code,
        NOT: { id },
      },
    });

    if (checkCategoryExistByCode) {
      throw new HttpException(
        'Category with this code already registered',
        HttpStatus.FOUND,
      );
    }

    // Update the category
    const updatedCategory = await this.prisma.category.update({
      where: { id },
      data: {
        ...data,
        slug: generatedSlug, // Ensure slug is updated based on the name
      },
    });

    // If the category was successfully updated, return the updated category data
    if (updatedCategory) {
      return {
        statusCode: 200,
        message: 'Update Successful',
        data: {
          id: updatedCategory.id,
          name: updatedCategory.name,
          slug: updatedCategory.slug,
          code: updatedCategory.code,
          reference: updatedCategory.reference,
          location: updatedCategory.location,
          createdAt: updatedCategory.createdAt,
          updatedAt: updatedCategory.updatedAt,
          deletedAt: updatedCategory.deletedAt, // Include the deletedAt field (nullable)
        },
      };
    }
  }

  /**
   *
   * @param id
   * @returns
   */
  async remove(id: number) {
    // Check if the category exists
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      // If category does not exist, throw a 404 error
      throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
    }

    // Delete the category
    await this.prisma.category.delete({
      where: { id },
    });

    // Return a success message after deletion
    return {
      statusCode: 200,
      message: 'Category deleted successfully',
    };
  }
}
