import 'reflect-metadata';
import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cors from 'cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: ['log', 'error', 'warn'] });
  
  // CORS configuration - allow Vercel deployments and configured origins
  const configuredOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : [];
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    ...configuredOrigins
  ];

  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc)
      if (!origin) return callback(null, true);
      
      // Check if origin is in allowed list or is a Vercel deployment
      if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  }));

  const port = Number(process.env.API_PORT || 3001);
  await app.listen(port);
  console.log(`API listening on http://0.0.0.0:${port}`);
}
bootstrap();
