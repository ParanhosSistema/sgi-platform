'use client';

import { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { format } from 'date-fns';

type Evento = {
  id: string;
  title: string;
  start: string;
  end: string;
  location?: string;
  htmlLink?: string;
  description?: string;
};

export default function AgendaClient({ initialEventos }: { initialEventos: Evento[] }) {
  const [eventos, setEventos] = useState<Evento[]>(initialEventos);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  // Função para atualizar eventos
  const fetchEventos = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://sgi-platform-backend.onrender.com';
      const res = await fetch(`${apiUrl}/agenda`);
      if (!res.ok) throw new Error('Falha ao carregar eventos');
      const data = await res.json();
      setEventos(data.eventos || []);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Preparar eventos para FullCalendar
  const calendarEvents = eventos.map((e) => ({
    id: e.id,
    title: e.title,
    start: e.start,
    end: e.end,
    url: e.htmlLink,
  }));

  return (
    <div style={{ maxWidth: 1200, margin: '40px auto', padding: '0 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1>Agenda de Leonaldo Paranhos</h1>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => setViewMode('calendar')}
            style={{
              padding: '8px 16px',
              background: viewMode === 'calendar' ? '#007bff' : '#f0f0f0',
              color: viewMode === 'calendar' ? '#fff' : '#333',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            📅 Calendário
          </button>
          <button
            onClick={() => setViewMode('list')}
            style={{
              padding: '8px 16px',
              background: viewMode === 'list' ? '#007bff' : '#f0f0f0',
              color: viewMode === 'list' ? '#fff' : '#333',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            📋 Lista
          </button>
          <button
            onClick={fetchEventos}
            disabled={loading}
            style={{
              padding: '8px 16px',
              background: loading ? '#ccc' : '#28a745',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? '⏳ Carregando...' : '🔄 Atualizar'}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: 16, background: '#f8d7da', color: '#721c24', borderRadius: 4, marginBottom: 16 }}>
          ⚠️ {error}
        </div>
      )}

      {viewMode === 'calendar' ? (
        <div style={{ background: '#fff', borderRadius: 8, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay',
            }}
            events={calendarEvents}
            eventClick={(info) => {
              if (info.event.url) {
                window.open(info.event.url, '_blank');
                info.jsEvent.preventDefault();
              }
            }}
            locale="pt-br"
            height="auto"
            buttonText={{
              today: 'Hoje',
              month: 'Mês',
              week: 'Semana',
              day: 'Dia',
            }}
          />
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 8, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          {eventos.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#999', padding: 40 }}>
              Nenhum evento agendado nos próximos dias.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {eventos.map((evento) => (
                <div
                  key={evento.id}
                  style={{
                    border: '1px solid #e0e0e0',
                    borderRadius: 8,
                    padding: 16,
                    transition: 'box-shadow 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                  }}
                >
                  <h3 style={{ margin: '0 0 8px 0', fontSize: 20 }}>{evento.title}</h3>
                  <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>
                    📅 <strong>Início:</strong> {format(new Date(evento.start), "dd/MM/yyyy HH:mm")}
                    <br />
                    📅 <strong>Fim:</strong> {format(new Date(evento.end), "dd/MM/yyyy HH:mm")}
                  </div>
                  {evento.location && (
                    <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>
                      📍 <strong>Local:</strong> {evento.location}
                    </div>
                  )}
                  {evento.description && (
                    <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>
                      ℹ️ {evento.description}
                    </div>
                  )}
                  {evento.htmlLink && (
                    <a
                      href={evento.htmlLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-block',
                        marginTop: 8,
                        padding: '6px 12px',
                        background: '#007bff',
                        color: '#fff',
                        textDecoration: 'none',
                        borderRadius: 4,
                        fontSize: 13,
                      }}
                    >
                      📆 Adicionar ao Google Calendar
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
