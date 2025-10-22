-- CreateEnum
CREATE TYPE "ClassificacaoMunicipio" AS ENUM ('OURO', 'PRATA', 'BRONZE');

-- AlterTable
ALTER TABLE "municipio" ADD COLUMN "uf" TEXT DEFAULT 'PR',
ADD COLUMN "latitude" DOUBLE PRECISION,
ADD COLUMN "longitude" DOUBLE PRECISION,
ADD COLUMN "brasao_url" TEXT,
ADD COLUMN "classificacao" "ClassificacaoMunicipio",
ADD COLUMN "populacao_2022" INTEGER,
ADD COLUMN "eleitores_2024" INTEGER;

-- CreateTable
CREATE TABLE "politico" (
    "id" SERIAL NOT NULL,
    "municipio_id" INTEGER NOT NULL,
    "cargo" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "partido_sigla" TEXT,
    "partido_nome" TEXT,
    "foto_url" TEXT,
    "ano_inicio_mandato" INTEGER,
    "ano_fim_mandato" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "politico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eleicao_candidato_municipio" (
    "id" SERIAL NOT NULL,
    "ano" INTEGER NOT NULL,
    "turno" INTEGER NOT NULL DEFAULT 1,
    "cargo" TEXT NOT NULL,
    "uf" TEXT NOT NULL DEFAULT 'PR',
    "municipio_id" INTEGER NOT NULL,
    "candidato_nome" TEXT NOT NULL,
    "numero" INTEGER,
    "partido_sigla" TEXT,
    "partido_nome" TEXT,
    "votos" INTEGER NOT NULL,
    "percentual_votos" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "eleicao_candidato_municipio_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "politico_municipio_id_cargo_idx" ON "politico"("municipio_id", "cargo");

-- CreateIndex
CREATE INDEX "eleicao_candidato_municipio_ano_municipio_id_idx" ON "eleicao_candidato_municipio"("ano", "municipio_id");

-- CreateIndex
CREATE UNIQUE INDEX "eleicao_candidato_municipio_ano_cargo_municipio_id_candidato_" ON "eleicao_candidato_municipio"("ano", "cargo", "municipio_id", "candidato_nome");

-- AddForeignKey
ALTER TABLE "politico" ADD CONSTRAINT "politico_municipio_id_fkey" FOREIGN KEY ("municipio_id") REFERENCES "municipio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eleicao_candidato_municipio" ADD CONSTRAINT "eleicao_candidato_municipio_municipio_id_fkey" FOREIGN KEY ("municipio_id") REFERENCES "municipio"("id") ON DELETE CASCADE ON UPDATE CASCADE;
