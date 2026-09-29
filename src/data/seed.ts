// Datos semilla de la temporada 2026-27 simulada de la FCF. Copiados tal cual del
// prototipo de Claude Design (project/Convocat App v2.dc.html) para que las ligas,
// calendarios y resultados generados coincidan exactamente con el diseño.

export type KindKey = 'f11s' | 'juv' | 'cad' | 'inf' | 'ale' | 'ben' | 'fem' | 'vet' | 'fs';
export type Section = 'Fútbol 11' | 'Fútbol base' | 'Femenino' | 'Veteranos' | 'Fútbol sala';
export interface Kind {
  mod: string; cat: string; section: Section; suf: string; size: number; mins: number; lam: number;
  start: string; times: string[]; friday?: boolean; futsal?: boolean;
}

export const TOWNS: string[] = ['Badalona','Sabadell','Terrassa','Mataró','Granollers','Manresa','Vic','Girona','Lleida','Tarragona','Reus','Figueres','Olot','Igualada','Vilanova','Sitges','Castelldefels','Gavà','Viladecans','Cornellà','Hospitalet','Esplugues','Sant Boi','Sant Feliu','Molins de Rei','Martorell','Rubí','Sant Cugat','Cerdanyola','Ripollet','Montcada','Barberà','Mollet','Parets','La Llagosta','Sant Adrià','Santa Coloma','Montgat','El Masnou','Premià','Vilassar','Arenys','Calella','Pineda','Malgrat','Blanes','Lloret','Palamós','Banyoles','Salt','Manlleu','Torelló','Berga','Solsona','Cervera','Tàrrega','Balaguer','Mollerussa','Valls','Cambrils','Salou','Amposta','Tortosa','El Vendrell','Calafell','Cubelles','Sant Sadurní','Vilafranca','Canovelles','Les Franqueses','Cardedeu','La Garriga','Caldes','Sant Celoni','Tordera','Sant Joan Despí','Sant Just','El Prat','Castellar','Sentmenat','Polinyà','Sant Quirze','Matadepera','Olesa','Esparreguera','Abrera','Corbera','Vallirana','Sants','Gràcia','Horta','Sarrià','Sant Andreu','Sant Martí','Poblenou','Guinardó','Les Corts','Carmel','Vallcarca','Sant Gervasi','Nou Barris','Trinitat','Verdum','Roquetes','La Marina','Besòs','Clot','Fort Pienc','Sagrada Família','Barceloneta','Raval','La Sagrera','Can Rull','La Florida','Montjuïc'];
export const PREF: string[] = ['CE','CF','UE','UD','FC','AE','CD','EF'];
export const FSPREF: string[] = ['FS','CFS','AE'];
export const FIRST: string[] = ['Marc','Pol','Arnau','Jordi','Oriol','Pau','Àlex','Sergi','Xavi','Dani','Adrià','Joan','Biel','Roger','Nil','Èric','Hugo','Iker','Martí','Jan','David','Carlos','Álvaro','Javi','Aleix','Guillem','Albert','Víctor','Rubén','Iván','Unai','Bruno'];
export const FIRSTF: string[] = ['Laia','Júlia','Paula','Marta','Aina','Clara','Ona','Carla','Noa','Irene','Berta','Lucía','Emma','Mar','Nerea','Alba','Sara','Ivet'];
export const LAST: string[] = ['Puig','Vidal','Soler','Ferrer','Martí','Serra','Font','Roca','Pujol','Casas','Mas','Riera','Vila','Costa','Bosch','Camps','Sala','Grau','García','López','Martínez','Sánchez','Romero','Navarro','Torres','Ruiz','Moreno','Gil','Ortega','Delgado','Prats','Comas'];
export const REFS: string[] = ['J. Pérez Soler','M. Vidal Roca','A. Serra Puig','D. López Mas','R. Font Casas','L. Martí Grau','S. Riera Vila'];
export const T11: string[] = ['09:00','10:30','11:00','12:00','12:30','16:00','16:30','17:00','18:00'];
export const KIND: Record<KindKey, Kind> = {
  f11s: { mod: 'Futbol 11', cat: 'Sénior', section: 'Fútbol 11', suf: '', size: 16, mins: 90, lam: 1.35, start: '2026-09-12', times: T11 },
  juv: { mod: 'Futbol 11', cat: 'Juvenil', section: 'Fútbol base', suf: ' Juvenil A', size: 16, mins: 90, lam: 1.5, start: '2026-09-19', times: ['09:00','10:30','11:30','12:30','16:00','17:30'] },
  cad: { mod: 'Futbol 11', cat: 'Cadet', section: 'Fútbol base', suf: ' Cadet A', size: 16, mins: 80, lam: 1.6, start: '2026-09-19', times: ['09:00','10:30','11:30','12:30','16:00'] },
  inf: { mod: 'Futbol 11', cat: 'Infantil', section: 'Fútbol base', suf: ' Infantil A', size: 16, mins: 70, lam: 1.8, start: '2026-09-19', times: ['09:00','10:00','11:00','12:00'] },
  ale: { mod: 'Futbol 7', cat: 'Aleví', section: 'Fútbol base', suf: ' Aleví A', size: 12, mins: 50, lam: 2.6, start: '2026-09-26', times: ['09:00','10:00','11:00','12:00'] },
  ben: { mod: 'Futbol 7', cat: 'Benjamí', section: 'Fútbol base', suf: ' Benjamí A', size: 12, mins: 50, lam: 3, start: '2026-09-26', times: ['09:00','10:00','11:00','12:00'] },
  fem: { mod: 'Futbol 11', cat: 'Femení', section: 'Femenino', suf: ' Femení', size: 14, mins: 90, lam: 1.5, start: '2026-09-12', times: ['11:00','12:00','16:00','17:00','18:30'] },
  vet: { mod: 'Futbol 7', cat: 'Veterans', section: 'Veteranos', suf: ' Veterans', size: 12, mins: 60, lam: 2.4, start: '2026-10-02', friday: true, times: ['21:00','21:30','22:00'] },
  fs: { mod: 'Futbol sala', cat: 'Sénior', section: 'Fútbol sala', suf: '', size: 16, mins: 40, lam: 3.2, start: '2026-09-12', futsal: true, times: ['17:00','18:00','18:30','19:00','20:00'] },
};
export const SPECS: [string, KindKey, number, string?][] = [['Primera Catalana','f11s',2],['Segona Catalana','f11s',4],['Tercera Catalana','f11s',10],['Quarta Catalana','f11s',3],['Juvenil Preferent','juv',2],['Juvenil Primera Divisió','juv',2],['Juvenil Segona Divisió','juv',2,' Juvenil B'],['Cadet Primera Divisió','cad',2],['Cadet Segona Divisió','cad',2,' Cadet B'],['Infantil Primera Divisió','inf',2],['Infantil Segona Divisió','inf',2,' Infantil B'],['Aleví Primera Divisió','ale',2],['Aleví Tercera Divisió','ale',2,' Aleví B'],['Benjamí Primera Divisió','ben',2],['Primera Divisió Femenina','fem',1],['Segona Divisió Femenina','fem',2],['Lliga Veterans F7','vet',2],['Segona Divisió FS','fs',1],['Tercera Divisió FS','fs',2]];
export const FIXED: Record<string, string[]> = {
  'Segona Catalana|4': ['UE Poble Sec','CE Júpiter B','AE Prat B','CF Besòs Batlló','UD Guinardó','CE Montañesa','CF Lloreda','UFB Jàbac','CE Carmel','UE Sant Andreu B','CF Vallcarca','CD La Sagrera','UE Clot','CE Europa C','CF Trinitat','AE Verdum'],
  'Tercera Divisió FS|2': ['FS Gràcia','CFS Sant Cugat','FS Montcada','AE Les Corts','CFS Sarrià','FS Badalona B','CE Vallvidrera','FS Horta','FS Sant Andreu','CFS Rubí','FS Cerdanyola','FS Ripollet','CFS Mollet','FS Poblenou','FS Esplugues','CFS Castellar'],
  'Lliga Veterans F7|1': ['CE Sants Veterans','CF Can Rull Veterans','UA Horta Veterans','CE Europa Veterans','UE Sant Andreu Veterans','CF La Florida Veterans','PB Sant Martí Veterans','CE Mercantil Veterans','UE Sants Veterans','CF Damm Veterans','CE Laietà Veterans','UFB Jàbac Veterans'],
};
export const SI_VENUE = { venue: 'Camp de Futbol Col·legi Sant Ignasi', addr: 'C/ del General Vives, 28-40 · Barcelona', surface: 'Césped artificial' };
export const INJECT: Record<string, string> = { 'segona-catalana-3': 'CE Sant Ignasi', 'tercera-catalana-10': 'CE Sant Ignasi B', 'juvenil-primera-divisio-2': 'CE Sant Ignasi Juvenil A', 'juvenil-segona-divisio-1': 'CE Sant Ignasi Juvenil B',
  'cadet-primera-divisio-1': 'CE Sant Ignasi Cadet A', 'cadet-segona-divisio-1': 'CE Sant Ignasi Cadet B', 'infantil-primera-divisio-1': 'CE Sant Ignasi Infantil A', 'infantil-segona-divisio-1': 'CE Sant Ignasi Infantil B',
  'alevi-primera-divisio-2': 'CE Sant Ignasi Aleví A', 'alevi-tercera-divisio-1': 'CE Sant Ignasi Aleví B', 'benjami-primera-divisio-1': 'CE Sant Ignasi Benjamí A' };
