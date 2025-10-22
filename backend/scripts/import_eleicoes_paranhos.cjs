// node scripts/import_eleicoes_paranhos.cjs
// Usage: node scripts/import_eleicoes_paranhos.cjs templates/eleicoes_paranhos.csv

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const csvPath = process.argv[2] || path.join(__dirname, '..', 'templates', 'eleicoes_paranhos.csv');
  
  if (!fs.existsSync(csvPath)) {
    console.warn(`⚠️ Arquivo ${csvPath} não encontrado. CSV vazio, nada a importar.`);
    return;
  }

  const raw = fs.readFileSync(csvPath, 'utf8');
  const rows = parse(raw, { columns: true, skip_empty_lines: true });

  if (rows.length === 0) {
    console.warn(`⚠️ CSV vazio ou só com cabeçalho. Nada a importar.`);
    return;
  }

  let created = 0;
  let updated = 0;
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
        console.warn(`⚠️ Município não encontrado: ${ibgeCodeNum}. Skipping.`);
        skipped++;
        continue;
      }

      const ano = parseInt(r.ano);
      const cargo = r.cargo || 'DEPUTADO ESTADUAL';
      const candidatoNome = r.candidato_nome;

      const existing = await prisma.eleicaoCandidatoMunicipio.findUnique({
        where: {
          ano_cargo_municipioId_candidatoNome: {
            ano,
            cargo,
            municipioId: municipio.id,
            candidatoNome
          }
        }
      });

      if (existing) {
        await prisma.eleicaoCandidatoMunicipio.update({
          where: { id: existing.id },
          data: {
            turno: r.turno ? parseInt(r.turno) : 1,
            numero: r.numero ? parseInt(r.numero) : null,
            partidoSigla: r.partido_sigla || null,
            partidoNome: r.partido_nome || null,
            votos: r.votos ? parseInt(r.votos) : 0,
            percentualVotos: r.percentual_votos_validos ? parseFloat(r.percentual_votos_validos) : null
          }
        });
        updated++;
      } else {
        await prisma.eleicaoCandidatoMunicipio.create({
          data: {
            ano,
            turno: r.turno ? parseInt(r.turno) : 1,
            cargo,
            uf: r.uf || 'PR',
            municipioId: municipio.id,
            candidatoNome,
            numero: r.numero ? parseInt(r.numero) : null,
            partidoSigla: r.partido_sigla || null,
            partidoNome: r.partido_nome || null,
            votos: r.votos ? parseInt(r.votos) : 0,
            percentualVotos: r.percentual_votos_validos ? parseFloat(r.percentual_votos_validos) : null
          }
        });
        created++;
      }
    } catch (error) {
      console.warn(`⚠️ Erro ao processar registro:`, error.message);
      skipped++;
    }
  }

  console.log(`✅ Importação eleicoes_paranhos concluída:`);
  console.log(`   - ${created} registros criados`);
  console.log(`   - ${updated} registros atualizados`);
  console.log(`   - ${skipped} registros ignorados`);
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
