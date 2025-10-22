
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

interface Municipio {
  id: string;
  nome: string;
  codigo_ibge?: string;
  ibgeCode?: string;  // Campo da API
  populacao?: number;
  territorio_id?: string;
  territorio?: {  // Objeto da API
    id: string;
    nome: string;
  };
  createdAt?: string;
}

interface Territorio {
  id: string;
  nome: string;
}

export default function Municipios() {
  const [ready, setReady] = useState(false);
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [territorios, setTerritorios] = useState<Territorio[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ nome: '', codigo_ibge: '', populacao: '', territorio_id: '' });
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('sgi_token');
    if (!token) {
      router.replace('/login');
      return;
    }
    setReady(true);
    loadData(token);
  }, [router]);

  const loadData = async (token: string) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
      
      const [municipiosRes, territoriosRes] = await Promise.all([
        fetch(`${API_URL}/municipios`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/territorios`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (municipiosRes.ok) {
        const data = await municipiosRes.json();
        setMunicipios(Array.isArray(data) ? data : []);
      }

      if (territoriosRes.ok) {
        const data = await territoriosRes.json();
        setTerritorios(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('sgi_token');
    if (!token) return;

    const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
    const url = editingId ? `${API_URL}/municipios/${editingId}` : `${API_URL}/municipios`;
    const method = editingId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          nome: formData.nome,
          codigo_ibge: formData.codigo_ibge || undefined,
          populacao: formData.populacao ? parseInt(formData.populacao) : undefined,
          territorio_id: formData.territorio_id || undefined
        })
      });

      if (res.ok) {
        setShowForm(false);
        setEditingId(null);
        setFormData({ nome: '', codigo_ibge: '', populacao: '', territorio_id: '' });
        loadData(token);
      } else {
        alert('Erro ao salvar município');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao salvar município');
    }
  };

  const handleEdit = (municipio: Municipio) => {
    setEditingId(municipio.id);
    setFormData({
      nome: municipio.nome,
      codigo_ibge: municipio.ibgeCode || municipio.codigo_ibge || '',
      populacao: municipio.populacao ? municipio.populacao.toString() : '',
      territorio_id: municipio.territorio?.id || municipio.territorio_id || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este município?')) return;

    const token = localStorage.getItem('sgi_token');
    if (!token) return;

    const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

    try {
      const res = await fetch(`${API_URL}/municipios/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        loadData(token);
      } else {
        alert('Erro ao excluir município');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao excluir município');
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
        <h1 style={styles.title}>SGI Platform - Municípios</h1>
        <button onClick={handleLogout} style={styles.logoutBtn}>Sair</button>
      </header>

      <nav style={styles.nav}>
        <Link href="/dashboard" style={styles.navLink}>📊 Dashboard</Link>
        <Link href="/dashboard/municipios" style={{ ...styles.navLink, backgroundColor: '#e0e7ff' }}>
          🏛️ Municípios
        </Link>
        <Link href="/dashboard/territorios" style={styles.navLink}>🗺️ Territórios</Link>
        <Link href="/dashboard/usuarios" style={styles.navLink}>👥 Usuários</Link>
      </nav>

      <main style={styles.main}>
        <div style={styles.pageHeader}>
          <h2 style={styles.subtitle}>Municípios</h2>
          <button 
            onClick={() => {
              setShowForm(true);
              setEditingId(null);
              setFormData({ nome: '', codigo_ibge: '', populacao: '', territorio_id: '' });
            }} 
            style={styles.primaryBtn}
          >
            + Novo Município
          </button>
        </div>

        {showForm && (
          <div style={styles.formCard}>
            <h3>{editingId ? 'Editar Município' : 'Novo Município'}</h3>
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Nome *</label>
                <input
                  type="text"
                  required
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Código IBGE</label>
                <input
                  type="text"
                  value={formData.codigo_ibge}
                  onChange={(e) => setFormData({ ...formData, codigo_ibge: e.target.value })}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>População</label>
                <input
                  type="number"
                  value={formData.populacao}
                  onChange={(e) => setFormData({ ...formData, populacao: e.target.value })}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Território</label>
                <select
                  value={formData.territorio_id}
                  onChange={(e) => setFormData({ ...formData, territorio_id: e.target.value })}
                  style={styles.input}
                >
                  <option value="">Selecione...</option>
                  {territorios.map((t) => (
                    <option key={t.id} value={t.id}>{t.nome}</option>
                  ))}
                </select>
              </div>

              <div style={styles.formActions}>
                <button type="submit" style={styles.primaryBtn}>Salvar</button>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({ nome: '', codigo_ibge: '', populacao: '', territorio_id: '' });
                  }}
                  style={styles.secondaryBtn}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <p>Carregando...</p>
        ) : (
          <div style={styles.tableCard}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Nome</th>
                  <th style={styles.th}>Código IBGE</th>
                  <th style={styles.th}>População</th>
                  <th style={styles.th}>Território</th>
                  <th style={styles.th}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {municipios.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ ...styles.td, textAlign: 'center' }}>
                      Nenhum município cadastrado
                    </td>
                  </tr>
                ) : (
                  municipios.map((m) => (
                    <tr key={m.id}>
                      <td style={styles.td}>{m.nome}</td>
                      <td style={styles.td}>{m.ibgeCode || m.codigo_ibge || '-'}</td>
                      <td style={styles.td}>{m.populacao?.toLocaleString('pt-BR') || '-'}</td>
                      <td style={styles.td}>
                        {m.territorio?.nome || territorios.find(t => t.id === m.territorio_id)?.nome || '-'}
                      </td>
                      <td style={styles.td}>
                        <button onClick={() => handleEdit(m)} style={styles.editBtn}>Editar</button>
                        <button onClick={() => handleDelete(m.id)} style={styles.deleteBtn}>Excluir</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
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
    transition: 'background-color 0.2s'
  },
  main: {
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem'
  },
  subtitle: {
    fontSize: '1.875rem',
    fontWeight: '700',
    margin: 0,
    color: '#111827'
  },
  primaryBtn: {
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    padding: '0.625rem 1.25rem',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '1rem'
  },
  secondaryBtn: {
    backgroundColor: '#e5e7eb',
    color: '#374151',
    border: 'none',
    padding: '0.625rem 1.25rem',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '1rem'
  },
  formCard: {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    padding: '1.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    marginBottom: '2rem'
  },
  form: {
    display: 'grid',
    gap: '1rem',
    marginTop: '1rem'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  label: {
    fontWeight: '500',
    color: '#374151',
    fontSize: '0.875rem'
  },
  input: {
    padding: '0.5rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    fontSize: '1rem'
  },
  formActions: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1rem'
  },
  tableCard: {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  th: {
    backgroundColor: '#f9fafb',
    padding: '0.75rem 1rem',
    textAlign: 'left',
    fontWeight: '600',
    fontSize: '0.75rem',
    color: '#6b7280',
    textTransform: 'uppercase',
    borderBottom: '1px solid #e5e7eb'
  },
  td: {
    padding: '1rem',
    borderBottom: '1px solid #e5e7eb',
    color: '#111827'
  },
  editBtn: {
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    padding: '0.375rem 0.75rem',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
    marginRight: '0.5rem'
  },
  deleteBtn: {
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    padding: '0.375rem 0.75rem',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontSize: '0.875rem'
  }
};
