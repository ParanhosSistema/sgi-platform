import { Module } from '@nestjs/common';
import { HealthController } from './modules/health.controller';
import { AuthController } from './modules/auth.controller';
import { PrismaService } from './prisma.service';

@Module({
  controllers: [HealthController, AuthController],
  providers: [PrismaService],
})
export class AppModule {}
