import Link from 'next/link';
import { apiFetch } from "../lib/api";

type Municipio = {
  id?: number | string;
  nome: string;
  codIbge?: number;
  ibgeCode?: string;
  territorio?: { nome: string } | null;
  territorioNome?: string | null;
  populacao?: number | null;
  eleitores?: number | null;
};

export default async function Page() {
  const municipios = await apiFetch<Municipio[]>('/municipios');
  const total = municipios.length;
  return (
    <main style={{maxWidth: 1200, margin: '40px auto', padding: '0 16px'}}>
      <h1>Municípios × Territórios Turísticos (PR)</h1>
      <p style={{opacity:.8}}>Total: {total} municípios</p>
      <p style={{opacity:.7, fontSize: '14px'}}>
        Clique no nome do município para ver dados demográficos e autoridades eleitas (2024)
      </p>
      <table style={{width:'100%', borderCollapse:'collapse', marginTop: '20px'}}>
        <thead>
          <tr>
            <th style={{textAlign:'left', borderBottom:'2px solid #333', padding:'12px'}}>Município</th>
            <th style={{textAlign:'left', borderBottom:'2px solid #333', padding:'12px'}}>Território</th>
            <th style={{textAlign:'center', borderBottom:'2px solid #333', padding:'12px'}}>Código IBGE</th>
            <th style={{textAlign:'center', borderBottom:'2px solid #333', padding:'12px'}}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {municipios.map((m) => {
            const terr = (m as any).territorio?.nome || (m as any).territorioNome || '';
            const ibgeCode = m.ibgeCode || m.codIbge;
            return (
              <tr key={String(m.id || ibgeCode || m.nome)} style={{borderBottom:'1px solid #eee'}}>
                <td style={{padding:'12px'}}>
                  <strong>{m.nome}</strong>
                </td>
                <td style={{padding:'12px', color: '#666'}}>{terr}</td>
                <td style={{padding:'12px', textAlign: 'center', fontFamily: 'monospace'}}>
                  {ibgeCode ?? '—'}
                </td>
                <td style={{padding:'12px', textAlign: 'center'}}>
                  {ibgeCode ? (
                    <Link
                      href={`/municipios/${ibgeCode}`}
                      style={{
                        padding: '6px 12px',
                        background: '#0070f3',
                        color: 'white',
                        borderRadius: '4px',
                        textDecoration: 'none',
                        fontSize: '14px',
                        display: 'inline-block'
                      }}
                    >
                      Ver Detalhes
                    </Link>
                  ) : (
                    <span style={{color: '#999'}}>—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </main>
  );
}
