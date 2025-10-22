import Link from 'next/link';
import { apiFetch } from "../lib/api";

type Territorio = {
  id: string;
  nome: string;
};

type Municipio = {
  id: string;
  nome: string;
  ibgeCode: string;
  territorio?: Territorio | null;
  territorio_id?: string | null;
  populacao?: number | null;
  eleitores?: number | null;
};

export default async function Page() {
  const municipios = await apiFetch<Municipio[]>('/municipios');
  const total = municipios.length;
  return (
    <main style={{maxWidth: 1100, margin: '40px auto', padding: '0 16px'}}>
      <h1>Municípios × Territórios Turísticos (PR)</h1>
      <p style={{opacity:.8}}>Total: {total}</p>
      <table style={{width:'100%', borderCollapse:'collapse'}}>
        <thead>
          <tr>
            <th style={{textAlign:'left', borderBottom:'1px solid #ddd', padding:'8px'}}>Município</th>
            <th style={{textAlign:'left', borderBottom:'1px solid #ddd', padding:'8px'}}>Território</th>
            <th style={{textAlign:'left', borderBottom:'1px solid #ddd', padding:'8px'}}>IBGE</th>
            <th style={{textAlign:'left', borderBottom:'1px solid #ddd', padding:'8px'}}>População</th>
            <th style={{textAlign:'left', borderBottom:'1px solid #ddd', padding:'8px'}}>Eleitores</th>
          </tr>
        </thead>
        <tbody>
          {municipios.map((m) => {
            const territorioNome = m.territorio?.nome || '-';
            const ibgeCode = m.ibgeCode || '-';
            const populacao = m.populacao ? m.populacao.toLocaleString('pt-BR') : '-';
            const eleitores = m.eleitores ? m.eleitores.toLocaleString('pt-BR') : '-';
            
            return (
              <tr key={m.id}>
                <td style={{borderBottom:'1px solid #eee', padding:'8px'}}>
                  {m.ibgeCode ? (
                    <Link href={`/municipios/${m.ibgeCode}`} style={{ color: '#0070f3', textDecoration: 'none' }}>
                      {m.nome}
                    </Link>
                  ) : (
                    m.nome
                  )}
                </td>
                <td style={{borderBottom:'1px solid #eee', padding:'8px'}}>{territorioNome}</td>
                <td style={{borderBottom:'1px solid #eee', padding:'8px'}}>{ibgeCode}</td>
                <td style={{borderBottom:'1px solid #eee', padding:'8px'}}>{populacao}</td>
                <td style={{borderBottom:'1px solid #eee', padding:'8px'}}>{eleitores}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </main>
  );
}
