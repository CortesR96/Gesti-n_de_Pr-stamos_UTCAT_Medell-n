/* ============================================================
   Store – Gestión de Préstamos UT CAT Medellín (demo v5)
   Datos de demostración en localStorage. La interfaz y los correos
   están separados en email.js / app.js para poder migrar luego a
   Supabase sin reescribir las vistas.
   ============================================================ */

const KEY = 'prestamos-ut-db-v5';
const SESSION_KEY = 'prestamos-ut-session-v5';
const H = 3600e3;
const D = 864e5;
const CATS = ['Tecnología', 'Artes y Cultura', 'Deportes', 'Espacios'];
const ACTIVE = ['Aprobada', 'En préstamo'];

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const pad = n => String(n).padStart(4, '0');
const hash = s => [...String(s)].reduce((a, c) => a + c.charCodeAt(0), 0);
const ymd = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const dayPlus = n => ymd(new Date(Date.now() + n * D));
const nowStr = () => new Date().toISOString();

function fmt(iso) {
  if (!iso) return '—';
  const raw = String(iso).length > 10 ? String(iso).slice(0, 10) : String(iso);
  const d = new Date(raw + 'T00:00:00');
  return isNaN(d) ? String(iso) : d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
}
function fmtDT(date, time) { return `${fmt(date)}${time ? ' · ' + time : ''}`; }
function ago(t) {
  const m = Math.round((Date.now() - t) / 6e4);
  if (m < 1) return 'ahora';
  if (m < 60) return `hace ${m} min`;
  const h = Math.round(m / 60);
  if (h < 24) return `hace ${h} h`;
  return `hace ${Math.round(h / 24)} d`;
}
function av(seed, sz = 36) {
  const sk = ['#f1c9a5', '#d9a273', '#a8734a', '#f5d7bd', '#8a5a3b'];
  const hr = ['#2b1b14', '#141414', '#6b3a1f', '#3a2a22', '#a1121f'];
  const sh = ['#7a1230', '#141414', '#8a8a8a', '#5c0d24', '#444'];
  const n = Math.abs(Number(seed) || 0);
  const a = n % 5, b = (n * 3) % 5, c = (n * 2 + 1) % 5;
  return `<svg width="${sz}" height="${sz}" viewBox="0 0 40 40" style="border-radius:50%;flex:none"><rect width="40" height="40" fill="#efe6e8"/><path d="M5 40c2-9 9-11 15-11s13 2 15 11z" fill="${sh[c]}"/><rect x="17" y="24" width="6" height="6" fill="${sk[a]}"/><ellipse cx="20" cy="17" rx="8" ry="9" fill="${sk[a]}"/><path d="M11.5 16c0-8 5-10 9-10s8.5 2 8.5 10c-2-4-5-5-8.5-5s-6 1-9 5z" fill="${hr[b]}"/><circle cx="17" cy="18" r="1" fill="#222"/><circle cx="23" cy="18" r="1" fill="#222"/><path d="M17.5 22q2.5 2 5 0" stroke="#222" fill="none" stroke-width="1"/></svg>`;
}
const ROLE = { admin: 'Administrador', co: 'Coordinación', st: 'Estudiante', prof: 'Docente' };
const roleName = r => ROLE[r] || r;
const roleClass = r => r === 'admin' ? 'admin' : r === 'co' ? 'co' : r === 'prof' ? 'prof' : 'st';

/* ---------- Base de datos local ---------- */
function seed() {
  const now = Date.now();
  const users = [
    { id: 'u_admin', name: 'Administrador', email: 'admin@ut.edu.co', pass: 'admin2026', role: 'admin', doc: '', phone: '', program: 'Coordinación CAT Medellín', semester: null, groupId: null, course: '', active: true, createdAt: now, lastLogin: null },
    { id: 'u_co', name: 'Camila Ortiz', email: 'coordinacion.cat@ut.edu.co', pass: 'cat2026', role: 'co', doc: '1.098.765.433', phone: '301 234 5678', program: 'Coordinación CAT Medellín', semester: null, groupId: null, course: '', active: true, createdAt: now, lastLogin: null }
  ];
  const groups = [
    { id: 'g1', name: 'Semillero Arte Vivo', program: 'Licenciatura en Educación Artística', faculty: 'Facultad de Ciencias de la Educación', semester: 6, jornada: 'Diurna', period: '2026-2', members: 18, repId: null, active: true },
    { id: 'g2', name: 'Club de Robótica', program: 'Ingeniería de Sistemas', faculty: 'Facultad de Ciencias', semester: 4, jornada: 'Diurna', period: '2026-2', members: 22, repId: null, active: true },
    { id: 'g3', name: 'Grupo Deportivo UT', program: 'Licenciatura en Educación Física, Recreación y Deportes', faculty: 'Facultad de Ciencias de la Educación', semester: 3, jornada: 'Diurna', period: '2026-2', members: 30, repId: null, active: true },
    { id: 'g4', name: 'Coro Universitario', program: 'Licenciatura en Música', faculty: 'Facultad de Ciencias de la Educación', semester: 5, jornada: 'Diurna', period: '2026-2', members: 16, repId: null, active: true }
  ];
  const inv = [
    ['t1', 'Video beams', 'Tecnología', '📽️', 6, 0, 'TEC-VB-01', 'Almacén CAT', true],
    ['t2', 'Bafles', 'Tecnología', '🔊', 8, 0, 'TEC-BA-01', 'Almacén CAT', false],
    ['t3', 'Computadores', 'Tecnología', '💻', 12, 0, 'TEC-PC-01', 'Sala de cómputo', false],
    ['t4', 'Micrófonos', 'Tecnología', '🎤', 6, 1, 'TEC-MI-01', 'Almacén CAT', false],
    ['t5', 'Televisores', 'Tecnología', '📺', 4, 0, 'TEC-TV-01', 'Almacén CAT', false],
    ['t6', 'Cables HDMI y de audio', 'Tecnología', '🔌', 20, 0, 'TEC-CA-01', 'Almacén CAT', false],
    ['t7', 'Cámaras DSLR', 'Tecnología', '📷', 4, 1, 'TEC-CA-02', 'Almacén CAT', true],
    ['a1', 'Caballetes de pintura', 'Artes y Cultura', '🎨', 12, 0, 'ART-CA-01', 'Depósito de artes', false],
    ['a2', 'Faldas de danza', 'Artes y Cultura', '💃', 10, 0, 'ART-FA-01', 'Depósito de artes', false],
    ['a3', 'Tambores', 'Artes y Cultura', '🥁', 6, 0, 'ART-TA-01', 'Depósito de artes', false],
    ['a4', 'Maracas', 'Artes y Cultura', '🎶', 10, 0, 'ART-MA-01', 'Depósito de artes', false],
    ['a5', 'Guitarras acústicas', 'Artes y Cultura', '🎸', 8, 0, 'ART-GU-01', 'Depósito de artes', false],
    ['a6', 'Reflectores LED', 'Artes y Cultura', '💡', 14, 0, 'ART-RE-01', 'Depósito de artes', false],
    ['a7', 'Pianos digitales', 'Artes y Cultura', '🎹', 2, 0, 'ART-PI-01', 'Sala de música', false],
    ['d1', 'Balones de fútbol', 'Deportes', '⚽', 24, 0, 'DEP-BA-01', 'Depósito deportivo', false],
    ['d2', 'Balones de baloncesto', 'Deportes', '🏀', 12, 0, 'DEP-BA-02', 'Depósito deportivo', false],
    ['d3', 'Colchonetas', 'Deportes', '🧘', 20, 0, 'DEP-CO-01', 'Depósito deportivo', false],
    ['d4', 'Lazos para saltar', 'Deportes', '➰', 25, 0, 'DEP-LA-01', 'Depósito deportivo', false],
    ['d5', 'Mallas de voleibol', 'Deportes', '🏐', 4, 1, 'DEP-MA-01', 'Depósito deportivo', false],
    ['e1', 'Cancha de microfútbol', 'Espacios', '🥅', 1, 0, 'ESP-CM-01', 'Zona deportiva', false],
    ['e2', 'Cancha de voleibol', 'Espacios', '🏐', 1, 0, 'ESP-CV-01', 'Zona deportiva', false],
    ['e3', 'Coliseo', 'Espacios', '🏟️', 1, 0, 'ESP-CO-01', 'Bloque deportivo', true],
    ['e4', 'Aula múltiple', 'Espacios', '🎓', 1, 0, 'ESP-AM-01', 'Bloque académico', false],
    ['e5', 'Auditorio', 'Espacios', '🏛️', 1, 0, 'ESP-AU-01', 'Bloque central', true],
    ['e6', 'Piscina', 'Espacios', '🏊', 1, 1, 'ESP-PI-01', 'Zona deportiva', false]
  ].map(a => ({ id: a[0], name: a[1], cat: a[2], icon: a[3], total: a[4], broken: a[5], code: a[6], location: a[7], requiresAval: a[8] }));

  const reqs = [];
  const notifs = [];

  return {
    v: 5,
    seq: 0,
    users,
    groups,
    inv,
    reqs,
    notifs,
    emails: [],
    settings: {
      period: '2026-2',
      catName: 'CAT Medellín',
      demo: true,
      emailjs: { enabled: false, serviceId: '', templateId: '', publicKey: '', testTo: '' }
    },
    createdAt: now
  };
}

function migrate(d) {
  if (!d || d.v !== 5) return d;
  // La cuenta administradora es un usuario de sistema: no debe mostrar
  // el nombre personal de la persona que atendió la demo originalmente.
  const admin = d.users.find(u => u.id === 'u_admin' && u.email === 'admin@ut.edu.co');
  if (admin && admin.name === 'Laura Restrepo') {
    admin.name = 'Administrador';
    if (admin.doc === '1.098.765.432') admin.doc = '';
    if (admin.phone === '300 123 4567') admin.phone = '';
  }
  return d;
}
function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const d = JSON.parse(raw);
    return d && d.v === 5 ? migrate(d) : null;
  } catch (e) { return null; }
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { console.warn('No se pudo guardar la demo:', e); }
}

var db = load();
if (!db) { db = seed(); save(); }

/* ---------- Consultas y reglas de negocio ---------- */
const item = id => db.inv.find(i => i.id === id);
// Los elementos eliminados se conservan en la base para no perder el
// nombre en el historial, pero dejan de aparecer en inventario y catálogo.
const activeInv = () => db.inv.filter(i => !i.deletedAt);
const isActiveItem = i => !!i && !i.deletedAt;
const userById = id => db.users.find(u => u.id === id);
const groupById = id => db.groups.find(g => g.id === id);
const groupLabel = g => g ? `${g.name} · Semestre ${g.semester}${g.period ? ' · ' + g.period : ''}` : 'Sin grupo';
const byNew = (a, b) => b.created - a.created;
const staffUsers = () => db.users.filter(u => u.active && ['admin', 'co'].includes(u.role));
const coordinators = () => db.users.filter(u => u.active && u.role === 'co');
const studentUsers = () => db.users.filter(u => u.active && u.role === 'st');
const unreadCount = userId => db.notifs.filter(n => n.userId === userId && !n.read).length;

function reqStart(r) {
  const d = new Date(`${r.date}T${r.time || '00:00'}:00`);
  return isNaN(d) ? new Date(`${r.date}T00:00:00`) : d;
}
function reqEnd(r) {
  const d = new Date(`${r.ret}T${r.retTime || '23:59'}:00`);
  return isNaN(d) ? new Date(`${r.ret}T23:59:00`) : d;
}
function effectiveStart(r) {
  const scheduled = reqStart(r);
  if (r.status !== 'En préstamo') return scheduled;
  // Si la entrega se registra antes de la fecha solicitada, el material
  // ya está físicamente fuera y debe descontarse desde ese momento.
  const delivered = r.deliveredAt ? new Date(r.deliveredAt) : new Date();
  return delivered < scheduled ? delivered : scheduled;
}
function effectiveEnd(r) {
  const scheduled = reqEnd(r);
  if (r.status !== 'En préstamo') return scheduled;
  // Mientras no se registre la devolución, el préstamo sigue ocupando
  // inventario aunque la fecha prevista ya haya pasado.
  const now = new Date();
  return scheduled > now ? scheduled : now;
}
function overlaps(aS, aE, bS, bE) { return aS < bE && aE > bS; }

function outQ(itemId, start, end, excludeReqId) {
  const aS = start instanceof Date ? start : new Date(start);
  const aE = end instanceof Date ? end : new Date(end);
  return db.reqs
    .filter(r => r.id !== excludeReqId && ACTIVE.includes(r.status))
    .filter(r => overlaps(aS, aE, effectiveStart(r), effectiveEnd(r)))
    .reduce((s, r) => s + ((r.items.find(x => x[0] === itemId) || [0, 0])[1] || 0), 0);
}
function avail(itemId, start, end, excludeReqId) {
  const i = item(itemId);
  if (!i) return 0;
  const aS = start || new Date();
  const aE = end || new Date();
  return Math.max(0, i.total - i.broken - outQ(itemId, aS, aE, excludeReqId));
}
const availNow = itemId => avail(itemId, new Date(), new Date());

function itemState(i) {
  const a = availNow(i.id), o = outQ(i.id, new Date(), new Date());
  if (a === 0) return [i.cat === 'Espacios' ? 'Reservado' : 'Agotado', i.cat === 'Espacios' ? 'En-prestamo' : 'Rechazada'];
  if (i.total > 1 && a / i.total <= .25) return ['Inventario bajo', 'Pendiente'];
  if (i.broken > 0) return ['Con novedades', 'En-prestamo'];
  return ['Disponible', 'Aprobada'];
}

function itemsText(r) {
  return r.items.map(([id, q]) => {
    const i = item(id);
    if (!i) return 'Elemento eliminado';
    return i.cat === 'Espacios' ? i.name : `${q} × ${i.name}`;
  }).join(', ');
}

function itemsList(r) {
  return r.items.map(([id, q]) => {
    const i = item(id) || { name: 'Elemento eliminado', icon: '❔', cat: '' };
    return `<li><span class="thumb sm">${i.icon}</span><span><b>${esc(i.name)}</b><small>${i.cat === 'Espacios' ? 'Espacio' : q + ' unidad(es)'}</small></span></li>`;
  }).join('');
}

function notify(userId, kind, text, reqId) {
  if (!userById(userId)) return;
  db.notifs.unshift({ id: uid(), userId, kind, text, req: reqId || null, ts: Date.now(), read: false });
  db.notifs = db.notifs.slice(0, 300);
}
function markNotifRead(id) {
  const n = db.notifs.find(x => x.id === id);
  if (n) { n.read = true; save(); }
}
function markAllNotifs(userId) {
  db.notifs.forEach(n => { if (n.userId === userId) n.read = true; });
  save();
}
function hist(r, txt, by) {
  r.hist.push({ ts: Date.now(), txt, by: by || 'Coordinación CAT' });
}

function requestStats() {
  const all = db.reqs;
  const pending = all.filter(r => r.status === 'Pendiente').length;
  const active = all.filter(r => ACTIVE.includes(r.status)).length;
  const loaned = all.filter(r => r.status === 'En préstamo').length;
  const returned = all.filter(r => r.status === 'Devuelta').length;
  const materials = activeInv().filter(i => i.cat !== 'Espacios');
  const available = materials.reduce((s, i) => s + availNow(i.id), 0);
  const total = materials.reduce((s, i) => s + i.total - i.broken, 0);
  const broken = activeInv().reduce((s, i) => s + i.broken, 0);
  const emails = db.emails.length;
  const emailErrors = db.emails.filter(e => e.status === 'error').length;
  return { pending, active, loaned, returned, available, total, broken, emails, emailErrors };
}
