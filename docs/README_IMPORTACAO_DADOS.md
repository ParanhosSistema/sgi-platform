# README_IMPORTACAO_DADOS.md
Próximo passo: enriquecer com população (IBGE) e eleitorado (TSE).

## Fontes oficiais
- IBGE (Cidades e Estados) – downloads por município.
- TSE – Eleitorado Atual (CSV) por município.

## Estratégia
1. Normalizar chaves (códigos IBGE-7) para cada município.
2. Gerar `dados/ibge_populacao.csv` e `dados/tse_eleitorado.csv`.
3. Estender o seed para salvar `populacao` e `eleitores` nos municípios.

## Observação
Enquanto os dados não forem importados, os campos aparecerão em branco no painel.
