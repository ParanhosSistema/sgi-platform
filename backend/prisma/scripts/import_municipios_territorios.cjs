/**
 * Importador de Municípios x Territórios (CommonJS)
 * Uso no Render Shell (raiz do backend):
 *   npm ci --include=dev
 *   npx prisma db push
 *   node prisma/scripts/import_municipios_territorios.cjs
 *
 * Mapeie os nomes dos modelos abaixo conforme seu schema.prisma
 * Tentativas padrão: Municipio / municipio e TerritorioTuristico / territorioTuristico / territorio
 */
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const DATA_PATH = process.env.SGI_MUN_DATA || path.join(__dirname, '../data/municipios_territorios.json');

// Ajustes de campos (altere aqui se o schema for diferente)
const FIELDS = {
  municipioName: 'nome',          // campo string no modelo de Município
  municipioIbge: 'ibgeCode',      // campo numérico único/índice
  territorioName: 'nome',         // campo string no modelo de Território
};

// Resolve o "client" de um modelo com base em nomes prováveis
function getModel(client, candidates) {
  for (const c of candidates) {
    if (client[c]) return { key: c, model: client[c] };
    const low = c[0].lowercase + c.slice(1);
    if (client[low]) return { key: low, model: client[low] };
  }
  return null;
}

(async () => {
  try {
    if (!fs.existsSync(DATA_PATH)) {
      console.error("❌ Arquivo de dados não encontrado:", DATA_PATH);
      process.exit(1);
    }
    const arr = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
    console.log(`📦 Lendo ${arr.length} registros de: ${DATA_PATH}`);

    // Tentar descobrir modelos
    const muniModel = getModel(prisma, ['municipio', 'Municipio']);
    const terrModel = getModel(prisma, ['territorioTuristico','TerritorioTuristico','territorio','Territorio']);

    if (!muniModel) {
      console.error("❌ Modelo Municipio não encontrado no Prisma Client. Ajuste os nomes no script.");
      process.exit(1);
    }
    if (!terrModel) {
      console.warn("⚠️  Modelo de Território não encontrado. Municípios serão importados sem relação de território.");
    }

    let created=0, updated=0, linked=0, skipped=0;

    // Índice de territórios por nome para reuso
    const terrCache = new Map();

    async function ensureTerritoryByName(name) {
      if (!name) return null;
      const norm = name.trim();
      if (terrCache.has(norm)) return terrCache.get(norm);

      // tentar buscar por nome
      let t = null;
      try {
        t = await terrModel.model.findFirst({ where: { [FIELDS.territorioName]: norm }});
      } catch(e) {/* ignore */}
      if (!t) {
        try {
          t = await terrModel.model.create({ data: { [FIELDS.territorioName]: norm }});
          console.log("➕ Território criado:", norm);
        } catch (e) {
          console.warn("⚠️  Falha ao criar território", norm, e.message);
        }
      }
      terrCache.set(norm, t);
      return t;
    }

    for (const r of arr) {
      const muniName = (r.municipio || "").trim();
      const muniIbge = r.ibge_code || null;
      const terrName = r.territorio && r.territorio.trim() ? r.territorio.trim() : null;

      if (!muniName) { skipped++; continue; }

      let where = {};
      if (muniIbge) { where[FIELDS.municipioIbge] = Number(muniIbge); }
      else          { where[FIELDS.municipioName] = muniName; }

      let dataSet = {
        [FIELDS.municipioName]: muniName,
      };
      if (muniIbge) dataSet[FIELDS.municipioIbge] = Number(muniIbge);

      // tentar upsert por IBGE ou nome
      let record = null;
      try {
        record = await muniModel.model.upsert({
          where,
          update: dataSet,
          create: dataSet
        });
        if (record) {
          if (record.createdAt) updated++; // heurística ruim; deixaremos simples:
        }
        // não temos como saber se foi create ou update pelo retorno; então contar genericamente
      } catch (e) {
        // fallback: tentar create
        try {
          record = await muniModel.model.create({ data: dataSet });
          created++;
        } catch (e2) {
          console.warn("⚠️  Falha ao upsert/criar município:", muniName, e2.message);
          skipped++;
          continue;
        }
      }

      // Se houver território e modelo existe, vincular
      if (terrModel && terrName) {
        try {
          const t = await ensureTerritoryByName(terrName);
          if (t && t.id) {
            // Tentar atualizar relação: heurística simples, esperando chave "territorioId" no Municipio
            try {
              await muniModel.model.update({
                where,
                data: { territorioId: t.id }
              });
              linked++;
            } catch (e) {
              // fallback: ignorar se schema usa relação N:N ou campo diferente
              console.warn("⚠️  Não foi possível relacionar território por campo territorioId (ajuste necessário no script).");
            }
          }
        } catch (e) {
          console.warn("⚠️  Falha ao associar território:", terrName, e.message);
        }
      }
    }

    console.log(`✅ Importação concluída.`);
    console.log(`   Criados/Atualizados: ~${created+updated}, Relacionados: ${linked}, Ignorados: ${skipped}`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Erro na importação:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();