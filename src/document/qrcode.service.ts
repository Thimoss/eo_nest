/* eslint-disable prettier/prettier, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as QRCode from 'qrcode';

@Injectable()
export class QRCodeService {
  constructor(private readonly configService: ConfigService) {}

  async generateQRCode(documentSlug: string): Promise<string> {
    const baseUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const verificationUrl = `${baseUrl}/verify-document/${documentSlug}`;

    try {
      const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
        errorCorrectionLevel: 'H',
        margin: 1,
        width: 200,
      });

      return qrCodeDataUrl;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to generate QR code: ${message}`);
    }
  }

  async generateQRCodeBuffer(documentSlug: string): Promise<Buffer> {
    const baseUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const verificationUrl = `${baseUrl}/verify-document/${documentSlug}`;

    try {
      const qrCodeBuffer = await QRCode.toBuffer(verificationUrl, {
        errorCorrectionLevel: 'H',
        margin: 1,
        width: 200,
      });

      return qrCodeBuffer;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to generate QR code buffer: ${message}`);
    }
  }
}
