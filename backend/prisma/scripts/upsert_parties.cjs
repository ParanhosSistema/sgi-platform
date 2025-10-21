
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const prisma = new PrismaClient();

async function main() {
  const csvPath = process.argv[2] || path.join(__dirname, '../data/parties.csv');
  
  console.log(`📦 Importing parties from: ${csvPath}`);
  
  const parties = [];
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        parties.push({
          sigla: row.sigla,
          nome: row.nome,
          tseNumber: row.tse_number ? parseInt(row.tse_number) : null,
          colorHex: row.color_hex || null,
        });
      })
      .on('end', async () => {
        console.log(`📊 Found ${parties.length} parties to import`);
        
        let created = 0;
        let updated = 0;
        
        for (const party of parties) {
          try {
            const result = await prisma.party.upsert({
              where: { sigla: party.sigla },
              update: {
                nome: party.nome,
                tseNumber: party.tseNumber,
                colorHex: party.colorHex,
              },
              create: party,
            });
            
            if (result.createdAt.getTime() === result.updatedAt.getTime()) {
              created++;
            } else {
              updated++;
            }
            
            console.log(`✅ ${party.sigla} - ${party.nome}`);
          } catch (error) {
            console.error(`❌ Error upserting party ${party.sigla}:`, error.message);
          }
        }
        
        console.log(`\n🎉 Import complete!`);
        console.log(`   Created: ${created}`);
        console.log(`   Updated: ${updated}`);
        
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
