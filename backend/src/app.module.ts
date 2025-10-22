import { Module } from '@nestjs/common';
import { HealthController } from './modules/health.controller';
import { AuthController } from './modules/auth.controller';
import { SeedController } from './modules/seed.controller';
import { MunicipiosController } from './modules/municipios.controller';
import { TerritoriosController } from './modules/territorios.controller';
import { AgendaController } from './modules/agenda.controller';
import { PrismaService } from './prisma.service';
import { AgendaService } from './modules/agenda.service';

@Module({
  controllers: [HealthController, AuthController, SeedController, MunicipiosController, TerritoriosController, AgendaController],
  providers: [PrismaService, AgendaService],
})
export class AppModule {}
