#!/usr/bin/env node
/**
 * Script: import_municipios_territorios.cjs
 * Purpose: Import (upsert) PR municipalities and their tourist territories from JSON.
 * JSON expected at: backend/prisma/data/municipios_territorios.json
 * Usage (from backend root): node prisma/scripts/import_municipios_territorios.cjs
 */
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const JSON_PATHS = [
  path.join(process.cwd(), 'prisma', 'data', 'municipios_territorios.json'),
  path.join(process.cwd(), 'backend', 'prisma', 'data', 'municipios_territorios.json'),
  path.join(process.cwd(), 'src', 'backend', 'prisma', 'data', 'municipios_territorios.json'),
];

function loadJSON() {
  for (const p of JSON_PATHS) {
    if (fs.existsSync(p)) {
      return JSON.parse(fs.readFileSync(p, 'utf-8'));
    }
  }
  throw new Error('Arquivo municipios_territorios.json não encontrado.');
}

(async () => {
  const prisma = new PrismaClient();
  try {
    const data = loadJSON();
    if (!Array.isArray(data) || data.length === 0) {
      console.log('Nada para importar - JSON vazio.');
      process.exit(0);
    }

    // Try to resolve Territory model name
    const terrModel = prisma.territorioTuristico || prisma.TerritorioTuristico || prisma.territorio || prisma.Territorio;
    if (!terrModel) {
      throw new Error('Modelo de território não encontrado no Prisma Client. Esperado: TerritorioTuristico ou Territorio.');
    }
    // Try to resolve Municipality model name
    const muniModel = prisma.municipio || prisma.Municipio || prisma.cidade || prisma.Cidade;
    if (!muniModel) {
      throw new Error('Modelo de município não encontrado no Prisma Client. Esperado: Municipio ou Cidade.');
    }

    // Collect unique territories
    const territories = [...new Set(data.map(r => (r.territorio || r.territorio_turistico || r.territorioTuristico || '').trim()).filter(Boolean))];

    // Upsert territories
    let terrCount = 0;
    for (const nome of territories) {
      await terrModel.upsert({
        where: { nome },
        update: {},
        create: { nome },
      });
      terrCount++;
    }

    // For each municipality, upsert and connect to territory
    let muniCount = 0, linked = 0;
    for (const row of data) {
      const nome = (row.nome || row.municipio || row.Municipio || '').trim();
      if (!nome) continue;
      const codigo = row.codIbge || row.cod_ibge || row.codigo_ibge || row.codigoIbge || null;
      const territorioNome = (row.territorio || row.territorio_turistico || row.territorioTuristico || '').trim();

      // Ensure territory exists
      let terr = null;
      if (territorioNome) {
        terr = await terrModel.upsert({
          where: { nome: territorioNome },
          update: {},
          create: { nome: territorioNome },
        });
      }

      // upsert municipality
      let muni = null;
      try {
        // prefer unique by codIbge if it exists
        if (codigo) {
          muni = await muniModel.upsert({
            where: { codIbge: Number(String(codigo).replace(/\D/g,'')) },
            update: { nome },
            create: { nome, codIbge: Number(String(codigo).replace(/\D/g,'')) },
          });
        } else {
          muni = await muniModel.upsert({
            where: { nome },
            update: {},
            create: { nome },
          });
        }
      } catch (err) {
        // fallback if unique constraints differ: try findFirst then update/create
        muni = await muniModel.findFirst({ where: { nome } });
        if (!muni) {
          muni = await muniModel.create({ data: { nome } });
        }
      }
      muniCount++;

      // Connect relation by trying common relation names
      if (terr) {
        const id = muni.id;
        const terrId = terr.id;
        let updated = false;
        const relationCandidates = [
          // many-to-one relation fields commonly used
          { relationField: 'territorio', set: { territorio: { connect: { id: terrId } } } },
          { relationField: 'territorioTuristico', set: { territorioTuristico: { connect: { id: terrId } } } },
          { relationField: 'territorio_turistico', set: { territorio_turistico: { connect: { id: terrId } } } },
          // foreign key numeric field
          { relationField: 'territorioId', set: { territorioId: terrId } },
          { relationField: 'territorioTuristicoId', set: { territorioTuristicoId: terrId } },
        ];
        for (const cand of relationCandidates) {
          try {
            await muniModel.update({
              where: { id },
              data: cand.set,
            });
            updated = true;
            linked++;
            break;
          } catch (e) {
            // try next candidate
          }
        }
        if (!updated) {
          console.warn(`⚠️ Não consegui associar território para ${nome}. Ajuste o nome do campo de relação no script se necessário.`);
        }
      }
    }

    console.log(`✅ Importação concluída. Municípios: ${muniCount} | Territórios: ${terrCount} | Vinculados: ${linked}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Falha na importação:', err?.message || err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
