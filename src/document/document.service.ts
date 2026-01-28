import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DocumentStatus } from '@prisma/client';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateGeneralDocumentDto } from './dto/update-general-document.dto';
import { UpdatePercentageDto } from './dto/update-percentage.dto';
import { UpdateRecapitulationLocationDto } from './dto/update-recapitulation-location.dto';
import { QRCodeService } from './qrcode.service';
import { PDFService } from './pdf.service';

const documentUserSelect = {
  id: true,
  name: true,
  email: true,
  phoneNumber: true,
  position: true,
  role: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
};

@Injectable()
export class DocumentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly qrcodeService: QRCodeService,
    private readonly pdfService: PDFService,
  ) {}

  /**
   *
   * @param createDocumentDto
   * @returns
   */
  async create(createDocumentDto: CreateDocumentDto, req: number) {
    const { name, checkedById, confirmedById } = createDocumentDto;
    const userId = req;

    if (checkedById === confirmedById) {
      throw new HttpException(
        'Checker and confirmer must be different users',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (checkedById === userId || confirmedById === userId) {
      throw new HttpException(
        'Checker and confirmer must be different from the creator',
        HttpStatus.BAD_REQUEST,
      );
    }

    const selectedUsers = await this.prisma.user.findMany({
      where: { id: { in: [checkedById, confirmedById] } },
      select: { id: true },
    });

    if (selectedUsers.length !== 2) {
      throw new HttpException(
        'Checker or confirmer user not found',
        HttpStatus.BAD_REQUEST,
      );
    }

    const uniqueSlug = await this.generateUniqueSlug(name);

    const newDocument = await this.prisma.document.create({
      data: {
        name,
        slug: uniqueSlug,
        job: '',
        location: '',
        base: '',
        status: DocumentStatus.IN_PROGRESS,
        createdById: userId,
        checkedById,
        confirmedById,
      },
      include: {
        createdBy: { select: documentUserSelect },
        checkedBy: { select: documentUserSelect },
        confirmedBy: { select: documentUserSelect },
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
  async findAll(sortBy: string, req: number, scope?: string, limit?: number) {
    const orderBy = this.getOrderBy(sortBy);
    const userId = req;
    const where = this.getScopeWhere(scope, userId);
    const take = limit ? Number(limit) : undefined;

    const documents = await this.prisma.document.findMany({
      where,
      orderBy,
      take,
      include: {
        createdBy: { select: documentUserSelect },
        checkedBy: { select: documentUserSelect },
        confirmedBy: { select: documentUserSelect },
      },
    });

    return {
      statusCode: 200,
      message: 'Items found successfully',
      data: documents,
    };
  }

  private getScopeWhere(scope: string | undefined, userId: number) {
    switch (scope) {
      case 'review':
        return { checkedById: userId };
      case 'confirm':
        return { confirmedById: userId };
      default:
        return { createdById: userId };
    }
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
        createdBy: { select: documentUserSelect },
        checkedBy: { select: documentUserSelect },
        confirmedBy: { select: documentUserSelect },
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

    const canAccess =
      document.createdById === userId ||
      document.checkedById === userId ||
      document.confirmedById === userId;

    if (!canAccess) {
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
    const { name, checkedById, confirmedById } = updateDocumentDto;
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
    if (document.status !== DocumentStatus.IN_PROGRESS) {
      throw new HttpException(
        'Cannot edit document that has been submitted for review',
        HttpStatus.BAD_REQUEST,
      );
    }

    const nextCheckedById = checkedById ?? document.checkedById;
    const nextConfirmedById = confirmedById ?? document.confirmedById;

    if (checkedById !== undefined || confirmedById !== undefined) {
      if (nextCheckedById === nextConfirmedById) {
        throw new HttpException(
          'Checker and confirmer must be different users',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (nextCheckedById === userId || nextConfirmedById === userId) {
        throw new HttpException(
          'Checker and confirmer must be different from the creator',
          HttpStatus.BAD_REQUEST,
        );
      }

      const selectedUsers = await this.prisma.user.findMany({
        where: { id: { in: [nextCheckedById, nextConfirmedById] } },
        select: { id: true },
      });

      if (selectedUsers.length !== 2) {
        throw new HttpException(
          'Checker or confirmer user not found',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    const data: {
      checkedById: number;
      confirmedById: number;
      name?: string;
      slug?: string;
    } = {
      checkedById: nextCheckedById,
      confirmedById: nextConfirmedById,
    };

    if (name !== undefined) {
      const uniqueSlug = await this.generateUniqueSlug(name);
      data.name = name;
      data.slug = uniqueSlug;
    }

    const updatedDocument = await this.prisma.document.update({
      where: { id },
      data,
      include: {
        createdBy: { select: documentUserSelect },
        checkedBy: { select: documentUserSelect },
        confirmedBy: { select: documentUserSelect },
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
    if (document.status !== DocumentStatus.IN_PROGRESS) {
      throw new HttpException(
        'Cannot edit document that has been submitted for review',
        HttpStatus.BAD_REQUEST,
      );
    }

    const updatedDocument = await this.prisma.document.update({
      where: { slug },
      data: {
        base: base ?? document.base,
        job: job ?? document.job,
        location: location ?? document.location,
      },
      include: {
        createdBy: { select: documentUserSelect },
        checkedBy: { select: documentUserSelect },
        confirmedBy: { select: documentUserSelect },
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
    if (document.status !== DocumentStatus.IN_PROGRESS) {
      throw new HttpException(
        'Cannot edit document that has been submitted for review',
        HttpStatus.BAD_REQUEST,
      );
    }

    const updatedDocument = await this.prisma.document.update({
      where: { slug },
      data: {
        percentageBenefitsAndRisks:
          updatePercentageDto.percentageBenefitsAndRisks,
      },
      include: {
        createdBy: { select: documentUserSelect },
        checkedBy: { select: documentUserSelect },
        confirmedBy: { select: documentUserSelect },
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
   * @param updateRecapitulationLocationDto
   * @returns
   */
  async updateRecapitulationLocation(
    slug: string,
    updateRecapitulationLocationDto: UpdateRecapitulationLocationDto,
    req: number,
  ) {
    const { recapitulationLocation } = updateRecapitulationLocationDto;
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
    if (document.status !== DocumentStatus.IN_PROGRESS) {
      throw new HttpException(
        'Cannot edit document that has been submitted for review',
        HttpStatus.BAD_REQUEST,
      );
    }

    const updatedDocument = await this.prisma.document.update({
      where: { slug },
      data: {
        recapitulationLocation,
      },
      include: {
        createdBy: { select: documentUserSelect },
        checkedBy: { select: documentUserSelect },
        confirmedBy: { select: documentUserSelect },
      },
    });

    return {
      statusCode: 200,
      message: 'Recapitulation location updated successfully',
      data: updatedDocument,
    };
  }

  async submitForCheck(slug: string, req: number) {
    const userId = req;

    const document = await this.prisma.document.findUnique({
      where: { slug },
    });

    if (!document) {
      throw new HttpException('Document not found', HttpStatus.NOT_FOUND);
    }

    if (document.createdById !== userId) {
      throw new HttpException(
        'You do not have permission to submit this document',
        HttpStatus.FORBIDDEN,
      );
    }

    if (document.status !== DocumentStatus.IN_PROGRESS) {
      throw new HttpException(
        'Document is not in progress',
        HttpStatus.BAD_REQUEST,
      );
    }

    const updatedDocument = await this.prisma.document.update({
      where: { slug },
      data: {
        status: DocumentStatus.NEED_CHECKED,
      },
      include: {
        createdBy: { select: documentUserSelect },
        checkedBy: { select: documentUserSelect },
        confirmedBy: { select: documentUserSelect },
      },
    });

    return {
      statusCode: 200,
      message: 'Document submitted for checking successfully',
      data: updatedDocument,
    };
  }

  async approveCheck(slug: string, req: number) {
    const userId = req;

    const document = await this.prisma.document.findUnique({
      where: { slug },
    });

    if (!document) {
      throw new HttpException('Document not found', HttpStatus.NOT_FOUND);
    }

    if (document.checkedById !== userId) {
      throw new HttpException(
        'You do not have permission to check this document',
        HttpStatus.FORBIDDEN,
      );
    }

    if (document.status !== DocumentStatus.NEED_CHECKED) {
      throw new HttpException(
        'Document is not ready to be checked',
        HttpStatus.BAD_REQUEST,
      );
    }

    const updatedDocument = await this.prisma.document.update({
      where: { slug },
      data: {
        status: DocumentStatus.NEED_CONFIRMED,
        checkedAt: new Date(),
      },
      include: {
        createdBy: { select: documentUserSelect },
        checkedBy: { select: documentUserSelect },
        confirmedBy: { select: documentUserSelect },
      },
    });

    return {
      statusCode: 200,
      message: 'Document checked successfully',
      data: updatedDocument,
    };
  }

  async approveConfirm(slug: string, req: number) {
    const userId = req;

    const document = await this.prisma.document.findUnique({
      where: { slug },
    });

    if (!document) {
      throw new HttpException('Document not found', HttpStatus.NOT_FOUND);
    }

    if (document.confirmedById !== userId) {
      throw new HttpException(
        'You do not have permission to confirm this document',
        HttpStatus.FORBIDDEN,
      );
    }

    if (document.status !== DocumentStatus.NEED_CONFIRMED) {
      throw new HttpException(
        'Document is not ready to be confirmed',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Generate QR code
    const qrCodeDataUrl = await this.qrcodeService.generateQRCode(slug);

    const updatedDocument = await this.prisma.document.update({
      where: { slug },
      data: {
        status: DocumentStatus.APPROVED,
        confirmedAt: new Date(),
        qrCodeUrl: qrCodeDataUrl,
      },
      include: {
        createdBy: { select: documentUserSelect },
        checkedBy: { select: documentUserSelect },
        confirmedBy: { select: documentUserSelect },
      },
    });

    return {
      statusCode: 200,
      message: 'Document confirmed successfully',
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

  /**
   * Generate PDF for approved document
   */
  async generatePDF(slug: string, userId: number): Promise<Buffer> {
    const document = await this.prisma.document.findUnique({
      where: { slug },
      include: {
        createdBy: { select: documentUserSelect },
        checkedBy: { select: documentUserSelect },
        confirmedBy: { select: documentUserSelect },
        jobSections: {
          orderBy: { id: 'asc' },
          include: {
            itemJobSections: {
              orderBy: { id: 'asc' },
            },
          },
        },
      },
    });

    if (!document) {
      throw new HttpException('Document not found', HttpStatus.NOT_FOUND);
    }

    // Check if user has access to this document
    const canAccess =
      document.createdById === userId ||
      document.checkedById === userId ||
      document.confirmedById === userId;

    if (!canAccess) {
      throw new HttpException(
        'You do not have permission to access this document',
        HttpStatus.FORBIDDEN,
      );
    }

    // Check if document is approved
    if (document.status !== DocumentStatus.APPROVED) {
      throw new HttpException(
        'Document must be approved before generating PDF',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!document.checkedAt || !document.confirmedAt) {
      throw new HttpException(
        'Document approval information is incomplete',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Calculate totals on the fly (same logic as findOne)
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

      // Update total for JobSection
      jobSection.totalMaterialPrice = totalMaterialPriceJob;
      jobSection.totalFeePrice = totalFeePriceJob;
    }

    // Calculate totals for Document
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
    // Default to 0 if not set, though findOne throws error.
    // generatePDF should probably be safer or consistent.
    // findOne logic:
    // if (percentage === undefined || percentage === null) { throw ... }
    // However, for PDF generation we might want to proceed even if 0?
    // The original code passed document.percentageBenefitsAndRisks directly.
    // Let's stick to the logic:
    const safePercentage = percentage ?? 0;

    const totalBenefitsAndRisksDoc =
      totalMaterialAndFeeDoc * (safePercentage / 100);
    const totalPriceDoc = totalMaterialAndFeeDoc + totalBenefitsAndRisksDoc;

    // Prepare document data for PDF generation
    const documentData = {
      name: document.name,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
      recapitulationLocation: document.recapitulationLocation,
      createdBy: document.createdBy,
      checkedBy: document.checkedBy,
      confirmedBy: document.confirmedBy,
      checkedAt: document.checkedAt,
      confirmedAt: document.confirmedAt,
      job: document.job,
      location: document.location,
      base: document.base,
      totalMaterialPrice: totalMaterialPriceDoc,
      totalFeePrice: totalFeePriceDoc,
      totalMaterialAndFee: totalMaterialAndFeeDoc,
      totalPrice: totalPriceDoc,
      totalBenefitsAndRisks: totalBenefitsAndRisksDoc,
      percentageBenefitsAndRisks: document.percentageBenefitsAndRisks,
      jobSections: document.jobSections,
    };

    return await this.pdfService.generateDocumentPDF(documentData, slug);
  }

  /**
   * Get public document information for QR code verification
   * This endpoint does not require authentication
   */
  async getPublicDocumentInfo(slug: string) {
    const document = await this.prisma.document.findUnique({
      where: { slug },
      include: {
        createdBy: { select: documentUserSelect },
        checkedBy: { select: documentUserSelect },
        confirmedBy: { select: documentUserSelect },
      },
    });

    if (!document) {
      throw new HttpException('Document not found', HttpStatus.NOT_FOUND);
    }

    // Only show information for approved documents
    if (document.status !== DocumentStatus.APPROVED) {
      throw new HttpException(
        'Document information is only available for approved documents',
        HttpStatus.FORBIDDEN,
      );
    }

    // Return only public information
    return {
      statusCode: 200,
      message: 'Document information retrieved successfully',
      data: {
        name: document.name,
        slug: document.slug,
        status: document.status,
        job: document.job,
        location: document.location,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt,
        createdBy: {
          name: document.createdBy.name,
          position: document.createdBy.position,
        },
        checkedBy: {
          name: document.checkedBy.name,
          position: document.checkedBy.position,
        },
        checkedAt: document.checkedAt,
        confirmedBy: {
          name: document.confirmedBy.name,
          position: document.confirmedBy.position,
        },
        confirmedAt: document.confirmedAt,
      },
    };
  }
}
