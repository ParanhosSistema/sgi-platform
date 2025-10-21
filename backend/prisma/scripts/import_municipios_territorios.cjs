/* backend/prisma/scripts/import_municipios_territorios.cjs */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

function titleCase(s) {
  return (s || '').toString().trim().replace(/\s+/g, ' ')
    .split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

async function main() {
  const dataPath = path.join(__dirname, '..', 'data', 'municipios_territorios.json');
  if (!fs.existsSync(dataPath)) {
    throw new Error(`Arquivo de dados não encontrado: ${dataPath}`);
  }
  const items = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

  let terrCache = new Map();

  for (const item of items) {
    const municipio = titleCase(item.municipio);
    const territorio = titleCase(item.territorio || '');
    const uf = (item.uf || 'PR').toUpperCase();
    const populacao = item.populacao ?? null;
    const eleitores = item.eleitores ?? null;

    let territorioId = null;
    if (territorio) {
      if (!terrCache.has(territorio)) {
        // try find by name (non-unique safe)
        let terr = await prisma.territorioTuristico.findFirst({ where: { nome: territorio } });
        if (!terr) {
          terr = await prisma.territorioTuristico.create({ data: { nome: territorio } });
        }
        terrCache.set(territorio, terr.id);
      }
      territorioId = terrCache.get(territorio);
    }

    // try to find Municipio by name&UF
    let muni = await prisma.municipio.findFirst({
      where: { nome: municipio, uf }
    });

    if (muni) {
      await prisma.municipio.update({
        where: { id: muni.id },
        data: { territorioId, populacao: populacao ?? undefined, eleitores: eleitores ?? undefined }
      });
      console.log(`↻ Atualizado: ${municipio} (${uf})`);
    } else {
      await prisma.municipio.create({
        data: { nome: municipio, uf, territorioId, populacao, eleitores }
      });
      console.log(`＋ Criado: ${municipio} (${uf})`);
    }
  }

  // summary
  const totalM = await prisma.municipio.count({ where: { uf: 'PR' } });
  const totalT = await prisma.territorioTuristico.count();
  console.log(`\n✅ Importação concluída. Municípios PR: ${totalM} | Territórios: ${totalT}`);
}

main().then(() => prisma.$disconnect()).catch(async (e) => {
  console.error('❌ Erro importação', e);
  await prisma.$disconnect();
  process.exit(1);
});