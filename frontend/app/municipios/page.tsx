'use client';

import { useEffect, useState } from 'react';
import { safeCompare, Dir } from '../_lib/safeCompare';

interface Territorio {
  id: string;
  nome: string;
}

interface Municipio {
  id: string;
  nome: string;
  ibgeCode?: string;
  codigo_ibge?: string;
  codIbge?: string;
  populacao2022?: number;
  populacao?: number;
  population?: number;
  eleitores2024?: number;
  eleitores?: number;
  eleitorado2024?: number;
  territorio?: Territorio;
  territorio_id?: string;
  territorioId?: string;
}

// Mapping helpers with fallback order
const getIBGE = (m: Municipio) => m.ibgeCode ?? m.codigo_ibge ?? m.codIbge ?? null;
const getPop = (m: Municipio) => m.populacao2022 ?? m.populacao ?? m.population ?? null;
const getEle = (m: Municipio) => m.eleitores2024 ?? m.eleitores ?? m.eleitorado2024 ?? null;
const getTer = (m: Municipio, map: Map<string, string>) => 
  m.territorio?.nome ?? map.get(m.territorio_id || m.territorioId || '') ?? null;

export default function MunicipiosPage() {
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [territorios, setTerritorios] = useState<Territorio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<string>('nome');
  const [sortDir, setSortDir] = useState<Dir>('asc');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [munRes, terRes] = await Promise.all([
          fetch('https://sgi-platform-backend.onrender.com/municipios'),
          fetch('https://sgi-platform-backend.onrender.com/territorios')
        ]);

        if (!munRes.ok || !terRes.ok) {
          throw new Error('Erro ao carregar dados');
        }

        const munData = await munRes.json();
        const terData = await terRes.json();

        setMunicipios(munData);
        setTerritorios(terData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Build territorio map
  const terMap = new Map<string, string>();
  territorios.forEach(t => terMap.set(t.id, t.nome));

  // Filter
  const filtered = municipios.filter(m =>
    m.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort with safeCompare
  const sorted = [...filtered].sort((a, b) => {
    let valA: unknown;
    let valB: unknown;

    switch (sortField) {
      case 'nome':
        valA = a.nome;
        valB = b.nome;
        break;
      case 'ibge':
        valA = getIBGE(a);
        valB = getIBGE(b);
        break;
      case 'populacao':
        valA = getPop(a);
        valB = getPop(b);
        break;
      case 'eleitores':
        valA = getEle(a);
        valB = getEle(b);
        break;
      case 'territorio':
        valA = getTer(a, terMap);
        valB = getTer(b, terMap);
        break;
      default:
        valA = a.nome;
        valB = b.nome;
    }

    return safeCompare(valA, valB, sortDir);
  });

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const formatNumber = (val: unknown): string => {
    if (val == null) return '-';
    const num = Number(val);
    return Number.isFinite(num) ? num.toLocaleString('pt-BR') : '-';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Carregando municípios...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">Erro: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Municípios do Paraná</h1>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar município..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  onClick={() => handleSort('nome')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  Nome {sortField === 'nome' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  onClick={() => handleSort('ibge')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  Código IBGE {sortField === 'ibge' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  onClick={() => handleSort('populacao')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  População {sortField === 'populacao' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  onClick={() => handleSort('eleitores')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  Eleitores {sortField === 'eleitores' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  onClick={() => handleSort('territorio')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  Território {sortField === 'territorio' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sorted.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {m.nome}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getIBGE(m) ?? '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatNumber(getPop(m))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatNumber(getEle(m))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getTer(m, terMap) ?? '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        Total: {sorted.length} município{sorted.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
