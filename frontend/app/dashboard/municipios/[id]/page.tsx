"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type Municipio = {
  id: number;
  nome: string;
  territorio: string;
};

const API_URL = "https://sgi-platform-backend.onrender.com/municipios";

export default function MunicipioDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<Municipio[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(API_URL)
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => setData(json))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const mun = useMemo(() => {
    if (!data) return null;
    const idNum = Number(params.id);
    return data.find((m) => m.id === idNum) ?? null;
  }, [data, params.id]);

  if (loading) return <div className="p-6 text-gray-600">Carregando...</div>;
  if (error) return <div className="p-6 text-red-600">Erro: {error}</div>;
  if (!mun) {
    return (
      <div className="p-6 space-y-4">
        <div className="text-red-600">Município não encontrado.</div>
        <button onClick={() => router.back()} className="underline">
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-2xl font-bold">{mun.nome}</h1>
        <Link href="/dashboard/municipios" className="underline">
          ← Voltar à lista
        </Link>
      </div>

      {/* Identificação */}
      <section className="grid md:grid-cols-3 gap-4">
        <div className="border rounded p-4">
          <h2 className="font-semibold mb-2">Identificação</h2>
          <div className="space-y-1 text-sm">
            <div><span className="text-gray-500">Território:</span> {mun.territorio}</div>
            <div><span className="text-gray-500">Classificação:</span> <em>Não informado</em></div>
          </div>
        </div>
        <div className="border rounded p-4">
          <h2 className="font-semibold mb-2">Brasão</h2>
          <div className="text-sm text-gray-500">Não informado</div>
        </div>
        <div className="border rounded p-4">
          <h2 className="font-semibold mb-2">Valores destinados</h2>
          <div className="text-sm text-gray-500">Não informado</div>
        </div>
      </section>

      {/* Votação Leonaldo (TSE) */}
      <section className="border rounded p-4">
        <h2 className="font-semibold mb-3">Votação de Leonaldo Paranhos (Deputado Estadual)</h2>
        <div className="grid sm:grid-cols-4 gap-3 text-sm">
          <div><div className="text-gray-500">2002</div><div><em>Não informado</em></div></div>
          <div><div className="text-gray-500">2006</div><div><em>Não informado</em></div></div>
          <div><div className="text-gray-500">2010</div><div><em>Não informado</em></div></div>
          <div><div className="text-gray-500">2014</div><div><em>Não informado</em></div></div>
        </div>
      </section>

      {/* Prefeitura */}
      <section className="grid md:grid-cols-3 gap-4">
        <div className="border rounded p-4">
          <h2 className="font-semibold mb-2">Prefeito</h2>
          <div className="text-sm space-y-1">
            <div><span className="text-gray-500">Nome:</span> <em>Não informado</em></div>
            <div><span className="text-gray-500">Partido:</span> <em>Não informado</em></div>
            <div><span className="text-gray-500">Votação:</span> <em>Não informado</em></div>
            <div><span className="text-gray-500">% Votação:</span> <em>Não informado</em></div>
            <div><span className="text-gray-500">Mandatos anteriores:</span> <em>Não informado</em></div>
            <div><span className="text-gray-500">Nascimento:</span> <em>Não informado</em></div>
            <div><span className="text-gray-500">WhatsApp:</span> <em>Não informado</em></div>
            <div><span className="text-gray-500">E-mail:</span> <em>Não informado</em></div>
            <div><span className="text-gray-500">Instagram:</span> <em>Não informado</em></div>
            <div><span className="text-gray-500">Facebook:</span> <em>Não informado</em></div>
            <div><span className="text-gray-500">É nosso?:</span> <em>Não informado</em></div>
          </div>
        </div>
        <div className="border rounded p-4">
          <h2 className="font-semibold mb-2">Vice-Prefeito</h2>
          <div className="text-sm space-y-1">
            <div><span className="text-gray-500">Nome:</span> <em>Não informado</em></div>
            <div><span className="text-gray-500">Partido:</span> <em>Não informado</em></div>
            <div><span className="text-gray-500">Votação:</span> <em>Não informado</em></div>
            <div><span className="text-gray-500">% Votação:</span> <em>Não informado</em></div>
            <div><span className="text-gray-500">Mandatos anteriores:</span> <em>Não informado</em></div>
            <div><span className="text-gray-500">Nascimento:</span> <em>Não informado</em></div>
            <div><span className="text-gray-500">WhatsApp:</span> <em>Não informado</em></div>
            <div><span className="text-gray-500">E-mail:</span> <em>Não informado</em></div>
            <div><span className="text-gray-500">Instagram:</span> <em>Não informado</em></div>
            <div><span className="text-gray-500">Facebook:</span> <em>Não informado</em></div>
            <div><span className="text-gray-500">É nosso?:</span> <em>Não informado</em></div>
          </div>
        </div>
        <div className="border rounded p-4">
          <h2 className="font-semibold mb-2">Presidente da Câmara</h2>
          <div className="text-sm space-y-1">
            <div><span className="text-gray-500">Nome:</span> <em>Não informado</em></div>
            <div><span className="text-gray-500">Partido:</span> <em>Não informado</em></div>
            <div><span className="text-gray-500">Votação:</span> <em>Não informado</em></div>
            <div><span className="text-gray-500">% Votação:</span> <em>Não informado</em></div>
            <div><span className="text-gray-500">Mandatos anteriores:</span> <em>Não informado</em></div>
            <div><span className="text-gray-500">Nascimento:</span> <em>Não informado</em></div>
            <div><span className="text-gray-500">WhatsApp:</span> <em>Não informado</em></div>
            <div><span className="text-gray-500">E-mail:</span> <em>Não informado</em></div>
            <div><span className="text-gray-500">Instagram:</span> <em>Não informado</em></div>
            <div><span className="text-gray-500">Facebook:</span> <em>Não informado</em></div>
            <div><span className="text-gray-500">É nosso?:</span> <em>Não informado</em></div>
          </div>
        </div>
      </section>

      {/* Vereadores */}
      <section className="border rounded p-4">
        <h2 className="font-semibold mb-3">Vereadores</h2>
        <div className="text-sm text-gray-500">
          Não informado
        </div>
      </section>

      {/* Responsável local */}
      <section className="border rounded p-4">
        <h2 className="font-semibold mb-2">Responsável da nossa equipe</h2>
        <div className="text-sm space-y-1">
          <div><span className="text-gray-500">Nome:</span> <em>Não informado</em></div>
          <div><span className="text-gray-500">Telefone:</span> <em>Não informado</em></div>
        </div>
      </section>
    </div>
  );
}
