/* ============================================================
   Gestión de Préstamos – UT CAT Medellín
   Prototipo FUNCIONAL: los datos viven en localStorage del navegador.
   - El estudiante arma y envía solicitudes.
   - Coordinación las aprueba / rechaza / entrega / recibe devolución.
   - Cada acción genera notificaciones para el otro rol.
   - Dos pestañas del mismo navegador se sincronizan en vivo.
   Más adelante, load()/save() se reemplazan por llamadas a una base de datos.
   ============================================================ */

const KEY = 'prestamos-ut-db-v1';
const BASETITLE = document.title;
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const pad = n => String(n).padStart(4, '0');
const ah = s => [...String(s)].reduce((a, c) => a + c.charCodeAt(0), 0) % 10;

/* ---------- Avatares e iconos ---------- */
function av(seed, sz = 36) {
  const sk = ['#f1c9a5','#d9a273','#a8734a','#f5d7bd','#8a5a3b'], hr = ['#2b1b14','#141414','#6b3a1f','#3a2a22','#a1121f'], sh = ['#7a1230','#141414','#8a8a8a','#5c0d24','#444'];
  const a = seed % 5, b = (seed * 3) % 5, c = (seed * 2 + 1) % 5;
  return `<svg width="${sz}" height="${sz}" viewBox="0 0 40 40" style="border-radius:50%;flex:none"><rect width="40" height="40" fill="#efe6e8"/><path d="M5 40c2-9 9-11 15-11s13 2 15 11z" fill="${sh[c]}"/><rect x="17" y="24" width="6" height="6" fill="${sk[a]}"/><ellipse cx="20" cy="17" rx="8" ry="9" fill="${sk[a]}"/><path d="M11.5 16c0-8 5-10 9-10s8.5 2 8.5 10c-2-4-5-5-8.5-5s-6 1-9 5z" fill="${hr[b]}"/><circle cx="17" cy="18" r="1" fill="#222"/><circle cx="23" cy="18" r="1" fill="#222"/><path d="M17.5 22q2.5 2 5 0" stroke="#222" fill="none" stroke-width="1"/></svg>`;
}
const P = {home:'M3 11l9-8 9 8v10H3zM9 21v-7h6v7',req:'M6 3h9l4 4v14H6zM9 12h7M9 16h7',inv:'M3 7l9-4 9 4v10l-9 4-9-4zM3 7l9 4 9-4M12 11v10',mat:'M4 8h16v12H4zM8 8V5h8v3',esp:'M3 21V9l9-6 9 6v12M9 21v-6h6v6',dev:'M4 12a8 8 0 1 0 3-6M4 4v4h4',rep:'M4 20V4M4 20h16M8 16v-5M12 16V8M16 16v-8',cfg:'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19 12l2-1-1-3-2 .5-1.5-1.5.5-2-3-1-1 2h-2l-1-2-3 1 .5 2L6 8.500 4 8l-1 3 2 1v2l-2 1 1 3 2-.5L7.500 19l-.5 2 3 1 1-2h2l1 2 3-1-.5-2 1.500-1.500 2 .5 1-3-2-1z'};
const NAV = [['home','Panel principal','dash'],['req','Solicitudes','reqs'],['inv','Inventario','inv'],['mat','Materiales','inv'],['esp','Espacios','inv'],['dev','Devoluciones','ret'],['rep','Reportes','ph'],['cfg','Configuración','cfg']];
const SNAV = [['home','Inicio','sdash'],['mat','Catálogo','scat'],['req','Mi solicitud','ssol'],['dev','Historial','shist']];
const CATS = ['Tecnología','Artes y Cultura','Deportes','Espacios'];
const USERS = {
  st: {name:'Valentina Cruz', short:'Valentina C.', sub:'Representante · Arte Vivo', seed:7},
  co: {name:'Laura Restrepo', short:'Laura R.', sub:'Coordinación CAT Medellín', seed:2}
};

/* ---------- Base de datos local ---------- */
function seed() {
  const H = 3600e3, now = Date.now();
  const inv = [
    ['t1','Video beams','Tecnología','📽️',6,0],['t2','Bafles','Tecnología','🔊',8,0],['t3','Computadores','Tecnología','💻',12,0],
    ['t4','Micrófonos','Tecnología','🎤',6,1],['t5','Televisores','Tecnología','📺',4,0],['t6','Cables HDMI y de audio','Tecnología','🔌',20,0],['t7','Cámaras DSLR','Tecnología','📷',4,1],
    ['a1','Caballetes de pintura','Artes y Cultura','🎨',12,0],['a2','Faldas de danza','Artes y Cultura','💃',10,0],['a3','Tambores','Artes y Cultura','🥁',6,0],
    ['a4','Maracas','Artes y Cultura','🎶',10,0],['a5','Guitarras acústicas','Artes y Cultura','🎸',8,0],['a6','Reflectores LED','Artes y Cultura','💡',14,0],['a7','Pianos digitales','Artes y Cultura','🎹',2,0],
    ['d1','Balones de fútbol','Deportes','⚽',24,0],['d2','Balones de baloncesto','Deportes','🏀',12,0],['d3','Colchonetas','Deportes','🧘',20,0],
    ['d4','Lazos para saltar','Deportes','➰',25,0],['d5','Mallas de voleibol','Deportes','🏐',4,1],
    ['e1','Cancha de microfútbol','Espacios','🥅',1,0],['e2','Cancha de voleibol','Espacios','🏐',1,0],['e3','Coliseo','Espacios','🏟️',1,0],
    ['e4','Aula múltiple','Espacios','🎓',1,0],['e5','Auditorio','Espacios','🏛️',1,0],['e6','Piscina','Espacios','🏊',1,1]
  ].map(a => ({id:a[0], name:a[1], cat:a[2], icon:a[3], total:a[4], broken:a[5]}));
  const COORD = 'Laura Restrepo';
  const R = (n, owner, name, role, group, act, date, time, ret, items, status, obs, note, ageH, hist) => ({
    id:'UT-2026-' + pad(n), owner, name, role, group, act, date, time, ret, items, status, obs, note,
    created: now - ageH * H,
    hist: hist.map(([t, txt, by]) => ({ts: now - t * H, txt, by: by || COORD}))
  });
  const reqs = [
    R(143,'x','Daniela Ríos','Estudiante · Ingeniería','Club de Robótica','Torneo interno','2026-10-05','08:00','2026-10-06',[['t3',4]],'Devuelta','','',264,[[264,'Solicitud creada','Daniela Ríos'],[260,'Aprobada por coordinación'],[240,'Entregada'],[216,'Devolución recibida']]),
    R(144,'x','Sebastián Arias','Estudiante · Artes escénicas','Grupo de Teatro','Ensayo general','2026-10-08','17:00','2026-10-09',[['a6',6]],'Rechazada','','Los reflectores se deben solicitar con 15 días de anticipación. Vuelve a enviarla con más tiempo.',200,[[200,'Solicitud creada','Sebastián Arias'],[190,'Rechazada por coordinación']]),
    R(145,'val','Valentina Cruz','Estudiante · Representante','Semillero Arte Vivo','Cierre de exposición','2026-10-09','15:00','2026-10-09',[['e2',1]],'Devuelta','','',216,[[216,'Solicitud creada','Valentina Cruz'],[210,'Aprobada por coordinación'],[190,'Entregada'],[170,'Devolución recibida']]),
    R(146,'val','Valentina Cruz','Estudiante · Representante','Semillero Arte Vivo','Taller de pintura','2026-10-13','09:00','2026-10-17',[['a1',6]],'En préstamo','','',140,[[140,'Solicitud creada','Valentina Cruz'],[130,'Aprobada por coordinación'],[72,'Entregada']]),
    R(147,'x','Julián Vélez','Estudiante · Música','Coro Universitario','Concierto de otoño','2026-10-14','16:00','2026-10-18',[['a7',1],['t4',3]],'En préstamo','','',120,[[120,'Solicitud creada','Julián Vélez'],[110,'Aprobada por coordinación'],[48,'Entregada']]),
    R(148,'x','Andrés Muñoz','Estudiante · Deporte','Grupo Deportivo UT','Torneo de bienvenida','2026-10-19','08:00','2026-10-20',[['d1',6]],'Aprobada','','',50,[[50,'Solicitud creada','Andrés Muñoz'],[30,'Aprobada por coordinación']]),
    R(149,'x','Prof. Marta Gil','Docente · Cine','Cátedra de Cine','Cineforo institucional','2026-10-22','18:00','2026-10-23',[['e5',1]],'Pendiente','Necesitamos el auditorio con 30 minutos de anticipación para pruebas de sonido.','',6,[[6,'Solicitud creada','Prof. Marta Gil']]),
    R(150,'x','Camila Ortiz Henao','Estudiante · Comunicación Social','Semillero Arte Vivo','Muestra cultural de bienvenida','2026-10-20','14:00','2026-10-21',[['t1',1],['t2',2],['t4',4]],'Pendiente','Necesitamos montaje desde la 1:00 p. m. Ya contamos con el aval de la dirección del programa.','',4,[[4,'Solicitud creada','Camila Ortiz Henao']]),
    R(151,'val','Valentina Cruz','Estudiante · Representante','Semillero Arte Vivo','Muestra cultural','2026-10-20','14:00','2026-10-21',[['t2',2]],'Pendiente','','',2,[[2,'Solicitud creada','Valentina Cruz']])
  ];
  const N = (to, kind, text, req, hrs, read) => ({id:uid(), to, kind, text, req, ts: now - hrs * H, read});
  const notifs = [
    N('co','new','Valentina Cruz (Semillero Arte Vivo) envió la solicitud UT-2026-0151','UT-2026-0151',2,false),
    N('co','new','Camila Ortiz Henao (Semillero Arte Vivo) envió la solicitud UT-2026-0150','UT-2026-0150',4,false),
    N('co','new','Prof. Marta Gil (Cátedra de Cine) envió la solicitud UT-2026-0149','UT-2026-0149',6,false),
    N('st','ok','Tu solicitud UT-2026-0146 fue aprobada','UT-2026-0146',130,true),
    N('st','info','Recuerda devolver los 6 caballetes de pintura mañana antes de las 12:00 m.','UT-2026-0146',3,false)
  ];
  return {v:1, seq:151, inv, reqs, notifs};
}
function load() {
  try { const r = localStorage.getItem(KEY); if (r) { const d = JSON.parse(r); if (d && d.v === 1) return d; } } catch (e) {}
  return null;
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) {} }
let db = load();
if (!db) { db = seed(); save(); }

/* ---------- Reglas de negocio ---------- */
const ACTIVE = ['Aprobada', 'En préstamo'];
const item = id => db.inv.find(i => i.id === id);
const outQ = id => db.reqs.filter(r => ACTIVE.includes(r.status)).reduce((s, r) => s + ((r.items.find(x => x[0] === id) || [0, 0])[1]), 0);
const avail = i => Math.max(0, i.total - i.broken - outQ(i.id));
const mine = () => db.reqs.filter(r => r.owner === 'val');
const pending = () => db.reqs.filter(r => r.status === 'Pendiente');
const byNew = (a, b) => b.created - a.created;
function fmt(iso) { if (!iso) return '—'; const d = new Date(iso + 'T00:00'); return isNaN(d) ? iso : d.toLocaleDateString('es-CO', {day:'2-digit', month:'short', year:'numeric'}); }
function ago(t) { const m = Math.round((Date.now() - t) / 6e4); if (m < 1) return 'ahora'; if (m < 60) return `hace ${m} min`; const h = Math.round(m / 60); if (h < 24) return `hace ${h} h`; return `hace ${Math.round(h / 24)} d`; }
function ymd(d) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
const dayPlus = n => ymd(new Date(Date.now() + n * 864e5));
const itemsText = r => r.items.map(([id, q]) => { const i = item(id); if (!i) return '?'; return i.cat === 'Espacios' ? i.name : `${q} × ${i.name}`; }).join(', ');
const tag = s => `<span class="tag ${s.replace(' ', '-')}">${s}</span>`;
function stt(i) {
  const a = avail(i);
  if (a > 0) return a <= 3 && i.total > 1 ? 'Pocas unidades' : 'Disponible';
  if (outQ(i.id) > 0) return i.cat === 'Espacios' ? 'Reservado' : 'Todo prestado';
  return 'No disponible';
}
const stc = {'Disponible':'Aprobada','Pocas unidades':'Pendiente','No disponible':'Rechazada','Reservado':'En-préstamo','Todo prestado':'En-préstamo'};
function istate(i) {
  const a = avail(i);
  if (a === 0) return ['Agotado', 'Rechazada'];
  if (i.total > 1 && a / i.total <= .25) return ['Inventario bajo', 'Pendiente'];
  if (i.broken > 0) return ['Con novedades', 'En-préstamo'];
  return ['Disponible', 'Aprobada'];
}
function notify(to, kind, text, req) {
  db.notifs.unshift({id: uid(), to, kind, text, req, ts: Date.now(), read: false});
  db.notifs = db.notifs.slice(0, 80);
}
const hist = (r, txt, by) => r.hist.push({ts: Date.now(), txt, by});

/* ---------- Estado de interfaz (por pestaña) ---------- */
let role = 'st', cur = 'sdash', cat = 'Todos', nm = 'Inicio', q = '', cart = {}, done = '', sel = '', rf = 'Todas';
let frm = {group:'Semillero Arte Vivo', act:'', date:dayPlus(2), time:'14:00', ret:dayPlus(3), obs:''};
try { const r = sessionStorage.getItem('ut-role'); if (r === 'co' || r === 'st') { role = r; cur = r === 'co' ? 'dash' : 'sdash'; nm = r === 'co' ? 'Panel principal' : 'Inicio'; } } catch (e) {}

/* ---------- Cromo: navegación, campana, avisos ---------- */
function nav() {
  const U = USERS[role], pc = pending().length;
  $('#nav').innerHTML = (role == 'co' ? NAV : SNAV).map(n => `<button class="${n[1] == nm ? 'on' : ''}" onclick="go('${n[2]}','${n[1]}')"><svg viewBox="0 0 24 24"><path d="${P[n[0]]}"/></svg>${n[1]}${role == 'co' && n[1] == 'Solicitudes' && pc ? `<em class="nbadge">${pc}</em>` : ''}</button>`).join('');
  $('#me').innerHTML = av(U.seed, 44) + `<div><b>${U.name}</b><small>${U.sub}</small></div>`;
  $('#prof').innerHTML = av(U.seed, 34) + `<span><b>${U.short}</b></span>`;
  $('#seg').innerHTML = [['st','Estudiante'],['co','Coordinación']].map(r => `<button class="${r[0] == role ? 'on' : ''}" onclick="setRole('${r[0]}')">${r[1]}</button>`).join('');
  $('#gs').placeholder = role == 'co' ? 'Buscar solicitudes, grupos, materiales…' : 'Buscar material o espacio…';
}
function tog() { $('#side').classList.toggle('open'); $('#scrim').classList.toggle('open'); }
function go(v, n, keepQ) {
  cur = v; if (n) nm = n; done = '';
  if (n == 'Materiales') cat = 'Tecnología'; else if (n == 'Espacios') cat = 'Espacios'; else if (n == 'Inventario' || n == 'Catálogo') cat = 'Todos';
  if (!keepQ) { q = ''; $('#gs').value = ''; }
  $('#np').hidden = true;
  nav(); renderBell(); render(); $('#side').classList.remove('open'); $('#scrim').classList.remove('open'); scrollTo(0, 0);
}
function setRole(r) {
  role = r; try { sessionStorage.setItem('ut-role', r); } catch (e) {}
  cat = 'Todos'; rf = 'Todas'; cart = {}; sel = '';
  go(r == 'co' ? 'dash' : 'sdash', r == 'co' ? 'Panel principal' : 'Inicio');
}
function gsearch(v) {
  q = v;
  if (role == 'co') { if (cur != 'reqs') go('reqs', 'Solicitudes', true); else render(); }
  else { if (cur != 'scat') go('scat', 'Catálogo', true); else $('#grid').innerHTML = grid(); }
}
const NI = {new:'📥', ok:'✅', no:'❌', info:'🔔'};
function renderBell() {
  const m = db.notifs.filter(n => n.to === role), u = m.filter(n => !n.read).length, b = $('#nb');
  b.textContent = u; b.hidden = !u;
  $('#np').innerHTML = `<div class="nh"><b>Notificaciones</b><button class="btn s" onclick="readAll()">Marcar leídas</button></div>` +
    (m.length ? m.slice(0, 15).map(n => `<button class="ni ${n.read ? '' : 'un'}" onclick="openN('${n.id}')"><span class="nic">${NI[n.kind] || '🔔'}</span><span><span class="nt">${esc(n.text)}</span><small>${ago(n.ts)}</small></span></button>`).join('') : '<p class="empty">Sin notificaciones.</p>');
  document.title = (u ? `(${u}) ` : '') + BASETITLE;
}
function toggleNP(e) { e.stopPropagation(); const p = $('#np'); renderBell(); p.hidden = !p.hidden; }
function readAll() { db.notifs.forEach(n => { if (n.to === role) n.read = true; }); save(); renderBell(); }
function openN(id) {
  const n = db.notifs.find(x => x.id === id); if (!n) return;
  n.read = true; save();
  if (role == 'co') { sel = n.req; go('det', 'Solicitudes'); } else go('shist', 'Historial');
  renderBell();
}
function toast(msg, kind = 'info') {
  const t = document.createElement('div'); t.className = 'toast ' + kind; t.setAttribute('role', 'status');
  t.innerHTML = `<span>${NI[kind] || '🔔'}</span><span>${esc(msg)}</span>`;
  const box = $('#toasts'); while (box.children.length >= 3) box.firstChild.remove();
  box.appendChild(t); setTimeout(() => t.classList.add('out'), 4200); setTimeout(() => t.remove(), 4600);
}
function openModal(html) { const m = $('#modal'); m.innerHTML = `<div class="mbox" role="dialog" aria-modal="true">${html}</div>`; m.hidden = false; const f = m.querySelector('input,select,textarea'); if (f) f.focus(); }
function closeModal() { $('#modal').hidden = true; $('#modal').innerHTML = ''; }
function commit() { save(); nav(); renderBell(); render(); }

/* ============================================================
   VISTAS – COORDINACIÓN
   ============================================================ */
function dash() {
  const pc = pending().length, act = db.reqs.filter(r => ACTIVE.includes(r.status)).length, lent = db.reqs.filter(r => r.status == 'En préstamo').length;
  const mats = db.inv.filter(i => i.cat != 'Espacios'), av_ = mats.reduce((s, i) => s + avail(i), 0), tot = mats.reduce((s, i) => s + i.total - i.broken, 0), broken = db.inv.reduce((s, i) => s + i.broken, 0);
  const k = [['Solicitudes pendientes', pc, 'Esperan tu decisión', '📋', pc > 0], ['Solicitudes activas', act, 'Aprobadas o en préstamo', '🔄'], ['Materiales disponibles', av_, `de ${tot} en servicio`, '📦'], ['Entregas por recibir', lent, 'Revisar estado físico', '✔️'], ['Novedades daño / pérdida', broken, 'Unidades fuera de servicio', '⚠️', broken > 0]];
  const c = CATS.map(n => [n, db.reqs.filter(r => !['Rechazada', 'Cancelada'].includes(r.status) && r.items.some(([id]) => (item(id) || {}).cat == n)).length]), mx = Math.max(1, ...c.map(x => x[1]));
  const rec = db.reqs.slice().sort(byNew).slice(0, 6);
  return `<div class="ph"><div><h1>Panel principal</h1><p>Resumen de la gestión de préstamos · ${new Date().toLocaleDateString('es-CO', {month:'long', year:'numeric'})}</p></div><button class="btn p" onclick="rf='Pendiente';go('reqs','Solicitudes')">+ Revisar pendientes</button></div>
<div class="banner"><div class="av">${[1,4,6,9].map(i => av(i, 40)).join('')}</div><div><b style="font:700 17px Georgia">Bienvenida, Laura</b><p>${pc ? `Tienes ${pc} solicitud${pc > 1 ? 'es' : ''} pendiente${pc > 1 ? 's' : ''} por responder.` : 'No tienes solicitudes pendientes. ¡Todo al día!'}</p></div></div>
<div class="grid5">${k.map(x => `<div class="card kpi ${x[4] ? 'alert' : ''}"><div class="ic">${x[3]}</div><small>${x[0]}</small><b>${x[1]}</b><span>${x[2]}</span></div>`).join('')}</div>
<div class="two"><div class="card"><h3>Solicitudes por categoría</h3><small style="color:var(--mut)">Sin contar rechazadas ni canceladas</small>
<div class="bars">${c.map(x => `<div><i style="height:${Math.max(3, x[1] / mx * 130)}px"></i>${x[1]}</div>`).join('')}</div><div class="lbl">${c.map(x => `<span>${x[0]}</span>`).join('')}</div></div>
<div class="card"><div class="ph" style="margin:0 0 8px"><h3>Solicitudes recientes</h3><button class="btn s" onclick="rf='Todas';go('reqs','Solicitudes')">Ver todas</button></div><div class="tw"><table><tr><th>Representante</th><th>Grupo</th><th>Material / Espacio</th><th>Uso</th><th>Estado</th><th></th></tr>
${rec.map(r => `<tr><td><div class="who">${av(ah(r.name), 30)}<b>${esc(r.name)}</b></div></td><td>${esc(r.group)}</td><td>${esc(itemsText(r))}</td><td>${fmt(r.date)}</td><td>${tag(r.status)}</td><td><button class="btn s ${r.status == 'Pendiente' ? 'p' : ''}" onclick="openReq('${r.id}')">${r.status == 'Pendiente' ? 'Revisar' : 'Ver'}</button></td></tr>`).join('')}</table></div></div></div>`;
}
function openReq(id) { sel = id; go('det', 'Solicitudes'); }
function reqs() {
  const fs = ['Todas', 'Pendiente', 'Aprobada', 'En préstamo', 'Devuelta', 'Rechazada', 'Cancelada'], s = q.toLowerCase();
  const rows = db.reqs.slice().sort(byNew).filter(r => (rf == 'Todas' || r.status == rf) && (!s || (r.id + ' ' + r.name + ' ' + r.group + ' ' + r.act + ' ' + itemsText(r)).toLowerCase().includes(s)));
  return `<div class="ph"><div><h1>Solicitudes</h1><p>Revisa, aprueba o rechaza las solicitudes de préstamo</p></div></div>
<div class="chips">${fs.map(f => `<button class="chip ${f == rf ? 'on' : ''}" onclick="rf='${f}';render()">${f}${f != 'Todas' ? ' (' + db.reqs.filter(r => r.status == f).length + ')' : ''}</button>`).join('')}</div>
<div class="card" style="margin-top:14px"><div class="tw"><table><tr><th>Solicitud</th><th>Representante</th><th>Grupo</th><th>Material / Espacio</th><th>Uso</th><th>Estado</th><th></th></tr>
${rows.map(r => `<tr><td><b>${r.id.slice(-4)}</b><small style="display:block;color:var(--mut)">${ago(r.created)}</small></td><td><div class="who">${av(ah(r.name), 30)}<b>${esc(r.name)}</b></div></td><td>${esc(r.group)}</td><td>${esc(itemsText(r))}</td><td>${fmt(r.date)}</td><td>${tag(r.status)}</td><td><button class="btn s ${r.status == 'Pendiente' ? 'p' : ''}" onclick="openReq('${r.id}')">${r.status == 'Pendiente' ? 'Revisar' : 'Ver'}</button></td></tr>`).join('') || '<tr><td colspan="7" class="empty">No hay solicitudes con este filtro.</td></tr>'}</table></div></div>`;
}
function det() {
  const r = db.reqs.find(x => x.id === sel);
  if (!r) { cur = 'reqs'; return reqs(); }
  const isP = r.status == 'Pendiente', short = r.items.some(([id, n]) => (item(id) ? n > avail(item(id)) : true));
  const lines = r.items.map(([id, n]) => {
    const i = item(id) || {name:'(eliminado)', icon:'❔', total:0, broken:0, cat:''}, a = item(id) ? avail(i) : 0;
    return `<tr><td><div class="who"><div class="thumb">${i.icon}</div>${esc(i.name)}</div></td><td>${n}</td>${isP ? `<td>${n <= a ? `<span class="avail ok">● Disponible (${a} libres)</span>` : `<span class="avail no">● Solo ${a} disponible${a == 1 ? '' : 's'}</span>`}</td>` : ''}</tr>`;
  }).join('');
  let dec;
  if (isP) dec = `<h3>Decisión</h3><p style="color:var(--mut);margin:6px 0 0">${short ? 'Hay elementos sin existencias suficientes. Ajusta la solicitud a lo disponible o recházala con un motivo.' : 'Hay existencias para todo lo solicitado. Puedes aprobar.'}</p>
<div class="acts" style="flex-direction:column"><button class="btn p" ${short ? 'disabled style="opacity:.5;cursor:not-allowed"' : ''} onclick="decide('${r.id}',true)">✓ Aprobar</button><button class="btn d" onclick="decide('${r.id}',false)">✕ Rechazar</button>${short ? `<button class="btn" onclick="fitReq('${r.id}')">✎ Ajustar a disponibilidad</button>` : ''}</div>`;
  else if (r.status == 'Aprobada') dec = `<h3>Siguiente paso</h3><p style="color:var(--mut);margin:6px 0 0">Las existencias ya están reservadas. Registra la entrega cuando el solicitante recoja el material.</p><div class="acts" style="flex-direction:column"><button class="btn p" onclick="deliver('${r.id}')">📦 Registrar entrega</button></div>`;
  else if (r.status == 'En préstamo') dec = `<h3>Siguiente paso</h3><p style="color:var(--mut);margin:6px 0 0">Devolución prevista el ${fmt(r.ret)}. Al recibirlo, verifica el estado físico.</p><div class="acts" style="flex-direction:column"><button class="btn p" onclick="returnReq('${r.id}')">↩ Registrar devolución</button></div>`;
  else dec = `<h3>Solicitud ${r.status.toLowerCase()}</h3><p style="color:var(--mut);margin:6px 0 0">Este trámite ya está cerrado.</p>`;
  return `<button class="crumb" onclick="go('reqs','Solicitudes')">← Solicitudes /</button>
<div class="ph"><div><h1>Solicitud #${r.id}</h1><p>Recibida ${ago(r.created)}</p></div>${tag(r.status)}</div>
<div class="dgrid"><div>
<div class="card" style="margin-bottom:14px"><h3 style="margin-bottom:12px">Representante y grupo</h3><div class="who" style="margin-bottom:14px">${av(ah(r.name), 56)}<div><b style="font-size:16px">${esc(r.name)}</b><small>${esc(r.role)}</small></div></div>
<div class="kv"><div><small>Grupo</small><b>${esc(r.group)}</b></div><div><small>Actividad</small><b>${esc(r.act)}</b></div><div><small>Fecha de uso</small><b>${fmt(r.date)} · ${esc(r.time)}</b></div><div><small>Devolución</small><b>${fmt(r.ret)}</b></div></div></div>
<div class="card" style="margin-bottom:14px"><h3 style="margin-bottom:8px">Materiales solicitados</h3><div class="tw"><table><tr><th>Material</th><th>Cant.</th>${isP ? '<th>Disponibilidad</th>' : ''}</tr>${lines}</table></div></div>
<div class="card"><h3 style="margin-bottom:8px">Observaciones</h3>${r.obs ? `<p style="margin:0 0 10px;color:var(--mut)">“${esc(r.obs)}”</p>` : '<p style="margin:0 0 10px;color:var(--mut)">El solicitante no dejó observaciones.</p>'}
${isP ? `<textarea id="obs" placeholder="Mensaje para el solicitante (obligatorio al rechazar; llegará en su notificación)…"></textarea>` : r.note ? `<div class="note"><small>Respuesta de coordinación</small><br>${esc(r.note)}</div>` : ''}</div>
</div><div>
<div class="card" style="margin-bottom:14px;border-color:var(--wine)">${dec}</div>
<div class="card"><h3 style="margin-bottom:12px">Historial</h3><div class="tl">${r.hist.map(h => `<p><b>${esc(h.txt)}</b><br><small style="color:var(--mut)">${ago(h.ts)} · ${esc(h.by)}</small></p>`).join('')}</div></div>
</div></div>`;
}
function decide(id, ok) {
  const r = db.reqs.find(x => x.id === id); if (!r || r.status != 'Pendiente') return;
  const note = ($('#obs') || {value:''}).value.trim();
  if (ok) {
    const bad = r.items.find(([i, n]) => !item(i) || n > avail(item(i)));
    if (bad) { toast('No hay existencias suficientes para aprobar.', 'no'); return; }
    r.status = 'Aprobada'; r.note = note; hist(r, 'Aprobada por coordinación', USERS.co.name);
    notify('st', 'ok', `Tu solicitud ${r.id} fue aprobada${note ? ': ' + note : '. Pasa a recoger el material en la fecha indicada.'}`, r.id);
    toast(`Solicitud ${r.id.slice(-4)} aprobada. El estudiante fue notificado.`, 'ok');
  } else {
    if (!note) { toast('Escribe el motivo del rechazo para el solicitante.', 'no'); const t = $('#obs'); if (t) t.focus(); return; }
    r.status = 'Rechazada'; r.note = note; hist(r, 'Rechazada por coordinación', USERS.co.name);
    notify('st', 'no', `Tu solicitud ${r.id} fue rechazada: ${note}`, r.id);
    toast(`Solicitud ${r.id.slice(-4)} rechazada. El estudiante fue notificado.`, 'no');
  }
  commit();
}
function fitReq(id) {
  const r = db.reqs.find(x => x.id === id); if (!r) return;
  const nu = r.items.map(([i, n]) => [i, Math.min(n, item(i) ? avail(item(i)) : 0)]).filter(x => x[1] > 0);
  if (!nu.length) { toast('No queda nada disponible; lo más adecuado es rechazarla.', 'no'); return; }
  r.items = nu; hist(r, 'Ajustada a la disponibilidad actual', USERS.co.name);
  notify('st', 'info', `Coordinación ajustó tu solicitud ${r.id} a la disponibilidad actual. Revisa los cambios.`, r.id);
  toast('Solicitud ajustada a lo disponible.', 'info'); commit();
}
function deliver(id) {
  const r = db.reqs.find(x => x.id === id); if (!r || r.status != 'Aprobada') return;
  r.status = 'En préstamo'; hist(r, 'Material entregado', USERS.co.name);
  notify('st', 'info', `Se registró la entrega de tu solicitud ${r.id}. Devuélvela el ${fmt(r.ret)}.`, r.id);
  toast('Entrega registrada.', 'ok'); commit();
}
function returnReq(id) {
  const r = db.reqs.find(x => x.id === id); if (!r || r.status != 'En préstamo') return;
  r.status = 'Devuelta'; hist(r, 'Devolución recibida', USERS.co.name);
  notify('st', 'ok', `Recibimos la devolución de tu solicitud ${r.id}. ¡Gracias!`, r.id);
  toast('Devolución registrada; las existencias volvieron al inventario.', 'ok'); commit();
}
function ret() {
  const rows = db.reqs.filter(r => ACTIVE.includes(r.status)).sort((a, b) => a.ret.localeCompare(b.ret));
  return `<div class="ph"><div><h1>Devoluciones</h1><p>Entregas pendientes y materiales en préstamo</p></div></div>
<div class="card"><div class="tw"><table><tr><th>Solicitud</th><th>Grupo</th><th>Material / Espacio</th><th>Devolver el</th><th>Estado</th><th></th></tr>
${rows.map(r => `<tr><td><b>${r.id.slice(-4)}</b><small style="display:block;color:var(--mut)">${esc(r.name)}</small></td><td>${esc(r.group)}</td><td>${esc(itemsText(r))}</td><td>${fmt(r.ret)}</td><td>${tag(r.status)}</td><td>${r.status == 'Aprobada' ? `<button class="btn s p" onclick="deliver('${r.id}')">Registrar entrega</button>` : `<button class="btn s p" onclick="returnReq('${r.id}')">Registrar devolución</button>`} <button class="btn s" onclick="openReq('${r.id}')">Ver</button></td></tr>`).join('') || '<tr><td colspan="6" class="empty">No hay entregas ni préstamos activos.</td></tr>'}</table></div></div>`;
}
function inv() {
  const cats = ['Todos', ...CATS], rows = db.inv.filter(r => cat == 'Todos' || r.cat == cat);
  const low = db.inv.filter(i => ['Inventario bajo', 'Agotado'].includes(istate(i)[0])).length, brk = db.inv.reduce((s, i) => s + i.broken, 0), lent = db.inv.reduce((s, i) => s + outQ(i.id), 0), zero = db.inv.filter(i => avail(i) == 0).length;
  return `<div class="ph"><div><h1>Inventario</h1><p>Control de existencias, préstamos y novedades · se actualiza solo con cada aprobación y devolución</p></div><button class="btn p" onclick="itemForm()">+ Agregar elemento</button></div>
<div class="chips">${cats.map(c => `<button class="chip ${c == cat ? 'on' : ''}" onclick="cat='${c}';render()">${c}</button>`).join('')}</div>
<div class="alerts"><div class="al w"><b>${low}</b>⚠ Con inventario bajo o agotado</div><div class="al b"><b>${brk}</b>🔧 Unidades fuera de servicio</div><div class="al m"><b>${lent}</b>📦 Unidades en préstamo / reservadas</div><div class="al i"><b>${zero}</b>🚫 Elementos sin disponibilidad</div></div>
<div class="card"><div class="tw"><table><tr><th>Elemento</th><th>Total</th><th>Disponible</th><th>Prestada</th><th>Fuera de servicio</th><th>Estado</th><th></th></tr>
${rows.map(r => { const a = avail(r), s = istate(r); return `<tr><td><div class="who"><div class="thumb">${r.icon}</div><div><b>${esc(r.name)}</b><small>${r.cat}</small></div></div></td><td>${r.total}</td><td><b>${a}</b><div class="meter"><i style="width:${r.total ? a / r.total * 100 : 0}%"></i></div></td><td>${outQ(r.id)}</td><td>${r.broken}</td><td><span class="tag ${s[1]}">${s[0]}</span></td><td><button class="btn s" onclick="itemForm('${r.id}')">✎ Editar</button></td></tr>`; }).join('')}</table></div></div>`;
}
function itemForm(id) {
  const i = id ? item(id) : null;
  openModal(`<h3>${i ? 'Editar elemento' : 'Agregar elemento'}</h3>
<div class="mform">${i ? `<p style="margin:0;color:var(--mut)">${i.icon} <b>${esc(i.name)}</b> · ${i.cat}</p>` : `<label>Nombre<input class="in" id="m_name" placeholder="Ej. Trípodes" maxlength="40"></label>
<label>Categoría<select class="in" id="m_cat">${CATS.map(c => `<option>${c}</option>`).join('')}</select></label>
<label>Icono (emoji)<input class="in" id="m_icon" value="📦" maxlength="4"></label>`}
<label>Cantidad total<input class="in" id="m_total" type="number" min="0" value="${i ? i.total : 1}"></label>
<label>Fuera de servicio (daño / pérdida)<input class="in" id="m_broken" type="number" min="0" value="${i ? i.broken : 0}"></label></div>
<div class="acts" style="justify-content:flex-end"><button class="btn" onclick="closeModal()">Cancelar</button><button class="btn p" onclick="saveItem('${id || ''}')">Guardar</button></div>`);
}
function saveItem(id) {
  const total = parseInt($('#m_total').value, 10), broken = parseInt($('#m_broken').value, 10);
  if (!(total >= 0) || !(broken >= 0) || broken > total) { toast('Revisa las cantidades: lo fuera de servicio no puede superar el total.', 'no'); return; }
  if (id) { const i = item(id); i.total = total; i.broken = broken; toast('Inventario actualizado.', 'ok'); }
  else {
    const name = $('#m_name').value.trim(); if (!name) { toast('Escribe el nombre del elemento.', 'no'); return; }
    db.inv.push({id: 'x' + uid(), name, cat: $('#m_cat').value, icon: $('#m_icon').value.trim() || '📦', total, broken}); toast('Elemento agregado.', 'ok');
  }
  closeModal(); commit();
}
function ph() { return `<div class="ph"><div><h1>${nm}</h1><p>Módulo disponible en la siguiente fase del prototipo.</p></div></div><div class="card" style="text-align:center;padding:48px">${av(5, 64)}<p style="color:var(--mut)">Esta sección aún no está construida.</p><button class="btn p" onclick="go('dash','Panel principal')">Volver al panel</button></div>`; }
function cfg() {
  return `<div class="ph"><div><h1>Configuración</h1><p>Opciones del prototipo</p></div></div>
<div class="card" style="max-width:640px"><h3 style="margin-bottom:8px">Datos de demostración</h3><p style="color:var(--mut);margin:0 0 12px">Las solicitudes, el inventario y las notificaciones se guardan en este navegador. Puedes volver al estado inicial cuando quieras (afecta también a la otra vista de esta app).</p><button class="btn d" onclick="resetDemo()">Restablecer datos de demostración</button></div>`;
}
function resetDemo() {
  if (!confirm('¿Borrar todo lo que hayas hecho y volver a los datos iniciales?')) return;
  db = seed(); cart = {}; sel = ''; save(); toast('Datos restablecidos.', 'info'); commit();
}

/* ============================================================
   VISTAS – ESTUDIANTE
   ============================================================ */
const nCart = () => Object.values(cart).reduce((a, b) => a + b, 0);
function add(id) { const i = item(id); if (!i) return; cart[id] = Math.min((cart[id] || 0) + 1, avail(i)); done = ''; render(); }
function chg(id, d) { const i = item(id); cart[id] = Math.max(0, Math.min(avail(i), cart[id] + d)); if (!cart[id]) delete cart[id]; render(); }
function grid() {
  const s = q.toLowerCase(), rows = db.inv.filter(c => (cat == 'Todos' || c.cat == cat) && c.name.toLowerCase().includes(s));
  return rows.map(c => {
    const e = stt(c), a = avail(c), ok = a > 0;
    return `<div class="card cc"><div class="thumb">${c.icon}</div><b>${esc(c.name)}</b><small>${c.cat} · ${a} de ${c.total} disponibles</small><span><span class="tag ${stc[e]}">${e}</span></span><button class="btn ${ok ? 'p' : ''} s" ${ok ? '' : 'disabled style="opacity:.5;cursor:not-allowed"'} onclick="add('${c.id}')">${ok ? '+ Agregar a solicitud' + (cart[c.id] ? ' (' + cart[c.id] + ')' : '') : 'No se puede solicitar'}</button></div>`;
  }).join('') || '<p style="color:var(--mut)">Sin resultados.</p>';
}
function sdash() {
  const my = mine().sort(byNew), n = s => my.filter(r => s.includes(r.status)).length;
  const t = db.inv.filter(c => c.cat != 'Espacios').reduce((s, c) => s + avail(c), 0);
  const k = [['Solicitudes activas', n(['Pendiente', 'Aprobada', 'En préstamo']), 'En trámite o en préstamo', '📋'], ['Solicitudes pendientes', n(['Pendiente']), 'Esperando coordinación', '⏳'], ['Por devolver', n(['En préstamo']), 'Material en tu poder', '⏰'], ['Materiales disponibles', t, 'En el catálogo', '📦']];
  const nextR = my.filter(r => r.status == 'En préstamo').sort((a, b) => a.ret.localeCompare(b.ret))[0];
  return `<div class="banner">${av(7, 56)}<div><b style="font:700 18px Georgia">Hola, Valentina.</b><p>Gestiona los préstamos de tu grupo.</p></div><button class="btn" style="margin-left:auto" onclick="go('scat','Catálogo')">Solicitar material</button></div>
${nextR ? `<div class="al w" style="margin-bottom:18px">⏰ <b style="display:inline;font-size:14px">Devolución próxima:</b> ${esc(itemsText(nextR))} · antes del ${fmt(nextR.ret)}.</div>` : ''}
<div class="g4">${k.map(x => `<div class="card kpi"><div class="ic">${x[3]}</div><small>${x[0]}</small><b>${x[1]}</b><span>${x[2]}</span></div>`).join('')}</div>
<div class="card"><div class="ph" style="margin:0 0 8px"><h3>Mis solicitudes</h3><button class="btn s" onclick="go('ssol','Mi solicitud')">Nueva solicitud</button></div><div class="tw"><table><tr><th>Solicitud</th><th>Fecha de uso</th><th>Estado</th></tr>${my.slice(0, 5).map(r => `<tr><td><b>${esc(itemsText(r))}</b><small style="display:block;color:var(--mut)">${esc(r.act)}</small></td><td>${fmt(r.date)}</td><td>${tag(r.status)}</td></tr>`).join('') || '<tr><td colspan="3" class="empty">Aún no has hecho solicitudes.</td></tr>'}</table></div></div>`;
}
function scat() {
  const cs = ['Todos', ...CATS];
  return `<div class="ph"><div><h1>Catálogo de préstamos</h1><p>Materiales, equipos y espacios del CAT Medellín</p></div></div>
<div class="search" style="max-width:none;margin-bottom:12px">🔍<input value="${esc(q)}" placeholder="Buscar material o espacio…" oninput="q=this.value;$('#gs').value=q;$('#grid').innerHTML=grid()"></div>
<div class="chips">${cs.map(c => `<button class="chip ${c == cat ? 'on' : ''}" onclick="cat='${c}';render()">${c}</button>`).join('')}</div>
${nCart() ? `<div class="cartbar"><span>🛒 ${nCart()} elemento(s) en tu solicitud</span><button class="btn p s" onclick="go('ssol','Mi solicitud')">Ver solicitud</button></div>` : ''}
<div class="cg" id="grid">${grid()}</div>`;
}
function ssol() {
  const it = Object.entries(cart);
  if (done) return `<div class="card" style="text-align:center;padding:40px"><div style="font-size:40px">✅</div><h2>Solicitud enviada</h2><p style="color:var(--mut)">Número <b>${done}</b>. Coordinación ya recibió una notificación; cuando la apruebe o rechace te llegará a la campana 🔔.</p><div class="acts" style="justify-content:center"><button class="btn p" onclick="go('shist','Historial')">Ver mi historial</button><button class="btn" onclick="go('sdash','Inicio')">Volver al inicio</button></div></div>`;
  return `<div class="ph"><div><h1>Mi solicitud</h1><p>Revisa los elementos y completa los datos de tu grupo</p></div></div>
<div class="dgrid"><div class="card"><h3 style="margin-bottom:8px">Elementos</h3>${it.length ? `<div class="tw"><table><tr><th>Elemento</th><th>Cantidad</th></tr>${it.map(([id, c]) => `<tr><td><div class="who"><div class="thumb">${item(id).icon}</div><b>${esc(item(id).name)}</b></div></td><td><div class="qty"><button onclick="chg('${id}',-1)" aria-label="Menos">−</button><b>${c}</b><button onclick="chg('${id}',1)" aria-label="Más">+</button></div></td></tr>`).join('')}</table></div>` : `<p style="color:var(--mut)">Aún no has agregado elementos.</p><button class="btn p" onclick="go('scat','Catálogo')">Ir al catálogo</button>`}</div>
<div class="card"><h3 style="margin-bottom:10px">Datos de la actividad</h3><div class="mform">
<label>Grupo<input class="in" value="${esc(frm.group)}" oninput="frm.group=this.value" maxlength="60"></label>
<label>Actividad<input class="in" placeholder="Ej. muestra cultural" value="${esc(frm.act)}" oninput="frm.act=this.value" maxlength="80"></label>
<label>Fecha de uso<input class="in" type="date" min="${ymd(new Date())}" value="${frm.date}" oninput="frm.date=this.value"></label>
<label>Hora<input class="in" type="time" value="${frm.time}" oninput="frm.time=this.value"></label>
<label>Fecha de devolución<input class="in" type="date" min="${ymd(new Date())}" value="${frm.ret}" oninput="frm.ret=this.value"></label>
<label>Observaciones<textarea placeholder="Montaje, aval docente, necesidades especiales…" oninput="frm.obs=this.value">${esc(frm.obs)}</textarea></label>
<button class="btn p" ${it.length ? '' : 'disabled style="opacity:.5"'} onclick="send()">Enviar solicitud</button></div></div></div>`;
}
function send() {
  if (!nCart()) return;
  const f = frm;
  if (!f.group.trim() || !f.act.trim()) { toast('Completa el grupo y la actividad.', 'no'); return; }
  if (!f.date || !f.ret || f.ret < f.date) { toast('Revisa las fechas: la devolución no puede ser anterior al uso.', 'no'); return; }
  const items = Object.entries(cart).filter(([id]) => item(id) && avail(item(id)) > 0).map(([id, n]) => [id, Math.min(n, avail(item(id)))]);
  if (!items.length) { toast('Esos elementos ya no están disponibles.', 'no'); return; }
  const id = 'UT-2026-' + pad(++db.seq), U = USERS.st;
  db.reqs.push({id, owner:'val', name:U.name, role:'Estudiante · Representante', group:f.group.trim(), act:f.act.trim(), date:f.date, time:f.time, ret:f.ret, items, status:'Pendiente', obs:f.obs.trim(), note:'', created:Date.now(), hist:[{ts:Date.now(), txt:'Solicitud creada', by:U.name}]});
  notify('co', 'new', `${U.name} (${f.group.trim()}) envió la solicitud ${id}`, id);
  cart = {}; frm = {group:f.group, act:'', date:dayPlus(2), time:'14:00', ret:dayPlus(3), obs:''};
  save(); done = id; nav(); renderBell(); render();
}
function shist() {
  const my = mine().sort(byNew);
  return `<div class="ph"><div><h1>Historial</h1><p>Todas las solicitudes de tu grupo y la respuesta de coordinación</p></div><button class="btn p" onclick="go('scat','Catálogo')">+ Nueva solicitud</button></div>
${my.map(r => `<div class="card" style="margin-bottom:14px"><div class="ph" style="margin:0 0 8px"><div><h3>${esc(r.act)}</h3><p>Solicitud ${r.id.slice(-4)} · ${esc(itemsText(r))}</p></div>${tag(r.status)}</div>
<div class="kv"><div><small>Fecha de uso</small><b>${fmt(r.date)} · ${esc(r.time)}</b></div><div><small>Devolución</small><b>${fmt(r.ret)}</b></div></div>
${r.note ? `<div class="note" style="margin-top:12px"><small>${r.status == 'Rechazada' ? 'Motivo del rechazo' : 'Mensaje de coordinación'}</small><br>${esc(r.note)}</div>` : ''}
<div class="tl" style="margin-top:14px">${r.hist.map(h => `<p><b>${esc(h.txt)}</b> <small style="color:var(--mut)">· ${ago(h.ts)}</small></p>`).join('')}</div>
${r.status == 'Pendiente' ? `<div class="acts"><button class="btn d s" onclick="cancelReq('${r.id}')">Cancelar solicitud</button></div>` : ''}</div>`).join('') || '<div class="card empty">Aún no has hecho solicitudes.</div>'}`;
}
function cancelReq(id) {
  const r = db.reqs.find(x => x.id === id); if (!r || r.status != 'Pendiente') return;
  if (!confirm('¿Cancelar esta solicitud?')) return;
  r.status = 'Cancelada'; hist(r, 'Cancelada por el solicitante', r.name);
  notify('co', 'info', `${r.name} canceló la solicitud ${r.id}`, r.id);
  toast('Solicitud cancelada.', 'info'); commit();
}

/* ---------- Render y sincronización ---------- */
function render() { $('#view').innerHTML = {dash, reqs, det, inv, ret, ph, cfg, sdash, scat, ssol, shist}[cur](); }

// Sincroniza otra pestaña/ventana del mismo navegador en vivo
window.addEventListener('storage', e => {
  if (e.key !== KEY) return;
  const old = db, nd = load(); if (!nd) return;
  db = nd;
  const seen = new Set(old.notifs.map(n => n.id));
  db.notifs.filter(n => n.to === role && !seen.has(n.id)).reverse().forEach(n => toast(n.text, n.kind));
  nav(); renderBell();
  const a = document.activeElement;
  if (!(a && /INPUT|TEXTAREA|SELECT/.test(a.tagName))) render();
});
document.addEventListener('click', e => { if (!e.target.closest('.bellwrap')) $('#np').hidden = true; });
document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeModal(); $('#np').hidden = true; } });
$('#modal').addEventListener('click', e => { if (e.target.id === 'modal') closeModal(); });
setInterval(() => { renderBell(); }, 60000);

$('#date').textContent = new Date().toLocaleDateString('es-CO', {weekday:'long', day:'numeric', month:'long', year:'numeric'});
nav(); renderBell(); render();
