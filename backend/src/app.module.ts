import { Module } from '@nestjs/common';
import { HealthController } from './modules/health.controller';
import { AuthController } from './modules/auth.controller';

@Module({
  controllers: [HealthController, AuthController],
})
export class AppModule {}
