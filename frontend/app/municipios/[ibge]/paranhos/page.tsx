"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import MunicipioParanhosChart from '../../../../components/MunicipioParanhosChart';

type EleicaoData = {
  id: number;
  ano: number;
  turno: number;
  cargo: string;
  uf: string;
  municipio: {
    ibgeCode: string;
    nome: string;
  };
  candidatoNome: string;
  numero: number | null;
  partidoSigla: string | null;
  partidoNome: string | null;
  votos: number;
  percentualVotos: number | null;
};

export default function ParanhosVotacaoPage({ params }: { params: { ibge: string } }) {
  const { ibge } = params;
  const [eleicoes, setEleicoes] = useState<EleicaoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://sgi-platform-backend.onrender.com';
    const url = `${apiUrl}/eleicoes/paranhos?municipio_ibge_id=${ibge}`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`Erro ${res.status}`);
        return res.json();
      })
      .then((data: EleicaoData[]) => {
        setEleicoes(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [ibge]);

  if (loading) {
    return (
      <main style={{ maxWidth: 1100, margin: '40px auto', padding: '0 16px' }}>
        <p>Carregando...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main style={{ maxWidth: 1100, margin: '40px auto', padding: '0 16px' }}>
        <p>Erro ao carregar dados: {error}</p>
        <Link href={`/municipios/${ibge}`} style={{ color: '#0070f3' }}>← Voltar</Link>
      </main>
    );
  }

  if (eleicoes.length === 0) {
    return (
      <main style={{ maxWidth: 1100, margin: '40px auto', padding: '0 16px' }}>
        <div style={{ marginBottom: 20, fontSize: 14, color: '#666' }}>
          <Link href="/municipios" style={{ color: '#0070f3' }}>Municípios</Link> →{' '}
          <Link href={`/municipios/${ibge}`} style={{ color: '#0070f3' }}>Detalhes</Link> → Votação Paranhos
        </div>
        <h1>Votação de Leonaldo Paranhos</h1>
        <p>Nenhum dado de votação disponível para este município.</p>
        <Link href={`/municipios/${ibge}`} style={{ color: '#0070f3' }}>← Voltar</Link>
      </main>
    );
  }

  const municipioNome = eleicoes[0]?.municipio.nome || 'Município';
  const chartData = eleicoes.map((e) => ({ ano: e.ano, votos: e.votos }));

  return (
    <main style={{ maxWidth: 1100, margin: '40px auto', padding: '0 16px' }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: 20, fontSize: 14, color: '#666' }}>
        <Link href="/municipios" style={{ color: '#0070f3' }}>Municípios</Link> →{' '}
        <Link href={`/municipios/${ibge}`} style={{ color: '#0070f3' }}>{municipioNome}</Link> → Votação Paranhos
      </div>

      <h1>Votação de Leonaldo Paranhos em {municipioNome}</h1>
      <p style={{ color: '#666', marginBottom: 32 }}>
        Série histórica de votos do candidato <strong>Leonaldo Paranhos</strong> para <strong>Deputado Estadual (PR)</strong> no município de <strong>{municipioNome}</strong>.
      </p>

      {/* Gráfico */}
      <section style={{ marginBottom: 48, backgroundColor: '#fff', padding: 24, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <h2 style={{ marginTop: 0 }}>Gráfico de Votação</h2>
        <MunicipioParanhosChart data={chartData} />
      </section>

      {/* Tabela de Dados */}
      <section style={{ marginBottom: 48 }}>
        <h2>Detalhamento por Ano</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5' }}>
              <th style={{ textAlign: 'left', padding: 12, borderBottom: '2px solid #ddd' }}>Ano</th>
              <th style={{ textAlign: 'left', padding: 12, borderBottom: '2px solid #ddd' }}>Turno</th>
              <th style={{ textAlign: 'left', padding: 12, borderBottom: '2px solid #ddd' }}>Partido</th>
              <th style={{ textAlign: 'right', padding: 12, borderBottom: '2px solid #ddd' }}>Votos</th>
              <th style={{ textAlign: 'right', padding: 12, borderBottom: '2px solid #ddd' }}>% Válidos</th>
            </tr>
          </thead>
          <tbody>
            {eleicoes.map((e) => (
              <tr key={e.id}>
                <td style={{ padding: 12, borderBottom: '1px solid #eee' }}>{e.ano}</td>
                <td style={{ padding: 12, borderBottom: '1px solid #eee' }}>{e.turno}º turno</td>
                <td style={{ padding: 12, borderBottom: '1px solid #eee' }}>
                  {e.partidoSigla || 'N/A'} {e.partidoNome && `(${e.partidoNome})`}
                </td>
                <td style={{ padding: 12, borderBottom: '1px solid #eee', textAlign: 'right', fontWeight: 'bold' }}>
                  {e.votos.toLocaleString('pt-BR')}
                </td>
                <td style={{ padding: 12, borderBottom: '1px solid #eee', textAlign: 'right' }}>
                  {e.percentualVotos ? `${e.percentualVotos.toFixed(2)}%` : 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div style={{ marginTop: 32 }}>
        <Link href={`/municipios/${ibge}`} style={{ color: '#0070f3' }}>← Voltar para detalhes do município</Link>
      </div>
    </main>
  );
}
