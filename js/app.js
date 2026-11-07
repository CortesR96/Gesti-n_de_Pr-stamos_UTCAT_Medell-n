/* ============================================================
   Núcleo de interfaz – demo v5
   Login por correo institucional, navegación por roles, correos,
   notificaciones y utilidades compartidas.
   Las vistas están en views-staff.js / views-student.js.
   ============================================================ */

const BASE_TITLE = document.title;
const PROGRAMAS = [
  'Licenciatura en Educación Artística',
  'Ingeniería de Sistemas',
  'Licenciatura en Educación Física, Recreación y Deportes',
  'Comunicación Social y Periodismo',
  'Licenciatura en Cine y Audiovisuales',
  'Licenciatura en Música',
  'Administración de Empresas',
  'Contaduría Pública',
  'Derecho',
  'Psicología'
];

const P = {
  home: 'M3 11l9-8 9 8v10H3zM9 21v-7h6v7',
  req: 'M6 3h9l4 4v14H6zM9 12h7M9 16h7',
  inv: 'M3 7l9-4 9 4v10l-9 4-9-4zM3 7l9 4 9-4M12 11v10',
  dev: 'M4 12a8 8 0 1 0 3-6M4 4v4h4',
  users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  groups: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  mail: 'M4 4h16v16H4zM4 6l8 7 8-7',
  rep: 'M4 20V4M4 20h16M8 16v-5M12 16V8M16 16v-8',
  cfg: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19 12l2-1-1-3-2 .5-1.5-1.5.5-2-3-1-1 2h-2l-1-2-3 1 .5 2L6 8.5 4 8l-1 3 2 1v2l-2 1 1 3 2-.5L7.5 19l-.5 2 3 1 1-2h2l1 2 3-1-.5-2 1.5-1.5 2 .5 1-3-2-1z',
  cat: 'M4 8h16v12H4zM8 8V5h8v3',
  sol: 'M12 5v14M5 12h14',
  hist: 'M3 12a9 9 0 1 0 3-6M3 4v4h4M12 7v5l3 2'
};

const NAV_ADMIN = [
  ['home', 'Panel principal', 'dash'], ['req', 'Solicitudes', 'reqs'], ['inv', 'Inventario', 'inv'],
  ['dev', 'Devoluciones', 'ret'], ['users', 'Usuarios', 'users'], ['groups', 'Grupos', 'groups'],
  ['mail', 'Correos', 'emails'], ['rep', 'Reportes', 'reports'], ['cfg', 'Configuración', 'cfg']
];
const NAV_CO = [
  ['home', 'Panel principal', 'dash'], ['req', 'Solicitudes', 'reqs'], ['inv', 'Inventario', 'inv'],
  ['dev', 'Devoluciones', 'ret'], ['mail', 'Correos', 'emails'], ['rep', 'Reportes', 'reports']
];
const NAV_STUDENT = [
  ['home', 'Inicio', 'sdash'], ['cat', 'Catálogo', 'scat'], ['sol', 'Mi solicitud', 'ssol'], ['hist', 'Historial', 'shist']
];
const VIEW_NAME = {
  dash: 'Panel principal', reqs: 'Solicitudes', det: 'Solicitudes', inv: 'Inventario', ret: 'Devoluciones',
  users: 'Usuarios', groups: 'Grupos', emails: 'Correos', reports: 'Reportes', cfg: 'Configuración',
  profile: 'Mi perfil', sdash: 'Inicio', scat: 'Catálogo', ssol: 'Mi solicitud', shist: 'Historial'
};
const NI = { new: '📥', ok: '✅', no: '❌', info: '🔔' };

var me = null;
var cur = 'dash';
var nm = 'Panel principal';
var cat = 'Todos';
var q = '';
var cart = {};
var done = '';
var sel = '';
var rf = 'Todas';
var uf = 'Todos';
var us = 'Todos';
var ef = 'Todos';
var eq = '';
var frm = { act: '', date: dayPlus(2), time: '14:00', ret: dayPlus(3), retTime: '18:00', obs: '', aval: '', course: '' };

const isStaff = () => me && ['admin', 'co'].includes(me.role);
const isAdmin = () => me && me.role === 'admin';
const defaultView = u => ['admin', 'co'].includes(u.role) ? 'dash' : 'sdash';
const defaultName = v => VIEW_NAME[v] || 'Inicio';
const myReqs = () => me ? db.reqs.filter(r => r.ownerId === me.id).sort(byNew) : [];
const emailCountForReq = id => db.emails.filter(e => e.reqId === id).length;
const initFrm = () => ({ act: '', date: dayPlus(2), time: '14:00', ret: dayPlus(3), retTime: '18:00', obs: '', aval: '', course: me && me.role === 'prof' ? (me.course || '') : '' });

function setDate() {
  const el = $('#date');
  if (el) el.textContent = new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}
const tag = s => `<span class="tag ${String(s).replace(/\s+/g, '-')}">${esc(s)}</span>`;
const roleBadge = r => `<span class="rolebadge ${roleClass(r)}">${roleName(r)}</span>`;
const userSub = u => {
  if (!u) return '';
  if (u.role === 'st') { const g = groupById(u.groupId); return g ? `${g.name} · Sem ${g.semester}` : 'Sin grupo asignado'; }
  if (u.role === 'prof') return u.course || u.program || 'Docente';
  return u.program || roleName(u.role);
};
function permissions() {
  if (!me) return [];
  if (me.role === 'admin') return ['dash', 'reqs', 'det', 'inv', 'ret', 'users', 'groups', 'emails', 'reports', 'cfg', 'profile'];
  if (me.role === 'co') return ['dash', 'reqs', 'det', 'inv', 'ret', 'emails', 'reports', 'profile'];
  return ['sdash', 'scat', 'ssol', 'shist', 'profile'];
}
const canView = v => permissions().includes(v);

/* ---------- Login ---------- */
function showLogin() {
  document.body.classList.add('locked');
  const L = $('#login');
  L.hidden = false;
  $('#np').hidden = true;
  $('#side').classList.remove('open');
  $('#scrim').classList.remove('open');
  closeModal();
  document.title = BASE_TITLE;
  const demo = [
    ['Admin', 'admin@ut.edu.co', 'admin2026', 'u_admin'],
    ['Coordinación', 'coordinacion.cat@ut.edu.co', 'cat2026', 'u_co']
  ];
  L.innerHTML = `<div class="lbox lwide">
    <section class="lhero">
      <div class="lhero-top"><img class="lhero-logo" src="icons/logo-ut.png" alt="Logosímbolo Universidad del Tolima" onerror="this.remove()"><div><b>Universidad del Tolima</b><small>IDEAD · CAT Medellín</small></div></div>
      <h1>Préstamo de materiales y espacios</h1>
      <p>Solicita, aprueba y controla los recursos del CAT desde un solo lugar.</p>
      <ul class="lpoints">
        <li><span>📚</span> Catálogo de materiales, equipos y espacios</li>
        <li><span>👥</span> Grupos, representantes y docentes</li>
        <li><span>✉️</span> Notificaciones por correo institucional</li>
        <li><span>📊</span> Trazabilidad y reportes para coordinación</li>
      </ul>
      <div class="lhero-foot">Prototipo académico · Los datos se guardan en este navegador</div>
    </section>
    <section class="lformside">
      <h2>Ingresa con tu correo institucional</h2>
      <p class="lsub">Usa la cuenta que te asignó la coordinación del CAT.</p>
      <form class="lform" onsubmit="doLogin(event)">
        <label>Correo institucional
          <input class="in" id="lu" type="email" placeholder="nombre.apellido@ut.edu.co" autocomplete="username" autocapitalize="none" spellcheck="false">
        </label>
        <label>Contraseña
          <span class="pw"><input class="in" id="lp" type="password" placeholder="••••••••" autocomplete="current-password"><button type="button" onclick="togglePw()" aria-label="Mostrar u ocultar contraseña">👁</button></span>
        </label>
        <div class="lerr" id="lerr" role="alert" hidden></div>
        <button class="btn p" type="submit">Ingresar</button>
        <p class="lhint">¿Olvidaste tu contraseña? Contacta al administrador del sistema.</p>
      </form>
      <div class="ldemo">
        <b>Acceso rápido para la demostración</b>
        <div class="lquick">${demo.map(([label, email, pass, id]) => `<button type="button" onclick="demoLogin('${id}')"><b>${label}</b><small>${email}</small></button>`).join('')}</div>
        <small>Los correos y contraseñas son de demostración y se pueden ver en el código.</small>
      </div>
      <div class="llegal"><a href="https://www.ut.edu.co" target="_blank" rel="noopener">www.ut.edu.co</a> · Prototipo académico</div>
    </section>
  </div>`;
  const u = $('#lu');
  if (u) setTimeout(() => u.focus(), 50);
}
function showLoginError(msg) {
  const m = $('#lerr');
  if (!m) { toast(msg, 'no'); return; }
  m.textContent = msg;
  m.hidden = false;
}
function togglePw() {
  const i = $('#lp');
  if (i) i.type = i.type === 'password' ? 'text' : 'password';
}
function doLogin(e) {
  e.preventDefault();
  const email = ($('#lu').value || '').trim().toLowerCase();
  const pass = $('#lp').value || '';
  if (!email || !pass) { showLoginError('Escribe tu correo y contraseña.'); return; }
  const u = db.users.find(x => x.email.toLowerCase() === email);
  if (!u || u.pass !== pass) { showLoginError('Correo o contraseña incorrectos.'); return; }
  if (!u.active) { showLoginError('Tu cuenta está desactivada. Contacta al administrador del sistema.'); return; }
  me = u;
  sessionStorage.setItem(SESSION_KEY, u.id);
  u.lastLogin = Date.now();
  save();
  enterApp(true);
}
function demoLogin(id) {
  const u = userById(id);
  if (!u) { showLoginError('El usuario de demostración no existe. Restablece los datos.'); return; }
  if (!u.active) { showLoginError('Ese usuario de demostración está desactivado.'); return; }
  me = u;
  sessionStorage.setItem(SESSION_KEY, u.id);
  u.lastLogin = Date.now();
  save();
  enterApp(true);
}
function enterApp(welcome) {
  document.body.classList.remove('locked');
  const L = $('#login');
  L.hidden = true;
  L.innerHTML = '';
  me = userById(me.id) || me;
  cur = defaultView(me);
  nm = defaultName(cur);
  cat = 'Todos'; q = ''; rf = 'Todas'; uf = 'Todos'; us = 'Todos'; ef = 'Todos'; eq = '';
  cart = {}; done = ''; sel = '';
  frm = initFrm();
  nav(); renderBell(); render();
  const gs = $('#gs');
  if (gs) { gs.value = ''; gs.placeholder = isStaff() ? 'Buscar solicitudes, usuarios, correos…' : 'Buscar material o espacio…'; }
  if (welcome) toast(`Bienvenido/a, ${me.name.split(' ')[0]}.`, 'ok');
}
function logout() {
  sessionStorage.removeItem(SESSION_KEY);
  me = null;
  cart = {}; done = ''; sel = '';
  cur = 'dash'; nm = 'Panel principal';
  showLogin();
}

/* ---------- Navegación ---------- */
function nav() {
  if (!me) return;
  const items = me.role === 'admin' ? NAV_ADMIN : me.role === 'co' ? NAV_CO : NAV_STUDENT;
  const pc = db.reqs.filter(r => r.status === 'Pendiente').length;
  $('#nav').innerHTML = items.map(n => {
    const active = n[2] === cur || (cur === 'det' && n[2] === 'reqs');
    const badge = (n[2] === 'reqs' && isStaff() && pc) ? `<em class="nbadge">${pc}</em>` : '';
    return `<button class="${active ? 'on' : ''}" onclick="go('${n[2]}','${n[1]}')"><svg viewBox="0 0 24 24"><path d="${P[n[0]]}"/></svg><span>${n[1]}</span>${badge}</button>`;
  }).join('');
  $('#me').innerHTML = `${av(hash(me.email), 44)}<div><b>${esc(me.name)}</b><small>${esc(userSub(me))}</small></div>`;
  $('#prof').innerHTML = `<button class="btn s profbtn" onclick="go('profile','Mi perfil')">${av(hash(me.email), 28)}<span>${esc(me.name.split(' ')[0])}</span></button><button class="btn s plogout" onclick="logout()" title="Cerrar sesión">Salir</button>`;
  const seg = $('#seg');
  if (seg) seg.innerHTML = '<span class="demobadge">Modo demo</span>';
  const gs = $('#gs');
  if (gs) gs.placeholder = isStaff() ? 'Buscar solicitudes, usuarios, correos…' : 'Buscar material o espacio…';
}
function tog() {
  $('#side').classList.toggle('open');
  $('#scrim').classList.toggle('open');
}
function closeSide() {
  $('#side').classList.remove('open');
  $('#scrim').classList.remove('open');
}
function go(v, n, keepQ) {
  if (!me) return;
  if (!canView(v)) { toast('No tienes permiso para esta sección.', 'no'); return; }
  cur = v;
  nm = n || defaultName(v);
  if (!keepQ) { q = ''; const gs = $('#gs'); if (gs) gs.value = ''; }
  if (v === 'reqs' && !keepQ) rf = 'Todas';
  if (v === 'users' && !keepQ) { uf = 'Todos'; us = 'Todos'; }
  if (v === 'emails' && !keepQ) { ef = 'Todos'; eq = ''; }
  if (v === 'inv' || v === 'scat') cat = 'Todos';
  if (v !== 'ssol') done = '';
  $('#np').hidden = true;
  closeSide();
  nav(); renderBell(); render();
  scrollTo(0, 0);
}
function gsearch(v) {
  q = v;
  if (!me) return;
  if (isStaff()) {
    if (!['reqs', 'emails', 'users', 'groups'].includes(cur)) { cur = 'reqs'; nm = 'Solicitudes'; nav(); }
  } else if (!['scat', 'shist'].includes(cur)) {
    cur = 'scat'; nm = 'Catálogo'; nav();
  }
  render();
}
function render() {
  const map = { dash, reqs, det, inv, ret, users, groups, emails, reports, cfg, profile, sdash, scat, ssol, shist };
  const fn = map[cur] || (me && isStaff() ? dash : sdash);
  $('#view').innerHTML = fn ? fn() : '';
}

/* ---------- Notificaciones y avisos ---------- */
function renderBell() {
  if (!me) return;
  const list = db.notifs.filter(n => n.userId === me.id).sort((a, b) => b.ts - a.ts);
  const unread = list.filter(n => !n.read).length;
  const b = $('#nb');
  if (b) { b.textContent = unread > 9 ? '9+' : unread; b.hidden = !unread; }
  const p = $('#np');
  if (p) {
    p.innerHTML = `<div class="nh"><b>Notificaciones</b><button class="btn s" onclick="readAllNotifs()">Marcar leídas</button></div>` +
      (list.length ? list.slice(0, 18).map(n => `<button class="ni ${n.read ? '' : 'un'}" onclick="openN('${n.id}')"><span class="nic">${NI[n.kind] || '🔔'}</span><span><span class="nt">${esc(n.text)}</span><small>${ago(n.ts)}</small></span></button>`).join('') : '<p class="empty">Sin notificaciones.</p>');
  }
  document.title = (unread ? `(${unread}) ` : '') + BASE_TITLE;
}
function toggleNP(e) {
  e.stopPropagation();
  const p = $('#np');
  renderBell();
  p.hidden = !p.hidden;
}
function readAllNotifs() {
  markAllNotifs(me.id);
  renderBell();
}
function openN(id) {
  const n = db.notifs.find(x => x.id === id);
  if (!n) return;
  n.read = true;
  save();
  renderBell();
  const r = n.req ? db.reqs.find(x => x.id === n.req) : null;
  if (isStaff() && r) { openReq(r.id); return; }
  go('shist', 'Historial');
}
function toast(msg, kind = 'info') {
  const t = document.createElement('div');
  t.className = 'toast ' + kind;
  t.setAttribute('role', 'status');
  t.innerHTML = `<span>${NI[kind] || '🔔'}</span><span>${esc(msg)}</span>`;
  const box = $('#toasts');
  while (box.children.length >= 3) box.firstChild.remove();
  box.appendChild(t);
  setTimeout(() => t.classList.add('out'), 4200);
  setTimeout(() => t.remove(), 4600);
}

/* ---------- Modales ---------- */
function openModal(html, wide) {
  const m = $('#modal');
  m.innerHTML = `<div class="mbox ${wide ? 'wide' : ''}" role="dialog" aria-modal="true">${html}</div>`;
  m.hidden = false;
  const f = m.querySelector('input,select,textarea,button');
  if (f) f.focus();
}
function closeModal() {
  const m = $('#modal');
  if (!m) return;
  m.hidden = true;
  m.innerHTML = '';
}
function commit() {
  save();
  nav();
  renderBell();
  render();
}

/* ---------- Correos ---------- */
function templateLabel(t) {
  return ({
    invitacion: 'Invitación', solicitud_recibida: 'Solicitud recibida', nueva_solicitud: 'Nueva solicitud',
    aprobacion: 'Aprobación', rechazo: 'Rechazo', ajuste: 'Ajuste', entrega: 'Entrega',
    devolucion: 'Devolución', cancelacion: 'Cancelación', reset_password: 'Contraseña',
    prueba: 'Prueba'
  })[t] || t || 'Correo';
}
function emailStatusTag(s) {
  const map = { simulado: 'Simulado', pendiente: 'Pendiente', enviado: 'Enviado', error: 'Error' };
  return `<span class="estado ${s}">${map[s] || s}</span>`;
}
function emails() {
  const cfg = db.settings.emailjs || {};
  const list = db.emails.filter(e =>
    (ef === 'Todos' || e.status === ef) &&
    (!eq || e.reqId === eq) &&
    (!q || (e.to + ' ' + e.toName + ' ' + e.subject + ' ' + templateLabel(e.template) + ' ' + (e.reqId || '')).toLowerCase().includes(q.toLowerCase()))
  );
  const count = s => db.emails.filter(e => e.status === s).length;
  return `<div class="ph"><div><h1>Correos</h1><p>Bandeja de notificaciones del sistema · ${db.emails.length} mensaje(s)</p></div><button class="btn" onclick="emailSettings()">⚙ Configurar envío real</button></div>
  <div class="${cfg.enabled ? 'al i' : 'al w'} mailbanner">${cfg.enabled ? '✉️ Envío real activo con EmailJS. Los correos que fallen quedarán marcados como error.' : '🧪 Modo demostración: los correos se registran en esta bandeja y no salen a internet. Configura EmailJS para enviarlos de verdad.'}</div>
  <div class="alerts"><div class="al m"><b>${db.emails.length}</b>Total en bandeja</div><div class="al i"><b>${count('simulado')}</b>Simulados</div><div class="al w"><b>${count('pendiente')}</b>Pendientes</div><div class="al b"><b>${count('error')}</b>Con error</div></div>
  ${eq ? `<div class="filterNote">Mostrando correos de la solicitud <b>${esc(eq)}</b> <button class="btn s" onclick="eq='';render()">Quitar filtro</button></div>` : ''}
  <div class="chips">${['Todos', 'simulado', 'pendiente', 'enviado', 'error'].map(f => `<button class="chip ${ef === f ? 'on' : ''}" onclick="ef='${f}';render()">${f === 'Todos' ? 'Todos' : emailStatusTag(f)}</button>`).join('')}</div>
  <div class="card" style="margin-top:14px"><div class="tw"><table><tr><th>Fecha</th><th>Destinatario</th><th>Asunto</th><th>Plantilla</th><th>Estado</th><th></th></tr>
  ${list.map(e => `<tr><td>${ago(e.ts)}</td><td><b>${esc(e.toName || e.to)}</b><small class="block mut">${esc(e.to)}</small></td><td><b>${esc(e.subject)}</b>${e.reqId ? `<small class="block mut">${esc(e.reqId)}</small>` : ''}</td><td>${esc(templateLabel(e.template))}</td><td>${emailStatusTag(e.status)}${e.error ? `<small class="block errtext">${esc(e.error)}</small>` : ''}</td><td class="actions"><button class="btn s" onclick="openEmail('${e.id}')">Ver</button><button class="btn s" onclick="resendEmail('${e.id}')">Reenviar</button><a class="btn s" href="${esc(mailtoHref(e))}">Cliente</a></td></tr>`).join('') || `<tr><td colspan="6" class="empty">No hay correos con este filtro.</td></tr>`}</table></div></div>`;
}
function openEmail(id) {
  const e = db.emails.find(x => x.id === id);
  if (!e) return;
  if (!isStaff() && (!me || e.to.toLowerCase() !== me.email.toLowerCase())) { toast('No puedes abrir este correo.', 'no'); return; }
  openModal(`<div class="mailhead"><div><h3>${esc(e.subject)}</h3><small>${esc(templateLabel(e.template))} · ${new Date(e.ts).toLocaleString('es-CO')}</small></div>${emailStatusTag(e.status)}</div>
  <div class="mailmeta"><div><small>De</small><b>${esc(e.from)}</b></div><div><small>Para</small><b>${esc(e.toName || e.to)} &lt;${esc(e.to)}&gt;</b></div>${e.reqId ? `<div><small>Solicitud</small><b>${esc(e.reqId)}</b></div>` : ''}</div>
  ${e.error ? `<div class="note errtext" style="margin:10px 0">${esc(e.error)}</div>` : ''}
  <div class="mailview">${e.html}</div>
  <div class="acts" style="justify-content:flex-end"><a class="btn" href="${esc(mailtoHref(e))}">Abrir en cliente de correo</a><button class="btn" onclick="resendEmail('${e.id}')">Reenviar</button><button class="btn p" onclick="closeModal()">Cerrar</button></div>`, true);
}
async function resendEmail(id) {
  const e = db.emails.find(x => x.id === id);
  if (!e) return;
  const copy = await queueEmail({
    to: e.to, toName: e.toName,
    tpl: { subject: e.subject, html: e.html, text: e.text, template: e.template },
    reqId: e.reqId
  });
  if (copy) { openEmail(copy.id); toast('Correo reenviado a la bandeja.', 'ok'); }
}
function myEmails(reqId) {
  if (!me) return;
  const list = db.emails.filter(e => e.to.toLowerCase() === me.email.toLowerCase() && (!reqId || e.reqId === reqId));
  openModal(`<h3>Mis correos${reqId ? ' · ' + esc(reqId) : ''}</h3><p class="mut" style="margin:4px 0 12px">Notificaciones enviadas a ${esc(me.email)}</p>
  <div class="maillist">${list.map(e => `<button class="mailrow" onclick="openEmail('${e.id}')"><span><b>${esc(e.subject)}</b><small>${new Date(e.ts).toLocaleString('es-CO')} · ${templateLabel(e.template)}</small></span>${emailStatusTag(e.status)}</button>`).join('') || '<p class="empty">Todavía no hay correos para esta solicitud.</p>'}</div>
  <div class="acts" style="justify-content:flex-end"><button class="btn" onclick="closeModal()">Cerrar</button></div>`, true);
}
function emailSettings() {
  if (!isStaff()) { toast('Solo administración y coordinación pueden configurar correos.', 'no'); return; }
  const c = db.settings.emailjs || {};
  openModal(`<h3>Configuración de correo real</h3>
  <p class="mut" style="margin:4px 0 10px">Por defecto los correos quedan en la bandeja local. Para enviarlos de verdad crea una cuenta gratuita en <a href="https://www.emailjs.com" target="_blank" rel="noopener">EmailJS</a>, conecta un servicio de correo y usa una plantilla con las variables <code>{{to_email}}</code>, <code>{{subject}}</code>, <code>{{message}}</code> y <code>{{from_name}}</code>.</p>
  <div class="mform">
    <label class="checkline"><input type="checkbox" id="ej_enabled" ${c.enabled ? 'checked' : ''}> Activar envío real con EmailJS</label>
    <label>Service ID<input class="in" id="ej_service" value="${esc(c.serviceId || '')}" placeholder="service_xxxxxxx"></label>
    <label>Template ID<input class="in" id="ej_tpl" value="${esc(c.templateId || '')}" placeholder="template_xxxxxxx"></label>
    <label>Public Key<input class="in" id="ej_key" value="${esc(c.publicKey || '')}" placeholder="Clave pública de la cuenta"></label>
    <label>Correo de prueba<input class="in" id="ej_test" type="email" value="${esc(c.testTo || me.email)}" placeholder="tu-correo@ejemplo.com"></label>
  </div>
  <div class="note">Si no configuras EmailJS, el demo sigue funcionando: cada acción genera un correo visible en la bandeja y en “Mis correos”.</div>
  <div class="acts" style="justify-content:flex-end"><button class="btn" onclick="testEmail()">Enviar prueba</button><button class="btn" onclick="closeModal()">Cancelar</button><button class="btn p" onclick="saveEmailSettings(true)">Guardar</button></div>`, true);
}
function saveEmailSettings(close) {
  const enabled = !!$('#ej_enabled').checked;
  const serviceId = $('#ej_service').value.trim();
  const templateId = $('#ej_tpl').value.trim();
  const publicKey = $('#ej_key').value.trim();
  const testTo = $('#ej_test').value.trim();
  if (enabled && (!serviceId || !templateId || !publicKey)) {
    toast('Para activar el envío real completa Service ID, Template ID y Public Key.', 'no');
    return false;
  }
  db.settings.emailjs = { enabled, serviceId, templateId, publicKey, testTo };
  save();
  if (close) { closeModal(); toast(enabled ? 'Envío real activado.' : 'Envío simulado activo.', 'ok'); if (cur === 'emails' || cur === 'cfg') render(); }
  return true;
}
async function testEmail() {
  const to = ($('#ej_test').value || '').trim();
  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) { toast('Escribe un correo de prueba válido.', 'no'); return; }
  if (!saveEmailSettings(false)) return;
  const em = await queueEmail({ to, toName: 'Prueba', tpl: tplTest(to) });
  closeModal();
  if (em) { openEmail(em.id); toast(db.settings.emailjs.enabled ? 'Prueba enviada. Revisa el estado del correo.' : 'Prueba registrada en la bandeja simulada.', 'ok'); }
}
function showGuide() {
  openModal(`<h3>Guion rápido para la presentación</h3>
  <ol class="guide">
    <li><b>Administrador:</b> ingresa con <code>admin@ut.edu.co / admin2026</code>. En <b>Usuarios</b> crea una cuenta con correo <code>@ut.edu.co</code>; el sistema genera contraseña y correo de invitación.</li>
    <li><b>Correos:</b> abre la bandeja, revisa la invitación y muestra el estado “simulado”. Si configuraste EmailJS, muestra el envío real.</li>
    <li><b>Estudiante:</b> crea una cuenta de estudiante y entra con el correo y la contraseña temporal que aparecen en la invitación; agrega materiales al catálogo, elige fechas y envía la solicitud.</li>
    <li><b>Coordinación:</b> entra con <code>coordinacion.cat@ut.edu.co / cat2026</code>, revisa la solicitud, aprueba o ajusta, registra entrega y devolución.</li>
    <li><b>Correo y trazabilidad:</b> cada paso genera notificación en la campana y un correo en la bandeja. El historial conserva fechas, responsables y novedades.</li>
  </ol>
  <div class="note">La disponibilidad se calcula por rangos de fechas, no solo por cantidades: dos solicitudes que no se cruzan pueden usar el mismo material.</div>
  <div class="acts" style="justify-content:flex-end"><button class="btn p" onclick="closeModal()">Entendido</button></div>`, true);
}
