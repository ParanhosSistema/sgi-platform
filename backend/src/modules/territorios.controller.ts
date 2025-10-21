import { Controller, Get, Param } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Controller('territorios')
export class TerritoriosController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async findAll() {
    return this.prisma.territorioTuristico.findMany({
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
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.prisma.territorioTuristico.findUnique({
      where: { id: parseInt(id) },
      include: {
        municipios: true,
      },
    });
  }
}
