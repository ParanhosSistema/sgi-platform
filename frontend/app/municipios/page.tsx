// frontend/app/municipios/page.tsx
import { apiGet } from '../lib/api';

export const dynamic = 'force-dynamic';

type Municipio = { id?: number; nome: string; territorio?: { nome: string } | null; territorioId?: number };

async function getData() {
  return apiGet<Municipio[]>('/municipios');
}

export default async function MunicipiosPage() {
  const data = await getData();
  return (
    <main style={{padding: '24px', maxWidth: 1000, margin: '0 auto'}}>
      <h1>Municípios × Territórios Turísticos (PR)</h1>
      <p>Total: {data.length}</p>
      <table style={{width:'100%', borderCollapse:'collapse'}}>
        <thead>
          <tr>
            <th style={{textAlign:'left', borderBottom:'1px solid #ddd', padding:'8px'}}>Município</th>
            <th style={{textAlign:'left', borderBottom:'1px solid #ddd', padding:'8px'}}>Território</th>
          </tr>
        </thead>
        <tbody>
          {data.map((m, i) => (
            <tr key={i}>
              <td style={{borderBottom:'1px solid #eee', padding:'8px'}}>{m.nome}</td>
              <td style={{borderBottom:'1px solid #eee', padding:'8px'}}>{m.territorio?.nome ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
