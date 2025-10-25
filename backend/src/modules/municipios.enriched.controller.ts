import { Controller, Get, Query } from '@nestjs/common';
import { MunicipiosEnrichedService } from './municipios.enriched.service';

@Controller('municipios')
export class MunicipiosEnrichedController {
  constructor(private readonly service: MunicipiosEnrichedService) {}

  /**
   * GET /municipios/enriched
   * Query:
   *  - limit?: number
   *  - territorioId?: string
   *  - popYear?: number (default 2022)
   *  - eleYear?: number (default 2024)
   */
  @Get('enriched')
  async enriched(
    @Query('limit') limit?: string,
    @Query('territorioId') territorioId?: string,
    @Query('popYear') popYear?: string,
    @Query('eleYear') eleYear?: string,
  ) {
    const parsedLimit = limit ? Math.max(0, parseInt(String(limit), 10)) : undefined;
    const parsedPopYear = popYear ? parseInt(String(popYear), 10) : 2022;
    const parsedEleYear = eleYear ? parseInt(String(eleYear), 10) : 2024;
    return this.service.findAllEnriched({
      limit: parsedLimit,
      territorioId: territorioId || undefined,
      popYear: isNaN(parsedPopYear) ? 2022 : parsedPopYear,
      eleYear: isNaN(parsedEleYear) ? 2024 : parsedEleYear,
    });
  }
}
