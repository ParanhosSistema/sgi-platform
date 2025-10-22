import { Controller, Get, Query } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Controller('eleicoes')
export class EleicoesController {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * GET /eleicoes/paranhos?municipio_ibge_id=4104808
   * Retorna série histórica de votação do Leonaldo Paranhos
   */
  @Get('paranhos')
  async getParanhosVotes(@Query('municipio_ibge_id') municipioIbgeId?: string) {
    const where: any = {
      candidatoNome: {
        contains: 'LEONALDO PARANHOS',
        mode: 'insensitive',
      },
    };

    // Se municipio_ibge_id fornecido, filtra por município
    if (municipioIbgeId) {
      const municipio = await this.prisma.municipio.findUnique({
        where: { ibgeCode: BigInt(municipioIbgeId) },
      });

      if (municipio) {
        where.municipioId = municipio.id;
      }
    }

    const eleicoes = await this.prisma.eleicaoCandidatoMunicipio.findMany({
      where,
      include: {
        municipio: true,
      },
      orderBy: [
        { ano: 'asc' },
        { votos: 'desc' },
      ],
    });

    return eleicoes.map(e => ({
      id: e.id,
      ano: e.ano,
      turno: e.turno,
      cargo: e.cargo,
      uf: e.uf,
      municipio: {
        ibgeCode: e.municipio.ibgeCode.toString(),
        nome: e.municipio.nome,
      },
      candidatoNome: e.candidatoNome,
      numero: e.numero,
      partidoSigla: e.partidoSigla,
      partidoNome: e.partidoNome,
      votos: e.votos,
      percentualVotos: e.percentualVotos,
    }));
  }
}

@Controller('partidos')
export class PartidosController {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * GET /partidos
   * Retorna lista de partidos únicos cadastrados
   */
  @Get()
  async findAll() {
    const politicos = await this.prisma.politico.findMany({
      select: {
        partidoSigla: true,
        partidoNome: true,
      },
      distinct: ['partidoSigla'],
      where: {
        partidoSigla: {
          not: null,
        },
      },
      orderBy: {
        partidoSigla: 'asc',
      },
    });

    // Remove duplicatas e filtra nulos
    const partidosMap = new Map();
    
    for (const p of politicos) {
      if (p.partidoSigla && !partidosMap.has(p.partidoSigla)) {
        partidosMap.set(p.partidoSigla, {
          sigla: p.partidoSigla,
          nome: p.partidoNome,
        });
      }
    }

    return Array.from(partidosMap.values());
  }
}

@Controller('busca')
export class BuscaController {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * GET /busca/autoridades?q=leonaldo
   * Busca autoridades por nome (autocomplete)
   */
  @Get('autoridades')
  async searchAutoridades(@Query('q') query: string) {
    if (!query || query.length < 3) {
      return [];
    }

    const politicos = await this.prisma.politico.findMany({
      where: {
        nome: {
          contains: query,
          mode: 'insensitive',
        },
      },
      include: {
        municipio: true,
      },
      take: 20,
      orderBy: {
        nome: 'asc',
      },
    });

    return politicos.map(p => ({
      id: p.id,
      nome: p.nome,
      cargo: p.cargo,
      partidoSigla: p.partidoSigla,
      partidoNome: p.partidoNome,
      fotoUrl: p.fotoUrl,
      municipio: {
        ibgeCode: p.municipio.ibgeCode.toString(),
        nome: p.municipio.nome,
      },
    }));
  }
}
