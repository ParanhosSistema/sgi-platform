import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

type LoginDto = { email: string; password: string };

@Controller('auth')
export class AuthController {
  @Post('login')
  login(@Body() body: LoginDto) {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@localhost';
    const adminPassword = process.env.ADMIN_PASSWORD;
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret || !adminPassword) {
      throw new UnauthorizedException('Server not configured for login');
    }
    if (!body?.email || !body?.password) {
      throw new UnauthorizedException('Missing credentials');
    }
    if (body.email !== adminEmail || body.password !== adminPassword) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // @ts-expect-error TypeScript has issues with jwt.sign overloads
    const token = jwt.sign(
      { sub: 'admin', email: adminEmail, role: 'ADMIN' },
      jwtSecret as string,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return { token, user: { email: adminEmail, role: 'ADMIN' } };
  }
}
