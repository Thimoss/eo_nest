import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateJobSectionDto } from './dto/create-job-section.dto';
import { UpdateJobSectionDto } from './dto/update-job-section.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class JobSectionService {
  constructor(private prisma: PrismaService) {}

  /**
   *
   * @param createJobSectionDto
   * @returns
   */
  async create(createJobSectionDto: CreateJobSectionDto, userId: number) {
    const { name, documentId } = createJobSectionDto;

    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new HttpException('Document not found', HttpStatus.NOT_FOUND);
    }

    if (document.createdById !== userId) {
      throw new HttpException(
        'You do not have permission to create a job section for this document',
        HttpStatus.FORBIDDEN,
      );
    }
    const existingJobSection = await this.prisma.jobSection.findFirst({
      where: {
        name: name,
        documentId: documentId,
      },
    });

    if (existingJobSection) {
      throw new HttpException(
        `Job Section already exists in this document`,
        HttpStatus.CONFLICT,
      );
    }

    const createJobSection = await this.prisma.jobSection.create({
      data: {
        name,
        documentId,
      },
    });

    if (createJobSection) {
      return {
        statusCode: 200,
        message: 'Job section created successfully',
        data: createJobSection,
      };
    }
  }

  /**
   *
   * @param id
   * @param updateJobSectionDto
   * @param userId
   * @returns
   */
  async update(
    id: number,
    updateJobSectionDto: UpdateJobSectionDto,
    userId: number,
  ) {
    const { name, documentId } = updateJobSectionDto;

    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new HttpException('Document not found', HttpStatus.NOT_FOUND);
    }

    if (document.createdById !== userId) {
      throw new HttpException(
        'You do not have permission to update a job section for this document',
        HttpStatus.FORBIDDEN,
      );
    }

    const jobSection = await this.prisma.jobSection.findUnique({
      where: { id },
    });

    if (!jobSection) {
      throw new HttpException('Job section not found', HttpStatus.NOT_FOUND);
    }

    const existingJobSection = await this.prisma.jobSection.findFirst({
      where: {
        name: name,
        documentId: documentId,
      },
    });

    if (existingJobSection) {
      throw new HttpException(
        `Job Section already exists in this document`,
        HttpStatus.CONFLICT,
      );
    }

    const updateJobSection = await this.prisma.jobSection.update({
      where: { id },
      data: {
        name,
      },
    });

    if (updateJobSection) {
      return {
        statusCode: 200,
        message: 'Job section updated successfully',
        data: updateJobSection,
      };
    }
  }

  async remove(id: number, userId: number) {
    const jobSection = await this.prisma.jobSection.findUnique({
      where: { id },
      include: {
        document: true,
      },
    });

    if (!jobSection) {
      throw new HttpException('Job section not found', HttpStatus.NOT_FOUND);
    }

    if (jobSection.document.createdById !== userId) {
      throw new HttpException(
        'You do not have permission to delete this job section',
        HttpStatus.FORBIDDEN,
      );
    }
    await this.prisma.jobSection.delete({
      where: { id },
    });
    return {
      statusCode: 200,
      message: 'Job section removed successfully',
    };
  }
}
