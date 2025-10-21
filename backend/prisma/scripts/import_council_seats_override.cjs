
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const prisma = new PrismaClient();

async function main() {
  const csvPath = process.argv[2] || path.join(__dirname, '../data/council_seats_override.csv');
  
  console.log(`📦 Importing council seats config from: ${csvPath}`);
  
  const records = [];
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        records.push({
          ibgeCode: BigInt(row.ibge_code),
          year: parseInt(row.year),
          seats: parseInt(row.seats),
        });
      })
      .on('end', async () => {
        console.log(`📊 Found ${records.length} council seats records to import`);
        
        let created = 0;
        let updated = 0;
        let errors = 0;
        
        for (const record of records) {
          try {
            // Find municipality by IBGE code
            const municipality = await prisma.municipio.findUnique({
              where: { ibgeCode: record.ibgeCode },
            });
            
            if (!municipality) {
              console.error(`❌ Municipality not found for IBGE code: ${record.ibgeCode}`);
              errors++;
              continue;
            }
            
            const result = await prisma.councilSeatsConfig.upsert({
              where: {
                municipalityId_referenceYear: {
                  municipalityId: municipality.id,
                  referenceYear: record.year,
                },
              },
              update: {
                seats: record.seats,
              },
              create: {
                municipalityId: municipality.id,
                referenceYear: record.year,
                seats: record.seats,
              },
            });
            
            if (result.createdAt.getTime() === result.updatedAt.getTime()) {
              created++;
            } else {
              updated++;
            }
            
            console.log(`✅ ${municipality.nome} (${record.year}): ${record.seats} vereadores`);
          } catch (error) {
            console.error(`❌ Error importing council seats for IBGE ${record.ibgeCode}:`, error.message);
            errors++;
          }
        }
        
        console.log(`\n🎉 Import complete!`);
        console.log(`   Created: ${created}`);
        console.log(`   Updated: ${updated}`);
        console.log(`   Errors:  ${errors}`);
        
        await prisma.$disconnect();
        resolve();
      })
      .on('error', (error) => {
        console.error('❌ Error reading CSV:', error);
        reject(error);
      });
  });
}

main()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
