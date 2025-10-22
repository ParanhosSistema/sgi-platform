import { apiFetch } from "../../lib/api";
import AutoridadeCard from "../../../components/AutoridadeCard";
import Link from "next/link";

type MunicipioOverview = {
  ibgeCode: string;
  nome: string;
  uf: string;
  territorio: string | null;
  brasaoUrl: string | null;
  classificacao: 'OURO' | 'PRATA' | 'BRONZE' | null;
  populacao2022: number | null;
  eleitores2024: number | null;
  latitude: number | null;
  longitude: number | null;
};

type Autoridade = {
  id: number;
  nome: string;
  cargo: string;
  partidoSigla?: string;
  partidoNome?: string;
  fotoUrl?: string;
  anoInicioMandato?: number;
  anoFimMandato?: number;
};

type AutoridadesResponse = {
  ibgeCode: string;
  nome: string;
  autoridades: Autoridade[];
};

export default async function MunicipioDetalhesPage({ params }: { params: { ibge: string } }) {
  const { ibge } = params;

  let overview: MunicipioOverview | null = null;
  let autoridadesData: AutoridadesResponse | null = null;

  try {
    overview = await apiFetch<MunicipioOverview>(`/municipios/${ibge}/overview`);
  } catch (error) {
    console.error('Erro ao buscar overview:', error);
  }

  try {
    autoridadesData = await apiFetch<AutoridadesResponse>(`/municipios/${ibge}/autoridades`);
  } catch (error) {
    console.error('Erro ao buscar autoridades:', error);
  }

  if (!overview) {
    return (
      <main style={{ maxWidth: 1100, margin: '40px auto', padding: '0 16px' }}>
        <p>Município não encontrado.</p>
        <Link href="/municipios" style={{ color: '#0070f3' }}>← Voltar para lista</Link>
      </main>
    );
  }

  const classificacaoColors: Record<string, string> = {
    OURO: '#FFD700',
    PRATA: '#C0C0C0',
    BRONZE: '#CD7F32',
  };

  const classificacaoColor = overview.classificacao ? classificacaoColors[overview.classificacao] : '#ccc';

  return (
    <main style={{ maxWidth: 1100, margin: '40px auto', padding: '0 16px' }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: 20, fontSize: 14, color: '#666' }}>
        <Link href="/municipios" style={{ color: '#0070f3' }}>Municípios</Link> → {overview.nome}
      </div>

      {/* Header com Brasão e Nome */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 32 }}>
        {overview.brasaoUrl && (
          <img
            src={overview.brasaoUrl}
            alt={`Brasão de ${overview.nome}`}
            style={{ width: 120, height: 120, objectFit: 'contain' }}
          />
        )}
        <div>
          <h1 style={{ margin: 0, fontSize: 32 }}>{overview.nome} - {overview.uf}</h1>
          {overview.classificacao && (
            <span
              style={{
                display: 'inline-block',
                marginTop: 8,
                padding: '4px 12px',
                borderRadius: 4,
                backgroundColor: classificacaoColor,
                color: '#fff',
                fontWeight: 'bold',
                fontSize: 14,
              }}
            >
              {overview.classificacao}
            </span>
          )}
        </div>
      </div>

      {/* Seção Overview */}
      <section style={{ marginBottom: 48 }}>
        <h2>Visão Geral</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          <div style={{ padding: 16, border: '1px solid #e0e0e0', borderRadius: 8 }}>
            <div style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>Código IBGE</div>
            <div style={{ fontSize: 20, fontWeight: 'bold' }}>{overview.ibgeCode}</div>
          </div>
          <div style={{ padding: 16, border: '1px solid #e0e0e0', borderRadius: 8 }}>
            <div style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>Território Turístico</div>
            <div style={{ fontSize: 20, fontWeight: 'bold' }}>{overview.territorio || 'N/A'}</div>
          </div>
          <div style={{ padding: 16, border: '1px solid #e0e0e0', borderRadius: 8 }}>
            <div style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>População (2022)</div>
            <div style={{ fontSize: 20, fontWeight: 'bold' }}>
              {overview.populacao2022 ? overview.populacao2022.toLocaleString('pt-BR') : 'N/A'}
            </div>
          </div>
          <div style={{ padding: 16, border: '1px solid #e0e0e0', borderRadius: 8 }}>
            <div style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>Eleitores (2024)</div>
            <div style={{ fontSize: 20, fontWeight: 'bold' }}>
              {overview.eleitores2024 ? overview.eleitores2024.toLocaleString('pt-BR') : 'N/A'}
            </div>
          </div>
        </div>
      </section>

      {/* Seção Autoridades */}
      <section style={{ marginBottom: 48 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2>Autoridades Municipais</h2>
        </div>

        {autoridadesData && autoridadesData.autoridades.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {autoridadesData.autoridades.map((autoridade) => (
              <AutoridadeCard key={autoridade.id} {...autoridade} />
            ))}
          </div>
        ) : (
          <p style={{ color: '#666' }}>Nenhuma autoridade cadastrada.</p>
        )}
      </section>

      {/* Link para Votação do Paranhos */}
      <section style={{ padding: 24, backgroundColor: '#f5f5f5', borderRadius: 8 }}>
        <h3 style={{ marginTop: 0 }}>Votação de Leonaldo Paranhos</h3>
        <p style={{ color: '#666', marginBottom: 16 }}>
          Veja a série histórica de votação do candidato Leonaldo Paranhos (Deputado Estadual) neste município.
        </p>
        <Link
          href={`/municipios/${ibge}/paranhos`}
          style={{
            display: 'inline-block',
            padding: '12px 24px',
            backgroundColor: '#0070f3',
            color: '#fff',
            borderRadius: 6,
            textDecoration: 'none',
            fontWeight: 'bold',
          }}
        >
          Ver Votação do Paranhos
        </Link>
      </section>
    </main>
  );
}
