/* ============================================================
   Gestión de Préstamos – UT CAT Medellín
   Lógica de la aplicación (datos de demostración en memoria).
   Más adelante los datos (REQ, INV, CAT) vendrán de una base de datos.
   ============================================================ */

const $=s=>document.querySelector(s);
function av(seed,sz=36){const sk=['#f1c9a5','#d9a273','#a8734a','#f5d7bd','#8a5a3b'],hr=['#2b1b14','#141414','#6b3a1f','#3a2a22','#a1121f'],sh=['#7a1230','#141414','#8a8a8a','#5c0d24','#444'];
 const a=seed%5,b=(seed*3)%5,c=(seed*2+1)%5;
 return `<svg width="${sz}" height="${sz}" viewBox="0 0 40 40" style="border-radius:50%;flex:none"><rect width="40" height="40" fill="#efe6e8"/><path d="M5 40c2-9 9-11 15-11s13 2 15 11z" fill="${sh[c]}"/><rect x="17" y="24" width="6" height="6" fill="${sk[a]}"/><ellipse cx="20" cy="17" rx="8" ry="9" fill="${sk[a]}"/><path d="M11.5 16c0-8 5-10 9-10s8.5 2 8.5 10c-2-4-5-5-8.5-5s-6 1-9 5z" fill="${hr[b]}"/><circle cx="17" cy="18" r="1" fill="#222"/><circle cx="23" cy="18" r="1" fill="#222"/><path d="M17.5 22q2.5 2 5 0" stroke="#222" fill="none" stroke-width="1"/></svg>`}
const P={home:'M3 11l9-8 9 8v10H3zM9 21v-7h6v7',req:'M6 3h9l4 4v14H6zM9 12h7M9 16h7',inv:'M3 7l9-4 9 4v10l-9 4-9-4zM3 7l9 4 9-4M12 11v10',mat:'M4 8h16v12H4zM8 8V5h8v3',esp:'M3 21V9l9-6 9 6v12M9 21v-6h6v6',dev:'M4 12a8 8 0 1 0 3-6M4 4v4h4',rep:'M4 20V4M4 20h16M8 16v-5M12 16V8M16 16v-8',cfg:'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19 12l2-1-1-3-2 .5-1.5-1.5.5-2-3-1-1 2h-2l-1-2-3 1 .5 2L6 8.500 4 8l-1 3 2 1v2l-2 1 1 3 2-.5L7.500 19l-.5 2 3 1 1-2h2l1 2 3-1-.5-2 1.500-1.500 2 .5 1-3-2-1z'};
const NAV=[['home','Panel principal','dash'],['req','Solicitudes','det'],['inv','Inventario','inv'],['mat','Materiales','inv'],['esp','Espacios','inv'],['dev','Devoluciones','dev'],['rep','Reportes','dev'],['cfg','Configuración','dev']];
let role='st',cur='sdash',cat='Todos',nm='Inicio',q='',cart={},done=0;
function nav(){$('#nav').innerHTML=(role=='co'?NAV:SNAV).map(n=>`<button class="${n[1]==nm?'on':''}" onclick="go('${n[2]}','${n[1]}')"><svg viewBox="0 0 24 24"><path d="${P[n[0]]}"/></svg>${n[1]}</button>`).join('');
 $('#me').innerHTML=role=='co'?av(2,44)+'<div><b>Laura Restrepo</b><small>Coordinación CAT Medellín</small></div>':av(7,44)+'<div><b>Valentina Cruz</b><small>Representante · Arte Vivo</small></div>';
 $('#prof').innerHTML=role=='co'?av(2,34)+'<span><b>Laura R.</b></span>':av(7,34)+'<span><b>Valentina C.</b></span>';
 $('#seg').innerHTML=[['st','Estudiante'],['co','Coordinación']].map(r=>`<button class="${r[0]==role?'on':''}" onclick="setRole('${r[0]}')">${r[1]}</button>`).join('')}
function tog(){$('#side').classList.toggle('open');$('#scrim').classList.toggle('open')}
function go(v,n){cur=v;if(n)nm=n;if(n=='Materiales')cat='Tecnología';else if(n=='Espacios')cat='Deportes y Espacios';else if(n=='Inventario')cat='Todos';nav();render();$('#side').classList.remove('open');$('#scrim').classList.remove('open');scrollTo(0,0)}
const tag=s=>`<span class="tag ${s.replace(' ','-')}">${s}</span>`;
const REQ=[['Camila Ortiz','Semillero Arte Vivo','Video beam + Sonido','04 oct 2026','Pendiente'],['Andrés Muñoz','Grupo Deportivo UT','Balones de fútbol (6)','05 oct 2026','Aprobada'],['Prof. Marta Gil','Cátedra de Cine','Auditorio','07 oct 2026','Pendiente'],['Julián Vélez','Coro Universitario','Piano digital','02 oct 2026','En préstamo'],['Daniela Ríos','Club de Robótica','Portátiles (4)','30 sep 2026','Devuelta'],['Sebastián Arias','Grupo de Teatro','Reflectores LED','01 oct 2026','Rechazada']];
function dash(){const k=[['Solicitudes pendientes','12','3 vencen hoy','📋',1],['Préstamos activos','28','5 terminan esta semana','🔄'],['Materiales disponibles','214','de 296 en total','📦'],['Devoluciones por verificar','7','Revisar estado físico','✔️'],['Novedades daño / pérdida','3','Requieren gestión','⚠️',1]];
const c=[['Tecnología',82],['Artes y Cultura',58],['Deportes',44],['Espacios',27]],mx=82;
return `<div class="ph"><div><h1>Panel principal</h1><p>Resumen de la gestión de préstamos · Octubre 2026</p></div><button class="btn p" onclick="go('det','Solicitudes')">+ Revisar pendientes</button></div>
<div class="banner"><div class="av">${[1,4,6,9].map(i=>av(i,40)).join('')}</div><div><b style="font:700 17px Georgia">Bienvenida, Laura</b><p>Estudiantes, docentes y responsables esperan tu respuesta: 12 solicitudes pendientes.</p></div></div>
<div class="grid5">${k.map(x=>`<div class="card kpi ${x[4]?'alert':''}"><div class="ic">${x[3]}</div><small>${x[0]}</small><b>${x[1]}</b><span>${x[2]}</span></div>`).join('')}</div>
<div class="two"><div class="card"><h3>Préstamos por categoría</h3><small style="color:var(--mut)">Últimos 30 días</small>
<div class="bars">${c.map(x=>`<div><i style="height:${x[1]/mx*130}px"></i>${x[1]}</div>`).join('')}</div><div class="lbl">${c.map(x=>`<span>${x[0]}</span>`).join('')}</div></div>
<div class="card"><div class="ph" style="margin:0 0 8px"><h3>Solicitudes recientes</h3><button class="btn s" onclick="go('det','Solicitudes')">Ver todas</button></div><div class="tw"><table><tr><th>Representante</th><th>Grupo</th><th>Material / Espacio</th><th>Fecha</th><th>Estado</th><th>Acciones</th></tr>
${REQ.map((r,i)=>`<tr><td><div class="who">${av(i+3,30)}<b>${r[0]}</b></div></td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td><td>${tag(r[4])}</td><td><button class="btn s" onclick="go('det','Solicitudes')">Ver</button></td></tr>`).join('')}</table></div></div></div>`}
function det(){return `<button class="crumb" onclick="go('dash','Panel principal')">← Panel principal / Solicitudes /</button>
<div class="ph"><div><h1>Solicitud #UT-2026-0148</h1><p>Recibida el 01 oct 2026 · 09:42 a. m.</p></div>${tag('Pendiente')}</div>
<div class="dgrid"><div>
<div class="card" style="margin-bottom:14px"><h3 style="margin-bottom:12px">Representante y grupo</h3><div class="who" style="margin-bottom:14px">${av(3,56)}<div><b style="font-size:16px">Camila Ortiz Henao</b><small>Estudiante · Comunicación Social · camila.ortiz@ut.edu.co</small></div></div>
<div class="kv"><div><small>Grupo</small><b>Semillero Arte Vivo</b></div><div><small>Responsable docente</small><b>Prof. Marta Gil</b></div><div><small>Actividad</small><b>Muestra cultural de bienvenida</b></div><div><small>Asistentes</small><b>60 personas</b></div><div><small>Fecha de uso</small><b>04 oct 2026 · 2:00–6:00 p. m.</b></div><div><small>Devolución</small><b>05 oct 2026 · 8:00 a. m.</b></div></div></div>
<div class="card" style="margin-bottom:14px"><h3 style="margin-bottom:8px">Materiales solicitados</h3><div class="tw"><table><tr><th>Material</th><th>Cant.</th><th>Disponibilidad</th></tr>
<tr><td><div class="who"><div class="thumb">📽️</div>Video beam</div></td><td>1</td><td><span class="avail ok">● Disponible (5 libres)</span></td></tr>
<tr><td><div class="who"><div class="thumb">🔊</div>Sonido portátil</div></td><td>2</td><td><span class="avail ok">● Disponible (3 libres)</span></td></tr>
<tr><td><div class="who"><div class="thumb">🎤</div>Micrófonos inalámbricos</div></td><td>4</td><td><span class="avail no">● Solo 2 disponibles</span></td></tr>
<tr><td><div class="who"><div class="thumb">🏛️</div>Auditorio</div></td><td>1</td><td><span class="avail ok">● Libre en horario</span></td></tr></table></div></div>
<div class="card"><h3 style="margin-bottom:8px">Observaciones</h3><p style="margin:0 0 10px;color:var(--mut)">“Necesitamos montaje desde la 1:00 p. m. Ya contamos con el aval de la dirección del programa.”</p><textarea placeholder="Observaciones de coordinación (se incluirán en el correo)…"></textarea></div>
</div><div>
<div class="card" style="margin-bottom:14px;border-color:var(--wine)"><h3>Decisión</h3><p style="color:var(--mut);margin:6px 0 0">Faltan 2 micrófonos. Puedes aprobar parcialmente ajustando la solicitud.</p>
<div class="acts" style="flex-direction:column"><button class="btn p" onclick="alert('Solicitud aprobada (demo)')">✓ Aprobar</button><button class="btn d" onclick="alert('Solicitud rechazada (demo)')">✕ Rechazar</button><button class="btn">✎ Ajustar solicitud</button><button class="btn">✉ Enviar correo de confirmación</button></div></div>
<div class="card"><h3 style="margin-bottom:12px">Historial</h3><div class="tl"><p><b>Solicitud creada</b><br><small style="color:var(--mut)">01 oct · Camila Ortiz</small></p><p><b>Aval docente recibido</b><br><small style="color:var(--mut)">01 oct · Prof. Marta Gil</small></p><p><b>En revisión por coordinación</b><br><small style="color:var(--mut)">02 oct · Laura Restrepo</small></p></div></div>
</div></div>`}
const INV=[['Video beam Epson','Tecnología','📽️',12,5,7,'Disponible'],['Portátil Lenovo','Tecnología','💻',20,3,15,'Bajo'],['Micrófono inalámbrico','Tecnología','🎤',6,2,3,'Bajo'],['Cámara DSLR','Tecnología','📷',4,0,3,'Dañado'],['Guitarra acústica','Artes y Cultura','🎸',8,6,2,'Disponible'],['Instrumentos de percusión','Artes y Cultura','🥁',10,7,2,'Disponible'],['Reflector LED','Artes y Cultura','💡',14,9,4,'Reposición'],['Balón de fútbol','Deportes y Espacios','⚽',24,17,6,'Disponible'],['Mallas de voleibol','Deportes y Espacios','🏐',4,0,3,'Pérdida'],['Auditorio','Deportes y Espacios','🏛️',1,1,0,'Disponible']];
function inv(){const cats=['Todos','Tecnología','Artes y Cultura','Deportes y Espacios'],rows=INV.filter(r=>cat=='Todos'||r[1]==cat);
const cls={Disponible:'Aprobada',Bajo:'Pendiente',Dañado:'Rechazada',Pérdida:'Rechazada',Reposición:'En-préstamo'};
return `<div class="ph"><div><h1>Inventario</h1><p>Control de existencias, préstamos y novedades</p></div><button class="btn p">+ Agregar elemento</button></div>
<div class="chips">${cats.map(c=>`<button class="chip ${c==cat?'on':''}" onclick="cat='${c}';render()">${c}</button>`).join('')}</div>
<div class="alerts"><div class="al w"><b>2</b>⚠ Inventario bajo</div><div class="al b"><b>1</b>🔧 Materiales dañados</div><div class="al b"><b>1</b>❗ Pérdidas reportadas</div><div class="al m"><b>1</b>🛒 Requieren reposición</div></div>
<div class="card"><div class="tw"><table><tr><th>Elemento</th><th>Total</th><th>Disponible</th><th>Prestada</th><th>Estado</th><th></th></tr>
${rows.map(r=>`<tr><td><div class="who"><div class="thumb">${r[2]}</div><div><b>${r[0]}</b><small>${r[1]}</small></div></div></td><td>${r[3]}</td><td><b>${r[4]}</b><div class="meter"><i style="width:${r[4]/r[3]*100}%"></i></div></td><td>${r[5]}</td><td><span class="tag ${cls[r[6]]}">${r[6]=='Bajo'?'Inventario bajo':r[6]}</span></td><td><button class="btn s">✎ Editar</button></td></tr>`).join('')}</table></div></div>`}
function dev(){return `<div class="ph"><div><h1>${nm}</h1><p>Módulo disponible en la siguiente fase del prototipo.</p></div></div><div class="card" style="text-align:center;padding:48px">${av(5,64)}<p style="color:var(--mut)">Esta sección aún no está diseñada en este mock-up.</p><button class="btn p" onclick="go('dash','Panel principal')">Volver al panel</button></div>`}
const SNAV=[['home','Inicio','sdash'],['mat','Catálogo','scat'],['req','Mi solicitud','ssol'],['dev','Historial','dev']];
const CAT=[['Bafles','Tecnología','🔊',6,8],['Computadores','Tecnología','💻',2,20],['Micrófonos','Tecnología','🎤',0,6],['Televisores','Tecnología','📺',3,4],['Cables HDMI y de audio','Tecnología','🔌',15,20],['Caballetes de pintura','Artes y Cultura','🎨',10,12],['Faldas de danza','Artes y Cultura','💃',8,10],['Tambores','Artes y Cultura','🥁',5,6],['Maracas','Artes y Cultura','🎶',9,10],['Balones de fútbol','Deportes','⚽',12,24],['Balones de baloncesto','Deportes','🏀',9,12],['Colchonetas','Deportes','🧘',14,20],['Lazos para saltar','Deportes','➰',18,25],['Cancha de microfútbol','Espacios','🥅',1,1],['Cancha de voleibol','Espacios','🏐',1,1],['Coliseo','Espacios','🏟️',1,1],['Aula múltiple','Espacios','🎓',1,1,1],['Piscina','Espacios','🏊',0,1]];
const stt=c=>c[5]?'Reservado':c[3]==0?'No disponible':c[3]<=3&&c[4]>1?'Pocas unidades':'Disponible';
const stc={'Disponible':'Aprobada','Pocas unidades':'Pendiente','No disponible':'Rechazada','Reservado':'En-préstamo'};
const nCart=()=>Object.values(cart).reduce((a,b)=>a+b,0);
function setRole(r){role=r;cur=r=='co'?'dash':'sdash';nm=r=='co'?'Panel principal':'Inicio';cat='Todos';done=0;nav();render();scrollTo(0,0)}
function add(n){const c=CAT.find(x=>x[0]==n);cart[n]=Math.min((cart[n]||0)+1,c[3]);done=0;render()}
function chg(n,d){const c=CAT.find(x=>x[0]==n);cart[n]=Math.max(0,Math.min(c[3],cart[n]+d));if(!cart[n])delete cart[n];render()}
function send(){if(!nCart())return;cart={};done=1;render()}
function grid(){const s=q.toLowerCase(),rows=CAT.filter(c=>(cat=='Todos'||c[1]==cat)&&c[0].toLowerCase().includes(s));
return rows.map(c=>{const e=stt(c),ok=e=='Disponible'||e=='Pocas unidades';return `<div class="card cc"><div class="thumb">${c[2]}</div><b>${c[0]}</b><small>${c[1]} · ${c[3]} de ${c[4]} disponibles</small><span><span class="tag ${stc[e]}">${e}</span></span><button class="btn ${ok?'p':''} s" ${ok?'':'disabled style="opacity:.5;cursor:not-allowed"'} onclick="add('${c[0]}')">${ok?'+ Agregar a solicitud'+(cart[c[0]]?' ('+cart[c[0]]+')':''):'No se puede solicitar'}</button></div>`}).join('')||'<p style="color:var(--mut)">Sin resultados.</p>'}
function sdash(){const t=CAT.reduce((s,c)=>s+c[3],0),k=[['Solicitudes activas','2','En trámite o en préstamo','📋'],['Solicitudes pendientes','1','Esperando coordinación','⏳'],['Próximos a devolver','1','Vence mañana','⏰'],['Materiales disponibles',t,'En el catálogo','📦']];
const m=[['Bafles (2) · Muestra cultural','04 oct 2026','Pendiente'],['Caballetes (6) · Taller de pintura','28 sep 2026','En préstamo'],['Cancha de voleibol','20 sep 2026','Devuelta']];
return `<div class="banner">${av(7,56)}<div><b style="font:700 18px Georgia">Hola, Valentina.</b><p>Gestiona los préstamos de tu grupo.</p></div><button class="btn" style="margin-left:auto" onclick="go('scat','Catálogo')">Solicitar material</button></div>
<div class="al w" style="margin-bottom:18px">⏰ <b style="display:inline;font-size:14px">Devolución próxima:</b> 6 caballetes de pintura, mañana 03 oct, antes de las 12:00 m.</div>
<div class="g4">${k.map(x=>`<div class="card kpi"><div class="ic">${x[3]}</div><small>${x[0]}</small><b>${x[1]}</b><span>${x[2]}</span></div>`).join('')}</div>
<div class="card"><div class="ph" style="margin:0 0 8px"><h3>Mis solicitudes</h3><button class="btn s" onclick="go('ssol','Mi solicitud')">Nueva solicitud</button></div><div class="tw"><table><tr><th>Solicitud</th><th>Fecha</th><th>Estado</th></tr>${m.map(r=>`<tr><td><b>${r[0]}</b></td><td>${r[1]}</td><td>${tag(r[2])}</td></tr>`).join('')}</table></div></div>`}
function scat(){const cs=['Todos','Tecnología','Artes y Cultura','Deportes','Espacios'];
return `<div class="ph"><div><h1>Catálogo de préstamos</h1><p>Materiales, equipos y espacios del CAT Medellín</p></div></div>
<div class="search" style="max-width:none;margin-bottom:12px">🔍<input value="${q}" placeholder="Buscar material o espacio…" oninput="q=this.value;$('#grid').innerHTML=grid()"></div>
<div class="chips">${cs.map(c=>`<button class="chip ${c==cat?'on':''}" onclick="cat='${c}';render()">${c}</button>`).join('')}</div>
${nCart()?`<div class="cartbar"><span>🛒 ${nCart()} elemento(s) en tu solicitud</span><button class="btn p s" onclick="go('ssol','Mi solicitud')">Ver solicitud</button></div>`:''}
<div class="cg" id="grid">${grid()}</div>`}
function ssol(){const it=Object.entries(cart);
if(done)return `<div class="card" style="text-align:center;padding:40px"><div style="font-size:40px">✅</div><h2>Solicitud enviada</h2><p style="color:var(--mut)">Coordinación del CAT Medellín la revisará y te notificará por correo.</p><button class="btn p" onclick="go('sdash','Inicio')">Volver al inicio</button></div>`;
return `<div class="ph"><div><h1>Mi solicitud</h1><p>Revisa los elementos y completa los datos de tu grupo</p></div></div>
<div class="dgrid"><div class="card"><h3 style="margin-bottom:8px">Elementos</h3>${it.length?`<div class="tw"><table><tr><th>Elemento</th><th>Cantidad</th></tr>${it.map(([n,c])=>`<tr><td><div class="who"><div class="thumb">${CAT.find(x=>x[0]==n)[2]}</div><b>${n}</b></div></td><td><div class="qty"><button onclick="chg('${n}',-1)">−</button><b>${c}</b><button onclick="chg('${n}',1)">+</button></div></td></tr>`).join('')}</table></div>`:`<p style="color:var(--mut)">Aún no has agregado elementos.</p><button class="btn p" onclick="go('scat','Catálogo')">Ir al catálogo</button>`}</div>
<div class="card"><h3 style="margin-bottom:10px">Datos de la actividad</h3><div style="display:grid;gap:10px"><input class="in" value="Semillero Arte Vivo" aria-label="Grupo"><input class="in" placeholder="Actividad (ej. muestra cultural)"><input class="in" type="date" value="2026-10-04"><input class="in" type="time" value="14:00"><textarea placeholder="Observaciones"></textarea><button class="btn p" ${it.length?'':'disabled style="opacity:.5"'} onclick="send()">Enviar solicitud</button></div></div></div>`}
function render(){$('#view').innerHTML={dash,det,inv,dev,sdash,scat,ssol}[cur]()}
$('#date').textContent=new Date().toLocaleDateString('es-CO',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
nav();render();
