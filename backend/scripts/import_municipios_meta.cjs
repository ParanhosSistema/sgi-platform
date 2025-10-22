// node scripts/import_municipios_meta.cjs
// Usage: node scripts/import_municipios_meta.cjs templates/municipios_meta.csv

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const csvPath = process.argv[2] || path.join(__dirname, '..', 'templates', 'municipios_meta.csv');
  const raw = fs.readFileSync(csvPath, 'utf8');
  const rows = parse(raw, { columns: true, skip_empty_lines: true });

  let updated = 0;
  let skipped = 0;

  for (const r of rows) {
    const ibgeCodeNum = parseInt(r.municipio_ibge_id);
    if (!ibgeCodeNum || isNaN(ibgeCodeNum)) {
      skipped++;
      continue;
    }

    try {
      // Atualiza município existente
      await prisma.municipio.update({
        where: { ibgeCode: BigInt(ibgeCodeNum) },
        data: {
          uf: r.uf || 'PR',
          latitude: r.latitude ? parseFloat(r.latitude) : null,
          longitude: r.longitude ? parseFloat(r.longitude) : null,
          brasaoUrl: r.brasao_url || null,
          classificacao: r.classificacao || null,
          populacao2022: r.populacao_ibge_2022 ? parseInt(r.populacao_ibge_2022) : null,
          eleitores2024: r.eleitores_tse_2024 ? parseInt(r.eleitores_tse_2024) : null,
        },
      });
      updated++;
    } catch (error) {
      console.warn(`⚠️ Município não encontrado: ${ibgeCodeNum} (${r.municipio_nome})`);
      skipped++;
    }
  }

  console.log(`✅ Importação municipios_meta concluída:`);
  console.log(`   - ${updated} municípios atualizados`);
  console.log(`   - ${skipped} registros ignorados`);
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
