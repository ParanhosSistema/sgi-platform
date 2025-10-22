import { Module } from '@nestjs/common';
import { MapaController } from './mapa.controller';
import { MapaService } from './mapa.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [MapaController],
  providers: [MapaService, PrismaService],
  exports: [MapaService],
})
export class MapaModule {}
