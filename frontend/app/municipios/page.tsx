// frontend/app/municipios/page.tsx
import { apiGet } from '../lib/api';

type Municipio = {
  id?: number | string;
  nome: string;
  uf?: string;
  territorio?: { id: number; nome: string } | null;
  territorioId?: number | null;
  populacao?: number | null;
  eleitores?: number | null;
};

export default async function Page() {
  const data = await apiGet<Municipio[]>('/municipios');
  const total = data.length;

  return (
    <main style={{ maxWidth: 1000, margin: '40px auto', padding: 16 }}>
      <h1>Municípios do Paraná (PR)</h1>
      <p><strong>{total}</strong> municípios carregados da API.</p>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Município</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Território</th>
            <th style={{ textAlign: 'right', borderBottom: '1px solid #ddd', padding: 8 }}>População</th>
            <th style={{ textAlign: 'right', borderBottom: '1px solid #ddd', padding: 8 }}>Eleitores</th>
          </tr>
        </thead>
        <tbody>
          {data.map((m) => (
            <tr key={`${m.id ?? m.nome}`}>
              <td style={{ borderBottom: '1px solid #eee', padding: 8 }}>{m.nome}</td>
              <td style={{ borderBottom: '1px solid #eee', padding: 8 }}>
                {m.territorio?.nome ?? '—'}
              </td>
              <td style={{ borderBottom: '1px solid #eee', padding: 8, textAlign: 'right' }}>
                {m.populacao?.toLocaleString('pt-BR') ?? '—'}
              </td>
              <td style={{ borderBottom: '1px solid #eee', padding: 8, textAlign: 'right' }}>
                {m.eleitores?.toLocaleString('pt-BR') ?? '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}