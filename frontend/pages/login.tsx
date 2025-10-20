import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    if (!API_URL) {
      setError('Erro: URL da API não configurada');
      console.error('NEXT_PUBLIC_API_URL não está definida');
      return;
    }

    console.log('Tentando fazer login em:', `${API_URL}/auth/login`);
    
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      console.log('Status da resposta:', res.status);
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('Erro na resposta:', errorData);
        setError(errorData.message || 'Credenciais inválidas');
        return;
      }
      
      const data = await res.json();
      console.log('Login bem-sucedido');
      
      if (!data.token) {
        setError('Erro: token não retornado');
        console.error('Token não encontrado na resposta');
        return;
      }
      
      localStorage.setItem('sgi_token', data.token);
      router.push('/dashboard');
    } catch (err) {
      console.error('Erro ao fazer login:', err);
      setError('Erro de conexão com o servidor');
    }
  };

  return (
    <main style={{ maxWidth: 420, margin: '60px auto', fontFamily: 'system-ui' }}>
      <h1>Login</h1>
      <form onSubmit={submit}>
        <label>E-mail</label>
        <input value={email} onChange={(e)=>setEmail(e.target.value)} style={{display:'block', width:'100%', marginBottom:10}} />
        <label>Senha</label>
        <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} style={{display:'block', width:'100%', marginBottom:10}} />
        <button type="submit">Entrar</button>
      </form>
      {error && <p style={{color:'red'}}>{error}</p>}
    </main>
  );
}
