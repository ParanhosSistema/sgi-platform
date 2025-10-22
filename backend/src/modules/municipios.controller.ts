import { Controller, Get, Param, Query, NotFoundException } from '@nestjs/common';
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

  /**
   * GET /municipios/:ibgeCode/overview
   * Retorna visão geral do município com demografia
   */
  @Get(':ibgeCode/overview')
  async getOverview(@Param('ibgeCode') ibgeCode: string) {
    const municipio = await this.prisma.municipio.findUnique({
      where: { ibgeCode: BigInt(ibgeCode) },
      include: {
        territorio: true,
      },
    });

    if (!municipio) {
      throw new NotFoundException(`Município com código IBGE ${ibgeCode} não encontrado`);
    }

    return {
      ibgeCode: municipio.ibgeCode.toString(),
      nome: municipio.nome,
      uf: municipio.uf,
      territorio: municipio.territorio?.nome || null,
      brasaoUrl: municipio.brasaoUrl,
      classificacao: municipio.classificacao,
      populacao2022: municipio.populacao2022,
      eleitores2024: municipio.eleitores2024,
      latitude: municipio.latitude,
      longitude: municipio.longitude,
    };
  }

  /**
   * GET /municipios/:ibgeCode/autoridades
   * Retorna lista de prefeito, vice-prefeito e vereadores
   */
  @Get(':ibgeCode/autoridades')
  async getAutoridades(@Param('ibgeCode') ibgeCode: string) {
    const municipio = await this.prisma.municipio.findUnique({
      where: { ibgeCode: BigInt(ibgeCode) },
      include: {
        politicos: {
          orderBy: [
            { cargo: 'asc' },
            { nome: 'asc' },
          ],
        },
      },
    });

    if (!municipio) {
      throw new NotFoundException(`Município com código IBGE ${ibgeCode} não encontrado`);
    }

    return {
      ibgeCode: municipio.ibgeCode.toString(),
      nome: municipio.nome,
      autoridades: municipio.politicos.map(p => ({
        id: p.id,
        nome: p.nome,
        cargo: p.cargo,
        partidoSigla: p.partidoSigla,
        partidoNome: p.partidoNome,
        fotoUrl: p.fotoUrl,
        anoInicioMandato: p.anoInicioMandato,
        anoFimMandato: p.anoFimMandato,
      })),
    };
  }
}
