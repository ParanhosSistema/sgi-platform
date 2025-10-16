import 'reflect-metadata';
import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cors from 'cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: ['log', 'error', 'warn'] });
  const origin = process.env.CORS_ORIGIN || 'http://localhost:3000';
  app.use(cors({ origin, credentials: true }));

  const port = Number(process.env.API_PORT || 3001);
  await app.listen(port);
  console.log(`API listening on http://0.0.0.0:${port}`);
}
bootstrap();
