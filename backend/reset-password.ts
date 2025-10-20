import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function resetAdminPassword() {
  console.log('🔐 Resetando senha do administrador...');

  const adminEmail = 'admin@paranhospr.com.br';
  const newPassword = 'Lxp0pwz7dsR8ok8EtH0x';

  // Gerar hash bcrypt da nova senha
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  console.log('✅ Hash gerado com sucesso');

  // Atualizar senha do usuário admin
  const admin = await prisma.user.update({
    where: { email: adminEmail },
    data: { password: hashedPassword },
  });

  console.log('✅ Senha atualizada com sucesso!');
  console.log('📧 Email:', admin.email);
  console.log('🆔 ID:', admin.id);
  console.log('🔑 Role:', admin.role);
  
  return admin;
}

resetAdminPassword()
  .then(() => {
    console.log('\n✅ SUCESSO! Senha resetada para: Lxp0pwz7dsR8ok8EtH0x');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro ao resetar senha:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
