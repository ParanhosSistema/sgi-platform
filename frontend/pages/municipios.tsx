// pages/municipios.tsx - Next.js (Pages Router) fallback
import { useEffect, useState, useMemo } from 'react';

type Row = { municipio: string; territorio: string };

export default function Municipios() {
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState('');
  const [territorio, setTerritorio] = useState('');

  useEffect(() => {
    fetch('/municipios_territorios.json')
      .then(r => r.json())
      .then(data => setRows(data?.dados || []))
      .catch(() => setRows([]));
  }, []);

  const territorios = useMemo(() => {
    const set = new Set(rows.map(r => r.territorio));
    return Array.from(set).sort();
  }, [rows]);

  const filtered = useMemo(() => {
    const qn = q.trim().toLowerCase();
    const tn = territorio.trim().toLowerCase();
    return rows.filter(r => {
      const okQ = !qn || r.municipio.toLowerCase().includes(qn);
      const okT = !tn || r.territorio.toLowerCase() === tn;
      return okQ && okT;
    });
  }, [rows, q, territorio]);

  const grouped = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const r of filtered) {
      if (!map.has(r.territorio)) map.set(r.territorio, []);
      map.get(r.territorio)!.push(r.municipio);
    }
    return Array.from(map.entries()).sort(([a],[b]) => a.localeCompare(b));
  }, [filtered]);

  return (
    <main style={{padding:'24px', maxWidth: 1200, margin: '0 auto', fontFamily: 'Inter, system-ui, Arial'}}>
      <h1 style={{marginBottom: 8}}>Municípios × Territórios Turísticos (PR)</h1>
      <p style={{marginTop:0, color:'#666'}}>Base mínima para go-live. Outros campos (população, eleitores) serão preenchidos depois.</p>

      <div style={{display:'flex', gap:12, margin:'16px 0', alignItems:'center'}}>
        <input
          placeholder="Buscar município..."
          value={q}
          onChange={e => setQ(e.target.value)}
          style={{padding:'8px 12px', border:'1px solid #ddd', borderRadius:6, flex:1}}
        />
        <select value={territorio} onChange={e=>setTerritorio(e.target.value)} style={{padding:'8px 12px', border:'1px solid #ddd', borderRadius:6}}>
          <option value="">Todos os territórios</option>
          {territorios.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {grouped.map(([terr, munis]) => (
        <section key={terr} style={{margin:'18px 0', padding:'12px 16px', border:'1px solid #eee', borderRadius:8}}>
          <h2 style={{margin:'0 0 8px 0', fontSize:18}}>{terr} <span style={{color:'#888', fontWeight:400}}>({munis.length})</span></h2>
          <div style={{display:'flex', flexWrap:'wrap', gap:8}}>
            {munis.sort().map(m => (
              <span key={m} style={{background:'#f7f7f7', padding:'6px 10px', borderRadius:8, border:'1px solid #eee'}}>{m}</span>
            ))}
          </div>
        </section>
      ))}

      {grouped.length === 0 && (
        <p style={{color:'#999'}}>Nenhum resultado para os filtros aplicados.</p>
      )}
    </main>
  );
}
