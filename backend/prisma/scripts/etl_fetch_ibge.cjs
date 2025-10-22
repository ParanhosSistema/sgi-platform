// backend/prisma/scripts/etl_fetch_ibge.cjs
// Fetches population by municipality from IBGE and upserts MunicipioStats.
// Usage (Render Shell):
//   cd /opt/render/project/src/backend
//   node prisma/scripts/etl_fetch_ibge.cjs --state=PR --year=2022
//
// Notes:
// - Requires Node 18+ (global fetch).
// - Will only update municipalities present in your DB (by ibge) if you adapt join logic.
// - For safety, this script upserts by ibge key in MunicipioStats.

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function arg(k, def=null) {
  const idx = process.argv.findIndex(a => a.startsWith(`--${k}`));
  if (idx === -1) return def;
  const val = process.argv[idx].split('=')[1];
  return val ?? def;
}

const state = arg('state', 'PR');      // Default: Paraná
const year  = parseInt(arg('year', '2022'), 10);

async function main() {
  console.log(`[IBGE] Fetching population for state=${state}, year=${year}`);
  // Placeholder endpoint documentation; adapt to the official IBGE API you prefer (Censo 2022 or projection).
  // Example dataset idea (pseudo): https://servicodados.ibge.gov.br/api/v3/agregados/9324/periodos/2022/localidades/N6[UF_code]
  // To keep this offline-friendly, we support providing a CSV via data/templates/ibge_population_2022.csv as a fallback.
  try {
    const fs = require('fs');
    const path = require('path');
    const fallback = path.join(process.cwd(), 'prisma', 'data', 'ibge_population_'+year+'.csv');
    let rows = [];
    if (fs.existsSync(fallback)) {
      console.log(`[IBGE] Using local CSV fallback: ${fallback}`);
      const { parseCSV } = require('./helpers/csv.cjs');
      rows = parseCSV(fallback);
    } else {
      console.log('[IBGE] Remote fetch not implemented in this offline bundle. Provide CSV at prisma/data/ibge_population_'+year+'.csv');
      return;
    }

    let upserts = 0;
    for (const r of rows) {
      const ibge = parseInt(r.ibge, 10);
      if (!ibge || !r.population_total) continue;
      const population = parseInt(r.population_total, 10);
      await prisma.municipioStats.upsert({
        where: { ibge },
        update: { year, population },
        create: { ibge, year, population }
      });
      upserts++;
    }
    console.log(`[IBGE] Upserts: ${upserts}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(e => { console.error(e); process.exit(1); });
