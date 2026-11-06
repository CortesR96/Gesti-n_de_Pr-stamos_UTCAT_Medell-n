/* ============================================================
   Vistas de administración – usuarios, grupos, reportes y ajustes
   ============================================================ */

function users() {
  const rows = db.users.slice().sort((a, b) => roleName(a.role).localeCompare(roleName(b.role)) || a.name.localeCompare(b.name)).filter(u => {
    const okRole = uf === 'Todos' || u.role === uf;
    const okStatus = us === 'Todos' || (us === 'Activos' ? u.active : !u.active);
    const s = q.toLowerCase();
    const okQ = !s || (u.name + ' ' + u.email + ' ' + (u.program || '') + ' ' + userSub(u)).toLowerCase().includes(s);
    return okRole && okStatus && okQ;
  });
  const st = db.users.filter(u => u.role === 'st').length;
  const prof = db.users.filter(u => u.role === 'prof').length;
  const active = db.users.filter(u => u.active).length;
  return `<div class="ph"><div><h1>Usuarios</h1><p>Cuentas institucionales, roles, grupos y acceso al sistema</p></div><button class="btn p" onclick="userForm()">+ Crear usuario</button></div>
  <div class="alerts"><div class="al i"><b>${db.users.length}</b>Cuentas registradas</div><div class="al" style="background:var(--okb);color:var(--ok);border-color:var(--ok)"><b>${active}</b>Cuentas activas</div><div class="al m"><b>${st}</b>Estudiantes / representantes</div><div class="al w"><b>${prof}</b>Docentes</div></div>
  <div class="filterrow"><div class="chips">${['Todos', 'admin', 'co', 'st', 'prof'].map(r => `<button class="chip ${uf === r ? 'on' : ''}" onclick="uf='${r}';render()">${r === 'Todos' ? 'Todos los roles' : roleName(r)}</button>`).join('')}</div><div class="chips">${['Todos', 'Activos', 'Inactivos'].map(s => `<button class="chip ${us === s ? 'on' : ''}" onclick="us='${s}';render()">${s}</button>`).join('')}</div></div>
  <div class="card" style="margin-top:14px"><div class="tw"><table><tr><th>Usuario</th><th>Rol</th><th>Grupo / programa</th><th>Estado</th><th>Último ingreso</th><th></th></tr>
  ${rows.map(u => `<tr><td><div class="who">${av(hash(u.email), 36)}<div><b>${esc(u.name)}${u.id === me.id ? ' <span class="you">tú</span>' : ''}</b><small>${esc(u.email)}</small></div></div></td><td>${roleBadge(u.role)}</td><td>${esc(userSub(u))}<small class="block mut">${esc(u.program || '')}</small></td><td><span class="estado ${u.active ? 'enviado' : 'error'}">${u.active ? 'Activo' : 'Inactivo'}</span></td><td>${u.lastLogin ? ago(u.lastLogin) : 'Nunca'}</td><td class="actions"><button class="btn s" onclick="userForm('${u.id}')">✎ Editar</button><button class="btn s" onclick="resetPass('${u.id}')">🔑 Clave</button><button class="btn s ${u.active ? 'd' : ''}" ${u.id === me.id ? 'disabled title="No puedes desactivar tu propia cuenta"' : `onclick="toggleUser('${u.id}')"`}>${u.active ? 'Desactivar' : 'Activar'}</button></td></tr>`).join('') || '<tr><td colspan="6" class="empty">No hay usuarios con este filtro.</td></tr>'}</table></div></div>`;
}
function userForm(id) {
  if (!isAdmin()) { toast('Solo el administrador puede gestionar usuarios.', 'no'); return; }
  const u = id ? userById(id) : null;
  const groups = db.groups.filter(g => g.active);
  const roleOpts = ['st', 'prof', 'co', 'admin'].map(r => `<option value="${r}" ${u && u.role === r ? 'selected' : ''}>${roleName(r)}</option>`).join('');
  const groupOpts = `<option value="">Selecciona un grupo…</option>` + groups.map(g => `<option value="${g.id}" ${u && u.groupId === g.id ? 'selected' : ''}>${esc(groupLabel(g))}</option>`).join('');
  openModal(`<h3>${u ? 'Editar usuario' : 'Crear usuario institucional'}</h3>
  <p class="mut" style="margin:4px 0 12px">Los correos deben pertenecer al dominio <b>@ut.edu.co</b>. La contraseña se comparte por correo de invitación.</p>
  <div class="mform">
    <label>Nombre completo<input class="in" id="u_name" maxlength="70" value="${u ? esc(u.name) : ''}" placeholder="Nombre y apellidos"></label>
    <label>Correo institucional<input class="in" id="u_email" type="email" value="${u ? esc(u.email) : ''}" placeholder="nombre.apellido@ut.edu.co" autocapitalize="none"></label>
    <div class="form2"><label>Documento<input class="in" id="u_doc" value="${u ? esc(u.doc || '') : ''}" placeholder="Opcional"></label><label>Teléfono<input class="in" id="u_phone" value="${u ? esc(u.phone || '') : ''}" placeholder="Opcional"></label></div>
    <label>Rol<select class="in" id="u_role" onchange="userRoleFields()">${roleOpts}</select></label>
    <label>Programa / dependencia<input class="in" id="u_program" list="programas" value="${u ? esc(u.program || '') : ''}" placeholder="Programa académico"><datalist id="programas">${PROGRAMAS.map(p => `<option value="${esc(p)}">`).join('')}</datalist></label>
    <div class="form2 st-only"><label>Grupo<select class="in" id="u_group" onchange="syncGroupFields()">${groupOpts}</select></label><label>Semestre<input class="in" id="u_semester" type="number" min="1" max="12" value="${u && u.semester ? u.semester : ''}"></label></div>
    <label class="prof-only">Curso / cátedra<input class="in" id="u_course" value="${u ? esc(u.course || '') : ''}" placeholder="Ej. Cátedra de Cine"></label>
    <label>Contraseña ${u ? '(dejar en blanco para conservar)' : 'temporal'}<span class="pw"><input class="in" id="u_pass" value="${u ? '' : esc(tempPass())}" placeholder="${u ? 'Sin cambios' : 'Contraseña temporal'}"><button type="button" onclick="genUserPass()" title="Generar contraseña">🎲</button></span></label>
    <label class="checkline"><input type="checkbox" id="u_active" ${!u || u.active ? 'checked' : ''}> Cuenta activa</label>
  </div>
  <div class="note">Al crear la cuenta se genera un correo de invitación con el correo y la contraseña temporal. Si no hay grupos activos, crea primero un grupo en la sección <b>Grupos</b>.</div>
  <div class="acts" style="justify-content:flex-end"><button class="btn" onclick="closeModal()">Cancelar</button><button class="btn p" onclick="saveUser('${id || ''}')">${u ? 'Guardar cambios' : 'Crear y enviar invitación'}</button></div>`, true);
  userRoleFields();
}
function userRoleFields() {
  const role = ($('#u_role') || {}).value;
  $$('.st-only').forEach(e => e.hidden = role !== 'st');
  $$('.prof-only').forEach(e => e.hidden = role !== 'prof');
}
function syncGroupFields() {
  const g = groupById(($('#u_group') || {}).value);
  if (!g) return;
  const program = $('#u_program'), sem = $('#u_semester');
  if (program) program.value = g.program;
  if (sem) sem.value = g.semester;
}
function genUserPass() {
  const p = $('#u_pass');
  if (p) p.value = tempPass();
}
function tempPass() {
  return 'UT' + Math.floor(100000 + Math.random() * 900000);
}
async function saveUser(id) {
  if (!isAdmin()) return;
  const name = $('#u_name').value.trim();
  const email = $('#u_email').value.trim().toLowerCase();
  const role = $('#u_role').value;
  const doc = $('#u_doc').value.trim();
  const phone = $('#u_phone').value.trim();
  const active = $('#u_active').checked;
  const course = role === 'prof' ? ($('#u_course').value || '').trim() : '';
  const groupId = role === 'st' ? (($('#u_group') || {}).value || '') : '';
  const g = groupId ? groupById(groupId) : null;
  let program = ($('#u_program').value || '').trim();
  let semester = role === 'st' ? (parseInt(($('#u_semester') || {}).value, 10) || null) : null;
  if (role === 'st') {
    if (!g) { toast('Selecciona un grupo para el estudiante.', 'no'); return; }
    program = g.program;
    semester = g.semester;
  }
  if (role === 'prof' && !program) { toast('Escribe el programa o dependencia del docente.', 'no'); return; }
  if (!name) { toast('Escribe el nombre completo.', 'no'); return; }
  if (!/^[^\s@]+@ut\.edu\.co$/i.test(email)) { toast('El correo debe terminar en @ut.edu.co.', 'no'); $('#u_email').focus(); return; }
  const dup = db.users.find(x => x.email.toLowerCase() === email && x.id !== id);
  if (dup) { toast('Ya existe una cuenta con ese correo institucional.', 'no'); return; }
  const pass = ($('#u_pass').value || '').trim();
  if (!id && !pass) { toast('Genera una contraseña temporal.', 'no'); return; }
  if (id && pass && pass.length < 6) { toast('La nueva contraseña debe tener al menos 6 caracteres.', 'no'); return; }
  if (id) {
    const u = userById(id);
    if (!u) return;
    if (u.id === me.id && !active) { toast('No puedes desactivar tu propia cuenta.', 'no'); return; }
    if (u.id === me.id && role !== me.role) { toast('No puedes cambiar tu propio rol desde este formulario.', 'no'); return; }
    u.name = name; u.email = email; u.role = role; u.doc = doc; u.phone = phone;
    u.program = program; u.semester = semester; u.groupId = role === 'st' ? groupId : null;
    u.course = course; u.active = active;
    const changed = !!pass && pass !== u.pass;
    if (changed) u.pass = pass;
    save();
    let em = null;
    if (changed) em = await emailUser(u.id, tplReset(u, pass));
    me = userById(me.id) || me;
    closeModal(); commit();
    if (em) openEmail(em.id);
    toast('Usuario actualizado.', 'ok');
  } else {
    const nu = {
      id: 'u_' + uid(), name, email, pass, role, doc, phone, program,
      semester: role === 'st' ? semester : null,
      groupId: role === 'st' ? groupId : null,
      course, active, createdAt: Date.now(), lastLogin: null
    };
    db.users.push(nu);
    save();
    const em = active ? await emailUser(nu.id, tplInvite(nu, pass)) : null;
    closeModal(); commit();
    if (em) openEmail(em.id);
    toast(active ? 'Usuario creado. Revisa la invitación generada.' : 'Usuario creado inactivo.', 'ok');
  }
}
function toggleUser(id) {
  const u = userById(id);
  if (!u) return;
  if (u.id === me.id) { toast('No puedes desactivar tu propia cuenta.', 'no'); return; }
  u.active = !u.active;
  if (!u.active) db.groups.forEach(g => { if (g.repId === u.id) g.repId = null; });
  save(); commit();
  toast(u.active ? 'Usuario activado.' : 'Usuario desactivado. Sus registros históricos se conservan.', u.active ? 'ok' : 'info');
}
async function resetPass(id) {
  const u = userById(id);
  if (!u) return;
  if (!confirm(`¿Generar una nueva contraseña temporal para ${u.name}?`)) return;
  const pass = tempPass();
  u.pass = pass;
  save();
  const em = await emailUser(u.id, tplReset(u, pass));
  commit();
  if (em) openEmail(em.id);
  toast('Contraseña restablecida. Se generó el correo correspondiente.', 'ok');
}

/* ---------- Grupos ---------- */
function groups() {
  const active = db.groups.filter(g => g.active).length;
  const reps = db.groups.filter(g => g.repId).length;
  return `<div class="ph"><div><h1>Grupos</h1><p>Semilleros, clubes y representantes estudiantiles</p></div><button class="btn p" onclick="groupForm()">+ Crear grupo</button></div>
  <div class="alerts"><div class="al i"><b>${db.groups.length}</b>Grupos registrados</div><div class="al" style="background:var(--okb);color:var(--ok);border-color:var(--ok)"><b>${active}</b>Grupos activos</div><div class="al m"><b>${reps}</b>Con representante asignado</div><div class="al w"><b>${db.users.filter(u => u.role === 'st' && !u.groupId).length}</b>Estudiantes sin grupo</div></div>
  <div class="card"><div class="tw"><table><tr><th>Grupo</th><th>Programa / facultad</th><th>Semestre</th><th>Representante</th><th>Miembros</th><th>Solicitudes</th><th>Estado</th><th></th></tr>
  ${db.groups.map(g => { const rep = userById(g.repId); const count = db.reqs.filter(r => r.groupId === g.id).length; return `<tr><td><b>${esc(g.name)}</b><small class="block mut">${esc(g.period)} · ${esc(g.jornada)}</small></td><td>${esc(g.program)}<small class="block mut">${esc(g.faculty || '')}</small></td><td>${g.semester}</td><td>${rep ? `<div class="who">${av(hash(rep.email), 28)}<span>${esc(rep.name)}</span></div>` : '<span class="mut">Sin asignar</span>'}</td><td>${g.members || 0}</td><td>${count}</td><td><span class="estado ${g.active ? 'enviado' : 'error'}">${g.active ? 'Activo' : 'Inactivo'}</span></td><td class="actions"><button class="btn s" onclick="groupForm('${g.id}')">✎ Editar</button><button class="btn s d" onclick="deleteGroup('${g.id}')">🗑 Eliminar</button></td></tr>`; }).join('') || '<tr><td colspan="8" class="empty">No hay grupos registrados.</td></tr>'}</table></div></div>`;
}
function groupForm(id) {
  if (!isAdmin()) { toast('Solo el administrador puede gestionar grupos.', 'no'); return; }
  const g = id ? groupById(id) : null;
  const reps = db.users.filter(u => u.active && u.role === 'st');
  const repOpts = `<option value="">Sin representante</option>` + reps.map(u => `<option value="${u.id}" ${g && g.repId === u.id ? 'selected' : ''}>${esc(u.name)} · ${esc(u.email)}</option>`).join('');
  openModal(`<h3>${g ? 'Editar grupo' : 'Crear grupo'}</h3>
  <div class="mform">
    <label>Nombre del grupo<input class="in" id="g_name" maxlength="60" value="${g ? esc(g.name) : ''}" placeholder="Ej. Semillero de investigación"></label>
    <label>Programa<input class="in" id="g_program" list="programas2" value="${g ? esc(g.program) : ''}" placeholder="Programa académico"><datalist id="programas2">${PROGRAMAS.map(p => `<option value="${esc(p)}">`).join('')}</datalist></label>
    <label>Facultad / dependencia<input class="in" id="g_faculty" value="${g ? esc(g.faculty || '') : ''}" placeholder="Facultad de Ciencias de la Educación"></label>
    <div class="form2"><label>Semestre<input class="in" id="g_semester" type="number" min="1" max="12" value="${g ? g.semester : 1}"></label><label>Miembros<input class="in" id="g_members" type="number" min="1" value="${g ? g.members : 1}"></label></div>
    <div class="form2"><label>Jornada<select class="in" id="g_jornada"><option ${g && g.jornada === 'Diurna' ? 'selected' : ''}>Diurna</option><option ${g && g.jornada === 'Nocturna' ? 'selected' : ''}>Nocturna</option><option ${g && g.jornada === 'Mixta' ? 'selected' : ''}>Mixta</option></select></label><label>Periodo<input class="in" id="g_period" value="${g ? esc(g.period) : esc(db.settings.period)}"></label></div>
    <label>Representante<select class="in" id="g_rep">${repOpts}</select></label>
    <label class="checkline"><input type="checkbox" id="g_active" ${!g || g.active ? 'checked' : ''}> Grupo activo</label>
  </div>
  <div class="note">Puedes repetir el nombre del grupo si cambias el semestre, la jornada o el periodo: se diferenciarán por esos datos. Escribe el nombre base, por ejemplo <b>Grupo 1 Ingeniería de Sistemas</b>, y elige el semestre en el campo correspondiente. Al asignar un representante, su cuenta queda vinculada al grupo y hereda programa y semestre.</div>
  <div class="acts" style="justify-content:flex-end"><button class="btn" onclick="closeModal()">Cancelar</button><button class="btn p" onclick="saveGroup('${id || ''}')">Guardar</button></div>`, true);
}
function saveGroup(id) {
  if (!isAdmin()) return;
  const name = $('#g_name').value.trim();
  const program = $('#g_program').value.trim();
  const faculty = $('#g_faculty').value.trim();
  const semester = parseInt($('#g_semester').value, 10);
  const members = parseInt($('#g_members').value, 10) || 0;
  const jornada = $('#g_jornada').value;
  const period = $('#g_period').value.trim() || db.settings.period;
  const repId = $('#g_rep').value || null;
  const active = $('#g_active').checked;
  if (!name) { toast('Escribe el nombre del grupo.', 'no'); return; }
  if (!program) { toast('Escribe el programa del grupo.', 'no'); return; }
  if (!(semester >= 1)) { toast('Revisa el semestre.', 'no'); return; }
  const duplicate = db.groups.find(x =>
    x.id !== id &&
    x.name.trim().toLowerCase() === name.toLowerCase() &&
    x.program.trim().toLowerCase() === program.toLowerCase() &&
    x.semester === semester &&
    x.jornada === jornada &&
    x.period.trim().toLowerCase() === period.toLowerCase()
  );
  if (duplicate) { toast('Ya existe un grupo con ese nombre, programa, semestre, jornada y periodo. Cambia el semestre o el periodo para crear otro.', 'no'); return; }
  let g = id ? groupById(id) : null;
  if (!g) { g = { id: 'g_' + uid(), createdAt: Date.now() }; db.groups.push(g); }
  Object.assign(g, { name, program, faculty, semester, members, jornada, period, repId, active });
  if (repId) {
    const rep = userById(repId);
    if (rep) {
      rep.groupId = g.id;
      rep.program = program;
      rep.semester = semester;
    }
    db.groups.forEach(other => { if (other.id !== g.id && other.repId === repId) other.repId = null; });
  }
  save(); closeModal(); commit();
  toast(id ? 'Grupo actualizado.' : 'Grupo creado.', 'ok');
}
function deleteGroup(id) {
  if (!isAdmin()) { toast('Solo el administrador puede eliminar grupos.', 'no'); return; }
  const g = groupById(id);
  if (!g) return;
  const linked = db.users.filter(u => u.groupId === id);
  const requests = db.reqs.filter(r => r.groupId === id);
  const rep = userById(g.repId);
  let msg = `¿Eliminar el grupo “${groupLabel(g)}”?`;
  if (linked.length) msg += `\n\n${linked.length} usuario(s) quedarán sin grupo${rep ? ' (incluido el representante)' : ''}.`;
  if (requests.length) msg += `\n\nSe conservarán ${requests.length} solicitud(es) en el historial con el nombre del grupo.`;
  msg += '\n\nEsta acción no se puede deshacer.';
  if (!confirm(msg)) return;
  linked.forEach(u => { u.groupId = null; });
  db.groups = db.groups.filter(x => x.id !== id);
  save();
  commit();
  toast('Grupo eliminado. Las solicitudes históricas se conservaron.', 'ok');
}

/* ---------- Reportes ---------- */
function reports() {
  const s = requestStats();
  const statuses = ['Pendiente', 'Aprobada', 'En préstamo', 'Devuelta', 'Rechazada', 'Cancelada'];
  const top = {};
  db.reqs.filter(r => !['Rechazada', 'Cancelada'].includes(r.status)).forEach(r => r.items.forEach(([id, q]) => { const i = item(id); if (i) top[i.name] = (top[i.name] || 0) + q; }));
  const topArr = Object.entries(top).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const groupMap = {};
  db.reqs.forEach(r => { const k = r.group || 'Sin grupo'; groupMap[k] = groupMap[k] || { n: 0, active: 0 }; groupMap[k].n++; if (ACTIVE.includes(r.status)) groupMap[k].active++; });
  const groupArr = Object.entries(groupMap).sort((a, b) => b[1].n - a[1].n).slice(0, 8);
  return `<div class="ph"><div><h1>Reportes</h1><p>Indicadores de uso, estados y trazabilidad del periodo ${esc(db.settings.period)}</p></div><div class="acts" style="margin:0"><button class="btn" onclick="exportCSV()">⬇ Exportar CSV</button><button class="btn" onclick="printDoc()">🖨 Imprimir / PDF</button></div></div>
  <div class="grid5"><div class="card kpi"><div class="ic">📋</div><small>Solicitudes totales</small><b>${db.reqs.length}</b><span>Histórico del demo</span></div><div class="card kpi"><div class="ic">✅</div><small>Devoluciones</small><b>${s.returned}</b><span>Préstamos cerrados</span></div><div class="card kpi"><div class="ic">📦</div><small>Disponibilidad</small><b>${s.available}</b><span>de ${s.total} unidades</span></div><div class="card kpi"><div class="ic">⚠️</div><small>Novedades</small><b>${s.broken}</b><span>Unidades fuera de servicio</span></div><div class="card kpi"><div class="ic">✉️</div><small>Correos</small><b>${s.emails}</b><span>${s.emailErrors} con error</span></div></div>
  <div class="two"><div class="card"><h3>Solicitudes por estado</h3><div class="reportlist">${statuses.map(st => { const n = db.reqs.filter(r => r.status === st).length; return `<div><span>${tag(st)}</span><b>${n}</b><i style="width:${db.reqs.length ? n / db.reqs.length * 100 : 0}%"></i></div>`; }).join('')}</div></div>
  <div class="card"><h3>Elementos más solicitados</h3><div class="reportlist">${topArr.map(([n, q]) => `<div><span>${esc(n)}</span><b>${q}</b><i style="width:${topArr[0] ? q / topArr[0][1] * 100 : 0}%"></i></div>`).join('') || '<p class="empty">Sin datos.</p>'}</div></div></div>
  <div class="card" style="margin-top:14px"><h3 style="margin-bottom:8px">Uso por grupo / curso</h3><div class="tw"><table><tr><th>Grupo / curso</th><th>Solicitudes</th><th>Activas</th></tr>${groupArr.map(([g, v]) => `<tr><td>${esc(g)}</td><td>${v.n}</td><td>${v.active}</td></tr>`).join('') || '<tr><td colspan="3" class="empty">Sin datos.</td></tr>'}</table></div></div>`;
}
function printDoc() {
  const meta = $('#printmeta');
  if (meta) meta.textContent = `Generado el ${new Date().toLocaleString('es-CO')} · Periodo ${db.settings.period}`;
  window.print();
}
function exportCSV() {
  const head = ['Solicitud', 'Creada', 'Solicitante', 'Correo', 'Rol', 'Grupo / curso', 'Programa', 'Actividad', 'Fecha de uso', 'Hora', 'Devolución', 'Hora devolución', 'Elementos', 'Estado', 'Respuesta'];
  const rows = db.reqs.slice().sort(byNew).map(r => [r.id, new Date(r.created).toLocaleString('es-CO'), r.ownerName, r.ownerEmail, r.ownerRole, r.group, r.program || '', r.act, r.date, r.time || '', r.ret, r.retTime || '', itemsText(r), r.status, r.note || '']);
  const csv = [head, ...rows].map(row => row.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(';')).join('\r\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `prestamos-ut-${dayPlus(0)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  toast('Reporte CSV descargado.', 'ok');
}

/* ---------- Configuración ---------- */
function cfg() {
  if (!isAdmin()) return dash();
  const c = db.settings.emailjs || {};
  return `<div class="ph"><div><h1>Configuración</h1><p>Datos del demo, correo real y respaldo</p></div></div>
  <div class="cfgGrid">
    <div class="card"><h3>Periodo académico</h3><p class="mut" style="margin:4px 0 12px">Se usa en las invitaciones y en la cabecera del sistema.</p><div class="mform"><label>Periodo<input class="in" id="cfg_period" value="${esc(db.settings.period)}" placeholder="2026-2"></label><label>Nombre del CAT<input class="in" id="cfg_cat" value="${esc(db.settings.catName)}"></label></div><div class="acts"><button class="btn p" onclick="savePeriod()">Guardar</button></div></div>
    <div class="card"><h3>Correo</h3><p class="mut" style="margin:4px 0 12px">${c.enabled ? 'Envío real activo con EmailJS.' : 'Bandeja simulada: los correos no salen a internet.'}</p><div class="kv"><div><small>Service ID</small><b>${esc(c.serviceId || '—')}</b></div><div><small>Template ID</small><b>${esc(c.templateId || '—')}</b></div><div><small>Public Key</small><b>${c.publicKey ? '••••' + esc(c.publicKey.slice(-4)) : '—'}</b></div><div><small>Estado</small><b>${c.enabled ? 'Real' : 'Simulado'}</b></div></div><div class="acts"><button class="btn p" onclick="emailSettings()">Configurar correo</button><button class="btn" onclick="go('emails','Correos')">Ver bandeja</button></div></div>
    <div class="card"><h3>Respaldo</h3><p class="mut" style="margin:4px 0 12px">Descarga un JSON con usuarios, grupos, solicitudes y correos del demo.</p><div class="acts"><button class="btn" onclick="downloadBackup()">⬇ Descargar respaldo</button></div></div>
    <div class="card"><h3>Demostración</h3><p class="mut" style="margin:4px 0 12px">Restablece todo al estado inicial o abre el guion de la presentación.</p><div class="acts"><button class="btn" onclick="showGuide()">📋 Abrir guion</button><button class="btn d" onclick="resetDemo()">Restablecer demo</button></div></div>
  </div>
  <div class="card" style="margin-top:14px"><h3>Acerca de este prototipo</h3><p class="mut" style="margin:6px 0 0">Demo funcional para la Universidad del Tolima · CAT Medellín. Los datos viven en <code>localStorage</code> de este navegador: no hay backend, autenticación real ni sincronización entre dispositivos. Las contraseñas son visibles en el código y deben tratarse como datos de demostración. La versión de producción está documentada en <code>docs/PLAN-MAESTRO.md</code>.</p></div>`;
}
function savePeriod() {
  const p = ($('#cfg_period').value || '').trim();
  if (!p) { toast('Escribe el periodo académico.', 'no'); return; }
  db.settings.period = p;
  db.settings.catName = ($('#cfg_cat').value || '').trim() || 'CAT Medellín';
  save(); toast('Configuración guardada.', 'ok'); render(); nav();
}
function downloadBackup() {
  const data = { exportedAt: new Date().toISOString(), db };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `prestamos-ut-backup-${dayPlus(0)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  toast('Respaldo descargado.', 'ok');
}
function resetDemo() {
  if (!confirm('¿Borrar los cambios de la demostración y volver al estado inicial?')) return;
  db = seed();
  save();
  sessionStorage.removeItem(SESSION_KEY);
  location.reload();
}
