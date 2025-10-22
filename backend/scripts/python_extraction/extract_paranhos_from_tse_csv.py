
# scripts/extract_paranhos_from_tse_csv.py

Extrai dos CSVs oficiais do TSE (votacao_candidato_munzona) os votos por município/ano
do candidato LEONALDO PARANHOS para Deputado Estadual/PR (2002, 2006, 2010, 2014).

Requisitos:
  pip install pandas

Uso:
  python scripts/extract_paranhos_from_tse_csv.py --root /caminho/para/csvs --dest templates/eleicoes_paranhos.csv
  Onde --root deve conter subpastas por ano (2002, 2006, 2010, 2014) com os CSVs já extraídos.

import argparse
import pandas as pd
import os
import glob

CAND_PATTERNS = ["LEONALDO PARANHOS", "LEONALDO PARANHOS DA SILVA", "PARANHOS LEONALDO"]
CARGO_PATTERNS = ["DEPUTADO ESTADUAL", "DEPUTADO ESTADUAL 1ª SUPLENTE"]  # por segurança

def load_year(root, year):
    # Arquivos geralmente com nome 'votacao_candidato_munzona_XXXX_PR.csv' (varia por ano)
    pattern = os.path.join(root, str(year), "**", "*munzona*PR*.csv")
    files = glob.glob(pattern, recursive=True)
    if not files:
        raise FileNotFoundError(f"Nenhum CSV encontrado para {year} em {pattern}")

    frames = []
    for fp in files:
        try:
            df = pd.read_csv(fp, sep=';', dtype=str, encoding='latin1')
            frames.append(df)
        except Exception:
            try:
                df = pd.read_csv(fp, sep=',', dtype=str, encoding='latin1')
                frames.append(df)
            except Exception:
                continue
    if not frames:
        raise RuntimeError(f"Falha ao ler CSVs para {year}")
    return pd.concat(frames, ignore_index=True)

def normalize(df, year):
    # Harmonizar colunas relevantes (variável por ano)
    cols_map_options = [
        # ano 2010+
        {"ano":"ANO_ELEICAO","turno":"NUM_TURNO","cargo":"DS_CARGO","uf":"SG_UF","municipio":"NM_MUNICIPIO",
         "nome":"NM_CANDIDATO","numero":"NR_CANDIDATO","partido_sigla":"SG_PARTIDO","partido":"NM_PARTIDO","votos":"QT_VOTOS_NOMINAIS"},
        # anos mais antigos
        {"ano":"ANO_ELEICAO","turno":"NUM_TURNO","cargo":"DS_CARGO","uf":"SG_UF","municipio":"NM_MUNICIPIO",
         "nome":"NM_VOTAVEL","numero":"NR_VOTAVEL","partido_sigla":"SG_PARTIDO","partido":"NM_PARTIDO","votos":"QT_VOTOS_NOMINAIS"}
    ]
    for m in cols_map_options:
        if all(c in df.columns for c in m.values()):
            out = pd.DataFrame({
                "ano": df[m["ano"]].astype(int),
                "turno": df[m["turno"]].astype(int),
                "cargo": df[m["cargo"]],
                "uf": df[m["uf"]],
                "municipio_nome": df[m["municipio"]],
                "candidato_nome": df[m["nome"]],
                "numero": pd.to_numeric(df[m["numero"]], errors="coerce").astype("Int64"),
                "partido_sigla": df[m["partido_sigla"]],
                "partido_nome": df[m["partido"]],
                "votos": pd.to_numeric(df[m["votos"]], errors="coerce").fillna(0).astype(int)
            })
            return out
    raise RuntimeError("Não foi possível harmonizar colunas para o ano " + str(year))

def run(root, dest):
    all_years = []
    for year in [2002, 2006, 2010, 2014]:
        raw = load_year(root, year)
        norm = normalize(raw, year)
        # filtrar PR, cargo e candidato
        norm = norm[(norm["uf"]=="PR") & (norm["cargo"].str.upper().str.contains("DEPUTADO ESTADUAL"))]
        norm = norm[norm["candidato_nome"].str.upper().apply(lambda x: any(pat in x for pat in CAND_PATTERNS))]
        # agregar por município
        agg = (norm
               .groupby(["ano","turno","uf","municipio_nome","candidato_nome","numero","partido_sigla","partido_nome"], as_index=False)["votos"].sum()
        )
        all_years.append(agg)
    final = pd.concat(all_years, ignore_index=True)
    # adicionar id IBGE via dicionário mínimo (deve ser mapeado fora ou via API)
    final["municipio_ibge_id"] = ""
    # ordenar e salvar com cabeçalho esperado
    final = final[["ano","turno","cargo","uf","municipio_ibge_id","municipio_nome",
                   "candidato_nome","numero","partido_sigla","partido_nome","votos"]]
    final.to_csv(dest, index=False, encoding="utf-8")
    print(f"✓ Dados reais consolidados em {dest} (linhas: {len(final)})")

if __name__ == "__main__":
    import argparse
    ap = argparse.ArgumentParser()
    ap.add_argument("--root", required=True, help="Pasta raiz contendo subpastas 2002, 2006, 2010, 2014 com CSVs do TSE extraídos")
    ap.add_argument("--dest", default="templates/eleicoes_paranhos.csv")
    args = ap.parse_args()
    run(args.root, args.dest)
