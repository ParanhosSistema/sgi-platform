
# scripts/extract_paranhos_basedosdados.py

Extrai votos por município/ano para LEONALDO PARANHOS (DEPUTADO ESTADUAL/PR) dos anos 2002, 2006, 2010, 2014
usando a tabela Base dos Dados: basedosdados.br_tse_eleicoes.resultados_candidato_municipio

Requisitos:
  pip install pandas pandas-gbq google-cloud-bigquery pyarrow

Uso:
  python scripts/extract_paranhos_basedosdados.py --project <GCP_PROJECT> --dest templates/eleicoes_paranhos.csv

import argparse
import pandas as pd
from pandas_gbq import read_gbq

def run(project, dest):
    query = '''
    SELECT
      ano,
      CAST(turno AS INT64) AS turno,
      cargo,
      sigla_uf as uf,
      id_municipio as municipio_ibge_id,
      municipio as municipio_nome,
      nome_candidato as candidato_nome,
      CAST(numero_candidato AS INT64) as numero,
      sigla_partido as partido_sigla,
      partido as partido_nome,
      CAST(votos AS INT64) as votos,
      pct_votos_validos as percentual_votos_validos
    FROM `basedosdados.br_tse_eleicoes.resultados_candidato_municipio`
    WHERE
      cargo = 'DEPUTADO ESTADUAL' AND
      sigla_uf = 'PR' AND
      ano IN (2002, 2006, 2010, 2014) AND
      (UPPER(nome_candidato) LIKE 'LEONALDO%PARANHOS%' OR UPPER(nome_candidato) LIKE 'PARANHOS%LEONALDO%')
    ORDER BY ano, municipio
    '''
    df = read_gbq(query, project_id=project, use_bqstorage_api=False)
    df = df.fillna('')
    df.to_csv(dest, index=False, encoding='utf-8')
    print(f'✓ Dados reais gravados em {dest} (linhas: {len(df)})')

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--project", required=True, help="GCP Project ID com acesso ao BigQuery/Base dos Dados")
    ap.add_argument("--dest", default="templates/eleicoes_paranhos.csv")
    args = ap.parse_args()
    run(args.project, args.dest)
