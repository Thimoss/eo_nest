import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Document } from '@prisma/client';

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
    // Membuat slug dasar dari nama
    const baseSlug = name
      .toLowerCase()
      .replace(/\s+/g, '-') // Mengganti spasi dengan "-"
      .replace(/[^\w-]+/g, '') // Menghapus karakter non-alfanumerik
      .substring(0, 50); // Membatasi panjang slug

    // Mengambil timestamp saat ini
    const timestamp = new Date()
      .toISOString()
      .replace(/[^0-9]/g, '')
      .substring(0, 14); // Format YYYYMMDDHHMMSS

    let slug = `${baseSlug}-${timestamp}`; // Gabungkan slug dengan timestamp

    // Cek apakah slug sudah ada di database
    let existingDocument = await this.prisma.document.findUnique({
      where: { slug },
    });

    // Jika slug sudah ada, tambahkan angka di belakang slug untuk membuatnya unik
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

    // Mengembalikan pengaturan orderBy berdasarkan singkatan sortBy
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
        return {}; // Jika tidak ada pilihan yang valid, tidak mengurutkan
    }
  }

  async findOne(slug: string) {
    const document = await this.prisma.document.findUnique({
      where: { slug },
    });

    if (!document) {
      throw new HttpException('Document not found', HttpStatus.NOT_FOUND);
    }
    return {
      statusCode: 200,
      message: 'Documents found successfully',
      data: document,
    };
  }

  update(id: number, updateDocumentDto: UpdateDocumentDto) {
    return `This action updates a #${id} document`;
  }

  remove(id: number) {
    return `This action removes a #${id} document`;
  }
}
