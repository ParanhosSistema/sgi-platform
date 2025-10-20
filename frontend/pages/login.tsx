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
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        setError('Credenciais inválidas');
        return;
      }
      const data = await res.json();
      localStorage.setItem('sgi_token', data.token);
      router.push('/dashboard');
    } catch {
      setError('Erro de rede');
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
