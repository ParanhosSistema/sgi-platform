// backend/prisma/scripts/etl_import_officers_2024_from_csv.cjs
// Imports mayors, vice-mayors and councillors elected in 2024 from CSV(s).
// Usage:
//   cd /opt/render/project/src/backend
//   node prisma/scripts/etl_import_officers_2024_from_csv.cjs --mayors=prisma/data/mayors_2024.csv --vices=prisma/data/vices_2024.csv --councillors=prisma/data/councillors_2024.csv --parties=prisma/data/parties.csv --startYear=2025
//
// CSV formats (UTF-8, headers required):
// parties.csv: sigla,name,tseCode
// mayors_2024.csv: ibge,name,party,photo_url
// vices_2024.csv: ibge,name,party,photo_url
// councillors_2024.csv: ibge,name,party,photo_url  (one row per councillor; varies per municipality)
//
// Note: startYear is 2025 because Brazilian municipal mandates begin Jan/2025 (post-election 2024).

const { PrismaClient, MandateRole } = require('@prisma/client');
const prisma = new PrismaClient();
const { parseCSV } = require('./helpers/csv.cjs');
const path = require('path');

function arg(k, def=null) {
  const idx = process.argv.findIndex(a => a.startsWith(`--${k}`));
  if (idx === -1) return def;
  const val = process.argv[idx].includes('=') ? process.argv[idx].split('=')[1] : process.argv[idx+1];
  return val ?? def;
}

const mayorsFile = arg('mayors', 'prisma/data/mayors_2024.csv');
const vicesFile = arg('vices', 'prisma/data/vices_2024.csv');
const councFile = arg('councillors', 'prisma/data/councillors_2024.csv');
const partiesFile = arg('parties', 'prisma/data/parties.csv');
const startYear = parseInt(arg('startYear', '2025'), 10);

function ensureAbs(f) { return path.isAbsolute(f) ? f : path.join(process.cwd(), f); }

async function upsertParty(p) {
  await prisma.party.upsert({
    where: { sigla: p.sigla },
    update: { name: p.name, tseCode: p.tseCode ? parseInt(p.tseCode,10) : null },
    create: { sigla: p.sigla, name: p.name, tseCode: p.tseCode ? parseInt(p.tseCode,10) : null }
  });
}

async function upsertPerson(name, photoUrl) {
  const id = (await prisma.person.create({ data: { name, photoUrl } })).id;
  return id;
}

async function createMandate(ibge, role, name, partySigla, photoUrl) {
  // try to find an existing Person by name (best-effort)
  let person = await prisma.person.findFirst({ where: { name } });
  if (!person) {
    person = await prisma.person.create({ data: { name, photoUrl } });
  } else if (photoUrl && !person.photoUrl) {
    await prisma.person.update({ where: { id: person.id }, data: { photoUrl } });
  }

  await prisma.mandate.create({
    data: {
      ibge,
      role,
      startYear,
      personId: person.id,
      partySigla: partySigla || null
    }
  });
}

async function main() {
  console.log(`[OFFICERS] Importing parties from ${partiesFile}`);
  const parties = parseCSV(ensureAbs(partiesFile));
  for (const p of parties) await upsertParty(p);
  console.log(`[OFFICERS] Parties upserted: ${parties.length}`);

  console.log(`[OFFICERS] Importing mayors from ${mayorsFile}`);
  const mayors = parseCSV(ensureAbs(mayorsFile));
  for (const m of mayors) {
    const ibge = parseInt(m.ibge, 10);
    if (!ibge || !m.name) continue;
    await createMandate(ibge, 'PREFEITO', m.name, m.party || null, m.photo_url || null);
  }
  console.log(`[OFFICERS] Mayors imported: ${mayors.length}`);

  console.log(`[OFFICERS] Importing vice-mayors from ${vicesFile}`);
  const vices = parseCSV(ensureAbs(vicesFile));
  for (const v of vices) {
    const ibge = parseInt(v.ibge, 10);
    if (!ibge || !v.name) continue;
    await createMandate(ibge, 'VICE_PREFEITO', v.name, v.party || null, v.photo_url || null);
  }
  console.log(`[OFFICERS] Vice-mayors imported: ${vices.length}`);

  console.log(`[OFFICERS] Importing councillors from ${councFile}`);
  const cs = parseCSV(ensureAbs(councFile));
  let cCount = 0;
  for (const c of cs) {
    const ibge = parseInt(c.ibge, 10);
    if (!ibge || !c.name) continue;
    await createMandate(ibge, 'VEREADOR', c.name, c.party || null, c.photo_url || null);
    cCount++;
  }
  console.log(`[OFFICERS] Councillors imported: ${cCount}`);

  await prisma.$disconnect();
}

main().catch(async e => { console.error(e); await prisma.$disconnect(); process.exit(1); });
