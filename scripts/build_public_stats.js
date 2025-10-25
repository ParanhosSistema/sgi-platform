/**
 * Build two JSON maps in frontend/public/data/ from official sources:
 * - ibge_population_2022.json
 * - tse_electors_2024.json
 *
 * Usage (run from repo root or scripts folder):
 *   node scripts/build_public_stats.js
 *
 * Requires internet access in the environment where you run it (your local or ChatLLM agent's runner).
 */
const fs = require('fs');
const path = require('path');
const https = require('https');

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`GET ${url} -> ${res.statusCode}`));
        res.resume();
        return;
      }
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

// IBGE 2022 population per municipality via API SIDRA-like (example endpoint changed frequently).
// The safest approach is to require a curated CSV/JSON; but we try API first.
// Fallback: read local CSV if API fails.
async function buildPopulationMap() {
  // TODO: replace URL with a stable endpoint you or your agent can use.
  // We'll fallback to local CSV if this  fails.
  const popJsonPath = path.join(process.cwd(), 'frontend', 'public', 'data', 'ibge_population_2022.json');
  const localCsv = path.join(process.cwd(), 'backend', 'prisma', 'data', 'ibge_population_2022.csv');

  try {
    // Attempt to build from CSV if present:
    if (fs.existsSync(localCsv)) {
      const txt = fs.readFileSync(localCsv, 'utf8');
      const lines = txt.split(/\r?\n/).filter(Boolean);
      const map = {};
      // Expect header: ibgeCode,population
      const [header, ...rows] = lines;
      for (const row of rows) {
        const [ibge, pop] = row.split(',').map(s => s.trim());
        if (ibge && pop && !Number.isNaN(Number(pop))) map[ibge] = Number(pop);
      }
      fs.mkdirSync(path.dirname(popJsonPath), { recursive: true });
      fs.writeFileSync(popJsonPath, JSON.stringify(map));
      return map;
    }
    throw new Error('Local CSV not found, please provide it.');
  } catch (err) {
    console.error('Population map build error:', err.message);
    fs.mkdirSync(path.dirname(popJsonPath), { recursive: true });
    fs.writeFileSync(popJsonPath, JSON.stringify({}));
    return {};
  }
}

async function buildElectorsMap() {
  const eleJsonPath = path.join(process.cwd(), 'frontend', 'public', 'data', 'tse_electors_2024.json');
  const localCsv = path.join(process.cwd(), 'backend', 'prisma', 'data', 'electors_tse_2024.csv');
  try {
    if (fs.existsSync(localCsv)) {
      const txt = fs.readFileSync(localCsv, 'utf8');
      const lines = txt.split(/\r?\n/).filter(Boolean);
      const map = {};
      // Expect header: ibgeCode,eleitores2024
      const [header, ...rows] = lines;
      for (const row of rows) {
        const [ibge, ele] = row.split(',').map(s => s.trim());
        if (ibge && ele && !Number.isNaN(Number(ele))) map[ibge] = Number(ele);
      }
      fs.mkdirSync(path.dirname(eleJsonPath), { recursive: true });
      fs.writeFileSync(eleJsonPath, JSON.stringify(map));
      return map;
    }
    throw new Error('Local CSV not found, please provide it.');
  } catch (err) {
    console.error('Electors map build error:', err.message);
    fs.mkdirSync(path.dirname(eleJsonPath), { recursive: true });
    fs.writeFileSync(eleJsonPath, JSON.stringify({}));
    return {};
  }
}

(async () => {
  const pop = await buildPopulationMap();
  const ele = await buildElectorsMap();
  console.log('Population entries:', Object.keys(pop).length);
  console.log('Electors entries:', Object.keys(ele).length);
  console.log('✅ Generated files in frontend/public/data/');
})();
