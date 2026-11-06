/* ============================================================
   Vistas de operación – panel, solicitudes, inventario y devoluciones
   ============================================================ */

function dash() {
  if (!isStaff()) return sdash();
  const s = requestStats();
  const pc = s.pending;
  const c = CATS.map(n => [n, db.reqs.filter(r => !['Rechazada', 'Cancelada'].includes(r.status) && r.items.some(([id]) => (item(id) || {}).cat === n)).length]);
  const mx = Math.max(1, ...c.map(x => x[1]));
  const rec = db.reqs.slice().sort(byNew).slice(0, 7);
  const k = [
    ['Solicitudes pendientes', pc, 'Esperan decisión', '📋', pc > 0],
    ['Préstamos activos', s.active, 'Aprobados o en curso', '🔄'],
    ['Materiales disponibles', s.available, `de ${s.total} en servicio`, '📦'],
    ['Por recibir', s.loaned, 'Devoluciones pendientes', '↩️', s.loaned > 0],
    ['Correos en bandeja', s.emails, s.emailErrors ? `${s.emailErrors} con error` : 'Notificaciones generadas', '✉️', s.emailErrors > 0]
  ];
  return `<div class="ph"><div><h1>Panel principal</h1><p>Resumen de la gestión · ${esc(db.settings.period)} · ${new Date().toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })}</p></div><div class="acts" style="margin:0"><button class="btn" onclick="emailSettings()">⚙ Correo</button>${isAdmin() ? '<button class="btn" onclick="userForm()">+ Crear usuario</button>' : ''}<button class="btn p" onclick="rf='Pendiente';go('reqs','Solicitudes')">Revisar pendientes</button></div></div>
  <div class="banner"><div class="av">${[1, 4, 6, 9].map(i => av(i, 40)).join('')}</div><div><b style="font:700 17px Georgia">Hola, ${esc(me.name.split(' ')[0])}.</b><p>${pc ? `Tienes ${pc} solicitud${pc === 1 ? '' : 'es'} pendiente${pc === 1 ? '' : 's'} por responder.` : 'No tienes solicitudes pendientes. ¡Todo al día!'}</p></div><button class="btn" style="margin-left:auto" onclick="go('emails','Correos')">Ver correos</button></div>
  <div class="grid5">${k.map(x => `<div class="card kpi ${x[4] ? 'alert' : ''}"><div class="ic">${x[3]}</div><small>${x[0]}</small><b>${x[1]}</b><span>${x[2]}</span></div>`).join('')}</div>
  <div class="two"><div class="card"><h3>Solicitudes por categoría</h3><small class="mut">Sin contar rechazadas ni canceladas</small>
  <div class="bars">${c.map(x => `<div><i style="height:${Math.max(3, x[1] / mx * 130)}px"></i>${x[1]}</div>`).join('')}</div><div class="lbl">${c.map(x => `<span>${x[0]}</span>`).join('')}</div></div>
  <div class="card"><div class="ph" style="margin:0 0 8px"><h3>Solicitudes recientes</h3><button class="btn s" onclick="rf='Todas';go('reqs','Solicitudes')">Ver todas</button></div><div class="tw"><table><tr><th>Solicitante</th><th>Grupo / curso</th><th>Elementos</th><th>Uso</th><th>Estado</th><th></th></tr>
  ${rec.map(r => `<tr><td><div class="who">${av(hash(r.ownerEmail || r.ownerName), 30)}<div><b>${esc(r.ownerName)}</b><small>${esc(r.ownerRole)}</small></div></div></td><td>${esc(r.group)}</td><td>${esc(itemsText(r))}</td><td>${fmt(r.date)}</td><td>${tag(r.status)}</td><td><button class="btn s ${r.status === 'Pendiente' ? 'p' : ''}" onclick="openReq('${r.id}')">${r.status === 'Pendiente' ? 'Revisar' : 'Ver'}</button></td></tr>`).join('') || '<tr><td colspan="6" class="empty">Sin solicitudes.</td></tr>'}</table></div></div></div>`;
}

function openReq(id) {
  sel = id;
  go('det', 'Solicitudes');
}
function openReqEmails(id) {
  eq = id;
  ef = 'Todos';
  go('emails', 'Correos', true);
}
function reqs() {
  const fs = ['Todas', 'Pendiente', 'Aprobada', 'En préstamo', 'Devuelta', 'Rechazada', 'Cancelada'];
  const s = q.toLowerCase();
  const rows = db.reqs.slice().sort(byNew).filter(r =>
    (rf === 'Todas' || r.status === rf) &&
    (!s || (r.id + ' ' + r.ownerName + ' ' + r.ownerEmail + ' ' + r.group + ' ' + r.act + ' ' + itemsText(r)).toLowerCase().includes(s))
  );
  return `<div class="ph"><div><h1>Solicitudes</h1><p>Revisa, aprueba, ajusta o rechaza las solicitudes del CAT</p></div></div>
  <div class="chips">${fs.map(f => `<button class="chip ${f === rf ? 'on' : ''}" onclick="rf='${f}';render()">${f}${f !== 'Todas' ? ' (' + db.reqs.filter(r => r.status === f).length + ')' : ''}</button>`).join('')}</div>
  <div class="card" style="margin-top:14px"><div class="tw"><table><tr><th>Solicitud</th><th>Solicitante</th><th>Grupo / curso</th><th>Elementos</th><th>Fechas</th><th>Estado</th><th></th></tr>
  ${rows.map(r => `<tr><td><b>${esc(r.id)}</b><small class="block mut">${ago(r.created)}</small></td><td><div class="who">${av(hash(r.ownerEmail || r.ownerName), 30)}<div><b>${esc(r.ownerName)}</b><small>${esc(r.ownerRole)}</small></div></div></td><td>${esc(r.group)}<small class="block mut">${esc(r.program || '')}</small></td><td>${esc(itemsText(r))}</td><td>${fmt(r.date)}<small class="block mut">hasta ${fmt(r.ret)}</small></td><td>${tag(r.status)}</td><td class="actions"><button class="btn s ${r.status === 'Pendiente' ? 'p' : ''}" onclick="openReq('${r.id}')">${r.status === 'Pendiente' ? 'Revisar' : 'Ver'}</button></td></tr>`).join('') || '<tr><td colspan="7" class="empty">No hay solicitudes con este filtro.</td></tr>'}</table></div></div>`;
}

function det() {
  const r = db.reqs.find(x => x.id === sel);
  if (!r) { cur = 'reqs'; return reqs(); }
  const start = reqStart(r), end = reqEnd(r);
  const isP = r.status === 'Pendiente';
  const isA = r.status === 'Aprobada';
  const isL = r.status === 'En préstamo';
  const short = r.items.some(([id, n]) => !item(id) || n > avail(id, start, end, r.id));
  const owner = userById(r.ownerId) || {};
  const lines = r.items.map(([id, n]) => {
    const i = item(id) || { name: '(elemento eliminado)', icon: '❔', cat: '' };
    const a = item(id) ? avail(id, start, end, r.id) : 0;
    return `<tr><td><div class="who"><div class="thumb">${i.icon}</div><div><b>${esc(i.name)}</b><small>${esc(i.cat)}</small></div></div></td><td>${n}</td><td>${a >= n ? `<span class="avail ok">● ${a} disponible(s)</span>` : `<span class="avail no">● Solo ${a} para estas fechas</span>`}</td></tr>`;
  }).join('');
  let dec;
  if (isP) {
    dec = `<h3>Decisión de coordinación</h3><p class="mut" style="margin:6px 0 0">${short ? 'Hay elementos sin disponibilidad suficiente para las fechas solicitadas. Puedes ajustar la solicitud o rechazarla con un motivo.' : 'Hay disponibilidad para todos los elementos en las fechas solicitadas.'}</p>
    <div class="mform"><label>Mensaje para el solicitante<textarea id="obs" placeholder="Obligatorio al rechazar; opcional al aprobar…"></textarea></label></div>
    <div class="acts" style="flex-direction:column"><button class="btn p" ${short ? 'disabled' : ''} onclick="decide('${r.id}',true)">✓ Aprobar solicitud</button><button class="btn d" onclick="decide('${r.id}',false)">✕ Rechazar</button>${short ? `<button class="btn" onclick="fitReq('${r.id}')">✎ Ajustar a disponibilidad</button>` : ''}</div>`;
  } else if (isA) {
    dec = `<h3>Siguiente paso</h3><p class="mut" style="margin:6px 0 0">Las existencias están reservadas para estas fechas. Registra la entrega cuando el solicitante recoja el material.</p><div class="acts" style="flex-direction:column"><button class="btn p" onclick="deliver('${r.id}')">📦 Registrar entrega</button></div>`;
  } else if (isL) {
    dec = `<h3>Siguiente paso</h3><p class="mut" style="margin:6px 0 0">Devolución prevista: <b>${fmt(r.ret)} ${esc(r.retTime || '')}</b>. Verifica el estado físico al recibir.</p><div class="acts" style="flex-direction:column"><button class="btn p" onclick="returnReq('${r.id}')">↩ Registrar devolución</button></div>`;
  } else {
    dec = `<h3>Solicitud ${r.status.toLowerCase()}</h3><p class="mut" style="margin:6px 0 0">Este trámite ya está cerrado. El historial conserva la trazabilidad.</p>`;
  }
  const nov = (r.novedades || []).length ? `<div class="card" style="margin-bottom:14px"><h3 style="margin-bottom:8px">Novedades de devolución</h3><div class="tl">${r.novedades.map(n => `<p><b>${esc(n.item)}</b> · ${n.qty} unidad(es) · ${esc(n.tipo)}${n.nota ? `<br><small class="mut">${esc(n.nota)}</small>` : ''}</p>`).join('')}</div></div>` : '';
  return `<button class="crumb" onclick="go('reqs','Solicitudes')">← Solicitudes /</button>
  <div class="ph"><div><h1>Solicitud ${esc(r.id)}</h1><p>Recibida ${ago(r.created)} · ${esc(r.ownerName)}</p></div><div class="phact">${tag(r.status)}<button class="btn s" onclick="openReqEmails('${r.id}')">✉ Correos (${emailCountForReq(r.id)})</button></div></div>
  <div class="dgrid"><div>
    <div class="card" style="margin-bottom:14px"><h3 style="margin-bottom:12px">Solicitante</h3><div class="who" style="margin-bottom:14px">${av(hash(r.ownerEmail || r.ownerName), 56)}<div><b style="font-size:16px">${esc(r.ownerName)}</b><small>${esc(r.ownerRole)} · ${esc(r.ownerEmail)}</small></div></div>
    <div class="kv"><div><small>${r.ownerRole === 'Docente' ? 'Curso' : 'Grupo'}</small><b>${esc(r.group)}</b></div><div><small>Programa</small><b>${esc(r.program || '—')}</b></div><div><small>Actividad</small><b>${esc(r.act)}</b></div><div><small>Semestre</small><b>${r.semester ? esc(r.semester) : '—'}</b></div><div><small>Fecha de uso</small><b>${fmtDT(r.date, r.time)}</b></div><div><small>Devolución</small><b>${fmtDT(r.ret, r.retTime)}</b></div>${owner.phone ? `<div><small>Teléfono</small><b>${esc(owner.phone)}</b></div>` : ''}${r.aval ? `<div><small>Aval</small><b>${esc(r.aval)}</b></div>` : ''}</div></div>
    <div class="card" style="margin-bottom:14px"><h3 style="margin-bottom:8px">Elementos solicitados</h3><div class="tw"><table><tr><th>Elemento</th><th>Cant.</th><th>Disponibilidad para estas fechas</th></tr>${lines}</table></div></div>
    <div class="card"><h3 style="margin-bottom:8px">Observaciones</h3>${r.obs ? `<p style="margin:0 0 10px;color:var(--mut)">“${esc(r.obs)}”</p>` : '<p style="margin:0 0 10px;color:var(--mut)">El solicitante no dejó observaciones.</p>'}${r.note ? `<div class="note"><small>Respuesta de coordinación</small><br>${esc(r.note)}</div>` : ''}</div>
    ${nov}
  </div><div>
    <div class="card" style="margin-bottom:14px;border-color:var(--wine)">${dec}</div>
    <div class="card"><h3 style="margin-bottom:12px">Historial</h3><div class="tl">${r.hist.map(h => `<p><b>${esc(h.txt)}</b><br><small class="mut">${ago(h.ts)} · ${esc(h.by)}</small></p>`).join('')}</div></div>
  </div></div>`;
}

function decide(id, ok) {
  const r = db.reqs.find(x => x.id === id);
  if (!r || r.status !== 'Pendiente') return;
  const note = (($('#obs') || {}).value || '').trim();
  if (ok) {
    const start = reqStart(r), end = reqEnd(r);
    const bad = r.items.find(([i, n]) => !item(i) || n > avail(i, start, end, r.id));
    if (bad) { toast('No hay disponibilidad suficiente para esas fechas. Ajusta o rechaza.', 'no'); return; }
    r.status = 'Aprobada';
    r.note = note;
    hist(r, 'Aprobada por coordinación', me.name);
    notify(r.ownerId, 'ok', `Tu solicitud ${r.id} fue aprobada. ${note || 'Pasa a recoger el material en la fecha indicada.'}`, r.id);
    emailUser(r.ownerId, tplDecision(r, true, note), r.id);
    toast(`Solicitud ${r.id.slice(-4)} aprobada. Se generó el correo de notificación.`, 'ok');
  } else {
    if (!note) { toast('Escribe el motivo del rechazo para el solicitante.', 'no'); const t = $('#obs'); if (t) t.focus(); return; }
    r.status = 'Rechazada';
    r.note = note;
    hist(r, 'Rechazada por coordinación', me.name);
    notify(r.ownerId, 'no', `Tu solicitud ${r.id} fue rechazada: ${note}`, r.id);
    emailUser(r.ownerId, tplDecision(r, false, note), r.id);
    toast(`Solicitud ${r.id.slice(-4)} rechazada. Se generó el correo de notificación.`, 'no');
  }
  commit();
}
function fitReq(id) {
  const r = db.reqs.find(x => x.id === id);
  if (!r) return;
  const start = reqStart(r), end = reqEnd(r);
  const nu = r.items.map(([i, n]) => [i, Math.min(n, item(i) ? avail(i, start, end, r.id) : 0)]).filter(x => x[1] > 0);
  if (!nu.length) { toast('No queda disponibilidad para esas fechas; lo más adecuado es rechazar la solicitud.', 'no'); return; }
  r.items = nu;
  r.note = 'Cantidades ajustadas a la disponibilidad para las fechas solicitadas.';
  hist(r, 'Ajustada a la disponibilidad por fechas', me.name);
  notify(r.ownerId, 'info', `Coordinación ajustó tu solicitud ${r.id} a la disponibilidad real. Revisa los cambios.`, r.id);
  emailUser(r.ownerId, tplAdjusted(r), r.id);
  toast('Solicitud ajustada. Se notificó al solicitante.', 'info');
  commit();
}
function deliver(id) {
  const r = db.reqs.find(x => x.id === id);
  if (!r || r.status !== 'Aprobada') return;
  r.status = 'En préstamo';
  hist(r, 'Entrega registrada', me.name);
  notify(r.ownerId, 'info', `Se registró la entrega de tu solicitud ${r.id}. Devuélvela antes del ${fmtDT(r.ret, r.retTime)}.`, r.id);
  emailUser(r.ownerId, tplDelivery(r), r.id);
  toast('Entrega registrada. Se generó el correo de confirmación.', 'ok');
  commit();
}

/* ---------- Devoluciones ---------- */
function ret() {
  const rows = db.reqs.filter(r => ACTIVE.includes(r.status)).sort((a, b) => (a.ret + a.retTime).localeCompare(b.ret + b.retTime));
  const pendingDel = db.reqs.filter(r => r.status === 'Aprobada').length;
  const loaned = db.reqs.filter(r => r.status === 'En préstamo').length;
  const overdue = db.reqs.filter(r => r.status === 'En préstamo' && r.ret < dayPlus(0)).length;
  return `<div class="ph"><div><h1>Devoluciones</h1><p>Entregas pendientes, materiales en préstamo y novedades</p></div></div>
  <div class="alerts"><div class="al w"><b>${pendingDel}</b>Entregas por registrar</div><div class="al m"><b>${loaned}</b>Préstamos en curso</div><div class="al b"><b>${overdue}</b>Devoluciones vencidas</div><div class="al i"><b>${db.reqs.filter(r => r.status === 'Devuelta').length}</b>Devoluciones cerradas</div></div>
  <div class="card"><div class="tw"><table><tr><th>Solicitud</th><th>Solicitante</th><th>Grupo / curso</th><th>Elementos</th><th>Devolver el</th><th>Estado</th><th></th></tr>
  ${rows.map(r => `<tr><td><b>${esc(r.id)}</b><small class="block mut">${ago(r.created)}</small></td><td>${esc(r.ownerName)}</td><td>${esc(r.group)}</td><td>${esc(itemsText(r))}</td><td>${fmtDT(r.ret, r.retTime)}</td><td>${tag(r.status)}</td><td class="actions">${r.status === 'Aprobada' ? `<button class="btn s p" onclick="deliver('${r.id}')">Registrar entrega</button>` : `<button class="btn s p" onclick="returnReq('${r.id}')">Registrar devolución</button>`}<button class="btn s" onclick="openReq('${r.id}')">Ver</button></td></tr>`).join('') || '<tr><td colspan="7" class="empty">No hay entregas ni préstamos activos.</td></tr>'}</table></div></div>`;
}
function returnReq(id) {
  const r = db.reqs.find(x => x.id === id);
  if (!r || r.status !== 'En préstamo') return;
  returnForm(r);
}
function returnForm(r) {
  const rows = r.items.map(([id, qty]) => {
    const i = item(id) || { name: '(elemento eliminado)' };
    return `<tr><td><b>${esc(i.name)}</b></td><td>${qty}</td><td><input class="in mini" id="ret_${id}" type="number" min="0" max="${qty}" value="${qty}"></td><td><input class="in mini" id="dmg_${id}" type="number" min="0" max="${qty}" value="0"></td></tr>`;
  }).join('');
  openModal(`<h3>Registrar devolución</h3><p class="mut" style="margin:4px 0 10px">${esc(r.id)} · ${esc(r.ownerName)} · ${esc(r.group)}</p>
  <div class="tw"><table><tr><th>Elemento</th><th>Solicitado</th><th>Devuelto bien</th><th>Con daño</th></tr>${rows}</table></div>
  <p class="mut" style="font-size:12px;margin:10px 0">Si una unidad no se devuelve o llega dañada, se registra una novedad y se descuenta del inventario disponible.</p>
  <div class="mform"><label>Observación de la devolución<textarea id="ret_obs" placeholder="Ej. un micrófono llegó con el cable pelado…"></textarea></label></div>
  <div class="acts" style="justify-content:flex-end"><button class="btn" onclick="closeModal()">Cancelar</button><button class="btn p" onclick="confirmReturn('${r.id}')">Confirmar devolución</button></div>`, true);
}
function confirmReturn(id) {
  const r = db.reqs.find(x => x.id === id);
  if (!r) return;
  const obs = (($('#ret_obs') || {}).value || '').trim();
  const novedades = [];
  for (const [itemId, qty] of r.items) {
    const ret = parseInt((($('#ret_' + itemId) || {}).value || '0'), 10);
    const dmg = parseInt((($('#dmg_' + itemId) || {}).value || '0'), 10);
    if (isNaN(ret) || isNaN(dmg) || ret < 0 || dmg < 0 || ret + dmg > qty) {
      toast('Revisa las cantidades devueltas: no pueden superar lo solicitado.', 'no');
      return;
    }
    const i = item(itemId);
    const missing = qty - ret - dmg;
    if (dmg > 0 || missing > 0) {
      if (i) i.broken = Math.min(i.total, i.broken + dmg + missing);
      if (dmg > 0) novedades.push({ item: i ? i.name : itemId, qty: dmg, tipo: 'Daño', nota: obs });
      if (missing > 0) novedades.push({ item: i ? i.name : itemId, qty: missing, tipo: 'No devuelto', nota: obs });
    }
  }
  r.status = 'Devuelta';
  r.note = obs || r.note;
  r.novedades = [...(r.novedades || []), ...novedades];
  hist(r, novedades.length ? 'Devolución recibida con novedades' : 'Devolución recibida', me.name);
  const extra = novedades.length ? ` Se registraron ${novedades.length} novedad(es) en el inventario.` : '';
  notify(r.ownerId, 'ok', `Recibimos la devolución de tu solicitud ${r.id}.${extra}`, r.id);
  emailUser(r.ownerId, tplReturn(r), r.id);
  toast(novedades.length ? 'Devolución registrada con novedades.' : 'Devolución registrada sin novedades.', novedades.length ? 'info' : 'ok');
  closeModal();
  commit();
}

/* ---------- Inventario ---------- */
function inv() {
  const cats = ['Todos', ...CATS];
  const rows = db.inv.filter(r => (cat === 'Todos' || r.cat === cat) && (!q || (r.name + ' ' + r.code + ' ' + r.cat + ' ' + r.location).toLowerCase().includes(q.toLowerCase())));
  const low = db.inv.filter(i => ['Inventario bajo', 'Agotado'].includes(itemState(i)[0])).length;
  const brk = db.inv.reduce((s, i) => s + i.broken, 0);
  const lent = db.inv.reduce((s, i) => s + outQ(i.id, new Date(), new Date()), 0);
  const zero = db.inv.filter(i => availNow(i.id) === 0).length;
  return `<div class="ph"><div><h1>Inventario</h1><p>Existencias, reservas por fechas y unidades fuera de servicio</p></div><button class="btn p" onclick="itemForm()">+ Agregar elemento</button></div>
  <div class="chips">${cats.map(c => `<button class="chip ${c === cat ? 'on' : ''}" onclick="cat='${c}';render()">${c}</button>`).join('')}</div>
  <div class="alerts"><div class="al w"><b>${low}</b>Inventario bajo o agotado</div><div class="al b"><b>${brk}</b>Unidades fuera de servicio</div><div class="al m"><b>${lent}</b>Unidades prestadas o reservadas</div><div class="al i"><b>${zero}</b>Elementos sin disponibilidad</div></div>
  <div class="card"><div class="tw"><table><tr><th>Elemento</th><th>Código / ubicación</th><th>Total</th><th>Disponible hoy</th><th>Prestado</th><th>Novedades</th><th>Estado</th><th></th></tr>
  ${rows.map(r => { const a = availNow(r.id), s = itemState(r); return `<tr><td><div class="who"><div class="thumb">${r.icon}</div><div><b>${esc(r.name)}</b><small>${esc(r.cat)}${r.requiresAval ? ' · requiere aval' : ''}</small></div></div></td><td>${esc(r.code || '—')}<small class="block mut">${esc(r.location || '')}</small></td><td>${r.total}</td><td><b>${a}</b><div class="meter"><i style="width:${r.total ? a / r.total * 100 : 0}%"></i></div></td><td>${outQ(r.id, new Date(), new Date())}</td><td>${r.broken}</td><td><span class="tag ${s[1]}">${s[0]}</span></td><td><button class="btn s" onclick="itemForm('${r.id}')">✎ Editar</button></td></tr>`; }).join('') || '<tr><td colspan="8" class="empty">Sin resultados.</td></tr>'}</table></div></div>`;
}
function itemForm(id) {
  const i = id ? item(id) : null;
  openModal(`<h3>${i ? 'Editar elemento' : 'Agregar elemento'}</h3>
  <div class="mform">
    <label>Nombre<input class="in" id="m_name" maxlength="50" value="${i ? esc(i.name) : ''}" placeholder="Ej. Trípodes"></label>
    <div class="form2"><label>Categoría<select class="in" id="m_cat">${CATS.map(c => `<option ${i && i.cat === c ? 'selected' : ''}>${c}</option>`).join('')}</select></label><label>Icono<input class="in" id="m_icon" maxlength="4" value="${i ? esc(i.icon) : '📦'}"></label></div>
    <div class="form2"><label>Código<input class="in" id="m_code" value="${i ? esc(i.code || '') : ''}" placeholder="TEC-XX-01"></label><label>Ubicación<input class="in" id="m_location" value="${i ? esc(i.location || '') : ''}" placeholder="Almacén CAT"></label></div>
    <div class="form2"><label>Cantidad total<input class="in" id="m_total" type="number" min="0" value="${i ? i.total : 1}"></label><label>Fuera de servicio<input class="in" id="m_broken" type="number" min="0" value="${i ? i.broken : 0}"></label></div>
    <label class="checkline"><input type="checkbox" id="m_aval" ${i && i.requiresAval ? 'checked' : ''}> Requiere aval para estudiantes</label>
  </div>
  <div class="acts" style="justify-content:flex-end"><button class="btn" onclick="closeModal()">Cancelar</button><button class="btn p" onclick="saveItem('${id || ''}')">Guardar</button></div>`, true);
}
function saveItem(id) {
  const name = $('#m_name').value.trim();
  const total = parseInt($('#m_total').value, 10);
  const broken = parseInt($('#m_broken').value, 10);
  if (!name) { toast('Escribe el nombre del elemento.', 'no'); return; }
  if (!(total >= 0) || !(broken >= 0) || broken > total) { toast('Revisa las cantidades: lo fuera de servicio no puede superar el total.', 'no'); return; }
  const currentOut = id ? outQ(id, new Date(), new Date()) : 0;
  if (total - broken < currentOut) { toast('No puedes dejar el inventario por debajo de las unidades que están prestadas o reservadas.', 'no'); return; }
  const data = {
    name,
    cat: $('#m_cat').value,
    icon: $('#m_icon').value.trim() || '📦',
    code: $('#m_code').value.trim(),
    location: $('#m_location').value.trim(),
    total,
    broken,
    requiresAval: $('#m_aval').checked
  };
  if (id) { Object.assign(item(id), data); toast('Inventario actualizado.', 'ok'); }
  else { db.inv.push({ id: 'i' + uid(), ...data }); toast('Elemento agregado al inventario.', 'ok'); }
  closeModal();
  commit();
}
