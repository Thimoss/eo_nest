# Dokumentasi PDF & QR Code Generation

## Overview

Aplikasi Owner Estimate memiliki fitur cetak PDF dokumen yang dilengkapi dengan QR Code untuk verifikasi keaslian dokumen. QR Code hanya di-generate ketika dokumen sudah melewati proses approval lengkap.

---

## 📋 Approval Workflow

Dokumen harus melewati tahapan approval sebelum bisa dicetak dengan QR Code:

```
┌──────────────┐    ┌─────────────┐    ┌────────────────┐    ┌──────────┐
│ IN_PROGRESS  │ →  │ NEED_CHECK  │ →  │ NEED_CONFIRMED │ →  │ APPROVED │
└──────────────┘    └─────────────┘    └────────────────┘    └──────────┘
      ↓                   ↓                    ↓                   ↓
  Creator edit      Submit for        Checker approve      Confirmer approve
  dokumen           review                                 + QR Code generated
```

### Status Dokumen

| Status | Deskripsi |
|--------|-----------|
| `IN_PROGRESS` | Dokumen sedang dibuat/diedit oleh creator |
| `NEED_CHECK` | Dokumen submitted, menunggu checker review |
| `NEED_CONFIRMED` | Checker approved, menunggu confirmer |
| `APPROVED` | Dokumen final, QR Code sudah di-generate |

---

## 🔐 QR Code Generation

### Kapan QR Code Di-generate?

QR Code **hanya di-generate satu kali** ketika dokumen di-approve oleh **Confirmer** (tahap final approval).

### Lokasi Kode

**File:** `src/document/document.service.ts`

```typescript
async approveConfirm(slug: string, req: number) {
  // ... validasi ...

  // Generate QR code
  const qrCodeDataUrl = await this.qrcodeService.generateQRCode(slug);

  const updatedDocument = await this.prisma.document.update({
    where: { slug },
    data: {
      status: DocumentStatus.APPROVED,
      confirmedAt: new Date(),
      qrCodeUrl: qrCodeDataUrl,  // Disimpan ke database
    },
  });
}
```

### QR Code Service

**File:** `src/document/qrcode.service.ts`

| Method | Return Type | Penggunaan |
|--------|-------------|------------|
| `generateQRCode(slug)` | `string` (Data URL) | Disimpan ke database saat approval |
| `generateQRCodeBuffer(slug)` | `Buffer` | Untuk embed ke HTML template |

### Isi QR Code

QR Code berisi URL verifikasi:
```
{FRONTEND_URL}/verify-document/{documentSlug}
```

Contoh: `https://ownerestimate.com/verify-document/dok-proyek-a-123abc`

---

## 📄 PDF Generation (Arsitektur Baru)

### ✅ Metode yang Digunakan: Server-Side HTML Rendering + Headless Browser

**Endpoint:** `GET /document/download-pdf/:slug`

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      CLIENT (Frontend)                          │
├─────────────────────────────────────────────────────────────────┤
│  User klik tombol "Download PDF"                                │
│  → Request ke GET /document/download-pdf/:slug                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND (NestJS)                           │
├─────────────────────────────────────────────────────────────────┤
│  1. Validasi user & dokumen (must be APPROVED)                  │
│  2. Ambil data dokumen lengkap dari database                    │
│  3. Generate QR Code sebagai Data URL                           │
│  4. Render HTML template dengan data + QR Code                  │
│  5. Jalankan Playwright/Puppeteer (headless browser)            │
│  6. Convert HTML → PDF                                          │
│  7. Return PDF sebagai response download                        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      CLIENT (Frontend)                          │
├─────────────────────────────────────────────────────────────────┤
│  Browser otomatis download file PDF                             │
└─────────────────────────────────────────────────────────────────┘
```

### Keunggulan Arsitektur Ini

| Aspek | Keunggulan |
|-------|------------|
| **Konsistensi** | PDF selalu sama di semua browser/device |
| **Kontrol Penuh** | Layout, font, margin dikontrol 100% di backend |
| **QR Embedded** | QR langsung di-render di HTML, tidak perlu attach terpisah |
| **Maintainability** | Satu source of truth (HTML template) |
| **Performance** | Tidak ada upload/download bolak-balik |
| **Security** | PDF generation sepenuhnya di server |

### Struktur HTML Template

```
src/document/
├── templates/
│   └── document-print.template.html   # HTML template untuk PDF
├── pdf.service.ts                      # PDF generation logic
└── qrcode.service.ts                   # QR Code generation
```

### Contoh HTML Template

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    @page {
      size: A4 landscape;
      margin: 15mm;
    }
    body {
      font-family: 'Arial', sans-serif;
      font-size: 10pt;
    }
    .header { /* ... */ }
    .table { /* ... */ }
    .qr-container {
      position: fixed;
      bottom: 15mm;
      right: 15mm;
    }
    .qr-code {
      width: 80px;
      height: 80px;
    }
    .signatures { /* ... */ }
  </style>
</head>
<body>
  <div class="header">
    <h1>{{documentName}}</h1>
    <p>Pekerjaan: {{job}}</p>
    <p>Lokasi: {{location}}</p>
  </div>

  <table class="table">
    <!-- Data rows -->
  </table>

  <div class="signatures">
    <div class="signature-box">
      <p>Dibuat oleh: {{createdBy.name}}</p>
      <p>{{createdBy.position}}</p>
    </div>
    <!-- ... -->
  </div>

  <div class="qr-container">
    <img class="qr-code" src="{{qrCodeDataUrl}}" alt="QR Verification" />
    <p>Scan untuk verifikasi</p>
  </div>
</body>
</html>
```

### PDF Service (Playwright)

```typescript
import { Injectable } from '@nestjs/common';
import { chromium } from 'playwright';

@Injectable()
export class PDFService {
  async generateDocumentPDF(documentData: DocumentData): Promise<Buffer> {
    // 1. Render HTML template dengan data
    const html = this.renderTemplate(documentData);

    // 2. Launch headless browser
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    // 3. Set HTML content
    await page.setContent(html, { waitUntil: 'networkidle' });

    // 4. Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      landscape: true,
      printBackground: true,
      margin: { top: '15mm', bottom: '15mm', left: '15mm', right: '15mm' },
    });

    // 5. Cleanup
    await browser.close();

    return Buffer.from(pdfBuffer);
  }

  private renderTemplate(data: DocumentData): string {
    // Gunakan template engine (Handlebars/EJS) atau string interpolation
    return `<!DOCTYPE html>...`;
  }
}
```

---

## ❌ Metode yang Di-deprecate

### ~~Metode B: Hybrid (Frontend Capture + Backend QR Attach)~~

> **DEPRECATED** - Tidak lagi digunakan

**Alasan deprecation:**

| Masalah | Dampak |
|---------|--------|
| Inkonsisten hasil | Berbeda-beda tergantung browser/device user |
| Kompleks | Butuh 2 library frontend + 1 library backend |
| Performance | Upload PDF → proses → download (bolak-balik) |
| Maintenance | Styling terpisah di frontend dan backend |
| Unreliable | html2canvas tidak 100% akurat capture CSS |

**File yang perlu dihapus/diubah:**
- ~~`POST /document/download-pdf-ui/:slug`~~ - Hapus endpoint
- ~~`attachQrToPdf()`~~ - Hapus function
- ~~Frontend: html2canvas, jsPDF logic~~ - Hapus

---

## ✅ QR Code Verification

Ketika QR Code di-scan, user akan diarahkan ke halaman verifikasi.

### Endpoint Verifikasi

```
GET /document/verify/:slug
POST /document/verify/:slug
```

### Response (Hanya untuk dokumen APPROVED)

```json
{
  "statusCode": 200,
  "message": "Document information retrieved successfully",
  "data": {
    "name": "Nama Dokumen",
    "slug": "dok-proyek-a-123abc",
    "status": "APPROVED",
    "job": "Pembangunan Gedung A",
    "location": "Jakarta",
    "base": "RAB 2026",
    "totalPrice": 1500000000,
    "createdBy": {
      "name": "John Doe",
      "position": "Estimator"
    },
    "checkedBy": {
      "name": "Jane Smith",
      "position": "Supervisor"
    },
    "confirmedBy": {
      "name": "Bob Manager",
      "position": "Manager"
    },
    "checkedAt": "2026-01-25T10:00:00Z",
    "confirmedAt": "2026-01-26T14:00:00Z"
  }
}
```

---

## 📦 Dependencies

### Backend (NestJS)

| Package | Fungsi | Status |
|---------|--------|--------|
| `qrcode` | Generate QR Code | ✅ Keep |
| `playwright` | Headless browser untuk PDF | ✅ NEW |
| `handlebars` atau `ejs` | Template engine untuk HTML | ✅ NEW |
| ~~`pdfkit`~~ | ~~Generate PDF dari scratch~~ | ❌ Remove |
| ~~`pdf-lib`~~ | ~~Manipulasi PDF (attach QR)~~ | ❌ Remove |

### Frontend (Next.js)

| Package | Fungsi | Status |
|---------|--------|--------|
| ~~`html2canvas`~~ | ~~Capture HTML element ke canvas~~ | ❌ Remove |
| ~~`jspdf`~~ | ~~Generate PDF dari canvas~~ | ❌ Remove |

> **Note:** Frontend tidak lagi melakukan PDF generation. Hanya trigger download via API.

---

## 🔒 Security & Validasi

### Sebelum Generate PDF

1. **Authentication** - User harus login
2. **Authorization** - Hanya user terkait (creator, checker, confirmer) yang bisa download
3. **Status Check** - Dokumen harus berstatus `APPROVED`
4. **Approval Data** - `checkedAt` dan `confirmedAt` harus terisi

### Validasi QR Code

1. QR hanya menampilkan info untuk dokumen `APPROVED`
2. Dokumen non-approved akan return error `403 Forbidden`

---

## 📁 Struktur File

### Struktur Baru (Recommended)

```
eo_nest/src/document/
├── document.module.ts          # Module registration
├── document.controller.ts      # API endpoints
├── document.service.ts         # Business logic
├── pdf.service.ts              # PDF generation (Playwright)
├── qrcode.service.ts           # QR Code generation
└── templates/
    ├── document-print.html     # Main print template
    ├── partials/
    │   ├── header.html         # Header partial
    │   ├── table.html          # Table partial
    │   ├── signatures.html     # Signature boxes
    │   └── qr-footer.html      # QR Code footer
    └── styles/
        └── print.css           # Print-specific styles
```

### File yang Dihapus (Deprecated)

```
eo_next_project/src/components/document/
└── ClientSide.tsx              # Hapus logic html2canvas + jsPDF
```

---

## 🌐 Environment Variables

```env
# Backend (.env)
FRONTEND_URL=https://ownerestimate.com  # Base URL untuk QR verification link
```

---

## 📝 Migration Checklist

### Backend Changes

- [x] Install `playwright` dan setup browser
- [x] Install template engine (`handlebars`)
- [x] Buat folder `templates/` dan HTML template
- [x] Rewrite `PDFService` menggunakan Playwright
- [x] Hapus function `attachQrToPdf()` di `document.service.ts`
- [x] Hapus endpoint `POST /document/download-pdf-ui/:slug`
- [x] Uninstall `pdfkit` dan `pdf-lib`
- [ ] Update unit tests

### Frontend Changes

- [x] Hapus logic `handleDownloadPdfFromUi()` di `ClientSide.tsx`
- [x] Ganti dengan simple fetch ke `GET /document/download-pdf/:slug`
- [x] Uninstall `html2canvas` dan `jspdf`
- [x] Update button handler

### Deployment

- [ ] Pastikan server production support headless browser
- [ ] Install Chromium dependencies di server (jika Linux)
- [ ] Test PDF generation di staging environment

---

## 🚀 Instalasi Playwright

### Development

```bash
cd eo_nest
npm install playwright
npx playwright install chromium
```

### Production (Linux Server)

```bash
# Install dependencies untuk Chromium
apt-get install -y \
  libnss3 \
  libnspr4 \
  libatk1.0-0 \
  libatk-bridge2.0-0 \
  libcups2 \
  libdrm2 \
  libxkbcommon0 \
  libxcomposite1 \
  libxdamage1 \
  libxfixes3 \
  libxrandr2 \
  libgbm1 \
  libasound2

# Install Chromium
npx playwright install chromium
```

### Docker

```dockerfile
FROM mcr.microsoft.com/playwright:v1.40.0-focal

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

CMD ["npm", "run", "start:prod"]
```

---

## 📊 Perbandingan Arsitektur

| Aspek | Lama (Hybrid) | Baru (Server HTML) |
|-------|---------------|-------------------|
| **Kompleksitas** | Tinggi (2 lib FE + 2 lib BE) | Rendah (1 lib BE) |
| **Konsistensi** | Bervariasi per browser | 100% konsisten |
| **Maintenance** | 2 codebase (FE + BE) | 1 codebase (BE only) |
| **Performance** | Upload → Process → Download | Direct generate → Download |
| **QR Integration** | Post-process attach | Native embed di HTML |
| **Debugging** | Sulit (multi-step) | Mudah (preview HTML) |
| **Styling Control** | Limited (html2canvas) | Full CSS support |

