import { Controller, Get, Param } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Controller('municipios')
export class MunicipiosController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async findAll() {
    return this.prisma.municipio.findMany({
      include: {
        territorio: true,
      },
      orderBy: {
        nome: 'asc',
      },
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.prisma.municipio.findUnique({
      where: { id: parseInt(id) },
      include: {
        territorio: true,
      },
    });
  }
}
