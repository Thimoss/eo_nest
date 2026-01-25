import { Injectable } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-require-imports
import PDFDocument = require('pdfkit');
import { QRCodeService } from './qrcode.service';

interface DocumentData {
  name: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: {
    name: string;
    position: string;
  };
  checkedBy: {
    name: string;
    position: string;
  };
  confirmedBy: {
    name: string;
    position: string;
  };
  checkedAt: Date;
  confirmedAt: Date;
  job: string;
  location: string;
  base: string;
  totalPrice: number;
  jobSections: Array<{
    name: string;
    totalMaterialPrice: number;
    totalFeePrice: number;
    itemJobSections: Array<{
      name: string;
      volume: number;
      unit: string;
      materialPricePerUnit: number;
      feePricePerUnit: number;
      totalMaterialPrice: number;
      totalFeePrice: number;
    }>;
  }>;
}

@Injectable()
export class PDFService {
  constructor(private qrcodeService: QRCodeService) {}

  async generateDocumentPDF(
    documentData: DocumentData,
    documentSlug: string,
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const run = async () => {
        try {
          const doc = new PDFDocument({
            size: 'A4',
            margins: { top: 50, bottom: 50, left: 50, right: 50 },
          });

          const chunks: Buffer[] = [];
          doc.on('data', (chunk: Buffer) => chunks.push(chunk));
          doc.on('end', () => resolve(Buffer.concat(chunks)));
          doc.on('error', (error) =>
            reject(error instanceof Error ? error : new Error(String(error))),
          );

          // Header
          doc
            .fontSize(18)
            .font('Helvetica-Bold')
            .text(documentData.name, { align: 'center' });
          doc.moveDown(0.5);

          // Document Info
          doc.fontSize(10).font('Helvetica');
          doc.text(`Pekerjaan: ${documentData.job}`);
          doc.text(`Lokasi: ${documentData.location}`);
          doc.text(`Dasar: ${documentData.base}`);
          doc.moveDown();

          // Document Details Table
          doc
            .fontSize(12)
            .font('Helvetica-Bold')
            .text('Rincian Dokumen', { underline: true });
          doc.moveDown(0.5);
          doc.fontSize(9).font('Helvetica');

          // Loop through job sections
          for (const section of documentData.jobSections) {
            doc.fontSize(10).font('Helvetica-Bold').text(section.name);
            doc.fontSize(9).font('Helvetica');

            // Table headers
            const startY = doc.y;
            doc.text('Item', 50, startY);
            doc.text('Volume', 250, startY);
            doc.text('Satuan', 300, startY);
            doc.text('Harga Material', 350, startY);
            doc.text('Harga Upah', 450, startY);
            doc.moveDown();

            // Table content
            for (const item of section.itemJobSections) {
              const itemY = doc.y;
              doc.text(item.name, 50, itemY, { width: 180 });
              doc.text(item.volume.toString(), 250, itemY);
              doc.text(item.unit, 300, itemY);
              doc.text(
                this.formatCurrency(item.totalMaterialPrice),
                350,
                itemY,
              );
              doc.text(this.formatCurrency(item.totalFeePrice), 450, itemY);
              doc.moveDown(0.5);

              // Check if we need a new page
              if (doc.y > 700) {
                doc.addPage();
              }
            }

            doc.fontSize(9).font('Helvetica-Bold');
            doc.text(
              `Total Material: ${this.formatCurrency(section.totalMaterialPrice)}`,
              350,
            );
            doc.text(
              `Total Upah: ${this.formatCurrency(section.totalFeePrice)}`,
              350,
            );
            doc.moveDown();
          }

          // Total Price
          doc.fontSize(12).font('Helvetica-Bold');
          doc.text(
            `Total Harga: ${this.formatCurrency(documentData.totalPrice)}`,
            { align: 'right' },
          );
          doc.moveDown();

          // Approval Information
          doc
            .fontSize(10)
            .font('Helvetica-Bold')
            .text('Informasi Persetujuan', { underline: true });
          doc.moveDown(0.5);
          doc.fontSize(9).font('Helvetica');

          doc.text(
            `Dibuat oleh: ${documentData.createdBy.name} (${documentData.createdBy.position})`,
          );
          doc.text(
            `Tanggal dibuat: ${this.formatDate(documentData.createdAt)}`,
          );
          doc.moveDown(0.5);

          doc.text(
            `Diperiksa oleh: ${documentData.checkedBy.name} (${documentData.checkedBy.position})`,
          );
          doc.text(
            `Tanggal diperiksa: ${this.formatDate(documentData.checkedAt)}`,
          );
          doc.moveDown(0.5);

          doc.text(
            `Dikonfirmasi oleh: ${documentData.confirmedBy.name} (${documentData.confirmedBy.position})`,
          );
          doc.text(
            `Tanggal dikonfirmasi: ${this.formatDate(documentData.confirmedAt)}`,
          );
          doc.moveDown();

          // Generate QR Code
          const qrCodeBuffer =
            await this.qrcodeService.generateQRCodeBuffer(documentSlug);

          // Add QR Code at bottom right
          const pageWidth = doc.page.width;
          const pageHeight = doc.page.height;
          const qrSize = 100;
          const qrX = pageWidth - qrSize - 50;
          const qrY = pageHeight - qrSize - 50;

          doc.image(qrCodeBuffer, qrX, qrY, {
            width: qrSize,
            height: qrSize,
          });
          doc.end();
        } catch (error) {
          reject(error instanceof Error ? error : new Error(String(error)));
        }
      };

      void run();
    });
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  }

  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'long',
      timeStyle: 'short',
    }).format(new Date(date));
  }
}
