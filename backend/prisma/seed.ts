import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Obter credenciais do ambiente ou usar defaults
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@paranhospr.com.br';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Lxp0pwz7dsR8ok8EtH0x';

  console.log('📧 Email configurado:', adminEmail);
  console.log('🔑 Senha configurada:', adminPassword ? '***' + adminPassword.slice(-4) : 'NOT SET');
  console.log('📝 Usando ENV vars:', {
    hasAdminEmail: !!process.env.ADMIN_EMAIL,
    hasAdminPassword: !!process.env.ADMIN_PASSWORD
  });

  // Hash da senha usando bcrypt
  console.log('🔐 Gerando hash da senha...');
  const hashedPassword = await bcrypt.hash(adminPassword, 10);
  console.log('✅ Hash gerado:', hashedPassword.substring(0, 20) + '...');

  // Criar ou atualizar usuário admin
  console.log(`👤 Criando usuário admin: ${adminEmail}`);
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedPassword,
      name: 'Administrador',
      role: 'ADMIN'
    },
    create: {
      email: adminEmail,
      password: hashedPassword,
      name: 'Administrador',
      role: 'ADMIN'
    },
  });

  console.log('✅ Seed concluído com sucesso!');
  console.log('📧 Email:', admin.email);
  console.log('🔑 Role:', admin.role);
  console.log('🆔 ID:', admin.id);
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
