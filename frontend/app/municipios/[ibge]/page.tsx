import Link from 'next/link';
import { apiFetch } from "../../lib/api";

type Overview = {
  ibge: string;
  nome: string;
  population: {
    referenceYear: number;
    population: number;
  } | null;
  electorate: {
    referenceYear: number;
    electorate: number;
  } | null;
  council: {
    referenceYear: number;
    seats: number;
  } | null;
};

type Authority = {
  fullName: string;
  photoUrl?: string | null;
  party: {
    sigla: string;
    nome: string;
    colorHex?: string | null;
  } | null;
  legislature: string;
  seatNumber?: number | null;
};

type Authorities = {
  prefeito: Authority | null;
  vice: Authority | null;
  vereadores: Authority[];
};

export default async function Page({ params }: { params: { ibge: string } }) {
  const ibge = params.ibge;
  
  let overview: Overview | null = null;
  let authorities: Authorities | null = null;
  let errorMsg = '';
  
  try {
    overview = await apiFetch<Overview>(`/municipios/${ibge}/overview`);
  } catch (error) {
    errorMsg = 'Erro ao carregar dados demográficos';
  }
  
  try {
    authorities = await apiFetch<Authorities>(`/municipios/${ibge}/autoridades`);
  } catch (error) {
    errorMsg += (errorMsg ? ' e ' : 'Erro ao carregar ') + 'autoridades';
  }
  
  if (!overview && !authorities) {
    return (
      <main style={{maxWidth: 1000, margin: '40px auto', padding: '0 16px'}}>
        <Link href="/municipios" style={{color: '#0070f3', textDecoration: 'none'}}>
          ← Voltar para Municípios
        </Link>
        <h1 style={{marginTop: '20px'}}>Município não encontrado</h1>
        <p style={{color: '#666'}}>{errorMsg}</p>
      </main>
    );
  }
  
  return (
    <main style={{maxWidth: 1000, margin: '40px auto', padding: '0 16px'}}>
      <Link href="/municipios" style={{color: '#0070f3', textDecoration: 'none', marginBottom: '20px', display: 'inline-block'}}>
        ← Voltar para Municípios
      </Link>
      
      <h1 style={{marginTop: '10px', marginBottom: '10px'}}>
        {overview?.nome || `Município ${ibge}`}
      </h1>
      <p style={{color: '#666', fontSize: '14px'}}>Código IBGE: {ibge}</p>
      
      {/* Cards de Overview */}
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '30px', marginBottom: '40px'}}>
        {overview?.population && (
          <div style={{
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            padding: '20px',
            background: '#f9f9f9'
          }}>
            <h3 style={{margin: '0 0 10px 0', fontSize: '16px', color: '#666'}}>
              População ({overview.population.referenceYear})
            </h3>
            <p style={{margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#333'}}>
              {overview.population.population.toLocaleString('pt-BR')}
            </p>
          </div>
        )}
        
        {overview?.electorate && (
          <div style={{
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            padding: '20px',
            background: '#f9f9f9'
          }}>
            <h3 style={{margin: '0 0 10px 0', fontSize: '16px', color: '#666'}}>
              Eleitorado ({overview.electorate.referenceYear})
            </h3>
            <p style={{margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#333'}}>
              {overview.electorate.electorate.toLocaleString('pt-BR')}
            </p>
          </div>
        )}
        
        {overview?.council && (
          <div style={{
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            padding: '20px',
            background: '#f9f9f9'
          }}>
            <h3 style={{margin: '0 0 10px 0', fontSize: '16px', color: '#666'}}>
              Vereadores ({overview.council.referenceYear})
            </h3>
            <p style={{margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#333'}}>
              {overview.council.seats}
            </p>
          </div>
        )}
      </div>
      
      {/* Autoridades */}
      {authorities && (
        <div>
          <h2 style={{borderBottom: '2px solid #333', paddingBottom: '10px'}}>
            Autoridades Eleitas (2024)
          </h2>
          
          {/* Prefeito e Vice */}
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '20px', marginBottom: '30px'}}>
            {authorities.prefeito && (
              <AuthorityCard title="Prefeito" authority={authorities.prefeito} />
            )}
            {authorities.vice && (
              <AuthorityCard title="Vice-Prefeito" authority={authorities.vice} />
            )}
          </div>
          
          {/* Vereadores */}
          {authorities.vereadores && authorities.vereadores.length > 0 && (
            <div>
              <h3 style={{marginTop: '30px', marginBottom: '15px'}}>
                Vereadores ({authorities.vereadores.length})
              </h3>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px'}}>
                {authorities.vereadores.map((vereador, idx) => (
                  <div
                    key={idx}
                    style={{
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      padding: '16px',
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'flex-start'
                    }}
                  >
                    <img
                      src={vereador.photoUrl || '/images/avatar-placeholder.png'}
                      alt={vereador.fullName}
                      style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '2px solid #ddd'
                      }}
                    />
                    <div style={{flex: 1}}>
                      <p style={{margin: '0 0 4px 0', fontWeight: 'bold', fontSize: '15px'}}>
                        {vereador.fullName}
                      </p>
                      {vereador.party && (
                        <p
                          style={{
                            margin: '0 0 4px 0',
                            fontSize: '13px',
                            color: vereador.party.colorHex || '#0070f3',
                            fontWeight: '600'
                          }}
                        >
                          {vereador.party.sigla}
                        </p>
                      )}
                      {vereador.seatNumber && (
                        <p style={{margin: 0, fontSize: '12px', color: '#999'}}>
                          Cadeira #{vereador.seatNumber}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {!authorities?.prefeito && !authorities?.vice && !authorities?.vereadores?.length && (
        <div style={{padding: '40px', textAlign: 'center', color: '#999'}}>
          <p>Nenhuma autoridade encontrada para este município.</p>
        </div>
      )}
    </main>
  );
}

function AuthorityCard({ title, authority }: { title: string; authority: Authority }) {
  return (
    <div style={{
      border: '2px solid #0070f3',
      borderRadius: '12px',
      padding: '20px',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
    }}>
      <h3 style={{margin: '0 0 15px 0', fontSize: '18px', color: '#0070f3'}}>
        {title}
      </h3>
      <div style={{display: 'flex', gap: '15px', alignItems: 'center'}}>
        <img
          src={authority.photoUrl || '/images/avatar-placeholder.png'}
          alt={authority.fullName}
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            objectFit: 'cover',
            border: '3px solid white'
          }}
        />
        <div>
          <p style={{margin: '0 0 8px 0', fontWeight: 'bold', fontSize: '18px'}}>
            {authority.fullName}
          </p>
          {authority.party && (
            <p
              style={{
                margin: '0 0 4px 0',
                fontSize: '14px',
                color: authority.party.colorHex || '#0070f3',
                fontWeight: '600'
              }}
            >
              {authority.party.sigla} - {authority.party.nome}
            </p>
          )}
          <p style={{margin: 0, fontSize: '13px', color: '#666'}}>
            Mandato: {authority.legislature}
          </p>
        </div>
      </div>
    </div>
  );
}
