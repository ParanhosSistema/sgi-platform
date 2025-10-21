import { apiFetch } from "../lib/api";

type Municipio = {
  id?: number | string;
  nome: string;
  codIbge?: number;
  territorio?: { nome: string } | null;
  territorioNome?: string | null;
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
            const terr = (m as any).territorio?.nome || (m as any).territorioNome || '';
            return (
              <tr key={String(m.id || m.codIbge || m.nome)}>
                <td style={{borderBottom:'1px solid #eee', padding:'8px'}}>{m.nome}</td>
                <td style={{borderBottom:'1px solid #eee', padding:'8px'}}>{terr}</td>
                <td style={{borderBottom:'1px solid #eee', padding:'8px'}}>{m.codIbge ?? ''}</td>
                <td style={{borderBottom:'1px solid #eee', padding:'8px'}}>{m.populacao ?? ''}</td>
                <td style={{borderBottom:'1px solid #eee', padding:'8px'}}>{m.eleitores ?? ''}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </main>
  );
}
