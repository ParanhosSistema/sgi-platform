import { getJSON } from '../lib/api';

type Territorio = { id: number; nome: string };
type Municipio = { id: number; nome: string; territorioId?: number | null; territorio?: Territorio | null };

export const dynamic = 'force-dynamic';

export default async function MunicipiosPage() {
  const municipios = await getJSON<Municipio[]>('/municipios');
  return (
    <main style={{ padding: '1rem 1.25rem', maxWidth: 960, margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.75rem' }}>
        Municípios do Paraná
      </h1>
      <p style={{ marginBottom: '1rem' }}>Total: {municipios.length}</p>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.5rem' }}>
        {municipios.map((m) => (
          <li key={m.id} style={{ padding: '0.5rem 0.75rem', border: '1px solid #e5e7eb', borderRadius: 8 }}>
            <strong>{m.nome}</strong>
            {m.territorio?.nome ? <span style={{ marginLeft: 8, opacity: 0.7 }}>— {m.territorio.nome}</span> : null}
          </li>
        ))}
      </ul>
    </main>
  );
}
