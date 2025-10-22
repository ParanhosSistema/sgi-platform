// node scripts/import_politicos.cjs
// Usage: node scripts/import_politicos.cjs templates/politicos_municipais.csv

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const csvPath = process.argv[2] || path.join(__dirname, '..', 'templates', 'politicos_municipais.csv');
  const raw = fs.readFileSync(csvPath, 'utf8');
  const rows = parse(raw, { columns: true, skip_empty_lines: true });

  let created = 0;
  let skipped = 0;

  for (const r of rows) {
    const ibgeCodeNum = parseInt(r.municipio_ibge_id);
    if (!ibgeCodeNum || isNaN(ibgeCodeNum)) {
      skipped++;
      continue;
    }

    try {
      const municipio = await prisma.municipio.findUnique({ 
        where: { ibgeCode: BigInt(ibgeCodeNum) } 
      });

      if (!municipio) {
        console.warn(`⚠️ Município não encontrado: ${ibgeCodeNum} (${r.municipio_nome}). Skipping ${r.nome}.`);
        skipped++;
        continue;
      }

      await prisma.politico.create({
        data: {
          municipioId: municipio.id,
          cargo: r.cargo,
          nome: r.nome,
          partidoSigla: r.partido_sigla || null,
          partidoNome: r.partido_nome || null,
          fotoUrl: r.foto_url || null,
          anoInicioMandato: r.ano_inicio_mandato ? parseInt(r.ano_inicio_mandato) : null,
          anoFimMandato: r.ano_fim_mandato ? parseInt(r.ano_fim_mandato) : null,
        }
      });
      created++;
    } catch (error) {
      console.warn(`⚠️ Erro ao criar político ${r.nome}:`, error.message);
      skipped++;
    }
  }

  console.log(`✅ Importação politicos concluída:`);
  console.log(`   - ${created} políticos criados`);
  console.log(`   - ${skipped} registros ignorados`);
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
