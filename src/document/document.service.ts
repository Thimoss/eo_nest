import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateGeneralDocumentDto } from './dto/update-general-document.dto';

@Injectable()
export class DocumentService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   *
   * @param createDocumentDto
   * @returns
   */
  async create(createDocumentDto: CreateDocumentDto) {
    const { name } = createDocumentDto;

    const uniqueSlug = await this.generateUniqueSlug(name);

    const newDocument = await this.prisma.document.create({
      data: {
        name,
        slug: uniqueSlug,
        job: '',
        location: '',
        base: '',
      },
    });

    return {
      statusCode: 200,
      message: 'Document created successfully',
      data: newDocument,
    };
  }

  /**
   *
   * @param name
   * @returns
   */
  private async generateUniqueSlug(name: string): Promise<string> {
    const baseSlug = name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .substring(0, 50);

    const timestamp = new Date()
      .toISOString()
      .replace(/[^0-9]/g, '')
      .substring(0, 14);

    let slug = `${baseSlug}-${timestamp}`;
    let existingDocument = await this.prisma.document.findUnique({
      where: { slug },
    });

    let count = 1;
    while (existingDocument) {
      slug = `${baseSlug}-${timestamp}-${count}`;
      count++;
      existingDocument = await this.prisma.document.findUnique({
        where: { slug },
      });
    }

    return slug;
  }

  /**
   *
   * @param sortBy
   * @returns
   */
  async findAll(sortBy: string) {
    const orderBy = this.getOrderBy(sortBy);

    const documents = await this.prisma.document.findMany({
      orderBy,
    });

    return {
      statusCode: 200,
      message: 'Items found successfully',
      data: documents,
    };
  }

  /**
   *
   * @param sortBy
   * @returns
   */
  private getOrderBy(sortBy: string) {
    const sortOptions = {
      asc: { name: 'asc' },
      desc: { name: 'desc' },
      recent: { updatedAt: 'desc' },
      least: { updatedAt: 'asc' },
    };

    switch (sortBy) {
      case 'asc':
        return sortOptions.asc;
      case 'desc':
        return sortOptions.desc;
      case 'recent':
        return sortOptions.recent;
      case 'least':
        return sortOptions.least;
      default:
        return {};
    }
  }

  async findOne(slug: string) {
    const document = await this.prisma.document.findUnique({
      where: { slug },
      include: {
        jobSections: {
          orderBy: {
            id: 'asc',
          },
          include: {
            itemJobSections: {
              orderBy: {
                id: 'asc',
              },
            },
          },
        },
      },
    });

    if (!document) {
      throw new HttpException('Document not found', HttpStatus.NOT_FOUND);
    }

    for (const jobSection of document.jobSections) {
      const totalMaterialPriceJob = jobSection.itemJobSections.reduce(
        (total, item) => {
          return total + item.totalMaterialPrice;
        },
        0,
      );

      const totalFeePriceJob = jobSection.itemJobSections.reduce(
        (total, item) => {
          return total + item.totalFeePrice;
        },
        0,
      );

      // Update total untuk JobSection
      jobSection.totalMaterialPrice = totalMaterialPriceJob;
      jobSection.totalFeePrice = totalFeePriceJob;
    }

    // Menghitung totalMaterialPrice, totalFeePrice, dan totalPrice di Document
    const totalMaterialPriceDoc = document.jobSections.reduce(
      (total, section) => {
        return total + section.totalMaterialPrice;
      },
      0,
    );

    const totalFeePriceDoc = document.jobSections.reduce((total, section) => {
      return total + section.totalFeePrice;
    }, 0);

    const totalPriceDoc = totalMaterialPriceDoc + totalFeePriceDoc;

    // Update total di Document
    document.totalMaterialPrice = totalMaterialPriceDoc;
    document.totalFeePrice = totalFeePriceDoc;
    document.totalPrice = totalPriceDoc;

    return {
      statusCode: 200,
      message: 'Documents found successfully',
      data: document,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(id: number, updateDocumentDto: UpdateDocumentDto) {
    return `This action updates a #${id} document`;
  }

  /**
   *
   * @param slug
   * @param updateGeneralDocument
   * @returns
   */
  async updateGeneralInfo(
    slug: string,
    updateGeneralDocument: UpdateGeneralDocumentDto,
  ) {
    const { base, job, location } = updateGeneralDocument;

    const document = await this.prisma.document.findUnique({
      where: { slug },
    });

    if (!document) {
      throw new HttpException('Document not found', HttpStatus.NOT_FOUND);
    }

    const updatedDocument = await this.prisma.document.update({
      where: { slug },
      data: {
        base: base ?? document.base,
        job: job ?? document.job,
        location: location ?? document.location,
      },
    });

    return {
      statusCode: 200,
      message: 'Document general info updated successfully',
      data: updatedDocument,
    };
  }

  remove(id: number) {
    return `This action removes a #${id} document`;
  }
}
