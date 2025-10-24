"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Municipio = {
  id: number;
  nome: string;
  territorio: string;
};

const API_URL = "https://sgi-platform-backend.onrender.com/municipios";

export default function MunicipiosPage() {
  const [data, setData] = useState<Municipio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState<string>("");
  const [territorio, setTerritorio] = useState<string>("");

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

  const territorios = useMemo(() => {
    const set = new Set<string>();
    data.forEach((m) => {
      if (m.territorio && typeof m.territorio === 'object' && m.territorio.nome) {
        set.add(m.territorio.nome);
      } else if (typeof m.territorio === 'string') {
        set.add(m.territorio);
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [data]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return data.filter((m) => {
      const matchQ = !term || m.nome.toLowerCase().includes(term);
      const territorioNome = typeof m.territorio === 'object' ? m.territorio.nome : m.territorio;
      const matchT = !territorio || territorioNome === territorio;
      return matchQ && matchT;
    }).sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  }, [data, q, territorio]);

  if (loading) {
    return <div className="p-6 text-gray-600">Carregando municípios...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-red-600">
        Falha ao carregar municípios: {error}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-2xl font-bold">Municípios do Paraná</h1>
        <div className="text-sm text-gray-500">Total: {filtered.length}</div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nome..."
          className="border rounded px-3 py-2 w-64"
          aria-label="Buscar município"
        />
        <select
          value={territorio}
          onChange={(e) => setTerritorio(e.target.value)}
          className="border rounded px-3 py-2"
          aria-label="Filtrar por território"
        >
          <option value="">Todos os territórios</option>
          {territorios.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        {(q || territorio) && (
          <button
            onClick={() => { setQ(""); setTerritorio(""); }}
            className="border rounded px-3 py-2 text-sm"
          >
            Limpar filtros
          </button>
        )}
      </div>

      <div className="overflow-x-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-2 border">Nome</th>
              <th className="text-left p-2 border">Território</th>
              <th className="text-left p-2 border">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m) => (
              <tr key={m.id} className="hover:bg-gray-50">
                <td className="p-2 border">{m.nome}</td>
                <td className="p-2 border">{typeof m.territorio === 'object' ? m.territorio.nome : m.territorio}</td>
                <td className="p-2 border">
                  <Link
                    className="underline"
                    href={`/dashboard/municipios/${m.id}`}
                  >
                    Ver detalhes
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
