import { Controller, Get } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma.service';

@Controller('seed')
export class SeedController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async seed() {
    try {
      // Verificar se o usuário admin já existe
      const adminExists = await this.prisma.user.findUnique({
        where: { email: 'admin@paranhospr.com.br' }
      });

      if (adminExists) {
        return {
          success: true,
          message: 'Admin user already exists',
          user: {
            email: adminExists.email,
            name: adminExists.name,
            role: adminExists.role
          }
        };
      }

      // Criar hash da senha
      const hashedPassword = await bcrypt.hash('Lxp0pwz7dsR8ok8EtH0x', 10);

      // Criar usuário admin
      const admin = await this.prisma.user.create({
        data: {
          email: 'admin@paranhospr.com.br',
          password: hashedPassword,
          name: 'Admin',
          role: 'ADMIN'
        }
      });

      return {
        success: true,
        message: 'Admin user created successfully',
        user: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error creating admin user',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
