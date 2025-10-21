import { Controller, Get, Param } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Controller('municipios')
export class MunicipiosController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async findAll() {
    const municipios = await this.prisma.municipio.findMany({
      include: {
        territorio: true,
      },
      orderBy: {
        nome: 'asc',
      },
    });
    
    // Convert BigInt to String for JSON serialization
    return municipios.map(m => ({
      ...m,
      ibgeCode: m.ibgeCode ? m.ibgeCode.toString() : null,
    }));
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const municipio = await this.prisma.municipio.findUnique({
      where: { id: parseInt(id) },
      include: {
        territorio: true,
      },
    });
    
    if (!municipio) return null;
    
    // Convert BigInt to String for JSON serialization
    return {
      ...municipio,
      ibgeCode: municipio.ibgeCode ? municipio.ibgeCode.toString() : null,
    };
  }

  @Get(':ibge/stats')
  async getStats(@Param('ibge') ibge: string) {
    const stats = await this.prisma.municipioStats.findUnique({
      where: { ibge: parseInt(ibge) },
    });
    
    return stats;
  }

  @Get(':ibge/mandates')
  async getMandates(@Param('ibge') ibge: string) {
    const mandates = await this.prisma.mandate.findMany({
      where: { ibge: parseInt(ibge) },
      include: {
        person: true,
        party: true,
      },
      orderBy: [
        { role: 'asc' },
        { person: { name: 'asc' } },
      ],
    });
    
    return mandates;
  }
}
