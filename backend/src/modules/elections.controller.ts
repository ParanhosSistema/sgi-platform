
import { Controller, Get, Query, Param } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Controller()
export class ElectionsController {
  constructor(private readonly prisma: PrismaService) {}

  // GET /partidos
  @Get('partidos')
  async getAllParties() {
    const parties = await this.prisma.party.findMany({
      orderBy: {
        sigla: 'asc',
      },
    });
    
    return parties;
  }

  // GET /busca/autoridades?q=
  @Get('busca/autoridades')
  async searchAuthorities(@Query('q') query: string) {
    if (!query || query.length < 2) {
      return [];
    }
    
    const mandates = await this.prisma.mandate.findMany({
      where: {
        person: {
          fullName: {
            contains: query,
            mode: 'insensitive',
          },
        },
      },
      include: {
        person: true,
        party: true,
        municipality: true,
      },
      take: 20,
      orderBy: {
        person: {
          fullName: 'asc',
        },
      },
    });
    
    return mandates.map(m => ({
      id: m.id,
      fullName: m.person.fullName,
      photoUrl: m.person.photoUrl,
      office: m.office,
      party: m.party ? {
        sigla: m.party.sigla,
        nome: m.party.nome,
        colorHex: m.party.colorHex,
      } : null,
      municipality: {
        id: m.municipality.id,
        nome: m.municipality.nome,
        ibgeCode: m.municipality.ibgeCode ? m.municipality.ibgeCode.toString() : null,
      },
      legislature: m.legislature,
      seatNumber: m.seatNumber,
    }));
  }

  // GET /municipios/:ibge/overview
  @Get('municipios/:ibge/overview')
  async getMunicipalityOverview(@Param('ibge') ibge: string) {
    const municipality = await this.prisma.municipio.findUnique({
      where: { ibgeCode: BigInt(ibge) },
      include: {
        populationStats: {
          orderBy: {
            referenceYear: 'desc',
          },
          take: 1,
        },
        electorateStats: {
          orderBy: {
            referenceYear: 'desc',
          },
          take: 1,
        },
        councilSeats: {
          orderBy: {
            referenceYear: 'desc',
          },
          take: 1,
        },
      },
    });
    
    if (!municipality) {
      return null;
    }
    
    return {
      ibge: municipality.ibgeCode ? municipality.ibgeCode.toString() : null,
      nome: municipality.nome,
      population: municipality.populationStats[0] || null,
      electorate: municipality.electorateStats[0] || null,
      council: municipality.councilSeats[0] || null,
    };
  }

  // GET /municipios/:ibge/autoridades
  @Get('municipios/:ibge/autoridades')
  async getMunicipalityAuthorities(@Param('ibge') ibge: string) {
    const municipality = await this.prisma.municipio.findUnique({
      where: { ibgeCode: BigInt(ibge) },
    });
    
    if (!municipality) {
      return null;
    }
    
    const mandates = await this.prisma.mandate.findMany({
      where: {
        municipalityId: municipality.id,
        electionYear: 2024,
      },
      include: {
        person: true,
        party: true,
      },
      orderBy: [
        {
          office: 'asc',
        },
        {
          seatNumber: 'asc',
        },
      ],
    });
    
    const prefeito = mandates.find(m => m.office === 'PREFEITO');
    const vice = mandates.find(m => m.office === 'VICE_PREFEITO');
    const vereadores = mandates.filter(m => m.office === 'VEREADOR');
    
    return {
      prefeito: prefeito ? {
        fullName: prefeito.person.fullName,
        photoUrl: prefeito.person.photoUrl,
        party: prefeito.party ? {
          sigla: prefeito.party.sigla,
          nome: prefeito.party.nome,
          colorHex: prefeito.party.colorHex,
        } : null,
        legislature: prefeito.legislature,
      } : null,
      vice: vice ? {
        fullName: vice.person.fullName,
        photoUrl: vice.person.photoUrl,
        party: vice.party ? {
          sigla: vice.party.sigla,
          nome: vice.party.nome,
          colorHex: vice.party.colorHex,
        } : null,
        legislature: vice.legislature,
      } : null,
      vereadores: vereadores.map(v => ({
        fullName: v.person.fullName,
        photoUrl: v.person.photoUrl,
        party: v.party ? {
          sigla: v.party.sigla,
          nome: v.party.nome,
          colorHex: v.party.colorHex,
        } : null,
        legislature: v.legislature,
        seatNumber: v.seatNumber,
      })),
    };
  }
}

