// Exporta los partidos como archivo iCalendar para añadirlos al calendario del móvil.

import { addDays } from './data/util';
import type { MatchView } from './vm';

const esc = (s: string) => s.replace(/[\\;,]/g, m => '\\' + m).replace(/\n/g, '\\n');
const stamp = (date: string, time: string) => date.replace(/-/g, '') + 'T' + time.replace(':', '') + '00';

/** Duración del partido más un margen, usada como duración del evento. */
const DURATION_MIN = 120;

export const buildIcs = (matches: MatchView[]): string => {
  const now = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Convocat//FCF//ES', 'CALSCALE:GREGORIAN', 'X-WR-CALNAME:Convocat', 'X-WR-TIMEZONE:Europe/Madrid'];
  for (const m of matches) {
    const [h, mi] = m.time.split(':').map(Number);
    const end = new Date(2000, 0, 1, h, mi + DURATION_MIN);
    const endTime = String(end.getHours()).padStart(2, '0') + ':' + String(end.getMinutes()).padStart(2, '0');
    const endDate = end.getDate() > 1 ? addDays(m.date, 1) : m.date;
    lines.push(
      'BEGIN:VEVENT',
      'UID:' + m.id.replace(/:/g, '-') + '@convocat',
      'DTSTAMP:' + now,
      'DTSTART;TZID=Europe/Madrid:' + stamp(m.date, m.time),
      'DTEND;TZID=Europe/Madrid:' + stamp(endDate, endTime),
      'SUMMARY:' + esc(m.home + ' – ' + m.away),
      'LOCATION:' + esc(m.venue + ', ' + m.address),
      'DESCRIPTION:' + esc(m.comp + ' · J' + m.j + '\nConvocatoria ' + m.callTime),
      'END:VEVENT',
    );
  }
  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
};

export const downloadIcs = (matches: MatchView[]) => {
  const blob = new Blob([buildIcs(matches)], { type: 'text/calendar;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'convocat.ics';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
};
