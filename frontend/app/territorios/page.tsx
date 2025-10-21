// frontend/app/territorios/page.tsx
import { apiGet } from '../lib/api';

export const dynamic = 'force-dynamic';

type Municipio = { nome: string };
type Territorio = { id?: number; nome: string; municipios?: Municipio[] };

async function getData() {
  return apiGet<Territorio[]>('/territorios');
}

export default async function TerritoriosPage() {
  const data = await getData();
  return (
    <main style={{padding: '24px', maxWidth: 1000, margin: '0 auto'}}>
      <h1>Territórios Turísticos (PR)</h1>
      <p>Total: {data.length}</p>
      {data.map((t, idx) => (
        <section key={idx} style={{marginBottom:'24px'}}>
          <h2 style={{marginBottom:'8px'}}>{t.nome}</h2>
          <ul style={{columns:2, marginTop:0}}>
            {(t.municipios || []).map((m, i) => <li key={i}>{m.nome}</li>)}
          </ul>
        </section>
      ))}
    </main>
  );
}
