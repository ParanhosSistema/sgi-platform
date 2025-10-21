#!/usr/bin/env node
/**
 * Script: upsert_admin.cjs
 * Purpose: Create or update the ADMIN user using env ADMIN_EMAIL and ADMIN_PASSWORD.
 * Usage (from backend root): node prisma/scripts/upsert_admin.cjs
 */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

(async () => {
  const prisma = new PrismaClient();
  const email = process.env.ADMIN_EMAIL || 'admin@paranhospr.com.br';
  const plain = process.env.ADMIN_PASSWORD || 'Admins2025';
  const name = process.env.ADMIN_NAME || 'Administrador';
  const role = process.env.ADMIN_ROLE || 'ADMIN';

  if (!plain || plain.length < 8) {
    console.error('ADMIN_PASSWORD ausente ou muito curta.');
    process.exit(2);
  }

  try {
    const hash = await bcrypt.hash(plain, 10);

    // Try common model names: User or Usuario (case-sensitive)
    let updated = null;
    if (prisma.user) {
      updated = await prisma.user.upsert({
        where: { email },
        update: { password: hash, role, name },
        create: { email, password: hash, role, name },
      });
    } else if (prisma.User) {
      updated = await prisma.User.upsert({
        where: { email },
        update: { password: hash, role, name },
        create: { email, password: hash, role, name },
      });
    } else if (prisma.usuario || prisma.Usuario) {
      const model = prisma.usuario || prisma.Usuario;
      updated = await model.upsert({
        where: { email },
        update: { senha: hash, role, nome: name },
        create: { email, senha: hash, role, nome: name },
      });
    } else {
      console.error('Nenhum modelo de usuário compatível encontrado no Prisma Client.');
      console.error('Certifique-se de ter um modelo "User" com campo "email" único e "password".');
      process.exit(1);
    }

    console.log('✅ Admin upserted:', { email: updated.email || email, role });
    process.exit(0);
  } catch (err) {
    console.error('❌ Erro no upsert do admin:', err?.message || err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
