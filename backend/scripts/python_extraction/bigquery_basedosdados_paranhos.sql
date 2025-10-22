
-- BigQuery (Base dos Dados)
-- Tabela: basedosdados.br_tse_eleicoes.resultados_candidato_municipio
-- Filtro: Deputado Estadual, UF PR, anos 2002/2006/2010/2014, candidato Leonaldo Paranhos

SELECT
  ano,
  turno,
  cargo,
  sigla_uf as uf,
  id_municipio as municipio_ibge_id,
  municipio,
  nome_candidato,
  numero_candidato as numero,
  sigla_partido as partido_sigla,
  partido as partido_nome,
  votos,
  pct_votos_validos AS percentual_votos_validos
FROM `basedosdados.br_tse_eleicoes.resultados_candidato_municipio`
WHERE
  cargo = 'DEPUTADO ESTADUAL' AND
  sigla_uf = 'PR' AND
  ano IN (2002, 2006, 2010, 2014) AND
  (UPPER(nome_candidato) LIKE 'LEONALDO%PARANHOS%' OR UPPER(nome_candidato) LIKE 'PARANHOS%LEONALDO%')
ORDER BY ano, municipio;
