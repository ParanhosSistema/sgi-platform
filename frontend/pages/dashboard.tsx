
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

interface Stats {
  municipios: number;
  territorios: number;
  usuarios: number;
}

export default function Dashboard() {
  const [ready, setReady] = useState(false);
  const [stats, setStats] = useState<Stats>({ municipios: 0, territorios: 0, usuarios: 0 });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('sgi_token');
    if (!token) {
      router.replace('/login');
      return;
    }
    setReady(true);
    loadStats(token);
  }, [router]);

  const loadStats = async (token: string) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
      
      // Carregar estatísticas em paralelo
      const [municipiosRes, territoriosRes, usuariosRes] = await Promise.all([
        fetch(`${API_URL}/municipios`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/territorios`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/usuarios`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const municipios = municipiosRes.ok ? await municipiosRes.json() : [];
      const territorios = territoriosRes.ok ? await territoriosRes.json() : [];
      const usuarios = usuariosRes.ok ? await usuariosRes.json() : [];

      setStats({
        municipios: Array.isArray(municipios) ? municipios.length : 0,
        territorios: Array.isArray(territorios) ? territorios.length : 0,
        usuarios: Array.isArray(usuarios) ? usuarios.length : 0
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('sgi_token');
    router.push('/login');
  };

  if (!ready) return null;

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>SGI Platform - Dashboard</h1>
        <button onClick={handleLogout} style={styles.logoutBtn}>Sair</button>
      </header>

      <nav style={styles.nav}>
        <Link href="/dashboard" style={styles.navLink}>📊 Dashboard</Link>
        <Link href="/dashboard/municipios" style={styles.navLink}>🏛️ Municípios</Link>
        <Link href="/dashboard/territorios" style={styles.navLink}>🗺️ Territórios</Link>
        <Link href="/dashboard/usuarios" style={styles.navLink}>👥 Usuários</Link>
      </nav>

      <main style={styles.main}>
        <h2 style={styles.subtitle}>Visão Geral</h2>

        {loading ? (
          <p>Carregando estatísticas...</p>
        ) : (
          <div style={styles.statsGrid}>
            <div style={styles.card}>
              <div style={styles.cardIcon}>🏛️</div>
              <div style={styles.cardContent}>
                <h3 style={styles.cardTitle}>Municípios</h3>
                <p style={styles.cardValue}>{stats.municipios}</p>
                <Link href="/dashboard/municipios" style={styles.cardLink}>Ver todos →</Link>
              </div>
            </div>

            <div style={styles.card}>
              <div style={styles.cardIcon}>🗺️</div>
              <div style={styles.cardContent}>
                <h3 style={styles.cardTitle}>Territórios</h3>
                <p style={styles.cardValue}>{stats.territorios}</p>
                <Link href="/dashboard/territorios" style={styles.cardLink}>Ver todos →</Link>
              </div>
            </div>

            <div style={styles.card}>
              <div style={styles.cardIcon}>👥</div>
              <div style={styles.cardContent}>
                <h3 style={styles.cardTitle}>Usuários</h3>
                <p style={styles.cardValue}>{stats.usuarios}</p>
                <Link href="/dashboard/usuarios" style={styles.cardLink}>Ver todos →</Link>
              </div>
            </div>
          </div>
        )}

        <div style={styles.infoSection}>
          <h3>Bem-vindo ao Sistema de Gestão Integrada</h3>
          <p>Use o menu acima para navegar entre as diferentes seções do sistema.</p>
          <ul>
            <li><strong>Municípios:</strong> Gerencie os municípios cadastrados</li>
            <li><strong>Territórios:</strong> Organize municípios por territórios</li>
            <li><strong>Usuários:</strong> Administre usuários do sistema</li>
          </ul>
        </div>
      </main>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },
  header: {
    backgroundColor: '#2563eb',
    color: 'white',
    padding: '1.5rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: {
    margin: 0,
    fontSize: '1.5rem'
  },
  logoutBtn: {
    backgroundColor: 'white',
    color: '#2563eb',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontWeight: '500'
  },
  nav: {
    backgroundColor: 'white',
    padding: '1rem 2rem',
    display: 'flex',
    gap: '1.5rem',
    borderBottom: '1px solid #e5e5e5'
  },
  navLink: {
    textDecoration: 'none',
    color: '#374151',
    padding: '0.5rem 1rem',
    borderRadius: '0.375rem',
    transition: 'background-color 0.2s',
    cursor: 'pointer'
  },
  main: {
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  subtitle: {
    fontSize: '1.875rem',
    fontWeight: '700',
    marginBottom: '2rem',
    color: '#111827'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    padding: '1.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    display: 'flex',
    gap: '1rem',
    alignItems: 'center'
  },
  cardIcon: {
    fontSize: '2.5rem'
  },
  cardContent: {
    flex: 1
  },
  cardTitle: {
    margin: '0 0 0.5rem 0',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#6b7280'
  },
  cardValue: {
    margin: '0 0 0.5rem 0',
    fontSize: '2rem',
    fontWeight: '700',
    color: '#111827'
  },
  cardLink: {
    color: '#2563eb',
    textDecoration: 'none',
    fontSize: '0.875rem',
    fontWeight: '500'
  },
  infoSection: {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    padding: '1.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  }
};
