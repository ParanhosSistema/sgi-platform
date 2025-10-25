'use client';
import { useEffect, useMemo, useState } from 'react';
import { safeCompare, Dir } from '../_lib/safeCompare';

interface Territorio { id: string; nome: string; }
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

type MapByIbge = Record<string, number>;

// Helpers
const getIBGE = (m: Municipio) => m.ibgeCode ?? m.codigo_ibge ?? m.codIbge ?? null;

export default function MunicipiosPage() {
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [territorios, setTerritorios] = useState<Territorio[]>([]);
  const [popMap, setPopMap] = useState<MapByIbge>({});
  const [eleMap, setEleMap] = useState<MapByIbge>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<string>('nome');
  const [sortDir, setSortDir] = useState<Dir>('asc');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [munRes, terRes, popRes, eleRes] = await Promise.all([
          fetch('https://sgi-platform-backend.onrender.com/municipios'),
          fetch('https://sgi-platform-backend.onrender.com/territorios'),
          fetch('/data/ibge_population_2022.json').catch(() => new Response('{}')),
          fetch('/data/tse_electors_2024.json').catch(() => new Response('{}')),
        ]);
        if (!munRes.ok || !terRes.ok) throw new Error('Erro ao carregar dados (API)');
        const [munData, terData, popJson, eleJson] = await Promise.all([
          munRes.json(), terRes.json(), popRes.json(), eleRes.json(),
        ]);
        setMunicipios(munData);
        setTerritorios(terData);
        setPopMap(popJson || {});
        setEleMap(eleJson || {});
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
  const terMap = useMemo(() => {
    const m = new Map<string, string>();
    territorios.forEach(t => m.set(t.id, t.nome));
    return m;
  }, [territorios]);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return municipios;
    return municipios.filter(m => m.nome.toLowerCase().includes(q));
  }, [municipios, searchTerm]);

  const valueFor = (m: Municipio, kind: 'pop' | 'ele') => {
    const ibge = getIBGE(m);
    if (!ibge) return null;
    const map = kind === 'pop' ? popMap : eleMap;
    if (Object.prototype.hasOwnProperty.call(map, ibge)) return map[ibge];
    // fallback to fields from API (if backend already provides them)
    if (kind === 'pop') return m.populacao2022 ?? m.populacao ?? m.population ?? null;
    return m.eleitores2024 ?? m.eleitores ?? m.eleitorado2024 ?? null;
  };

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      let A: unknown; let B: unknown;
      switch (sortField) {
        case 'nome': A = a.nome; B = b.nome; break;
        case 'ibge': A = getIBGE(a); B = getIBGE(b); break;
        case 'populacao': A = valueFor(a, 'pop'); B = valueFor(b, 'pop'); break;
        case 'eleitores': A = valueFor(a, 'ele'); B = valueFor(b, 'ele'); break;
        case 'territorio':
          A = a.territorio?.nome ?? terMap.get(a.territorio_id || a.territorioId || '') ?? null;
          B = b.territorio?.nome ?? terMap.get(b.territorio_id || b.territorioId || '') ?? null;
          break;
        default: A = a.nome; B = b.nome;
      }
      return safeCompare(A, B, sortDir);
    });
    return arr;
  }, [filtered, sortDir, sortField, terMap, popMap, eleMap]);

  const handleSort = (field: string) => {
    if (sortField === field) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const formatNumber = (val: unknown): string => {
    if (val == null) return '-';
    const num = Number(val);
    return Number.isFinite(num) ? num.toLocaleString('pt-BR') : '-';
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><div className="text-lg">Carregando municípios...</div></div>;
  }
  if (error) {
    return <div className="flex items-center justify-center min-h-screen"><div className="text-lg text-red-600">Erro: {error}</div></div>;
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
                <th onClick={() => handleSort('nome')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                  Nome {sortField === 'nome' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('ibge')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                  Código IBGE {sortField === 'ibge' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('populacao')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                  População {sortField === 'populacao' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('eleitores')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                  Eleitores {sortField === 'eleitores' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('territorio')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                  Território {sortField === 'territorio' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sorted.map((m) => {
                const ibge = getIBGE(m);
                const pop = valueFor(m, 'pop');
                const ele = valueFor(m, 'ele');
                const territorioNome = m.territorio?.nome ?? (m.territorio_id || m.territorioId ? (terMap.get(m.territorio_id || m.territorioId || '') ?? null) : null);
                return (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{m.nome}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ibge ?? '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatNumber(pop)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatNumber(ele)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{territorioNome ?? '-'}</td>
                  </tr>
                );
              })}
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
