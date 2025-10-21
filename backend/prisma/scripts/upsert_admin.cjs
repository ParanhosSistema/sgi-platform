/* backend/prisma/scripts/upsert_admin.cjs */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@paranhospr.com.br';
  const password = process.env.ADMIN_PASSWORD || 'Admins2025';
  const name = process.env.ADMIN_NAME || 'Administrador';

  const hash = await bcrypt.hash(password, 10);

  // Try to find by email (assuming email is unique in User model)
  const existing = await prisma.user.findUnique({ where: { email } }).catch(async () => {
    // If 'email' is not a unique field, fallback to findFirst
    return await prisma.user.findFirst({ where: { email } });
  });

  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: { name, password: hash, role: 'ADMIN' }
    });
    console.log(`✅ Admin atualizado: ${email}`);
  } else {
    await prisma.user.create({
      data: { email, name, password: hash, role: 'ADMIN' }
    });
    console.log(`✅ Admin criado: ${email}`);
  }
}

main().then(() => prisma.$disconnect()).catch(async (e) => {
  console.error('❌ Erro upsert admin', e);
  await prisma.$disconnect();
  process.exit(1);
});