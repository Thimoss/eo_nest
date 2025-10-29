import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  HttpException,
  HttpStatus,
  UploadedFile,
} from '@nestjs/common';
import { ItemService } from './item.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';

@Controller('item')
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  @Post('create')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 1 * 1024 * 1024 }, // batas ukuran file
      fileFilter: (req, file, callback) => {
        console.log('File received by multer:', file);
        if (file.mimetype !== 'application/pdf') {
          return callback(
            new HttpException(
              'Only PDF files are allowed',
              HttpStatus.BAD_REQUEST,
            ),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async create(
    @Body() data: CreateItemDto,
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    console.log('File received 2:', file);
    console.log('Request body:', data);
    let pdfUrl: string = '';

    // Check if file is uploaded
    if (file && file.originalname) {
      // Set the upload directory
      const uploadDir = path.join(process.cwd(), 'uploads');

      // Ensure the 'uploads' directory exists
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Generate a unique file name using randomUUID from crypto
      const fileExtension = path.extname(file.originalname); // Get the file extension
      const uniqueFileName = `${randomUUID()}${fileExtension}`; // Generate a unique file name
      const uploadPath = path.join(uploadDir, uniqueFileName);

      // Save the file to the 'uploads' directory
      fs.writeFileSync(uploadPath, file.buffer);

      // Construct the URL for the saved file
      pdfUrl = `/uploads/${uniqueFileName}`;
    }

    // Call the service to create the item with the PDF URL (if present)
    return this.itemService.create(data, pdfUrl);
  }

  @Patch('update/:id')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 1 * 1024 * 1024 }, // Max 1MB file size
      fileFilter: (req, file, callback) => {
        if (file.mimetype !== 'application/pdf') {
          return callback(
            new HttpException(
              'Only PDF files are allowed',
              HttpStatus.BAD_REQUEST,
            ),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async update(
    @Param('id') id: string,
    @Body() data: UpdateItemDto,
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    let pdfUrl: string = '';

    // Check if file is uploaded
    if (file && file.originalname) {
      // Set the upload directory
      const uploadDir = path.join(process.cwd(), 'uploads');

      // Ensure the 'uploads' directory exists
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Generate a unique file name using randomUUID from crypto
      const fileExtension = path.extname(file.originalname); // Get the file extension
      const uniqueFileName = `${randomUUID()}${fileExtension}`; // Generate a unique file name
      const uploadPath = path.join(uploadDir, uniqueFileName);

      // Save the file to the 'uploads' directory
      fs.writeFileSync(uploadPath, file.buffer);

      // Construct the URL for the saved file
      pdfUrl = `/uploads/${uniqueFileName}`;
    }

    // Call the service to create the item with the PDF URL (if present)
    return this.itemService.update(+id, data, pdfUrl);
  }

  @Get('search')
  async search(@Query('keyword') keyword: string) {
    return await this.itemService.searchItems(keyword);
  }

  @Delete('delete/:id')
  async remove(@Param('id') id: string) {
    return this.itemService.remove(+id);
  }
}
