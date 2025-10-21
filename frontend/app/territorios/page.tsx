// frontend/app/territorios/page.tsx
import { apiGet } from '../lib/api';

type Territorio = {
  id: number | string;
  nome: string;
  municipios?: { id: number | string; nome: string }[];
};

export default async function Page() {
  const data = await apiGet<Territorio[]>('/territorios');

  return (
    <main style={{ maxWidth: 1000, margin: '40px auto', padding: 16 }}>
      <h1>Territórios Turísticos (PR)</h1>
      <p>Total: <strong>{data.length}</strong></p>
      <ul>
        {data.map(t => (
          <li key={t.id} style={{ marginBottom: 12 }}>
            <strong>{t.nome}</strong>{' '}
            <span style={{ color: '#666' }}>
              ({t.municipios?.length ?? 0} municípios)
            </span>
          </li>
        ))}
      </ul>
    </main>
  );
}