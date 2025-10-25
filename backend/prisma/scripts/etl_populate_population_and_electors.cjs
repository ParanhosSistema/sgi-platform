const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting ETL: Populate MunicipioStats with population and electors...');
  
  // Read CSV files
  const popCSV = fs.readFileSync(
    path.join(__dirname, '../data/ibge_population_2022.csv'),
    'utf-8'
  );
  const eleCSV = fs.readFileSync(
    path.join(__dirname, '../data/electors_tse_2024.csv'),
    'utf-8'
  );
  
  // Parse CSV (skip header)
  const popLines = popCSV.split('\n').slice(1).filter(l => l.trim());
  const eleLines = eleCSV.split('\n').slice(1).filter(l => l.trim());
  
  // Build maps: ibgeCode -> value
  const popMap = new Map();
  const eleMap = new Map();
  
  popLines.forEach(line => {
    const [ibgeCode, pop] = line.split(',').map(s => s.trim());
    if (ibgeCode && pop) {
      const ibgeInt = parseInt(ibgeCode, 10);
      const popInt = parseInt(pop, 10);
      if (!isNaN(ibgeInt) && !isNaN(popInt)) {
        popMap.set(ibgeInt, popInt);
      }
    }
  });
  
  eleLines.forEach(line => {
    const [ibgeCode, ele] = line.split(',').map(s => s.trim());
    if (ibgeCode && ele) {
      const ibgeInt = parseInt(ibgeCode, 10);
      const eleInt = parseInt(ele, 10);
      if (!isNaN(ibgeInt) && !isNaN(eleInt)) {
        eleMap.set(ibgeInt, eleInt);
      }
    }
  });
  
  console.log(`📊 Loaded ${popMap.size} population records`);
  console.log(`📊 Loaded ${eleMap.size} electors records`);
  
  // Get all unique IBGE codes from both maps
  const allIbgeCodes = new Set([...popMap.keys(), ...eleMap.keys()]);
  console.log(`📊 Total unique IBGE codes: ${allIbgeCodes.size}`);
  
  let created = 0;
  let updated = 0;
  
  for (const ibge of allIbgeCodes) {
    const pop = popMap.get(ibge);
    const ele = eleMap.get(ibge);
    
    try {
      // Try to upsert the record
      await prisma.municipioStats.upsert({
        where: { ibge },
        update: {
          population: pop,
          electors: ele,
          year: 2024,
          updatedAt: new Date(),
        },
        create: {
          ibge,
          year: 2024,
          population: pop,
          electors: ele,
        },
      });
      
      // Check if it was an update or create
      const existing = await prisma.municipioStats.findUnique({
        where: { ibge },
      });
      
      if (existing) {
        updated++;
      } else {
        created++;
      }
    } catch (error) {
      console.error(`❌ Error processing IBGE ${ibge}:`, error.message);
    }
  }
  
  console.log(`✅ Created ${created} new records`);
  console.log(`✅ Updated ${updated} existing records`);
  console.log(`✅ Total processed: ${created + updated}`);
}

main()
  .catch(e => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
