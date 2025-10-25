'use client';
import { useEffect, useState } from 'react';
import { safeCompare, Dir } from '../_lib/safeCompare';

interface Territorio { id: string; nome: string; }
interface Municipio {
  id: string; nome: string; ibgeCode?: string;
  territorio?: Territorio; territorio_id?: string; territorioId?: string;
  populacao2022?: number | null; eleitores2024?: number | null;
}

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
      setLoading(true);
      try {
        const [munRes, terRes] = await Promise.all([
          fetch('https://sgi-platform-backend.onrender.com/municipios/enriched'),
          fetch('https://sgi-platform-backend.onrender.com/territorios'),
        ]);
        
        let munData: Municipio[] = [];
        if (munRes.ok) {
          munData = await munRes.json();
        } else {
          const plainRes = await fetch('https://sgi-platform-backend.onrender.com/municipios');
          munData = plainRes.ok ? await plainRes.json() : [];
          try {
            const [ibgeJson, eleJson] = await Promise.all([
              fetch('/data/ibge_population_2022.json').then(r => r.ok ? r.json() : {}),
              fetch('/data/tse_electors_2024.json').then(r => r.ok ? r.json() : {}),
            ]);
            munData = munData.map((m: any) => ({
              ...m,
              populacao2022: m.populacao2022 ?? (m.ibgeCode ? ibgeJson[m.ibgeCode] ?? null : null),
              eleitores2024: m.eleitores2024 ?? (m.ibgeCode ? eleJson[m.ibgeCode] ?? null : null),
            }));
          } catch {}
        }
        
        const terData = terRes.ok ? await terRes.json() : [];
        setMunicipios(munData); 
        setTerritorios(terData); 
        setError(null);
      } catch (err: any) { 
        setError(err?.message || 'Erro ao carregar dados'); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchData();
  }, []);

  const terMap = new Map<string, string>(); 
  territorios.forEach(t => terMap.set(t.id, t.nome));
  
  const filtered = municipios.filter(m => 
    m.nome?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const sorted = [...filtered].sort((a, b) => {
    let valA: any; 
    let valB: any;
    switch (sortField) {
      case 'nome': valA = a.nome; valB = b.nome; break;
      case 'ibge': valA = a.ibgeCode; valB = b.ibgeCode; break;
      case 'populacao': valA = a.populacao2022; valB = b.populacao2022; break;
      case 'eleitores': valA = a.eleitores2024; valB = b.eleitores2024; break;
      case 'territorio':
        valA = a.territorio?.nome ?? terMap.get(a.territorioId || a.territorio_id || '') ?? null;
        valB = b.territorio?.nome ?? terMap.get(b.territorioId || b.territorio_id || '') ?? null;
        break;
      default: valA = a.nome; valB = b.nome;
    }
    return safeCompare(valA, valB, sortDir);
  });

  const handleSort = (f: string) => { 
    if (sortField === f) 
      setSortDir(sortDir === 'asc' ? 'desc':'asc'); 
    else { 
      setSortField(f); 
      setSortDir('asc'); 
    } 
  };
  
  const fmt = (v: any) => Number.isFinite(Number(v)) ? Number(v).toLocaleString('pt-BR') : '-';
  
  if (loading) return <div className="p-6">Carregando municípios…</div>;
  if (error) return <div className="p-6 text-red-600">Erro: {error}</div>;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Municípios do Paraná</h1>
      <div className="mb-4">
        <input 
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Buscar município…" 
          value={searchTerm} 
          onChange={(e)=>setSearchTerm(e.target.value)} 
        />
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th onClick={()=>handleSort('nome')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">Município</th>
                <th onClick={()=>handleSort('territorio')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">Território</th>
                <th onClick={()=>handleSort('ibge')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">IBGE</th>
                <th onClick={()=>handleSort('populacao')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">População</th>
                <th onClick={()=>handleSort('eleitores')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">Eleitores</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sorted.map((m) => {
                const territorioNome = m.territorio?.nome ?? terMap.get(m.territorioId || m.territorio_id || '') ?? '-';
                return (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{m.nome}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{territorioNome ?? '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{m.ibgeCode ?? '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{fmt(m.populacao2022)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{fmt(m.eleitores2024)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <div className="mt-4 text-sm text-gray-600">Total: {sorted.length} município{sorted.length !== 1 ? 's' : ''}</div>
    </div>
  );
}
