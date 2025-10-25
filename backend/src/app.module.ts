import { Module } from '@nestjs/common';
import { HealthController } from './modules/health.controller';
import { AuthController } from './modules/auth.controller';
import { SeedController } from './modules/seed.controller';
import { MunicipiosController } from './modules/municipios.controller';
import { MunicipiosEnrichedController } from './modules/municipios.enriched.controller';
import { TerritoriosController } from './modules/territorios.controller';
import { AgendaController } from './modules/agenda.controller';
import { PrismaService } from './prisma.service';
import { AgendaService } from './modules/agenda.service';
import { MunicipiosEnrichedService } from './modules/municipios.enriched.service';
import { MapaModule } from './modules/mapa.module';

@Module({
  imports: [MapaModule],
  controllers: [HealthController, AuthController, SeedController, MunicipiosController, MunicipiosEnrichedController, TerritoriosController, AgendaController],
  providers: [PrismaService, AgendaService, MunicipiosEnrichedService],
})
export class AppModule {}
