import { Controller, Get, Header } from '@nestjs/common';
import { AppService } from './app.service';
import { readFileSync } from 'fs';
import { join } from 'path';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('api-docs')
  @Header('Content-Type', 'text/html; charset=utf-8')
  getApiDocs(): string {
    const docsPath = join(process.cwd(), 'API.md');
    const markdown = readFileSync(docsPath, 'utf8');
    const escaped = markdown
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>EO Nest API Docs</title>
  <style>
    body { margin: 0; font-family: Arial, sans-serif; background: #f6f8fb; color: #1f2937; }
    header { padding: 24px 20px; background: #0f172a; color: #fff; }
    main { padding: 24px 20px; max-width: 980px; margin: 0 auto; }
    pre { white-space: pre-wrap; background: #fff; padding: 20px; border-radius: 12px; box-shadow: 0 12px 30px -20px rgba(15, 23, 42, 0.35); }
    a { color: #38bdf8; }
  </style>
</head>
<body>
  <header>
    <h1>EO Nest API Docs</h1>
    <p>Source: API.md</p>
  </header>
  <main>
    <pre>${escaped}</pre>
  </main>
</body>
</html>`;
  }
}
