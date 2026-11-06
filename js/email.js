/* ============================================================
   Correos – plantillas, bandeja de demostración y EmailJS opcional
   Por defecto todos los correos quedan en la bandeja local.
   Si se configura EmailJS en Configuración → Correo, se intenta
   enviar de verdad con la API pública (sin backend).
   ============================================================ */

const UT_FROM = 'Préstamos UT · CAT Medellín';
const UT_REPLY = 'cmedellin@ut.edu.co';

function appLink() {
  return (location.origin + location.pathname).replace(/index\.html$/, '');
}

function mailShell(title, body, footer) {
  return `<div style="margin:0;padding:24px;background:#f3f0f1;font-family:Arial,Helvetica,sans-serif;color:#1c1c1c">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e2dfe0;border-radius:16px;overflow:hidden">
    <div style="background:#7a1230;padding:20px 24px;color:#ffffff">
      <div style="font-size:11px;letter-spacing:.08em;text-transform:uppercase;opacity:.82">Universidad del Tolima · CAT Medellín</div>
      <div style="font-family:Georgia,serif;font-size:21px;font-weight:bold;margin-top:4px">${esc(title)}</div>
    </div>
    <div style="padding:24px;font-size:14px;line-height:1.6">${body}</div>
    <div style="padding:14px 24px;background:#f7f5f6;border-top:1px solid #e2dfe0;color:#6b6b6b;font-size:11px;line-height:1.5">
      ${footer || 'Correo automático del Sistema de Préstamo de Materiales y Espacios. Prototipo académico de la Universidad del Tolima.'}
    </div>
  </div>
</div>`;
}

function detailBox(rows) {
  return `<div style="margin:16px 0;padding:14px 16px;background:#f7f5f6;border-left:4px solid #7a1230;border-radius:8px;font-size:13px;line-height:1.7">${rows.map(([k, v]) => `<div><b>${esc(k)}:</b> ${v}</div>`).join('')}</div>`;
}
function cta(label) {
  return `<p style="margin:20px 0 8px"><a href="${appLink()}" style="display:inline-block;background:#7a1230;color:#ffffff;text-decoration:none;padding:11px 18px;border-radius:9px;font-weight:bold">${esc(label)}</a></p>`;
}

function tplInvite(u, pass) {
  const subject = 'Tu cuenta en Préstamos UT está lista';
  const html = mailShell('Bienvenido/a a Préstamos UT', `
    <p>Hola <b>${esc(u.name)}</b>,</p>
    <p>La coordinación del CAT Medellín creó tu cuenta en el Sistema de Préstamo de Materiales y Espacios.</p>
    ${detailBox([
      ['Correo institucional', `<b>${esc(u.email)}</b>`],
      ['Contraseña temporal', `<b>${esc(pass)}</b>`],
      ['Rol', esc(roleName(u.role))],
      ['Periodo', esc(db.settings.period)]
    ])}
    <p>Ingresa con tu correo institucional y cambia la contraseña cuando puedas.</p>
    ${cta('Ingresar a la aplicación')}
    <p style="color:#6b6b6b;font-size:12px">Si no reconoces esta cuenta, informa a la coordinación del CAT.</p>`);
  const text = `Hola ${u.name},\n\nLa coordinación del CAT Medellín creó tu cuenta en Préstamos UT.\n\nCorreo: ${u.email}\nContraseña temporal: ${pass}\nRol: ${roleName(u.role)}\n\nIngresa en: ${appLink()}\n\nEste es un correo de demostración del prototipo académico.`;
  return { subject, html, text, template: 'invitacion' };
}

function tplRequestReceived(r) {
  const subject = `Recibimos tu solicitud ${r.id}`;
  const html = mailShell('Solicitud recibida', `
    <p>Hola <b>${esc(r.ownerName)}</b>,</p>
    <p>Tu solicitud fue registrada. La coordinación del CAT la revisará y te responderá por este mismo medio.</p>
    ${detailBox([
      ['Solicitud', `<b>${esc(r.id)}</b>`],
      ['Actividad', esc(r.act)],
      ['Fechas', `${fmt(r.date)} ${r.time || ''} → ${fmt(r.ret)} ${r.retTime || ''}`],
      ['Elementos', esc(itemsText(r))]
    ])}
    ${cta('Ver el estado de mi solicitud')}
    <p style="color:#6b6b6b;font-size:12px">Las existencias quedan reservadas únicamente cuando la coordinación aprueba la solicitud.</p>`);
  const text = `Hola ${r.ownerName},\n\nRecibimos tu solicitud ${r.id}.\nActividad: ${r.act}\nFechas: ${fmt(r.date)} ${r.time} a ${fmt(r.ret)} ${r.retTime}\nElementos: ${itemsText(r)}\n\nLa coordinación la revisará y te responderá.\n\n${appLink()}`;
  return { subject, html, text, template: 'solicitud_recibida' };
}

function tplNewRequest(r) {
  const subject = `Nueva solicitud ${r.id} – ${r.ownerName}`;
  const html = mailShell('Nueva solicitud de préstamo', `
    <p>La coordinación recibió una nueva solicitud que requiere revisión.</p>
    ${detailBox([
      ['Solicitud', `<b>${esc(r.id)}</b>`],
      ['Solicitante', `${esc(r.ownerName)} · ${esc(r.ownerEmail)}`],
      ['Rol', esc(r.ownerRole)],
      [r.ownerRole === 'Docente' ? 'Curso' : 'Grupo', esc(r.group)],
      ['Programa', esc(r.program || '—')],
      ['Actividad', esc(r.act)],
      ['Fechas', `${fmt(r.date)} ${r.time || ''} → ${fmt(r.ret)} ${r.retTime || ''}`],
      ['Elementos', esc(itemsText(r))]
    ])}
    ${r.obs ? `<p><b>Observaciones del solicitante:</b><br>${esc(r.obs)}</p>` : ''}
    ${cta('Revisar en la aplicación')}
    <p style="color:#6b6b6b;font-size:12px">Puedes aprobar, rechazar con motivo o ajustar la solicitud a la disponibilidad por fechas.</p>`);
  const text = `Nueva solicitud ${r.id}\n\nSolicitante: ${r.ownerName} (${r.ownerEmail})\n${r.ownerRole === 'Docente' ? 'Curso' : 'Grupo'}: ${r.group}\nActividad: ${r.act}\nFechas: ${fmt(r.date)} ${r.time} a ${fmt(r.ret)} ${r.retTime}\nElementos: ${itemsText(r)}\n\n${r.obs ? 'Observaciones: ' + r.obs + '\n\n' : ''}Revisar: ${appLink()}`;
  return { subject, html, text, template: 'nueva_solicitud' };
}

function tplDecision(r, ok, note) {
  const subject = `Solicitud ${r.id} ${ok ? 'aprobada' : 'rechazada'}`;
  const html = mailShell(ok ? 'Tu solicitud fue aprobada' : 'Tu solicitud fue rechazada', `
    <p>Hola <b>${esc(r.ownerName)}</b>,</p>
    <p>La coordinación del CAT Medellín ${ok ? 'aprobó' : 'rechazó'} tu solicitud <b>${esc(r.id)}</b>.</p>
    ${detailBox([
      ['Actividad', esc(r.act)],
      ['Fechas', `${fmt(r.date)} ${r.time || ''} → ${fmt(r.ret)} ${r.retTime || ''}`],
      ['Elementos', esc(itemsText(r))],
      ['Respuesta de coordinación', note ? esc(note) : (ok ? 'Sin observaciones adicionales.' : 'Sin motivo registrado.')]
    ])}
    ${ok ? '<p>Cuando recojas el material, la coordinación registrará la entrega. Recuerda devolverlo en la fecha acordada.</p>' : '<p>Si necesitas ajustar la solicitud, puedes crear una nueva con otras fechas o elementos.</p>'}
    ${cta('Ver mi historial')}
    <p style="color:#6b6b6b;font-size:12px">Este mensaje también está disponible en la campana de notificaciones de la aplicación.</p>`);
  const text = `Hola ${r.ownerName},\n\nTu solicitud ${r.id} fue ${ok ? 'aprobada' : 'rechazada'}.\n${note ? 'Respuesta: ' + note + '\n' : ''}\nActividad: ${r.act}\nFechas: ${fmt(r.date)} a ${fmt(r.ret)}\nElementos: ${itemsText(r)}\n\n${appLink()}`;
  return { subject, html, text, template: ok ? 'aprobacion' : 'rechazo' };
}

function tplAdjusted(r) {
  const subject = `Solicitud ${r.id} ajustada a disponibilidad`;
  const html = mailShell('Solicitud ajustada', `
    <p>Hola <b>${esc(r.ownerName)}</b>,</p>
    <p>La coordinación ajustó las cantidades de tu solicitud <b>${esc(r.id)}</b> a la disponibilidad real para las fechas solicitadas.</p>
    ${detailBox([
      ['Actividad', esc(r.act)],
      ['Fechas', `${fmt(r.date)} ${r.time || ''} → ${fmt(r.ret)} ${r.retTime || ''}`],
      ['Elementos ajustados', esc(itemsText(r))]
    ])}
    <p>La solicitud sigue <b>pendiente de aprobación</b>. Revisa los cambios en tu historial.</p>
    ${cta('Ver mi solicitud')}`);
  const text = `Hola ${r.ownerName},\n\nLa coordinación ajustó tu solicitud ${r.id} a la disponibilidad para las fechas solicitadas.\nElementos: ${itemsText(r)}\n\nLa solicitud sigue pendiente de aprobación.\n\n${appLink()}`;
  return { subject, html, text, template: 'ajuste' };
}

function tplDelivery(r) {
  const subject = `Entrega registrada – ${r.id}`;
  const html = mailShell('Entrega registrada', `
    <p>Hola <b>${esc(r.ownerName)}</b>,</p>
    <p>La coordinación registró la entrega de los elementos de tu solicitud <b>${esc(r.id)}</b>.</p>
    ${detailBox([
      ['Elementos', esc(itemsText(r))],
      ['Fecha de devolución', `${fmt(r.ret)} ${r.retTime || ''}`],
      ['Grupo / curso', esc(r.group)]
    ])}
    <p>Por favor revisa el estado del material al recibirlo y devuélvelo en la fecha acordada.</p>
    ${cta('Ver mi solicitud')}`);
  const text = `Hola ${r.ownerName},\n\nSe registró la entrega de tu solicitud ${r.id}.\nElementos: ${itemsText(r)}\nDevolver antes de: ${fmt(r.ret)} ${r.retTime || ''}\n\n${appLink()}`;
  return { subject, html, text, template: 'entrega' };
}

function tplReturn(r) {
  const nov = (r.novedades || []).length
    ? detailBox(r.novedades.map(n => [n.item, `${n.qty} unidad(es) · ${n.tipo}${n.nota ? ' · ' + n.nota : ''}`]))
    : '<p>No se registraron novedades en la devolución.</p>';
  const subject = `Devolución recibida – ${r.id}`;
  const html = mailShell('Devolución recibida', `
    <p>Hola <b>${esc(r.ownerName)}</b>,</p>
    <p>La coordinación registró la devolución de tu solicitud <b>${esc(r.id)}</b>.</p>
    ${detailBox([
      ['Elementos', esc(itemsText(r))],
      ['Estado', r.novedades && r.novedades.length ? 'Recibida con novedades' : 'Recibida sin novedades']
    ])}
    ${nov}
    <p>Gracias por cuidar los recursos del CAT Medellín.</p>
    ${cta('Ver mi historial')}`);
  const text = `Hola ${r.ownerName},\n\nRecibimos la devolución de tu solicitud ${r.id}.\nElementos: ${itemsText(r)}\n${(r.novedades || []).map(n => `Novedad: ${n.item} · ${n.qty} ${n.tipo}${n.nota ? ' · ' + n.nota : ''}`).join('\n')}\n\n${appLink()}`;
  return { subject, html, text, template: 'devolucion' };
}

function tplCancelled(r) {
  const subject = `Solicitud cancelada – ${r.id}`;
  const html = mailShell('Solicitud cancelada', `
    <p>La solicitud <b>${esc(r.id)}</b> de <b>${esc(r.ownerName)}</b> fue cancelada por el solicitante.</p>
    ${detailBox([['Actividad', esc(r.act)], ['Elementos', esc(itemsText(r))]])}
    ${cta('Ver solicitudes')}`);
  const text = `La solicitud ${r.id} de ${r.ownerName} fue cancelada.\n\n${appLink()}`;
  return { subject, html, text, template: 'cancelacion' };
}

function tplReset(u, pass) {
  const subject = 'Nueva contraseña temporal – Préstamos UT';
  const html = mailShell('Contraseña restablecida', `
    <p>Hola <b>${esc(u.name)}</b>,</p>
    <p>La coordinación generó una nueva contraseña temporal para tu cuenta.</p>
    ${detailBox([['Correo', esc(u.email)], ['Contraseña temporal', `<b>${esc(pass)}</b>`]])}
    ${cta('Ingresar a la aplicación')}
    <p style="color:#6b6b6b;font-size:12px">Si no solicitaste este cambio, informa de inmediato a la coordinación del CAT.</p>`);
  const text = `Hola ${u.name},\n\nNueva contraseña temporal: ${pass}\nCorreo: ${u.email}\n\n${appLink()}`;
  return { subject, html, text, template: 'reset_password' };
}

function tplTest(to) {
  const subject = 'Prueba de correo – Préstamos UT CAT Medellín';
  const html = mailShell('Prueba de correo', `
    <p>Este es un correo de prueba enviado desde la configuración del prototipo.</p>
    ${detailBox([['Destinatario', esc(to)], ['Fecha', new Date().toLocaleString('es-CO')]])}
    <p>Si lo recibes, la integración con EmailJS está funcionando.</p>`);
  const text = `Correo de prueba de Préstamos UT.\nDestinatario: ${to}\nFecha: ${new Date().toLocaleString('es-CO')}`;
  return { subject, html, text, template: 'prueba' };
}

/* ---------- Cola / bandeja ---------- */
async function queueEmail({ to, toName, tpl, reqId }) {
  if (!to) return null;
  const cfg = db.settings.emailjs || {};
  const email = {
    id: 'e' + uid(),
    to,
    toName: toName || '',
    from: UT_FROM,
    replyTo: UT_REPLY,
    subject: tpl.subject,
    template: tpl.template,
    html: tpl.html,
    text: tpl.text,
    reqId: reqId || null,
    ts: Date.now(),
    status: cfg.enabled ? 'pendiente' : 'simulado',
    sentAt: null,
    error: ''
  };
  db.emails.unshift(email);
  db.emails = db.emails.slice(0, 400);
  save();
  window.dispatchEvent(new CustomEvent('emails:updated'));

  if (cfg.enabled) {
    try {
      await sendEmailJS(email);
    } catch (e) {
      email.status = 'error';
      email.error = String(e && e.message ? e.message : e);
      save();
      window.dispatchEvent(new CustomEvent('emails:updated'));
    }
  }
  return email;
}

function emailUser(userId, tpl, reqId) {
  const u = userById(userId);
  if (!u) return null;
  return queueEmail({ to: u.email, toName: u.name, tpl, reqId });
}
function emailRoles(roles, tpl, reqId) {
  const seen = new Set();
  db.users
    .filter(u => u.active && roles.includes(u.role))
    .forEach(u => {
      if (seen.has(u.email.toLowerCase())) return;
      seen.add(u.email.toLowerCase());
      queueEmail({ to: u.email, toName: u.name, tpl, reqId });
    });
}

async function sendEmailJS(email) {
  const cfg = db.settings.emailjs || {};
  if (!cfg.enabled) return;
  if (!cfg.serviceId || !cfg.templateId || !cfg.publicKey) {
    throw new Error('Falta service ID, template ID o public key de EmailJS.');
  }
  const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id: cfg.serviceId,
      template_id: cfg.templateId,
      user_id: cfg.publicKey,
      template_params: {
        to_email: email.to,
        to_name: email.toName,
        subject: email.subject,
        message: email.text,
        from_name: UT_FROM,
        reply_to: UT_REPLY
      }
    })
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(txt || ('EmailJS respondió ' + res.status));
  }
  email.status = 'enviado';
  email.sentAt = Date.now();
  email.error = '';
  save();
  window.dispatchEvent(new CustomEvent('emails:updated'));
}

function mailtoHref(email) {
  return `mailto:${encodeURIComponent(email.to)}?subject=${encodeURIComponent(email.subject)}&body=${encodeURIComponent(email.text)}`;
}


