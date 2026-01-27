import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { chromium, Browser, BrowserContext, Page } from 'playwright';
import * as Handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';
import { QRCodeService } from './qrcode.service';

export interface DocumentData {
  name: string;
  createdAt: Date;
  updatedAt: Date;
  recapitulationLocation: string;
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
  totalMaterialPrice: number;
  totalFeePrice: number;
  totalMaterialAndFee: number;
  totalPrice: number;
  totalBenefitsAndRisks: number;
  percentageBenefitsAndRisks: number;
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
      information?: string | null;
    }>;
  }>;
}

@Injectable()
export class PDFService implements OnModuleDestroy {
  private browser: Browser | null = null;
  private template: Handlebars.TemplateDelegate | null = null;

  constructor(private qrcodeService: QRCodeService) {
    this.registerHandlebarsHelpers();
    this.loadTemplate();
  }

  /**
   * Register Handlebars helpers for formatting
   */
  private registerHandlebarsHelpers(): void {
    // Format currency to Indonesian Rupiah
    Handlebars.registerHelper('formatCurrency', (amount: number) => {
      if (typeof amount !== 'number' || isNaN(amount)) {
        return 'Rp 0';
      }
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    });

    // Format date to Indonesian locale
    Handlebars.registerHelper('formatDate', (date: Date) => {
      if (!date) return '-';
      return new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'long',
        timeStyle: 'short',
      }).format(new Date(date));
    });

    // Format number with thousand separator
    Handlebars.registerHelper('formatNumber', (num: number) => {
      if (typeof num !== 'number' || isNaN(num)) {
        return '0';
      }
      return new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(num);
    });

    // Add one to index (for numbering starting from 1)
    Handlebars.registerHelper('addOne', (index: number) => {
      return index + 1;
    });

    // Convert 0-based index to A, B, C... (fallback to number when out of range)
    Handlebars.registerHelper('alphaIndex', (index: number) => {
      if (typeof index !== 'number' || isNaN(index) || index < 0) {
        return '';
      }
      const code = 65 + index;
      if (code >= 65 && code <= 90) {
        return String.fromCharCode(code);
      }
      return index + 1;
    });
  }

  /**
   * Load and compile the Handlebars template
   */
  private loadTemplate(): void {
    const templatePath = path.join(
      __dirname,
      'templates',
      'document-print.hbs',
    );
    const templateSource = fs.readFileSync(templatePath, 'utf-8');
    this.template = Handlebars.compile(templateSource);
  }

  /**
   * Get or create browser instance (lazy initialization)
   */
  private async getBrowser(): Promise<Browser> {
    if (this.browser && !this.browser.isConnected()) {
      try {
        await this.browser.close();
      } catch {
        // ignore
      } finally {
        this.browser = null;
      }
    }

    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
        ],
      });
    }
    return this.browser;
  }

  private async resetBrowser(): Promise<void> {
    if (!this.browser) return;
    try {
      await this.browser.close();
    } catch {
      // ignore
    } finally {
      this.browser = null;
    }
  }

  private isBrowserClosedError(err: unknown): boolean {
    if (!err || typeof err !== 'object') return false;
    const message =
      'message' in err && typeof (err as { message?: unknown }).message === 'string'
        ? (err as { message: string }).message
        : '';
    return message.includes('has been closed') || message.includes('Target page, context or browser has been closed');
  }

  /**
   * Cleanup browser on module destroy
   */
  async onModuleDestroy(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * Generate PDF document using Playwright
   */
  async generateDocumentPDF(
    documentData: DocumentData,
    documentSlug: string,
  ): Promise<Buffer> {
    // Generate QR Code as Data URL
    const qrCodeDataUrl =
      await this.qrcodeService.generateQRCode(documentSlug);

    // Prepare template data
    const templateData = {
      ...documentData,
      qrCodeDataUrl,
      printedAt: new Date(),
    };

    // Render HTML from template
    if (!this.template) {
      this.loadTemplate();
    }
    const html = this.template!(templateData);

    // Generate PDF using Playwright
    let context: BrowserContext | null = null;
    let page: Page | null = null;

    try {
      const browser = await this.getBrowser();

      try {
        context = await browser.newContext();
      } catch (err) {
        // If the cached browser instance was closed unexpectedly, relaunch once.
        if (this.isBrowserClosedError(err)) {
          await this.resetBrowser();
          const freshBrowser = await this.getBrowser();
          context = await freshBrowser.newContext();
        } else {
          throw err;
        }
      }

      page = await context.newPage();

      // Set HTML content
      await page.setContent(html, {
        waitUntil: 'networkidle',
      });

      // Generate PDF
      const pdfBuffer = await page.pdf({
        format: 'A4',
        landscape: true,
        printBackground: true,
        margin: {
          top: '10mm',
          bottom: '10mm',
          left: '10mm',
          right: '10mm',
        },
      });

      return Buffer.from(pdfBuffer);
    } finally {
      try {
        await page?.close();
      } catch {
        // ignore
      }
      try {
        await context?.close();
      } catch {
        // ignore
      }
    }
  }
}
