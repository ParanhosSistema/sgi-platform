// backend/prisma/scripts/etl_load_electors_2024.cjs
// Loads electorate counts by municipality (TSE 2024) from a local CSV fallback.
// Usage:
//   cd /opt/render/project/src/backend
//   node prisma/scripts/etl_load_electors_2024.cjs --file=prisma/data/electors_tse_2024.csv
//
// CSV expected columns: ibge,year,electors_total,electors_biometric(optional)

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { parseCSV } = require('./helpers/csv.cjs');
const path = require('path');

function arg(k, def=null) {
  const idx = process.argv.findIndex(a => a.startsWith(`--${k}`));
  if (idx === -1) return def;
  const val = process.argv[idx].split('=')[1];
  return val ?? def;
}

const file = arg('file', 'prisma/data/electors_tse_2024.csv');
const year = 2024;

async function main() {
  console.log(`[TSE] Loading electors from ${file}`);
  const rows = parseCSV(path.isAbsolute(file) ? file : path.join(process.cwd(), file));
  let upserts = 0;
  for (const r of rows) {
    const ibge = parseInt(r.ibge, 10);
    if (!ibge) continue;
    const electors = parseInt(r.electors_total || '0', 10);
    await prisma.municipioStats.upsert({
      where: { ibge },
      update: { year, electors },
      create: { ibge, year, electors }
    });
    upserts++;
  }
  console.log(`[TSE] Upserts: ${upserts}`);
  await prisma.$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
