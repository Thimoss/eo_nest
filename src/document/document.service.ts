import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateGeneralDocumentDto } from './dto/update-general-document.dto';
import { UpdatePercentageDto } from './dto/update-percentage.dto';
import { UpdateDocumentApprovalDto } from './dto/update-document-approval.dto';

@Injectable()
export class DocumentService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   *
   * @param createDocumentDto
   * @returns
   */
  async create(createDocumentDto: CreateDocumentDto, req: number) {
    const { name } = createDocumentDto;
    const userId = req;

    const uniqueSlug = await this.generateUniqueSlug(name);

    const newDocument = await this.prisma.document.create({
      data: {
        name,
        slug: uniqueSlug,
        job: '',
        location: '',
        base: '',
        createdById: userId,
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
  async findAll(sortBy: string, req: number) {
    const orderBy = this.getOrderBy(sortBy);
    const userId = req;

    const documents = await this.prisma.document.findMany({
      where: {
        createdById: userId,
      },
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

  /**
   *
   * @param slug
   * @returns
   */
  async findOne(slug: string, req: number) {
    const userId = req;
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

    if (document.createdById !== userId) {
      throw new HttpException(
        'You do not have permission to access this document',
        HttpStatus.FORBIDDEN,
      );
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

    const totalMaterialAndFeeDoc = totalMaterialPriceDoc + totalFeePriceDoc;

    const percentage = document.percentageBenefitsAndRisks;

    if (percentage === undefined || percentage === null) {
      throw new HttpException(
        'Percentage for benefits and risks is not set',
        HttpStatus.BAD_REQUEST,
      );
    }

    const totalBenefitsAndRisksDoc =
      totalMaterialAndFeeDoc * (percentage / 100);
    const totalPriceDoc = totalMaterialAndFeeDoc + totalBenefitsAndRisksDoc;

    // Update total di Document
    document.totalMaterialPrice = totalMaterialPriceDoc;
    document.totalFeePrice = totalFeePriceDoc;
    document.totalMaterialAndFee = totalMaterialAndFeeDoc;
    document.totalBenefitsAndRisks = totalBenefitsAndRisksDoc;
    document.totalPrice = totalPriceDoc;

    return {
      statusCode: 200,
      message: 'Documents found successfully',
      data: document,
    };
  }

  /**
   *
   * @param id
   * @param updateDocumentDto
   * @returns
   */
  async update(id: number, updateDocumentDto: UpdateDocumentDto, req: number) {
    const { name } = updateDocumentDto;
    const userId = req;

    const document = await this.prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      throw new HttpException('Document not found', HttpStatus.NOT_FOUND);
    }
    if (document.createdById !== userId) {
      throw new HttpException(
        'You do not have permission to access this document',
        HttpStatus.FORBIDDEN,
      );
    }

    const uniqueSlug = await this.generateUniqueSlug(name);

    const updatedDocument = await this.prisma.document.update({
      where: { id },
      data: {
        name: name ?? document.name,
        slug: uniqueSlug,
      },
    });

    return {
      statusCode: 200,
      message: 'Document  updated successfully',
      data: updatedDocument,
    };
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
    req: number,
  ) {
    const { base, job, location } = updateGeneralDocument;
    const userId = req;

    const document = await this.prisma.document.findUnique({
      where: { slug },
    });

    if (!document) {
      throw new HttpException('Document not found', HttpStatus.NOT_FOUND);
    }
    if (document.createdById !== userId) {
      throw new HttpException(
        'You do not have permission to access this document',
        HttpStatus.FORBIDDEN,
      );
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

  async updatePercentage(
    slug: string,
    updatePercentageDto: UpdatePercentageDto,
    req: number,
  ) {
    const userId = req;

    const document = await this.prisma.document.findUnique({
      where: { slug },
    });

    if (!document) {
      throw new Error('Document not found');
    }

    if (document.createdById !== userId) {
      throw new HttpException(
        'You do not have permission to access this document',
        HttpStatus.FORBIDDEN,
      );
    }

    const updatedDocument = await this.prisma.document.update({
      where: { slug },
      data: {
        percentageBenefitsAndRisks:
          updatePercentageDto.percentageBenefitsAndRisks,
      },
    });

    return {
      statusCode: 200,
      message: 'Percentage benefits and risks updated successfully',
      data: updatedDocument,
    };
  }

  /**
   *
   * @param slug
   * @param updateDocumentApproval
   * @returns
   */
  async updateApproval(
    slug: string,
    updateDocumentApproval: UpdateDocumentApprovalDto,
    req: number,
  ) {
    const {
      recapitulationLocation,
      preparedByName,
      preparedByPosition,
      checkedByName,
      checkedByPosition,
      confirmedByName,
      confirmedByPosition,
    } = updateDocumentApproval;

    const userId = req;

    const document = await this.prisma.document.findUnique({
      where: { slug },
    });

    if (!document) {
      throw new HttpException('Document not found', HttpStatus.NOT_FOUND);
    }

    if (document.createdById !== userId) {
      throw new HttpException(
        'You do not have permission to access this document',
        HttpStatus.FORBIDDEN,
      );
    }

    const updatedDocument = await this.prisma.document.update({
      where: { slug },
      data: {
        recapitulationLocation:
          recapitulationLocation ?? document.recapitulationLocation,
        preparedByName: preparedByName ?? document.preparedByName,
        preparedByPosition: preparedByPosition ?? document.preparedByPosition,
        checkedByName: checkedByName ?? document.checkedByName,
        checkedByPosition: checkedByPosition ?? document.checkedByPosition,
        confirmedByName: confirmedByName ?? document.confirmedByName,
        confirmedByPosition:
          confirmedByPosition ?? document.confirmedByPosition,
      },
    });

    return {
      statusCode: 200,
      message: 'Document approval updated successfully',
      data: updatedDocument,
    };
  }

  /**
   *
   * @param id
   * @returns
   */
  async remove(id: number, req: number) {
    const userId = req;

    const document = await this.prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      throw new HttpException('Document not found', HttpStatus.NOT_FOUND);
    }

    if (document.createdById !== userId) {
      throw new HttpException(
        'You do not have permission to access this document',
        HttpStatus.FORBIDDEN,
      );
    }

    await this.prisma.document.delete({
      where: { id },
    });

    return {
      statusCode: 200,
      message: 'Document deleted successfully',
    };
  }
}
