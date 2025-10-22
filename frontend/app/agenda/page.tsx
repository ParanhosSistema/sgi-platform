import { apiFetch } from "../lib/api";
import AgendaClient from "./AgendaClient";

type Evento = {
  id: string;
  title: string;
  start: string;
  end: string;
  location?: string;
  htmlLink?: string;
  description?: string;
};

type AgendaResponse = {
  eventos: Evento[];
};

export default async function AgendaPage() {
  let eventos: Evento[] = [];
  let error: string | null = null;

  try {
    const data = await apiFetch<AgendaResponse>('/agenda');
    eventos = data.eventos || [];
  } catch (err) {
    error = (err as Error).message;
    console.error('Erro ao carregar agenda:', err);
  }

  // Fallback: se houver erro, renderizar com array vazio
  return <AgendaClient initialEventos={error ? [] : eventos} />;
}
