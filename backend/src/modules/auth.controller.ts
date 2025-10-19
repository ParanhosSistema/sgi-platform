import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma.service';

type LoginDto = { email: string; password: string };

@Controller('auth')
export class AuthController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('login')
  async login(@Body() body: LoginDto) {
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new UnauthorizedException('Server not configured for login');
    }
    if (!body?.email || !body?.password) {
      throw new UnauthorizedException('Missing credentials');
    }

    // Buscar usuário no banco de dados
    const user = await this.prisma.user.findUnique({
      where: { email: body.email }
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Verificar senha usando bcrypt
    const isPasswordValid = await bcrypt.compare(body.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // @ts-expect-error TypeScript has issues with jwt.sign overloads
    const token = jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      jwtSecret as string,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return { 
      token, 
      user: { 
        id: user.id,
        email: user.email, 
        name: user.name,
        role: user.role 
      } 
    };
  }
}
