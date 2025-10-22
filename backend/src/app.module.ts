import { Module } from '@nestjs/common';
import { HealthController } from './modules/health.controller';
import { AuthController } from './modules/auth.controller';
import { SeedController } from './modules/seed.controller';
import { MunicipiosController } from './modules/municipios.controller';
import { TerritoriosController } from './modules/territorios.controller';
import { EleicoesController, PartidosController, BuscaController } from './modules/eleicoes.controller';
import { PrismaService } from './prisma.service';

@Module({
  controllers: [
    HealthController,
    AuthController,
    SeedController,
    MunicipiosController,
    TerritoriosController,
    EleicoesController,
    PartidosController,
    BuscaController,
  ],
  providers: [PrismaService],
})
export class AppModule {}
