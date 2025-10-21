import { Controller, Get, Param } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Controller('territorios')
export class TerritoriosController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async findAll() {
    const territorios = await this.prisma.territorioTuristico.findMany({
      include: {
        municipios: {
          orderBy: {
            nome: 'asc',
          },
        },
      },
      orderBy: {
        nome: 'asc',
      },
    });
    
    // Convert BigInt to String for JSON serialization
    return territorios.map(t => ({
      ...t,
      municipios: t.municipios.map(m => ({
        ...m,
        ibgeCode: m.ibgeCode ? m.ibgeCode.toString() : null,
      })),
    }));
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const territorio = await this.prisma.territorioTuristico.findUnique({
      where: { id: parseInt(id) },
      include: {
        municipios: true,
      },
    });
    
    if (!territorio) return null;
    
    // Convert BigInt to String for JSON serialization
    return {
      ...territorio,
      municipios: territorio.municipios.map(m => ({
        ...m,
        ibgeCode: m.ibgeCode ? m.ibgeCode.toString() : null,
      })),
    };
  }
}
