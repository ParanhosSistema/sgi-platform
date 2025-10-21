import { getJSON } from '../lib/api';

type Municipio = { id: number; nome: string };
type Territorio = { id: number; nome: string; municipios?: Municipio[] };

export const dynamic = 'force-dynamic';

export default async function TerritoriosPage() {
  const territorios = await getJSON<Territorio[]>('/territorios');
  return (
    <main style={{ padding: '1rem 1.25rem', maxWidth: 960, margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.75rem' }}>
        Territórios Turísticos do Paraná
      </h1>
      <p style={{ marginBottom: '1rem' }}>Total: {territorios.length}</p>
      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {territorios.map((t) => (
          <section key={t.id} style={{ padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: 8 }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{t.nome}</h2>
            {t.municipios && t.municipios.length > 0 ? (
              <ul style={{ marginTop: '0.5rem', paddingLeft: '1rem' }}>
                {t.municipios.map((m) => (
                  <li key={m.id}>{m.nome}</li>
                ))}
              </ul>
            ) : (
              <p style={{ opacity: 0.7, marginTop: '0.5rem' }}>Sem municípios vinculados.</p>
            )}
          </section>
        ))}
      </div>
    </main>
  );
}
