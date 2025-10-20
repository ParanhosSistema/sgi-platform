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

    console.log('🔍 [AUTH] Login attempt for:', body.email);

    // Buscar usuário no banco de dados
    const user = await this.prisma.user.findUnique({
      where: { email: body.email }
    });

    if (!user) {
      console.log('❌ [AUTH] User not found:', body.email);
      throw new UnauthorizedException('Invalid email or password');
    }

    console.log('👤 [AUTH] User found:', user.email, '| Role:', user.role);
    console.log('🔐 [AUTH] Comparing password...');

    // Verificar senha usando bcrypt
    const isPasswordValid = await bcrypt.compare(body.password, user.password);

    console.log('✅ [AUTH] Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      console.log('❌ [AUTH] Password comparison failed');
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
