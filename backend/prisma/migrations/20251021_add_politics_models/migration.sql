-- CreateEnum
CREATE TYPE "MandateRole" AS ENUM ('PREFEITO', 'VICE_PREFEITO', 'VEREADOR');

-- CreateTable
CREATE TABLE "MunicipioStats" (
    "ibge" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "population" INTEGER,
    "electors" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MunicipioStats_pkey" PRIMARY KEY ("ibge")
);

-- CreateTable
CREATE TABLE "Party" (
    "sigla" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tseCode" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Party_pkey" PRIMARY KEY ("sigla")
);

-- CreateTable
CREATE TABLE "Person" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "photoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Person_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mandate" (
    "id" TEXT NOT NULL,
    "ibge" INTEGER NOT NULL,
    "role" "MandateRole" NOT NULL,
    "startYear" INTEGER NOT NULL,
    "endYear" INTEGER,
    "personId" TEXT NOT NULL,
    "partySigla" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mandate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MunicipioStats_year_idx" ON "MunicipioStats"("year");

-- CreateIndex
CREATE INDEX "Mandate_ibge_role_startYear_idx" ON "Mandate"("ibge", "role", "startYear");

-- CreateIndex
CREATE INDEX "Mandate_partySigla_idx" ON "Mandate"("partySigla");

-- AddForeignKey
ALTER TABLE "Mandate" ADD CONSTRAINT "Mandate_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mandate" ADD CONSTRAINT "Mandate_partySigla_fkey" FOREIGN KEY ("partySigla") REFERENCES "Party"("sigla") ON DELETE SET NULL ON UPDATE CASCADE;
