/* ============================================================
   Vistas de estudiante / docente – catálogo, solicitud e historial
   ============================================================ */

const nCart = () => Object.values(cart).reduce((a, b) => a + b, 0);
const frmStart = () => new Date(`${frm.date}T${frm.time || '00:00'}:00`);
const frmEnd = () => new Date(`${frm.ret}T${frm.retTime || '23:59'}:00`);
function setFrm(k, v) {
  frm[k] = v;
  if (k === 'date' && (!frm.ret || frm.ret < frm.date)) frm.ret = frm.date;
  render();
}
function maxFor(id) {
  if (cur === 'ssol') {
    const s = frmStart(), e = frmEnd();
    if (!isNaN(s) && !isNaN(e)) return avail(id, s, e);
  }
  return availNow(id);
}
function add(id) {
  const i = item(id);
  if (!i) return;
  const max = availNow(id);
  if (!max) { toast('No hay disponibilidad en este momento.', 'no'); return; }
  if ((cart[id] || 0) >= max) { toast('Ya tienes el máximo disponible hoy. Puedes ajustar las fechas en Mi solicitud.', 'info'); return; }
  cart[id] = (cart[id] || 0) + 1;
  done = '';
  render();
}
function chg(id, d) {
  const i = item(id);
  if (!i) return;
  const max = maxFor(id);
  cart[id] = Math.max(0, Math.min(max, (cart[id] || 0) + d));
  if (!cart[id]) delete cart[id];
  render();
}

function sdash() {
  const my = myReqs();
  const n = statuses => my.filter(r => statuses.includes(r.status)).length;
  const g = groupById(me.groupId);
  const total = db.inv.filter(i => i.cat !== 'Espacios').reduce((s, i) => s + availNow(i.id), 0);
  const nextR = my.filter(r => r.status === 'En préstamo').sort((a, b) => (a.ret + a.retTime).localeCompare(b.ret + b.retTime))[0];
  const who = me.role === 'prof' ? `Docente · ${me.course || me.program}` : `Representante · ${g ? groupLabel(g) : 'Sin grupo asignado'}`;
  const k = [
    ['Solicitudes activas', n(['Pendiente', 'Aprobada', 'En préstamo']), 'En trámite o en préstamo', '📋'],
    ['Pendientes', n(['Pendiente']), 'Esperando coordinación', '⏳'],
    ['Por devolver', n(['En préstamo']), 'Material en tu poder', '⏰'],
    ['Materiales disponibles', total, 'En el catálogo', '📦']
  ];
  return `<div class="banner">${av(hash(me.email), 56)}<div><b style="font:700 18px Georgia">Hola, ${esc(me.name.split(' ')[0])}.</b><p>${esc(who)}</p></div><button class="btn" style="margin-left:auto" onclick="go('scat','Catálogo')">Solicitar material</button></div>
  ${nextR ? `<div class="al w" style="margin-bottom:18px">⏰ <b style="display:inline;font-size:14px">Devolución próxima:</b> ${esc(itemsText(nextR))} · antes del ${fmtDT(nextR.ret, nextR.retTime)}.</div>` : ''}
  <div class="g4">${k.map(x => `<div class="card kpi"><div class="ic">${x[3]}</div><small>${x[0]}</small><b>${x[1]}</b><span>${x[2]}</span></div>`).join('')}</div>
  <div class="card"><div class="ph" style="margin:0 0 8px"><h3>Mis solicitudes</h3><button class="btn s" onclick="go('ssol','Mi solicitud')">Nueva solicitud</button></div><div class="tw"><table><tr><th>Solicitud</th><th>Elementos</th><th>Fecha de uso</th><th>Estado</th></tr>${my.slice(0, 6).map(r => `<tr><td><b>${esc(r.id)}</b><small class="block mut">${esc(r.act)}</small></td><td>${esc(itemsText(r))}</td><td>${fmt(r.date)}</td><td>${tag(r.status)}</td></tr>`).join('') || '<tr><td colspan="4" class="empty">Aún no has hecho solicitudes.</td></tr>'}</table></div></div>`;
}

function gridHtml() {
  const s = q.toLowerCase();
  const rows = db.inv.filter(c => (cat === 'Todos' || c.cat === cat) && (!s || (c.name + ' ' + c.code + ' ' + c.cat).toLowerCase().includes(s)));
  return rows.map(c => {
    const a = availNow(c.id);
    const state = itemState(c);
    const selected = cart[c.id] || 0;
    return `<div class="card cc"><div class="thumb">${c.icon}</div><b>${esc(c.name)}</b><small>${esc(c.cat)} · ${esc(c.code || '')}</small><small>${a} de ${c.total} disponibles hoy</small><span><span class="tag ${state[1]}">${state[0]}</span>${c.requiresAval ? '<span class="tag miniTag">Aval</span>' : ''}</span><button class="btn ${a > 0 ? 'p' : ''} s" ${a > 0 ? '' : 'disabled'} onclick="add('${c.id}')">${a > 0 ? '+ Agregar' + (selected ? ` (${selected})` : '') : 'Sin disponibilidad'}</button></div>`;
  }).join('') || '<p class="empty">Sin resultados.</p>';
}
function scat() {
  const cs = ['Todos', ...CATS];
  return `<div class="ph"><div><h1>Catálogo de préstamos</h1><p>Materiales, equipos y espacios del CAT Medellín</p></div><button class="btn" onclick="myEmails()">✉ Mis correos</button></div>
  <div class="search wide" style="max-width:none;margin-bottom:12px">🔍<input value="${esc(q)}" placeholder="Buscar material o espacio…" oninput="q=this.value;$('#gs').value=q;$('#grid').innerHTML=gridHtml()"></div>
  <div class="chips">${cs.map(c => `<button class="chip ${c === cat ? 'on' : ''}" onclick="cat='${c}';render()">${c}</button>`).join('')}</div>
  ${nCart() ? `<div class="cartbar"><span>🛒 ${nCart()} elemento(s) en tu solicitud</span><button class="btn p s" onclick="go('ssol','Mi solicitud')">Ver solicitud</button></div>` : ''}
  <p class="hintline">La disponibilidad mostrada es la de hoy. Al enviar, el sistema la valida para el rango de fechas que elijas.</p>
  <div class="cg" id="grid">${gridHtml()}</div>`;
}

function ssol() {
  const it = Object.entries(cart).filter(([id]) => item(id));
  if (done) {
    const r = db.reqs.find(x => x.id === done);
    return `<div class="card success"><div style="font-size:42px">✅</div><h2>Solicitud enviada</h2><p class="mut">Número <b>${esc(done)}</b>. La coordinación recibió una notificación y tú recibiste un correo de confirmación. Cuando la aprueben o rechacen, el resultado también llegará a tu correo y a la campana 🔔.</p><div class="acts" style="justify-content:center"><button class="btn p" onclick="go('shist','Historial')">Ver mi historial</button><button class="btn" onclick="myEmails('${done}')">Ver correos</button><button class="btn" onclick="go('sdash','Inicio')">Volver al inicio</button></div>${r ? `<p class="mut" style="margin-top:14px;font-size:12px">${esc(itemsText(r))} · ${fmtDT(r.date, r.time)} → ${fmtDT(r.ret, r.retTime)}</p>` : ''}</div>`;
  }
  if (!it.length) {
    return `<div class="ph"><div><h1>Mi solicitud</h1><p>Agrega materiales o espacios desde el catálogo</p></div></div><div class="card empty-state"><div style="font-size:40px">🛒</div><h3>Tu solicitud está vacía</h3><p class="mut">Selecciona los elementos que necesitas para tu actividad.</p><button class="btn p" onclick="go('scat','Catálogo')">Ir al catálogo</button></div>`;
  }
  const g = groupById(me.groupId);
  const s = frmStart(), e = frmEnd();
  const validDates = !isNaN(s) && !isNaN(e);
  const short = it.some(([id, n]) => validDates && n > avail(id, s, e));
  const avalNeeded = me.role === 'st' && it.some(([id]) => (item(id) || {}).requiresAval);
  const lines = it.map(([id, n]) => {
    const i = item(id);
    const a = validDates ? avail(id, s, e) : 0;
    return `<tr><td><div class="who"><div class="thumb">${i.icon}</div><div><b>${esc(i.name)}</b><small>${esc(i.cat)}${i.requiresAval ? ' · requiere aval' : ''}</small></div></div></td><td><div class="qty"><button onclick="chg('${id}',-1)" aria-label="Menos">−</button><b>${n}</b><button onclick="chg('${id}',1)" aria-label="Más">+</button></div></td><td>${a >= n ? `<span class="avail ok">● ${a} para estas fechas</span>` : `<span class="avail no">● Solo ${a} para estas fechas</span>`}</td></tr>`;
  }).join('');
  return `<div class="ph"><div><h1>Mi solicitud</h1><p>Revisa los elementos y completa los datos de la actividad</p></div><button class="btn" onclick="go('scat','Catálogo')">+ Seguir agregando</button></div>
  <div class="dgrid"><div class="card"><h3 style="margin-bottom:8px">Elementos</h3><div class="tw"><table><tr><th>Elemento</th><th>Cantidad</th><th>Disponibilidad</th></tr>${lines}</table></div>${short ? `<div class="al b" style="margin-top:12px">No hay disponibilidad suficiente para todas las cantidades en estas fechas. Ajusta las cantidades o cambia las fechas.</div>` : ''}</div>
  <div class="card"><h3 style="margin-bottom:10px">Datos de la actividad</h3><div class="mform">
    ${me.role === 'st' ? `<label>Grupo / representación<input class="in" value="${esc(g ? groupLabel(g) : 'Sin grupo asignado')}" disabled></label><label>Programa<input class="in" value="${esc(g ? g.program : '—')}" disabled></label>` : ''}
    ${me.role === 'prof' ? `<label>Curso / cátedra<input class="in" value="${esc(frm.course)}" oninput="frm.course=this.value" maxlength="80" placeholder="Ej. Cátedra de Cine"></label>` : ''}
    <label>Actividad<input class="in" placeholder="Ej. muestra cultural, cineforo, torneo…" value="${esc(frm.act)}" oninput="frm.act=this.value" maxlength="90"></label>
    <div class="form2"><label>Fecha de uso<input class="in" type="date" min="${ymd(new Date())}" value="${frm.date}" onchange="setFrm('date',this.value)"></label><label>Hora<input class="in" type="time" value="${frm.time}" onchange="setFrm('time',this.value)"></label></div>
    <div class="form2"><label>Fecha de devolución<input class="in" type="date" min="${frm.date || ymd(new Date())}" value="${frm.ret}" onchange="setFrm('ret',this.value)"></label><label>Hora de devolución<input class="in" type="time" value="${frm.retTime}" onchange="setFrm('retTime',this.value)"></label></div>
    ${avalNeeded ? `<label>Aval docente / dirección<input class="in" placeholder="Nombre o dependencia que avala" value="${esc(frm.aval)}" oninput="frm.aval=this.value" maxlength="80"></label>` : ''}
    <label>Observaciones<textarea placeholder="Montaje, necesidades especiales, aval docente…" oninput="frm.obs=this.value">${esc(frm.obs)}</textarea></label>
    <button class="btn p" ${short ? 'disabled' : ''} onclick="send()">Enviar solicitud</button>
    <p class="hintline">Al enviar se validan las existencias para las fechas elegidas y se notifica por correo a coordinación y al solicitante.</p>
  </div></div></div>`;
}

function send() {
  if (!me) return;
  const items = Object.entries(cart).filter(([id, n]) => item(id) && n > 0).map(([id, n]) => [id, Math.min(n, item(id).total)]);
  if (!items.length) { toast('Agrega al menos un elemento a la solicitud.', 'no'); return; }
  const f = frm;
  if (!f.act.trim()) { toast('Escribe la actividad o motivo del préstamo.', 'no'); return; }
  const start = frmStart(), end = frmEnd();
  if (isNaN(start) || isNaN(end) || start >= end) { toast('Revisa las fechas y horas: la devolución debe ser posterior al uso.', 'no'); return; }
  const g = groupById(me.groupId);
  if (me.role === 'st' && !g) { toast('Tu cuenta no tiene un grupo asignado. Contacta a coordinación.', 'no'); return; }
  if (me.role === 'prof' && !f.course.trim()) { toast('Escribe el curso o cátedra que solicita el préstamo.', 'no'); return; }
  for (const [id, n] of items) {
    const a = avail(id, start, end);
    if (n > a) { toast(`No hay disponibilidad suficiente de “${item(id).name}” para esas fechas (${a} disponible(s)).`, 'no'); return; }
  }
  if (me.role === 'st' && items.some(([id]) => item(id).requiresAval) && !f.aval.trim()) {
    toast('Uno de los elementos requiere aval. Escribe el nombre o dependencia que avala.', 'no');
    return;
  }
  const isProf = me.role === 'prof';
  const obs = [f.obs.trim(), f.aval.trim() ? 'Aval: ' + f.aval.trim() : ''].filter(Boolean).join(' · ');
  const id = 'UT-2026-' + pad(++db.seq);
  const r = {
    id,
    ownerId: me.id,
    ownerName: me.name,
    ownerEmail: me.email,
    ownerRole: isProf ? 'Docente' : 'Estudiante · Representante',
    groupId: isProf ? null : g.id,
    group: isProf ? f.course.trim() : groupLabel(g),
    course: isProf ? f.course.trim() : '',
    program: isProf ? me.program : g.program,
    semester: isProf ? null : g.semester,
    act: f.act.trim(),
    date: f.date,
    time: f.time,
    ret: f.ret,
    retTime: f.retTime,
    items,
    status: 'Pendiente',
    obs,
    note: '',
    aval: f.aval.trim(),
    created: Date.now(),
    hist: [{ ts: Date.now(), txt: 'Solicitud creada', by: me.name }],
    novedades: []
  };
  db.reqs.push(r);
  staffUsers().forEach(u => notify(u.id, 'new', `${me.name} (${r.group}) envió la solicitud ${id}`, id));
  emailRoles(['admin', 'co'], tplNewRequest(r), id);
  emailUser(me.id, tplRequestReceived(r), id);
  notify(me.id, 'info', `Tu solicitud ${id} fue enviada. La coordinación la revisará y recibirás respuesta por correo.`, id);
  save();
  cart = {};
  done = id;
  frm = initFrm();
  nav(); renderBell(); render();
  toast('Solicitud enviada. Se generaron los correos de notificación.', 'ok');
}

function shist() {
  const my = myReqs();
  return `<div class="ph"><div><h1>Historial</h1><p>Tus solicitudes, la respuesta de coordinación y los correos asociados</p></div><button class="btn p" onclick="go('scat','Catálogo')">+ Nueva solicitud</button></div>
  ${my.map(r => {
    const mails = db.emails.filter(e => e.reqId === r.id && e.to.toLowerCase() === me.email.toLowerCase()).length;
    return `<div class="card historycard" style="margin-bottom:14px"><div class="ph" style="margin:0 0 8px"><div><h3>${esc(r.act)}</h3><p>${esc(r.id)} · ${esc(itemsText(r))}</p></div>${tag(r.status)}</div>
    <div class="kv"><div><small>Fecha de uso</small><b>${fmtDT(r.date, r.time)}</b></div><div><small>Devolución</small><b>${fmtDT(r.ret, r.retTime)}</b></div><div><small>${r.ownerRole === 'Docente' ? 'Curso' : 'Grupo'}</small><b>${esc(r.group)}</b></div><div><small>Correos recibidos</small><b>${mails}</b></div></div>
    ${r.obs ? `<p class="mut" style="margin:10px 0 0">“${esc(r.obs)}”</p>` : ''}
    ${r.note ? `<div class="note" style="margin-top:12px"><small>${r.status === 'Rechazada' ? 'Motivo del rechazo' : 'Mensaje de coordinación'}</small><br>${esc(r.note)}</div>` : ''}
    ${(r.novedades || []).length ? `<div class="note" style="margin-top:12px"><small>Novedades de devolución</small><br>${r.novedades.map(n => `${esc(n.item)}: ${n.qty} ${esc(n.tipo)}`).join('<br>')}</div>` : ''}
    <div class="tl" style="margin-top:14px">${r.hist.map(h => `<p><b>${esc(h.txt)}</b> <small class="mut">· ${ago(h.ts)}</small></p>`).join('')}</div>
    <div class="acts">${r.status === 'Pendiente' ? `<button class="btn d s" onclick="cancelReq('${r.id}')">Cancelar solicitud</button>` : ''}${mails ? `<button class="btn s" onclick="myEmails('${r.id}')">✉ Ver correos (${mails})</button>` : ''}</div></div>`;
  }).join('') || '<div class="card empty">Aún no has hecho solicitudes.</div>'}`;
}
function cancelReq(id) {
  const r = db.reqs.find(x => x.id === id);
  if (!r || r.ownerId !== me.id || r.status !== 'Pendiente') return;
  if (!confirm('¿Cancelar esta solicitud?')) return;
  r.status = 'Cancelada';
  hist(r, 'Cancelada por el solicitante', me.name);
  staffUsers().forEach(u => notify(u.id, 'info', `${me.name} canceló la solicitud ${r.id}`, r.id));
  emailRoles(['admin', 'co'], tplCancelled(r), r.id);
  toast('Solicitud cancelada. Se notificó a coordinación.', 'info');
  commit();
}

function profile() {
  const g = groupById(me.groupId);
  return `<div class="ph"><div><h1>Mi perfil</h1><p>Datos de tu cuenta institucional</p></div>${['st', 'prof'].includes(me.role) ? '<button class="btn" onclick="myEmails()">✉ Mis correos</button>' : ''}</div>
  <div class="profileGrid"><div class="card profileHead">${av(hash(me.email), 92)}<h2>${esc(me.name)}</h2><p>${esc(me.email)}</p>${roleBadge(me.role)}<div class="kv" style="margin-top:18px;text-align:left"><div><small>Programa</small><b>${esc(me.program || '—')}</b></div><div><small>${me.role === 'st' ? 'Grupo' : me.role === 'prof' ? 'Curso' : 'Dependencia'}</small><b>${esc(me.role === 'st' ? (g ? g.name : 'Sin grupo') : me.role === 'prof' ? (me.course || '—') : me.program || '—')}</b></div><div><small>Semestre</small><b>${me.semester ? esc(me.semester) : '—'}</b></div><div><small>Último ingreso</small><b>${me.lastLogin ? ago(me.lastLogin) : '—'}</b></div></div></div>
  <div class="card"><h3 style="margin-bottom:10px">Editar datos</h3><div class="mform"><label>Nombre completo<input class="in" id="p_name" value="${esc(me.name)}" maxlength="70"></label><label>Teléfono<input class="in" id="p_phone" value="${esc(me.phone || '')}" maxlength="30"></label><label>Nueva contraseña (opcional)<input class="in" id="p_pass" type="password" placeholder="Mínimo 6 caracteres" autocomplete="new-password"></label><button class="btn p" onclick="saveProfile()">Guardar cambios</button></div><div class="note">El correo institucional solo puede cambiarlo la coordinación del CAT. En este demo la contraseña se guarda en el navegador.</div></div></div>`;
}
function saveProfile() {
  const name = $('#p_name').value.trim();
  const phone = $('#p_phone').value.trim();
  const pass = $('#p_pass').value;
  if (!name) { toast('El nombre no puede quedar vacío.', 'no'); return; }
  if (pass && pass.length < 6) { toast('La nueva contraseña debe tener al menos 6 caracteres.', 'no'); return; }
  const u = userById(me.id);
  if (!u) return;
  u.name = name;
  u.phone = phone;
  if (pass) u.pass = pass;
  save();
  me = userById(me.id);
  nav(); render(); toast('Perfil actualizado.', 'ok');
}
