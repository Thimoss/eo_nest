import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateJobSectionDto } from './dto/create-job-section.dto';
import { UpdateJobSectionDto } from './dto/update-job-section.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class JobSectionService {
  constructor(private prisma: PrismaService) {}

  async create(createJobSectionDto: CreateJobSectionDto) {
    const { name, documentId } = createJobSectionDto;

    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new HttpException('Document not found', HttpStatus.NOT_FOUND);
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

  findAll() {
    return `This action returns all jobSection`;
  }

  findOne(id: number) {
    return `This action returns a #${id} jobSection`;
  }

  update(id: number, updateJobSectionDto: UpdateJobSectionDto) {
    return `This action updates a #${id} jobSection`;
  }

  remove(id: number) {
    return `This action removes a #${id} jobSection`;
  }
}
