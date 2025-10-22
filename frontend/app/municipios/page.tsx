import { apiFetch } from "../lib/api";

type Municipio = {
  id?: number | string;
  nome: string;
  ibgeCode?: string;
  codIbge?: number;
  territorio?: { nome: string } | null;
  territorioNome?: string | null;
  populacao2022?: number | null;
  eleitores2024?: number | null;
  classificacao?: 'OURO' | 'PRATA' | 'BRONZE' | null;
};

export default async function Page() {
  const municipios = await apiFetch<Municipio[]>('/municipios');
  const total = municipios.length;
  return (
    <main style={{maxWidth: 1200, margin: '40px auto', padding: '0 16px'}}>
      <h1>Municípios × Territórios Turísticos (PR)</h1>
      <p style={{opacity:.8}}>Total: {total}</p>
      <table style={{width:'100%', borderCollapse:'collapse', fontSize: 14}}>
        <thead>
          <tr>
            <th style={{textAlign:'left', borderBottom:'2px solid #ddd', padding:'10px 8px'}}>Município</th>
            <th style={{textAlign:'left', borderBottom:'2px solid #ddd', padding:'10px 8px'}}>Classificação</th>
            <th style={{textAlign:'left', borderBottom:'2px solid #ddd', padding:'10px 8px'}}>Território</th>
            <th style={{textAlign:'left', borderBottom:'2px solid #ddd', padding:'10px 8px'}}>IBGE</th>
            <th style={{textAlign:'right', borderBottom:'2px solid #ddd', padding:'10px 8px'}}>População (2022)</th>
            <th style={{textAlign:'right', borderBottom:'2px solid #ddd', padding:'10px 8px'}}>Eleitores (2024)</th>
            <th style={{textAlign:'center', borderBottom:'2px solid #ddd', padding:'10px 8px'}}>Detalhes</th>
          </tr>
        </thead>
        <tbody>
          {municipios.map((m) => {
            const terr = (m as any).territorio?.nome || (m as any).territorioNome || '';
            const ibge = m.ibgeCode || m.codIbge;
            const classificacaoColors: Record<string, string> = {
              OURO: '#FFD700',
              PRATA: '#C0C0C0',
              BRONZE: '#CD7F32',
            };
            const classificacaoColor = m.classificacao ? classificacaoColors[m.classificacao] : 'transparent';
            
            return (
              <tr key={String(m.id || ibge || m.nome)}>
                <td style={{borderBottom:'1px solid #eee', padding:'8px', fontWeight: 500}}>{m.nome}</td>
                <td style={{borderBottom:'1px solid #eee', padding:'8px'}}>
                  {m.classificacao ? (
                    <span style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: 4,
                      backgroundColor: classificacaoColor,
                      color: '#fff',
                      fontSize: 11,
                      fontWeight: 'bold'
                    }}>
                      {m.classificacao}
                    </span>
                  ) : ''}
                </td>
                <td style={{borderBottom:'1px solid #eee', padding:'8px', fontSize: 13, color: '#666'}}>{terr}</td>
                <td style={{borderBottom:'1px solid #eee', padding:'8px', fontSize: 13, color: '#666'}}>{ibge ?? ''}</td>
                <td style={{borderBottom:'1px solid #eee', padding:'8px', textAlign: 'right'}}>
                  {m.populacao2022 ? m.populacao2022.toLocaleString('pt-BR') : ''}
                </td>
                <td style={{borderBottom:'1px solid #eee', padding:'8px', textAlign: 'right'}}>
                  {m.eleitores2024 ? m.eleitores2024.toLocaleString('pt-BR') : ''}
                </td>
                <td style={{borderBottom:'1px solid #eee', padding:'8px', textAlign: 'center'}}>
                  {ibge && (
                    <a href={`/municipios/${ibge}`} style={{color: '#0070f3', textDecoration: 'none', fontWeight: 500}}>
                      Ver detalhes
                    </a>
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
