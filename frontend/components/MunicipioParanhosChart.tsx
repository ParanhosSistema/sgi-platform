
// frontend/components/MunicipioParanhosChart.tsx
// Renderiza gráfico com votos do Paranhos por ano para um município
// Requer react-chartjs-2 e chart.js

"use client";

import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function MunicipioParanhosChart({ data }: { data: { ano: number, votos: number }[] }) {
  const labels = data.map(d => d.ano);
  const values = data.map(d => d.votos);

  return (
    <div style={{ width: "100%", maxWidth: 720 }}>
      <Bar
        data={{
          labels,
          datasets: [{
            label: 'Votos do Paranhos (Deputado Estadual)',
            data: values,
          }]
        }}
        options={{
          responsive: true,
          plugins: { legend: { position: 'top' as const }, title: { display: true, text: 'Votação por Ano' } },
          scales: { y: { beginAtZero: true } }
        }}
      />
    </div>
  );
}
