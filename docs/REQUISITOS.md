# Requisitos del Sistema de Gestión de Préstamo de Materiales y Espacios
## Universidad del Tolima · CAT Medellín

> **Versión:** 1.0 · **Fecha:** noviembre de 2026
> **Relacionado:** [`PLAN-MAESTRO.md`](./PLAN-MAESTRO.md) · [`ARQUITECTURA-Y-DATOS.md`](./ARQUITECTURA-Y-DATOS.md)

---

## Convenciones

| Símbolo | Significado |
|---|---|
| **M** | Must / obligatorio para el MVP. |
| **S** | Should / importante, puede ir en la primera iteración posterior. |
| **C** | Could / deseable, fase futura. |
| **MVP** | Entra en la demo presentable. |
| **Piloto** | Entra antes de usar con usuarios reales. |
| **Futuro** | Se documenta, pero no se implementa todavía. |

Los requisitos originales (RF1–RF31) se conservan y se ajustan. Los nuevos se numeran desde RF32.

**Contenido:** 96 requisitos funcionales (31 originales revisados + 65 nuevos) y 50 requisitos no funcionales.

---

# Parte I — Requisitos funcionales

## 1. Requisitos originales revisados (RF1–RF31)

### 1.1 Gestión de usuarios y roles

| ID | Requisito revisado | Prio. | Observación |
|---|---|---|---|
| **RF1** | El sistema debe manejar los roles: **administrador del sistema, coordinador del CAT, encargado de inventario, profesor y estudiante representante**. | M | Se agrega profesor y se separan los dos tipos de administrador. |
| **RF2** | El estudiante representante debe crear y gestionar solicitudes **solo de su grupo y del periodo académico activo**. | M | Se acota el alcance. |
| **RF3** | El coordinador del CAT debe visualizar, aprobar, rechazar o ajustar las solicitudes de su CAT. | M | “Ajustar” se detalla en RF59. |
| **RF4** | El encargado de inventario debe crear, editar, dar de baja ítems y ajustar cantidades y estados. | M | No confundir con el administrador del sistema. |

### 1.2 Catálogo de materiales y espacios

| ID | Requisito revisado | Prio. | Observación |
|---|---|---|---|
| **RF5** | El catálogo debe clasificar los ítems en categorías **administrables**: tecnología, artes/cultura, deportes, espacios y las que el CAT agregue. | M | No deben ser listas fijas en el código. |
| **RF6** | La categoría tecnología debe incluir, como mínimo: bafles, computadores, micrófonos, televisores, cables, video beams y cámaras. | M | Carga inicial, no límite. |
| **RF7** | La categoría artes/cultura debe incluir: caballetes, faldas de danza, tambores, maracas, guitarras, reflectores y pianos. | M | Carga inicial. |
| **RF8** | La categoría deportes debe incluir: balones de fútbol y baloncesto, colchonetas, lazos y mallas de voleibol. | M | Carga inicial. |
| **RF9** | La categoría espacios debe incluir: cancha de microfútbol, cancha de voleibol, coliseo, aula múltiple, auditorio y piscina. | M | Requieren aforo y bloques horarios. |
| **RF10** | Cada ítem debe mostrar: **nombre, código, categoría, foto, descripción, ubicación, cantidad total, disponible, reservada, en préstamo, fuera de servicio, estado y observaciones**. | M | Se amplía la ficha. |

### 1.3 Solicitud de préstamo

| ID | Requisito revisado | Prio. | Observación |
|---|---|---|---|
| **RF11** | La solicitud debe indicar materiales/espacios, cantidades, **fecha y hora de inicio**, **fecha y hora de devolución**, motivo/actividad y responsable. | M | Mínimo al minuto; para espacios, bloques. |
| **RF12** | El sistema debe validar que la cantidad solicitada no supere la **disponibilidad para el rango de fechas solicitado**, considerando reservas y préstamos existentes. | M | Es la corrección más importante. |
| **RF13** | La solicitud debe permitir adjuntar **aval docente** (PDF/imagen) y datos complementarios: grupo, número de integrantes, programa, responsable directo. | M | El aval puede ser obligatorio según el ítem. |
| **RF14** | El solicitante debe poder consultar el estado de sus solicitudes: **borrador, pendiente, ajustada, aprobada, rechazada, cancelada, en préstamo, devuelta parcial, devuelta, vencida, cerrada**. | M | Estados completos. |

### 1.4 Aprobación y notificaciones

| ID | Requisito revisado | Prio. | Observación |
|---|---|---|---|
| **RF15** | Cada solicitud debe llegar automáticamente a la coordinación del CAT para revisión. | M | Notificación interna + correo. |
| **RF16** | La coordinación debe poder aprobar, rechazar, **aprobar parcialmente**, ajustar cantidades/fechas y dejar observaciones. | M | Se agrega aprobación parcial y contrapropuesta. |
| **RF17** | El sistema debe enviar **correo electrónico y notificación interna** cuando: se cree una solicitud, se apruebe/rechace/ajuste, se acerque la devolución (24 h y 2 h), se registre la entrega, la devolución o un retraso. | M | No solo correo. |

### 1.5 Gestión de inventario

| ID | Requisito revisado | Prio. | Observación |
|---|---|---|---|
| **RF18** | El inventario debe mantener: **cantidad total, disponible, reservada, en préstamo, en mantenimiento, dañada, perdida y dada de baja**. | M | Antes solo total/disponible/en préstamo. |
| **RF19** | El encargado debe registrar **movimientos**: entrada por compra/donación, salida, ajuste, baja, devolución y pérdida, con motivo y usuario. | M | Kardex. |
| **RF20** | El sistema debe permitir marcar estado **por unidad** (buen estado, requiere mantenimiento, dañado, en reparación, perdido, dado de baja) y por ítem cuando se maneja por cantidad. | M | Modelo híbrido. |
| **RF21** | El sistema debe generar reportes de inventario por categoría, ítem, estado y periodo. | M | Ver RF83. |

### 1.6 Registro de préstamo y devolución

| ID | Requisito revisado | Prio. | Observación |
|---|---|---|---|
| **RF22** | Al aprobarse una solicitud, el sistema debe **reservar** los materiales/espacios para las fechas indicadas y actualizar la disponibilidad **en una sola transacción**. | M | Evita dobles reservas. |
| **RF23** | En la entrega, el responsable debe registrar **quién recibe (nombre y documento), quién entrega, fecha/hora, estado de cada ítem/unidad, accesorios y firma o foto**. | M | Acta de entrega. |
| **RF24** | En la devolución, el sistema debe permitir registrar **devolución total o parcial**, verificando cantidad y estado por línea/unidad, con evidencia fotográfica. | M | Antes solo cambiaba el estado. |
| **RF25** | Si falta o se daña un ítem, el sistema debe registrar la **novedad**, generar un reporte, calcular el costo de reposición y activar el proceso de sanción según la política del CAT. | M | Flujo de novedades. |
| **RF26** | El inventario debe actualizarse automáticamente tras cada entrega, devolución, ajuste o novedad. | M | Dentro de la transacción. |

### 1.7 Consultas y reportes

| ID | Requisito revisado | Prio. | Observación |
|---|---|---|---|
| **RF27** | Coordinación y administración deben consultar el historial por grupo, representante, profesor, ítem, espacio, estado y periodo. | M | Filtros combinables. |
| **RF28** | El sistema debe generar reportes de uso: ítems más solicitados, tiempos promedio de préstamo, ocupación de espacios e incidencias. | M | Ver RF82 y RF84. |
| **RF29** | El sistema debe exportar reportes en **CSV, XLSX y PDF**. | M | PDF para actas; CSV/XLSX para análisis. |

### 1.8 Seguridad y trazabilidad

| ID | Requisito revisado | Prio. | Observación |
|---|---|---|---|
| **RF30** | El sistema debe registrar **quién** crea, aprueba, modifica, entrega, devuelve o elimina cada solicitud y movimiento, con fecha/hora, valores anteriores y nuevos. | M | Auditoría inmutable. |
| **RF31** | El acceso debe estar protegido con autenticación y autorización por roles, **validadas en el servidor**. | M | No basta con ocultar botones. |

---

## 2. Requisitos funcionales nuevos (RF32–RF96)

### 2.1 Usuarios, grupos y permisos

| ID | Requisito | Prio. | Fase |
|---|---|---|---|
| **RF32** | El administrador debe crear, editar y consultar usuarios con rol, nombres, apellidos, documento, correo, teléfono y estado. **No existe registro público.** | M | MVP |
| **RF33** | Al crear un usuario, el sistema debe enviar una **invitación por correo** con enlace para establecer contraseña; en el primer ingreso se debe exigir cambiarla. | M | MVP |
| **RF34** | El usuario debe poder **recuperar su contraseña** por correo y cerrar sesión en todos los dispositivos. | M | MVP |
| **RF35** | El administrador debe poder **desactivar y reactivar** usuarios sin borrar su historial. | M | MVP |
| **RF36** | El administrador debe gestionar **grupos**: nombre, programa, facultad, semestre, jornada, sede/CAT, periodo, número de integrantes y estado. | M | MVP |
| **RF37** | El administrador debe asignar **uno o varios representantes** a un grupo, con fecha de inicio/fin y estado. Un grupo no puede tener dos representantes activos simultáneos sin autorización. | M | MVP |
| **RF38** | El administrador debe crear el perfil de **profesor** con programa/departamento y cursos o materias que orienta. | M | MVP |
| **RF39** | Cada usuario debe poder actualizar sus datos de contacto, foto y preferencias de notificación. | S | Piloto |
| **RF40** | Todas las operaciones deben validar permisos **en el servidor**; la interfaz solo oculta acciones no permitidas. | M | MVP |
| **RF41** | El administrador debe poder **importar y exportar usuarios y grupos en CSV**, con validación y reporte de errores. | S | Piloto |
| **RF42** | El administrador debe poder buscar, filtrar y paginar usuarios por rol, grupo, estado y texto. | M | MVP |

### 2.2 Catálogo y disponibilidad

| ID | Requisito | Prio. | Fase |
|---|---|---|---|
| **RF43** | El administrador debe crear, editar, ordenar y ocultar **categorías y subcategorías**. | M | MVP |
| **RF44** | El encargado de inventario debe crear/editar ítems con: código único, nombre, categoría, tipo (**cantidad, serializado o espacio**), descripción, foto, ubicación, stock mínimo, valor de reposición, días máximos de préstamo, si requiere aval y estado. | M | MVP |
| **RF45** | Para ítems serializados, el sistema debe registrar **unidades individuales** con serial/placa, estado y notas. | S | Piloto |
| **RF46** | Para espacios, el sistema debe registrar **aforo, ubicación, bloques horarios, duración mínima/máxima y tiempo de montaje/limpieza**. | M | MVP |
| **RF47** | La ficha de cada ítem debe mostrar foto, descripción, ubicación, condiciones de uso, disponibilidad para las fechas elegidas y accesorios incluidos. | M | MVP |
| **RF48** | El sistema debe calcular y mostrar la **disponibilidad por rango de fechas y horas**, considerando reservas, préstamos, mantenimiento y bloqueos. | M | MVP |
| **RF49** | El sistema debe ofrecer una **vista de calendario** por ítem/espacio con reservas, bloqueos, feriados y mantenimiento. | S | Piloto |
| **RF50** | El encargado debe poder bloquear ítems/espacios por **mantenimiento, reparación, inventario físico o evento institucional**, indicando motivo y fechas. | M | Piloto |
| **RF51** | El sistema debe generar alertas cuando un ítem esté por debajo del **stock mínimo**, agotado, dañado o perdido. | S | Piloto |
| **RF52** | El catálogo debe permitir búsqueda por texto, filtros por categoría, disponibilidad, ubicación y ordenamiento. | M | MVP |

### 2.3 Solicitudes y reservas

| ID | Requisito | Prio. | Fase |
|---|---|---|---|
| **RF53** | El solicitante debe poder guardar una solicitud en **borrador** y retomarla después. | S | Piloto |
| **RF54** | El solicitante debe poder **editar** su solicitud mientras esté en borrador o pendiente. | M | MVP |
| **RF55** | El solicitante debe poder **cancelar** su solicitud antes de la aprobación; la cancelación debe liberar cualquier reserva. | M | MVP |
| **RF56** | El solicitante debe poder **duplicar** una solicitud anterior para reutilizar datos. | C | Futuro |
| **RF57** | El sistema debe manejar tipos de solicitud: **grupo de estudiante**, **curso de profesor** y **área administrativa**, con campos obligatorios según el tipo. | M | MVP |
| **RF58** | El sistema debe validar: disponibilidad en el rango, anticipación mínima, duración máxima, cupo por grupo, horario del CAT, fechas bloqueadas y aval requerido. | M | MVP |
| **RF59** | La coordinación debe poder **aprobar, rechazar, aprobar parcialmente, ajustar cantidades/fechas o proponer una contrapropuesta**, siempre con motivo. | M | MVP |
| **RF60** | El solicitante debe poder **aceptar o rechazar** la contrapropuesta de coordinación; si acepta, se confirma la reserva. | S | Piloto |
| **RF61** | La aprobación debe crear la **reserva de forma transaccional** y bloquear el ítem para evitar dobles reservas concurrentes. | M | MVP |
| **RF62** | El sistema debe aplicar reglas de **prioridad configurables** (ej. evento académico, profesor, orden de llegada) y registrar la decisión. | S | Piloto |
| **RF63** | Cada solicitud debe tener un **código único** y un **QR** para la entrega y devolución. | S | Piloto |
| **RF64** | Las solicitudes aprobadas y no reclamadas deben **vencer automáticamente** después de un tiempo configurable, liberando la reserva. | S | Piloto |
| **RF65** | El solicitante debe poder **solicitar reprogramación o prórroga**; coordinación la aprueba o rechaza. También debe poder exportar el préstamo a `.ics`. | C | Futuro |

### 2.4 Préstamos, entregas y devoluciones

| ID | Requisito | Prio. | Fase |
|---|---|---|---|
| **RF66** | La entrega debe registrar: quién entrega, quién recibe (nombre y documento), fecha/hora, estado por ítem/unidad, accesorios entregados, observaciones y **firma o foto**. | M | MVP |
| **RF67** | El sistema debe permitir **entregas parciales** cuando no se entrega todo lo aprobado, dejando registro del faltante. | S | Piloto |
| **RF68** | La devolución debe permitir **devolución total o parcial**, por línea y por unidad, registrando estado y evidencia fotográfica. | M | MVP |
| **RF69** | El sistema debe detectar **retrasos**, aplicar periodo de gracia configurable, cambiar el estado a “vencida” y notificar. | M | Piloto |
| **RF70** | El sistema debe registrar **daños o pérdidas** con descripción, fotos, cantidad, responsable, costo estimado y estado de la reposición. | M | MVP |
| **RF71** | El sistema debe permitir seguir un caso de **reparación o reposición** hasta su cierre, manteniendo la unidad fuera de servicio mientras tanto. | S | Piloto |
| **RF72** | El sistema debe generar un **comprobante de entrega/devolución en PDF** y enviarlo por correo al solicitante y a coordinación. | S | Piloto |
| **RF73** | El sistema debe permitir **bloquear a un usuario** para nuevas solicitudes cuando tenga una novedad pendiente, según la política configurada. | S | Piloto |
| **RF74** | El historial de préstamos por usuario, grupo e ítem debe ser **inmutable** y consultable. | M | MVP |

### 2.5 Notificaciones

| ID | Requisito | Prio. | Fase |
|---|---|---|---|
| **RF75** | El sistema debe tener un **centro de notificaciones interno** con leídas/no leídas, filtros y enlace directo al registro. | M | MVP |
| **RF76** | El sistema debe enviar **correos transaccionales** con plantillas para: solicitud creada, aprobada, rechazada, ajustada, recordatorio 24 h, recordatorio 2 h, entrega, devolución, retraso y novedad. | M | MVP |
| **RF77** | Los recordatorios y vencimientos deben ejecutarse con un **programador (cron)**, con reintentos y registro del estado del envío. | M | Piloto |
| **RF78** | El usuario debe poder configurar qué notificaciones recibe por correo, excepto las críticas (aprobación, rechazo, vencimiento). | S | Piloto |
| **RF79** | El administrador debe poder **reenviar** una notificación fallida. | S | Piloto |
| **RF80** | Se podrá integrar **WhatsApp o Telegram** como canal opcional en una fase futura. | C | Futuro |

### 2.6 Reportes y administración

| ID | Requisito | Prio. | Fase |
|---|---|---|---|
| **RF81** | El panel debe mostrar: pendientes, aprobadas, en préstamo, vencidas, disponibilidad, novedades, ítems más solicitados y uso por categoría. | M | MVP |
| **RF82** | El sistema debe generar reportes por **periodo, grupo, programa, representante, profesor, ítem, categoría, espacio y estado**. | M | Piloto |
| **RF83** | El reporte de inventario debe incluir total, disponible, reservado, en préstamo, mantenimiento, dañado, perdido, valor de reposición y stock mínimo. | M | Piloto |
| **RF84** | El sistema debe reportar **ocupación de espacios** y horas de mayor demanda. | S | Piloto |
| **RF85** | El administrador debe poder consultar, filtrar y exportar la **auditoría** (quién, qué, cuándo, antes/después). | M | Piloto |
| **RF86** | El administrador debe poder abrir, cerrar y archivar **periodos académicos**, conservando el historial y reiniciando cupos. | M | Piloto |
| **RF87** | El administrador debe configurar datos del CAT, horarios, feriados, reglas de aprobación, cupos, correos, términos y versiones legales. | M | Piloto |
| **RF88** | El administrador debe poder **respaldar y exportar** toda la información en formatos abiertos (CSV/JSON/SQL). | S | Piloto |

### 2.7 PWA, experiencia y aspectos legales

| ID | Requisito | Prio. | Fase |
|---|---|---|---|
| **RF89** | La app debe ser **instalable** y funcionar sin conexión para consultar el catálogo y borradores; las acciones críticas requieren conexión. | M | MVP |
| **RF90** | Búsqueda, filtros, ordenamiento y paginación deben funcionar del lado del servidor cuando el volumen crezca. | M | Piloto |
| **RF91** | La interfaz debe ser **responsive** (320 px a 1920 px), con modo claro/oscuro y respeto a `prefers-reduced-motion`. | M | MVP |
| **RF92** | La interfaz debe cumplir **WCAG 2.1 AA**: contraste, teclado, foco, etiquetas y lectores de pantalla. | M | Piloto |
| **RF93** | La app debe usar la **identidad institucional UT**: logo/escudo oficial, colores validados, tipografía, datos de contacto y enlace a `ut.edu.co`. | M | MVP |
| **RF94** | El usuario debe **aceptar términos y aviso de privacidad** en el primer ingreso y en cada nueva versión; la aceptación debe quedar registrada. | M | Piloto |
| **RF95** | La app debe incluir **ayuda, preguntas frecuentes y contacto** del CAT. | S | Piloto |
| **RF96** | El modelo debe estar preparado para **múltiples CAT/sedes** (`sede_id`) sin reescribir el esquema. | C | Futuro |

---

# Parte II — Requisitos no funcionales (RNF1–RNF50)

## 3. Seguridad

| ID | Requisito | Criterio de verificación |
|---|---|---|
| **RNF1** | Todo el tráfico debe usar **HTTPS/TLS 1.2+** con HSTS. | Prueba SSL; redirección 301 de HTTP. |
| **RNF2** | Las contraseñas deben almacenarse **hasheadas** (Argon2id o bcrypt) y nunca en texto plano ni en el frontend. | Revisión de `auth.users`; no hay contraseñas en el repo. |
| **RNF3** | Las sesiones deben usar **tokens de corta duración** con refresh; cierre de sesión global y expiración por inactividad (30 min para admin). | Prueba de expiración y revocación. |
| **RNF4** | Toda operación debe **autorizarse en el servidor** (RLS + funciones), no solo en la interfaz. | Pruebas con rol incorrecto reciben 401/403. |
| **RNF5** | RLS: un usuario solo ve sus datos; coordinación solo su CAT; administrador ve todo. | Suite de pruebas de políticas. |
| **RNF6** | No debe haber **secretos** en el repositorio ni en el bundle; usar variables de entorno. | Escaneo de secretos en CI. |
| **RNF7** | Validación de entradas, consultas parametrizadas, escape de HTML y **CSP** para prevenir XSS/SQLi. | Revisión OWASP + pruebas. |
| **RNF8** | **Rate limiting** en login y endpoints sensibles; bloqueo temporal tras intentos fallidos. | Prueba de fuerza bruta. |
| **RNF9** | **MFA opcional** (TOTP) para administrador y coordinación. | Activación y prueba. |
| **RNF10** | Auditoría **append-only** (sin edición ni borrado) con retención mínima de 2 años. | Intento de modificar auditoría falla. |
| **RNF11** | Archivos: tipos y tamaños permitidos, bucket privado, URLs firmadas y límite por usuario. | Prueba de carga maliciosa. |
| **RNF12** | Respaldos **cifrados**, restauración probada al menos cada trimestre. | Acta de restauración. |

## 4. Privacidad y cumplimiento

| ID | Requisito | Criterio de verificación |
|---|---|---|
| **RNF13** | Recolectar solo los datos personales **necesarios** (nombre, correo, documento si aplica, programa). | Revisión del modelo de datos. |
| **RNF14** | Cumplir la **Ley 1581 de 2012** y el Decreto 1377 de 2013: aviso de privacidad, consentimiento y derechos del titular. | Documento legal publicado y aceptación registrada. |
| **RNF15** | Política de **retención**: conservar préstamos y auditoría el tiempo acordado; anonimizar datos al vencer. | Job de retención documentado. |
| **RNF16** | Acceso a datos personales restringido por rol; no debe existir directorio público de usuarios. | Prueba de RLS. |
| **RNF17** | Registrar **versión, fecha y usuario** de la aceptación de términos y privacidad. | Consulta en base de datos. |

## 5. Rendimiento

| ID | Requisito | Criterio de verificación |
|---|---|---|
| **RNF18** | p95 de API < **500 ms** y p99 < **1.5 s** para consultas comunes. | Prueba de carga. |
| **RNF19** | Primera carga útil < **2 s** en 4G; interactividad < **3 s**; Lighthouse móvil ≥ 90 en rendimiento. | Lighthouse/WebPageTest. |
| **RNF20** | Bundle inicial < **300 KB gzip**; imágenes en WebP/AVIF con lazy loading. | Análisis de build. |
| **RNF21** | Índices en fechas, ítem, estado y usuario; paginación máxima de 50 registros. | `EXPLAIN ANALYZE` de consultas clave. |
| **RNF22** | Soportar **200 usuarios concurrentes** y **50.000 préstamos/año** sin degradación. | Prueba de carga con k6. |
| **RNF23** | Consulta de disponibilidad < **300 ms** con 1.000 ítems y 10.000 reservas. | Benchmark. |

## 6. Disponibilidad y confiabilidad

| ID | Requisito | Criterio de verificación |
|---|---|---|
| **RNF24** | Disponibilidad ≥ **99.5 %** en horario académico; modo de lectura si falla un servicio secundario. | Monitoreo mensual. |
| **RNF25** | **RPO ≤ 24 h** (ideal ≤ 1 h con PITR) y **RTO ≤ 4 h**. | Prueba de restauración. |
| **RNF26** | Aprobaciones, entregas y devoluciones deben ser **atómicas**: todo o nada. | Prueba de fallo a mitad de transacción. |
| **RNF27** | Operaciones reintentables deben ser **idempotentes**: no duplicar reservas ni correos. | Prueba de reintento. |

## 7. Usabilidad y accesibilidad

| ID | Requisito | Criterio de verificación |
|---|---|---|
| **RNF28** | Cumplir **WCAG 2.1 AA**: contraste 4.5:1, teclado, foco visible, etiquetas, `aria-live`. | Auditoría con axe/Lighthouse. |
| **RNF29** | Responsive de **320 px a 1920 px**; objetivos táctiles ≥ 44 px. | Prueba en dispositivos. |
| **RNF30** | Idioma **es-CO**, zona horaria **America/Bogota**, fechas y moneda local. | Revisión funcional. |
| **RNF31** | Mensajes de error claros, en español, con acción sugerida; confirmación en acciones destructivas. | Prueba heurística. |
| **RNF32** | Una solicitud debe completarse en **≤ 3 pasos** y ≤ 3 minutos; prueba con 5 usuarios con ≥ 80 % de éxito. | Test de usabilidad. |
| **RNF33** | Modo offline: catálogo de lectura y borradores; indicador claro de “sin conexión”. | Prueba desconectando red. |

## 8. Compatibilidad y portabilidad

| ID | Requisito | Criterio de verificación |
|---|---|---|
| **RNF34** | Compatible con las **2 últimas versiones** de Chrome, Edge, Firefox y Safari; Android 8+ e iOS 15+. | Matriz de pruebas. |
| **RNF35** | Frontend estático desplegable en GitHub Pages; backend gestionado; **sin dependencia de VPN**. | Despliegue en red UT y datos móviles. |
| **RNF36** | Esquema SQL **portable** (PostgreSQL estándar) y capa de repositorios para migrar de proveedor. | Documento de migración. |
| **RNF37** | Dominio propio o subdominio institucional con HTTPS. | Configuración DNS/SSL. |

## 9. Mantenibilidad y calidad

| ID | Requisito | Criterio de verificación |
|---|---|---|
| **RNF38** | Código **modular** (dominio, servicios, repositorios, UI), con lint, formato y revisión de PR. | Pipeline verde. |
| **RNF39** | Pruebas: unitarias ≥ 70 % del dominio, integración de RLS/disponibilidad y E2E de flujos críticos. | Cobertura y suite en CI. |
| **RNF40** | **CI/CD**: lint + tests + build en cada PR; migraciones versionadas; despliegue automático a staging. | Historial de Actions. |
| **RNF41** | Documentación: README, diccionario de datos, ADR, manual de usuario y runbook. | Documentos en `docs/`. |
| **RNF42** | Diseño **orientado a objetos**: clases de dominio, servicios e interfaces; lógica de negocio fuera de la UI. | Revisión de código + diagrama de clases. |

## 10. Escalabilidad y observabilidad

| ID | Requisito | Criterio de verificación |
|---|---|---|
| **RNF43** | Preparado para **múltiples CAT/sedes** sin reescribir el esquema. | `sede_id` en tablas clave. |
| **RNF44** | Escalar a **5.000 usuarios** y **10.000 ítems** con índices y paginación. | Prueba de carga. |
| **RNF45** | **Sentry** para errores, logs estructurados y monitor de disponibilidad con alertas. | Panel y alerta de prueba. |
| **RNF46** | Métricas: solicitudes, aprobaciones, tiempos, errores y fallos de correo. | Dashboard. |
| **RNF47** | Panel de salud para administrador (estado de jobs, correos fallidos, backups). | Vista disponible. |

## 11. Costo y operación

| ID | Requisito | Criterio de verificación |
|---|---|---|
| **RNF48** | El piloto debe operar en **capa gratuita o ≤ USD 25/mes**, con costos documentados. | Factura y proyección. |
| **RNF49** | Exportación completa en **CSV/JSON/SQL** para evitar dependencia del proveedor. | Prueba de exportación. |
| **RNF50** | Soporte definido: canal, horario y tiempo de respuesta para el piloto. | Acuerdo con el CAT. |

---

# Parte III — Criterios de aceptación

## 11. Casos críticos (formato Given/When/Then)

**CA1 — Disponibilidad por fechas**
- Dado un ítem con 5 unidades y una reserva activa de 3 del 12 al 14 de noviembre,
- cuando otro usuario consulta disponibilidad para el 13 de noviembre,
- entonces el sistema muestra **2 disponibles**.
- Y si solicita 3, la validación lo rechaza.

**CA2 — Doble reserva concurrente**
- Dadas dos coordinadoras aprobando la última unidad del mismo ítem para el mismo rango,
- cuando ambas confirman al mismo tiempo,
- entonces **solo una aprobación se completa** y la otra recibe un mensaje de conflicto.

**CA3 — Creación de usuario e invitación**
- Dado un administrador autenticado,
- cuando crea un estudiante representante con correo válido,
- entonces el usuario recibe la invitación, establece contraseña y puede ingresar con su rol.

**CA4 — Aprobación y reserva**
- Dada una solicitud pendiente con disponibilidad suficiente,
- cuando coordinación la aprueba,
- entonces se crea la reserva, disminuye la disponibilidad del rango y se envía correo al solicitante.

**CA5 — Devolución parcial**
- Dado un préstamo de 3 micrófonos,
- cuando se devuelven 2 en buen estado y 1 con daño,
- entonces la solicitud queda **devuelta parcial**, se registra la novedad, se actualiza el inventario y se notifica.

**CA6 — Aislamiento de datos**
- Dado un estudiante del Grupo A,
- cuando intenta consultar la solicitud del Grupo B por API,
- entonces recibe **403** y no ve datos.

**CA7 — Cancelación**
- Dada una solicitud pendiente,
- cuando el solicitante la cancela,
- entonces la solicitud queda cancelada y **no consume disponibilidad**.

**CA8 — Vencimiento**
- Dada una solicitud aprobada cuya fecha de recogida pasó y no se entregó,
- cuando corre el job de vencimiento,
- entonces la solicitud queda vencida, se libera la reserva y se notifica.

**CA9 — Auditoría**
- Dada cualquier aprobación, entrega, devolución o ajuste de inventario,
- cuando se consulta la auditoría,
- entonces aparece el usuario, la fecha/hora, la acción y los valores anterior/nuevo.

**CA10 — Accesibilidad**
- Dado un usuario que navega solo con teclado,
- cuando recorre el flujo de solicitud,
- entonces puede completar todos los campos y acciones con foco visible y sin trampas.

**CA11 — Correo**
- Dada una solicitud creada,
- cuando el job de correo se ejecuta,
- entonces el solicitante y coordinación reciben el correo; si falla, queda en la cola con reintento y estado visible.

**CA12 — PWA**
- Dada la app instalada,
- cuando se pierde la conexión,
- entonces el catálogo previamente cargado sigue visible en modo lectura y se muestra el indicador offline.

---

# Parte IV — Trazabilidad y alcance

## 12. Objetivos → requisitos

| Objetivo | Requisitos principales |
|---|---|
| Reemplazar el demo por datos reales | RF31–RF42, RNF1–RNF17 |
| Administrar usuarios, grupos y profesores | RF32–RF42, RF57, RF86 |
| Evitar dobles reservas | RF12, RF22, RF48, RF58, RF61, RNF26 |
| Controlar inventario y devoluciones | RF18–RF26, RF44–RF51, RF66–RF74 |
| Avisar a tiempo | RF15, RF17, RF75–RF79 |
| Rendir cuentas | RF27–RF30, RF81–RF85 |
| Verse institucional | RF91–RF95 |
| Operar sin conexión | RF89, RNF33 |

## 13. Fuera de alcance del MVP

- Firma digital certificada.
- Pasarela de pagos.
- Integración con matrícula/notas.
- Préstamo entre sedes.
- App nativa en App Store/Play Store.
- WhatsApp automático.
- Predicción de demanda con IA.
- Reconocimiento facial o biométrico.
- Facturación electrónica.

## 14. Glosario

| Término | Definición |
|---|---|
| **CAT** | Centro de Atención Tutorial de la Universidad del Tolima. |
| **Representante** | Estudiante autorizado para solicitar préstamos en nombre de su grupo. |
| **Ítem** | Material, equipo o espacio del catálogo. |
| **Unidad** | Ejemplar individual de un ítem serializado (ej. micrófono con serial). |
| **Reserva** | Bloqueo de disponibilidad de un ítem para un rango de fechas. |
| **Disponibilidad** | Total menos unidades fuera de servicio, reservadas y en préstamo para un rango. |
| **Aval** | Autorización del docente o director de programa para una solicitud. |
| **Kardex** | Historial de entradas, salidas y ajustes de inventario. |
| **Novedad** | Registro de daño, pérdida, retraso o faltante. |
| **RLS** | Row Level Security: seguridad por fila en PostgreSQL. |
| **RPO/RTO** | Pérdida máxima de datos aceptable / tiempo máximo de recuperación. |
| **WCAG** | Pautas de accesibilidad para contenido web. |
| **MVP** | Producto mínimo viable para demostración y piloto. |
