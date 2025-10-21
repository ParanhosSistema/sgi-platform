// backend/prisma/scripts/import_municipios_territorios.cjs
// Uso: node prisma/scripts/import_municipios_territorios.cjs
// Requisitos: Prisma Client gerado e models Municipio / TerritorioTuristico presentes.
// Cria/atualiza territórios e municípios, vinculando-os.
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  const dataPath = path.join(__dirname, '../data/municipios_territorios.json');
  const items = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  let created = 0, updated = 0;
  for (const item of items) {
    const nomeMunicipio = item.municipio?.trim();
    const nomeTerritorio = (item.territorio || 'Sem Território').trim();

    const territorio = await prisma.territorioTuristico.upsert({
      where: { nome: nomeTerritorio },
      update: {},
      create: { nome: nomeTerritorio }
    });

    const existing = await prisma.municipio.findUnique({ where: { nome: nomeMunicipio } });
    if (existing) {
      await prisma.municipio.update({
        where: { nome: nomeMunicipio },
        data: { territorioId: territorio.id }
      });
      updated++;
    } else {
      await prisma.municipio.create({
        data: {
          nome: nomeMunicipio,
          territorioId: territorio.id
        }
      });
      created++;
    }
  }

  console.log(`Import concluído. Criados: ${created}, Atualizados: ${updated}, Total processado: ${items.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
