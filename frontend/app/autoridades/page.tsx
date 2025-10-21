'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Authority = {
  id: string;
  fullName: string;
  photoUrl?: string | null;
  office: 'PREFEITO' | 'VICE_PREFEITO' | 'VEREADOR';
  party: {
    sigla: string;
    nome: string;
    colorHex?: string | null;
  } | null;
  municipality: {
    id: number;
    nome: string;
    ibgeCode: string | null;
  };
  legislature: string;
  seatNumber?: number | null;
};

const OFFICE_LABELS = {
  PREFEITO: 'Prefeito',
  VICE_PREFEITO: 'Vice-Prefeito',
  VEREADOR: 'Vereador'
};

export default function Page() {
  const [searchQuery, setSearchQuery] = useState('');
  const [authorities, setAuthorities] = useState<Authority[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (searchQuery.length >= 2) {
      searchAuthorities();
    } else {
      setAuthorities([]);
    }
  }, [searchQuery]);
  
  async function searchAuthorities() {
    setLoading(true);
    setError('');
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const response = await fetch(`${apiUrl}/busca/autoridades?q=${encodeURIComponent(searchQuery)}`);
      
      if (!response.ok) {
        throw new Error('Erro ao buscar autoridades');
      }
      
      const data = await response.json();
      setAuthorities(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao buscar');
      setAuthorities([]);
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <main style={{maxWidth: 1200, margin: '40px auto', padding: '0 16px'}}>
      <Link href="/municipios" style={{color: '#0070f3', textDecoration: 'none'}}>
        ← Voltar para Municípios
      </Link>
      
      <h1 style={{marginTop: '20px', marginBottom: '10px'}}>
        Buscar Autoridades Eleitas
      </h1>
      <p style={{color: '#666', fontSize: '14px', marginBottom: '30px'}}>
        Pesquise por nome de prefeitos, vice-prefeitos e vereadores eleitos em 2024
      </p>
      
      {/* Search Bar */}
      <div style={{marginBottom: '30px'}}>
        <input
          type="text"
          placeholder="Digite o nome da autoridade..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 16px',
            fontSize: '16px',
            border: '2px solid #ddd',
            borderRadius: '8px',
            outline: 'none',
            transition: 'border-color 0.2s'
          }}
          onFocus={(e) => e.target.style.borderColor = '#0070f3'}
          onBlur={(e) => e.target.style.borderColor = '#ddd'}
        />
        {searchQuery.length > 0 && searchQuery.length < 2 && (
          <p style={{color: '#999', fontSize: '14px', marginTop: '8px'}}>
            Digite pelo menos 2 caracteres para buscar
          </p>
        )}
      </div>
      
      {/* Loading */}
      {loading && (
        <div style={{textAlign: 'center', padding: '40px', color: '#666'}}>
          <p>Buscando...</p>
        </div>
      )}
      
      {/* Error */}
      {error && (
        <div style={{padding: '20px', background: '#ffebee', borderRadius: '8px', color: '#c62828', marginBottom: '20px'}}>
          {error}
        </div>
      )}
      
      {/* Results */}
      {!loading && !error && searchQuery.length >= 2 && authorities.length === 0 && (
        <div style={{textAlign: 'center', padding: '40px', color: '#999'}}>
          <p>Nenhuma autoridade encontrada para "{searchQuery}"</p>
        </div>
      )}
      
      {!loading && authorities.length > 0 && (
        <div>
          <p style={{color: '#666', marginBottom: '20px'}}>
            {authorities.length} resultado{authorities.length > 1 ? 's' : ''} encontrado{authorities.length > 1 ? 's' : ''}
          </p>
          
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px'}}>
            {authorities.map((authority) => (
              <div
                key={authority.id}
                style={{
                  border: '1px solid #e0e0e0',
                  borderRadius: '12px',
                  padding: '20px',
                  background: 'white',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  transition: 'box-shadow 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)'}
              >
                <div style={{display: 'flex', gap: '15px', marginBottom: '15px'}}>
                  <img
                    src={authority.photoUrl || '/images/avatar-placeholder.png'}
                    alt={authority.fullName}
                    style={{
                      width: '70px',
                      height: '70px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid #ddd'
                    }}
                  />
                  <div style={{flex: 1}}>
                    <p style={{margin: '0 0 6px 0', fontWeight: 'bold', fontSize: '17px'}}>
                      {authority.fullName}
                    </p>
                    <p
                      style={{
                        margin: '0 0 4px 0',
                        fontSize: '13px',
                        background: authority.office === 'PREFEITO' ? '#0070f3' : authority.office === 'VICE_PREFEITO' ? '#00a86b' : '#666',
                        color: 'white',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        display: 'inline-block'
                      }}
                    >
                      {OFFICE_LABELS[authority.office]}
                      {authority.seatNumber && ` #${authority.seatNumber}`}
                    </p>
                    {authority.party && (
                      <p
                        style={{
                          margin: '6px 0 0 0',
                          fontSize: '14px',
                          color: authority.party.colorHex || '#0070f3',
                          fontWeight: '600'
                        }}
                      >
                        {authority.party.sigla}
                      </p>
                    )}
                  </div>
                </div>
                
                <div style={{borderTop: '1px solid #eee', paddingTop: '12px'}}>
                  <p style={{margin: '0 0 4px 0', fontSize: '14px', color: '#666'}}>
                    <strong>Município:</strong> {authority.municipality.nome}
                  </p>
                  <p style={{margin: '0 0 8px 0', fontSize: '14px', color: '#666'}}>
                    <strong>Mandato:</strong> {authority.legislature}
                  </p>
                  {authority.municipality.ibgeCode && (
                    <Link
                      href={`/municipios/${authority.municipality.ibgeCode}`}
                      style={{
                        padding: '6px 12px',
                        background: '#f5f5f5',
                        color: '#0070f3',
                        borderRadius: '4px',
                        textDecoration: 'none',
                        fontSize: '13px',
                        display: 'inline-block',
                        border: '1px solid #ddd'
                      }}
                    >
                      Ver Município →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {!searchQuery && (
        <div style={{textAlign: 'center', padding: '60px 20px', color: '#999'}}>
          <p style={{fontSize: '16px'}}>
            Digite um nome na caixa de busca acima para encontrar autoridades eleitas
          </p>
        </div>
      )}
    </main>
  );
}
