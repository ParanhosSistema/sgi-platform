import { apiFetch } from "../lib/api";

type Territorio = {
  id?: number | string;
  nome: string;
  municipios?: { nome: string }[];
};

export default async function Page() {
  const territorios = await apiFetch<Territorio[]>('/territorios');
  return (
    <main style={{maxWidth: 1100, margin: '40px auto', padding: '0 16px'}}>
      <h1>Territórios Turísticos do Paraná</h1>
      <ul style={{lineHeight: '1.9'}}>
        {territorios.map((t) => (
          <li key={String(t.id || t.nome)}>
            <strong>{t.nome}</strong>
            {t.municipios?.length ? (
              <span> — {t.municipios.length} municípios</span>
            ) : null}
          </li>
        ))}
      </ul>
    </main>
  );
}
