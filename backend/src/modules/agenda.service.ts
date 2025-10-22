import { Injectable } from '@nestjs/common';
import { google, calendar_v3 } from 'googleapis';

@Injectable()
export class AgendaService {
  private calendar: calendar_v3.Calendar;

  constructor() {
    const oAuth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'https://paranhospr.com.br/api/auth/callback/google', // redirect URI
    );

    // Set refresh token para OAuth2
    oAuth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });

    this.calendar = google.calendar({ version: 'v3', auth: oAuth2Client });
  }

  async getProximosEventos() {
    try {
      const calendarId = process.env.CALENDAR_ID || 'primary';
      const now = new Date().toISOString();

      const response = await this.calendar.events.list({
        calendarId,
        timeMin: now,
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime',
      });

      const eventos = (response.data.items || []).map((item) => ({
        id: item.id,
        title: item.summary,
        start: item.start?.dateTime || item.start?.date,
        end: item.end?.dateTime || item.end?.date,
        location: item.location || '',
        htmlLink: item.htmlLink || '',
        description: item.description || '',
      }));

      return { eventos };
    } catch (error) {
      console.error('Erro ao buscar eventos do Google Calendar:', error);
      throw new Error('Falha ao buscar eventos do calendário');
    }
  }
}
