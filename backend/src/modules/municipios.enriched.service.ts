import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

interface FindAllParams {
  limit?: number;
  territorioId?: string;
  popYear?: number;
  eleYear?: number;
}

@Injectable()
export class MunicipiosEnrichedService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllEnriched(params: FindAllParams = {}) {
    const { limit, territorioId, popYear = 2022, eleYear = 2024 } = params;
    const whereMunicipio: any = {};
    if (territorioId) whereMunicipio.territorioId = territorioId;

    const municipios = await this.prisma.municipio.findMany({
      where: whereMunicipio,
      include: { territorio: true },
      take: limit,
      orderBy: { nome: 'asc' },
    });

    const ibgesNumeric = municipios
      .map((m) => Number(m.ibgeCode))
      .filter((n) => Number.isFinite(n));

    if (ibgesNumeric.length === 0) {
      return municipios.map((m) => ({ ...m, populacao2022: null, eleitores2024: null }));
    }

    const [statsPop, statsEle] = await Promise.all([
      this.prisma.municipioStats.findMany({
        where: { ibge: { in: ibgesNumeric }, year: popYear },
        select: { ibge: true, population: true },
      }),
      this.prisma.municipioStats.findMany({
        where: { ibge: { in: ibgesNumeric }, year: eleYear },
        select: { ibge: true, electors: true },
      }),
    ]);

    const popMap = new Map(statsPop.map((s) => [s.ibge, s.population]));
    const eleMap = new Map(statsEle.map((s) => [s.ibge, s.electors]));

    return municipios.map((m) => {
      const ibgeInt = Number(m.ibgeCode);
      return {
        ...m,
        populacao2022: popMap.get(ibgeInt) ?? null,
        eleitores2024: eleMap.get(ibgeInt) ?? null,
      };
    });
  }
}
