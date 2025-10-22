// frontend/app/municipios/[ibge]/page.tsx
'use client';

import { use, useEffect, useState } from 'react';
import MandateCard from '@/components/MandateCard';

type Stats = {
  ibge: number;
  year: number;
  population: number | null;
  electors: number | null;
};

type Mandate = {
  id: string;
  role: 'PREFEITO' | 'VICE_PREFEITO' | 'VEREADOR';
  person: {
    name: string;
    photoUrl: string | null;
  };
  party: {
    sigla: string;
    name: string;
  } | null;
};

type MunicipalityData = {
  municipio: {
    nome: string;
    codigoIbge: string;
  };
  stats: Stats | null;
  mandates: Mandate[];
};

export default function MunicipioDetailPage({
  params,
}: {
  params: Promise<{ ibge: string }>;
}) {
  const resolvedParams = use(params);
  const [data, setData] = useState<MunicipalityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch municipality basic info
        const municipioRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/municipios/${resolvedParams.ibge}`
        );
        if (!municipioRes.ok) {
          throw new Error('Município não encontrado');
        }
        const municipio = await municipioRes.json();

        // Fetch stats
        let stats = null;
        try {
          const statsRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/municipios/${resolvedParams.ibge}/stats`
          );
          if (statsRes.ok) {
            stats = await statsRes.json();
          }
        } catch (e) {
          console.warn('Stats not available', e);
        }

        // Fetch mandates
        let mandates: Mandate[] = [];
        try {
          const mandatesRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/municipios/${resolvedParams.ibge}/mandates`
          );
          if (mandatesRes.ok) {
            mandates = await mandatesRes.json();
          }
        } catch (e) {
          console.warn('Mandates not available', e);
        }

        setData({
          municipio,
          stats,
          mandates,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [resolvedParams.ibge]);

  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        <p>Carregando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <p style={{ color: 'red' }}>{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ padding: 24 }}>
        <p>Nenhum dado disponível</p>
      </div>
    );
  }

  const { municipio, stats, mandates } = data;

  const prefeito = mandates.find((m) => m.role === 'PREFEITO');
  const vice = mandates.find((m) => m.role === 'VICE_PREFEITO');
  const vereadores = mandates.filter((m) => m.role === 'VEREADOR');

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <h1 style={{ marginBottom: 24 }}>{municipio.nome}</h1>

      {/* Stats Section */}
      {stats && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16,
            marginBottom: 32,
          }}
        >
          <div style={{ padding: 16, border: '1px solid #eee', borderRadius: 8 }}>
            <div style={{ fontSize: 13, opacity: 0.7 }}>População ({stats.year})</div>
            <div style={{ fontSize: 24, fontWeight: 600 }}>
              {stats.population?.toLocaleString('pt-BR') || 'N/A'}
            </div>
          </div>
          <div style={{ padding: 16, border: '1px solid #eee', borderRadius: 8 }}>
            <div style={{ fontSize: 13, opacity: 0.7 }}>Eleitorado</div>
            <div style={{ fontSize: 24, fontWeight: 600 }}>
              {stats.electors?.toLocaleString('pt-BR') || 'N/A'}
            </div>
          </div>
        </div>
      )}

      {/* Elected Officials Section */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ marginBottom: 16 }}>Agentes Eleitos (2025-2028)</h2>

        {prefeito && (
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, marginBottom: 8 }}>Prefeito</h3>
            <MandateCard
              name={prefeito.person.name}
              role={prefeito.role}
              party={prefeito.party?.sigla || null}
              photoUrl={prefeito.person.photoUrl}
            />
          </div>
        )}

        {vice && (
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, marginBottom: 8 }}>Vice-Prefeito</h3>
            <MandateCard
              name={vice.person.name}
              role={vice.role}
              party={vice.party?.sigla || null}
              photoUrl={vice.person.photoUrl}
            />
          </div>
        )}

        {vereadores.length > 0 && (
          <div>
            <h3 style={{ fontSize: 16, marginBottom: 8 }}>
              Vereadores ({vereadores.length})
            </h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 12,
              }}
            >
              {vereadores.map((v) => (
                <MandateCard
                  key={v.id}
                  name={v.person.name}
                  role={v.role}
                  party={v.party?.sigla || null}
                  photoUrl={v.person.photoUrl}
                />
              ))}
            </div>
          </div>
        )}

        {!prefeito && !vice && vereadores.length === 0 && (
          <p style={{ opacity: 0.6 }}>Nenhum dado de agentes eleitos disponível.</p>
        )}
      </div>
    </div>
  );
}
