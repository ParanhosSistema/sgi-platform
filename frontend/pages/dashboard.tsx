import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function Dashboard() {
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const t = localStorage.getItem('sgi_token');
    if (!t) router.replace('/login');
    else setReady(true);
  }, [router]);

  if (!ready) return null;

  return (
    <main style={{ padding: 20, fontFamily: 'system-ui' }}>
      <h1>Dashboard</h1>
      <p>Login OK. (Token armazenado no navegador)</p>
      <button onClick={() => { localStorage.removeItem('sgi_token'); router.push('/login'); }}>
        Sair
      </button>
    </main>
  );
}
