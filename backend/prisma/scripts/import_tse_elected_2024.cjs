
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const prisma = new PrismaClient();

async function main() {
  const csvPath = process.argv[2] || path.join(__dirname, '../data/tse_elected_2024.csv');
  
  console.log(`📦 Importing elected officials from: ${csvPath}`);
  
  const records = [];
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        records.push({
          ibgeCode: BigInt(row.ibge_code),
          office: row.office,
          fullName: row.full_name,
          partySigla: row.party_sigla,
          partyNumber: row.party_number ? parseInt(row.party_number) : null,
          photoUrl: row.photo_url || null,
          legislature: row.legislature,
          seatNumber: row.seat_number ? parseInt(row.seat_number) : null,
        });
      })
      .on('end', async () => {
        console.log(`📊 Found ${records.length} elected officials to import`);
        
        let created = 0;
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
            
            // Find or create party
            let party = await prisma.party.findUnique({
              where: { sigla: record.partySigla },
            });
            
            if (!party) {
              // Create party if it doesn't exist
              party = await prisma.party.create({
                data: {
                  sigla: record.partySigla,
                  nome: record.partySigla, // Placeholder
                  tseNumber: record.partyNumber,
                },
              });
              console.log(`   📌 Created party: ${record.partySigla}`);
            }
            
            // Find or create person
            let person = await prisma.person.findFirst({
              where: {
                fullName: record.fullName,
                partyId: party.id,
              },
            });
            
            if (!person) {
              person = await prisma.person.create({
                data: {
                  fullName: record.fullName,
                  photoUrl: record.photoUrl,
                  partyId: party.id,
                },
              });
            }
            
            // Create mandate
            const mandate = await prisma.mandate.create({
              data: {
                municipalityId: municipality.id,
                office: record.office,
                personId: person.id,
                partyId: party.id,
                legislature: record.legislature,
                seatNumber: record.seatNumber,
                electionYear: 2024,
                termStart: new Date('2025-01-01'),
                termEnd: new Date('2028-12-31'),
              },
            });
            
            created++;
            console.log(`✅ ${record.office}: ${record.fullName} (${record.partySigla}) - ${municipality.nome}`);
          } catch (error) {
            console.error(`❌ Error importing ${record.fullName}:`, error.message);
            errors++;
          }
        }
        
        console.log(`\n🎉 Import complete!`);
        console.log(`   Created: ${created}`);
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
