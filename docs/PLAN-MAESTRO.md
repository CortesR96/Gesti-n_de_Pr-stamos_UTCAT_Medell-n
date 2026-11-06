# Plan maestro – Sistema de Gestión de Préstamo de Materiales y Espacios
## Universidad del Tolima · CAT Medellín

> **Versión:** 1.0 · **Fecha:** noviembre de 2026
> **Estado:** propuesta para revisión con coordinación del CAT y la Universidad.
> **Documentos relacionados:** [`REQUISITOS.md`](./REQUISITOS.md) · [`ARQUITECTURA-Y-DATOS.md`](./ARQUITECTURA-Y-DATOS.md)

---

## 1. Resumen ejecutivo

El proyecto ya tiene una **interfaz funcional y atractiva** (PWA instalable, catálogo, solicitudes, aprobación, entrega, devolución y notificaciones), pero hoy es un **prototipo de demostración**: los datos viven en `localStorage`, la autenticación está escrita en el código del navegador y la disponibilidad no considera fechas futuras. Eso impide usarlo con usuarios reales y compartirlo entre dispositivos.

La meta es convertirlo en un **MVP real y demostrable** para la Universidad, con:

1. **Base de datos central** (PostgreSQL) y autenticación real.
2. **Administrador que crea y administra usuarios**: estudiantes representantes, profesores, coordinación y personal de inventario.
3. **Grupos académicos** con programa, semestre, jornada, periodo y representante.
4. **Disponibilidad por rango de fechas**, sin dobles reservas.
5. **Correos automáticos** además de las notificaciones internas.
6. **Entrega y devolución con verificación**, devoluciones parciales, daños y pérdidas.
7. **Reportes exportables** y trazabilidad de cada acción.
8. **Identidad visual institucional** de la Universidad del Tolima.

**Ruta recomendada:** mantener la interfaz actual y migrarla por módulos a **Supabase** (PostgreSQL + Auth + almacenamiento + funciones), publicado el frontend en GitHub Pages. Es la opción de menor costo y menor riesgo para un piloto, y no obliga a reescribir toda la aplicación de una vez.

**Tiempo estimado:**
- **Demo presentable (MVP):** 6–8 semanas a medio tiempo.
- **Versión completa de piloto:** 14–18 semanas a medio tiempo.
- **Producción institucional:** +4–6 semanas de trámites, seguridad y capacitación.

---

## 2. Diagnóstico del prototipo actual

### 2.1 Lo que ya funciona y se debe conservar

| Componente | Estado | Comentario |
|---|---|---|
| Interfaz y navegación | ✅ Muy buena | Diseño limpio, responsive, modo oscuro, dos vistas. |
| Catálogo por categorías | ✅ Funcional | Tecnología, Artes, Deportes y Espacios. |
| Flujo solicitud → aprobación → entrega → devolución | ✅ Funcional (local) | La lógica de estados ya está modelada. |
| Notificaciones internas | ✅ Funcional (local) | Campana, no leídas, panel. |
| PWA | ✅ Instalable | Manifest, service worker, botón de instalación. |
| Inventario básico | ✅ Funcional | Total, disponibles, fuera de servicio. |
| Sincronización entre pestañas | ✅ Solo mismo navegador | Vía evento `storage`. |

### 2.2 Brechas críticas

| # | Brecha | Evidencia en el código | Impacto | Prioridad |
|---|---|---|---|---|
| 1 | **Autenticación falsa** | Credenciales y usuarios en `js/app.js` (`CRED`, `doLogin`, líneas 386–414). Cualquiera puede leerlas o saltarse el login. | No sirve para usuarios reales. | 🔴 Crítica |
| 2 | **Datos solo en un navegador** | `load()` / `save()` con `localStorage` (líneas 74–80). | No se comparte entre dispositivos ni usuarios. | 🔴 Crítica |
| 3 | **Disponibilidad sin fechas** | `avail()` resta solo préstamos activos (líneas 85–86); no compara el rango solicitado. | Se puede aprobar dos veces el mismo material para la misma fecha. | 🔴 Crítica |
| 4 | **No hay gestión de usuarios ni grupos** | “Valentina” y su grupo están fijos en el código. | El administrador no puede crear representantes ni profesores. | 🔴 Crítica |
| 5 | **No hay correos** | Solo notificaciones en la campana. | Coordinación y solicitantes no se enteran fuera de la app. | 🔴 Crítica |
| 6 | **Devolución simplificada** | `returnReq()` cambia el estado, sin verificar cantidades, estado físico ni novedades (línea 259). | No protege el inventario ni permite reponer. | 🔴 Crítica |
| 7 | **Inventario sin movimientos ni unidades** | Solo `total` y `broken`; no hay kardex, seriales ni reservas. | No hay trazabilidad ni control real. | 🟠 Alta |
| 8 | **Reportes incompletos** | `ph()` es un placeholder (línea 300). | No se pueden tomar decisiones ni rendir cuentas. | 🟠 Alta |
| 9 | **Sin rol de profesor** | Solo existen `st` y `co`. | Los docentes no pueden solicitar. | 🟠 Alta |
| 10 | **Periodo académico fijo** | IDs `UT-2026-…` y fechas de ejemplo. | No hay cierre de semestre ni archivo. | 🟠 Alta |
| 11 | **Sin auditoría** | Solo un historial básico dentro de la solicitud. | No se sabe quién cambió qué. | 🟠 Alta |
| 12 | **Sin privacidad ni términos** | No hay aviso de tratamiento de datos. | Riesgo legal (Ley 1581 de 2012). | 🟠 Alta |
| 13 | **Identidad UT parcial** | El “escudo” es un recuadro con el texto “UT”. | No se siente institucional. | 🟡 Media |
| 14 | **Accesibilidad mejorable** | Emojis como iconos, botones sin etiquetas, foco poco visible. | Dificulta uso con lectores de pantalla. | 🟡 Media |
| 15 | **Sin pruebas ni CI** | No hay tests, lint ni despliegue automatizado. | Regresiones frecuentes al crecer. | 🟡 Media |
| 16 | **Caché PWA riesgosa al conectar API** | `sw.js` cachea todo por origen. | Podría servir datos viejos o respuestas privadas. | 🟡 Media |

---

## 3. Visión del producto

### 3.1 Problema

En el CAT Medellín el préstamo de materiales y espacios se gestiona de forma manual (mensajes, correos, planillas). Esto genera:

- Doble asignación de un mismo equipo o espacio.
- Desconocimiento de la disponibilidad real por fecha.
- Pérdida de trazabilidad de entregas y devoluciones.
- Dificultad para saber qué falta, qué está dañado y qué se debe reponer.
- Reportes inexistentes o hechos a mano.

### 3.2 Propuesta de valor

Una plataforma web institucional, instalable como app, donde:

- El **representante de grupo** o el **profesor** encuentra el material disponible y solicita en minutos.
- La **coordinación** aprueba con información real de disponibilidad y deja trazabilidad.
- El **administrador** controla usuarios, grupos, inventario y reportes.
- Todo queda registrado: quién pidió, quién aprobó, quién entregó, en qué estado se devolvió.

### 3.3 Alcance

**Incluye (MVP):**
- Autenticación y roles.
- Gestión de usuarios, grupos y periodos.
- Catálogo e inventario.
- Solicitudes con validación de disponibilidad por fechas.
- Aprobación/rechazo/ajuste.
- Entrega y devolución (incluido parcial).
- Notificaciones internas y por correo.
- Reportes básicos y exportación.
- Identidad UT y PWA.

**No incluye en el MVP (fase posterior):**
- Firma digital certificada.
- Pagos o cobros en línea.
- Integración con el sistema académico (notas/matrícula).
- Préstamo entre sedes.
- App nativa en tiendas.
- WhatsApp automático.
- Inteligencia artificial para predicción de demanda.

---

## 4. Actores y roles

| Rol | Quién es | Qué puede hacer |
|---|---|---|
| **Administrador del sistema** | OTIC / coordinación del CAT | Crear y administrar usuarios, grupos, periodos, configuración, roles y auditoría. Ve todo. |
| **Coordinador(a) del CAT** | Coordinación | Revisar, aprobar, rechazar y ajustar solicitudes; entregar y recibir; ver reportes de su CAT. |
| **Encargado de inventario** | Auxiliar del CAT (opcional) | Crear/editar ítems, unidades y movimientos; entregar y recibir; reportes de inventario. |
| **Profesor** | Docente de la UT | Solicitar materiales y espacios para sus cursos; ver su historial. |
| **Estudiante representante** | Representante de grupo | Solicitar para su grupo; ver el historial del grupo; cancelar solicitudes pendientes. |
| **Estudiante (no representante)** | Integrante del grupo | Solo consulta (opcional). No solicita. |

> **Decisión de diseño:** no habrá registro público. **Solo el administrador crea usuarios** y les envía una invitación por correo. Esto evita cuentas falsas y es coherente con el control institucional.

### 4.1 Matriz de permisos

| Acción | Admin | Coordinador | Inventario | Profesor | Rep. estudiante |
|---|:---:|:---:|:---:|:---:|:---:|
| Crear/editar/desactivar usuarios | ✅ | — | — | — | — |
| Crear/editar grupos y representantes | ✅ | 👁 | — | — | — |
| Ver catálogo | ✅ | ✅ | ✅ | ✅ | ✅ |
| Crear/editar ítems y unidades | ✅ | — | ✅ | — | — |
| Registrar movimientos de inventario | ✅ | — | ✅ | — | — |
| Crear solicitud | ✅ | — | — | ✅ | ✅ |
| Aprobar / rechazar / ajustar | ✅ | ✅ | — | — | — |
| Registrar entrega | ✅ | ✅ | ✅ | — | — |
| Registrar devolución | ✅ | ✅ | ✅ | — | — |
| Registrar novedad (daño/pérdida) | ✅ | ✅ | ✅ | — | — |
| Ver solicitudes de su grupo | ✅ | ✅ | 👁 | — | ✅ |
| Ver todas las solicitudes del CAT | ✅ | ✅ | 👁 | — | — |
| Reportes y exportaciones | ✅ | ✅ | ✅ (inventario) | — | — |
| Configuración y periodos | ✅ | — | — | — | — |
| Auditoría | ✅ | 👁 | — | — | — |

`✅` = puede · `👁` = solo lectura · `—` = no puede.

---

## 5. Reglas de negocio que hay que definir con el CAT

Estas reglas no están en el código actual y son necesarias antes de programar la disponibilidad:

1. **Horario del CAT:** ¿de lunes a viernes 8:00–18:00? ¿sábados?
2. **Anticipación mínima:** ¿con cuántos días se puede solicitar? (ej. 2 días hábiles).
3. **Duración máxima:** ¿cuántos días se puede tener un equipo? ¿y un espacio?
4. **Cupos por grupo:** ¿máximo de ítems o de unidades por solicitud?
5. **Prioridad:** ¿profesores y eventos académicos tienen prioridad sobre grupos?
6. **Aval:** ¿qué materiales requieren aval del docente o del director de programa?
7. **Espacios:** ¿se reservan por bloques de 1 hora, 2 horas o por jornada? ¿hay tiempo de montaje/limpieza?
8. **Feriados y calendario académico:** ¿qué fechas se bloquean?
9. **Devolución:** ¿hay período de gracia? ¿qué pasa si se devuelve tarde?
10. **Daños y pérdidas:** ¿se cobra reposición? ¿con qué tarifas? ¿quién autoriza la sanción?
11. **Inventario:** ¿qué ítems se controlan por unidad/serial y cuáles por cantidad?
12. **Cierre de semestre:** ¿se archivan solicitudes? ¿se reinician cupos? ¿se conserva el inventario?
13. **Correo:** ¿se usará correo institucional `@ut.edu.co`? ¿quién administra el dominio?
14. **Datos personales:** ¿qué datos del estudiante se pueden guardar? (documento, teléfono, correo).

> Sin estas respuestas se puede construir el MVP, pero con reglas provisionales marcadas como “configurables”. Lo ideal es validarlas con la coordinación en la **fase 0**.

---

## 6. Requisitos

El detalle completo está en [`REQUISITOS.md`](./REQUISITOS.md). Aquí va el resumen del análisis.

### 6.1 Veredicto sobre los 31 requisitos actuales

**Están bien planteados en general**, pero tienen cuatro problemas:

1. **Mezclan roles.** “Administrador de inventario” no es lo mismo que “administrador del sistema”. Y falta el **profesor**.
2. **No cubren la administración de usuarios ni grupos**, que es justo lo que necesitas ahora.
3. **La disponibilidad está incompleta:** hablan de “cantidad disponible” pero no de **reservas por rango de fechas** (el problema más grave del prototipo).
4. **Faltan estados y casos reales:** devolución parcial, no reclamado, vencido, daño, pérdida, reposición, sanción, periodo académico.

### 6.2 Correcciones puntuales

| Requisito | Ajuste propuesto |
|---|---|
| RF1 | Roles: **administrador del sistema, coordinador, encargado de inventario, profesor, estudiante representante**. |
| RF2 | El representante gestiona solicitudes **solo de su grupo y del periodo activo**. |
| RF4 | Separar “administrador del sistema” de “encargado de inventario”. |
| RF5–RF9 | El catálogo debe ser **dinámico** (categorías e ítems administrables), no listas fijas. Los espacios necesitan aforo y bloques horarios. |
| RF10 | Agregar **código único, foto, ubicación, valor de reposición, estado por unidad y cantidad mínima**. |
| RF11 | Usar **fecha y hora de inicio/fin**, no solo fecha. Para espacios, bloques. |
| RF12 | Validar **solapamiento de reservas en el rango solicitado**, no solo el stock actual. |
| RF13 | Adjuntar **aval docente** y datos del responsable directo. |
| RF14 | Estados completos: borrador, pendiente, ajustada, aprobada, rechazada, cancelada, en préstamo, devuelta parcial, devuelta, vencida, cerrada. |
| RF17 | Correo **y** notificación interna; recordatorios 24 h y 2 h antes; aviso de retraso. |
| RF18 | Contar **total, disponible, reservado, en préstamo, en mantenimiento, dañado y perdido**. |
| RF19 | Kardex de movimientos: entrada, salida, ajuste, baja, devolución, pérdida. |
| RF20 | Estado **por unidad** (serial) y por ítem (cantidad). |
| RF21 | Reportes por categoría, ítem, grupo, programa, periodo y estado. |
| RF22 | La reserva debe ser **transaccional** y bloquear el ítem para evitar dobles aprobaciones. |
| RF23 | Entrega con **quién recibe, documento, firma o foto, estado y accesorios**. |
| RF24 | Devolución **parcial por línea y por unidad**. |
| RF25 | Novedad con evidencia, costo, estado de reposición y posible sanción. |
| RF26 | Actualización automática **dentro de la misma transacción**. |
| RF27–RF29 | Filtros por grupo, representante, ítem, espacio y periodo; exportar CSV/XLSX/PDF. |
| RF30–RF31 | Auditoría inmutable y autorización **en el servidor**, no solo en la interfaz. |

### 6.3 Requisitos funcionales que faltan (resumen)

Se propone agregar **RF32 a RF96**, agrupados así:

- **Usuarios, grupos y permisos (RF32–RF42):** alta de usuarios por admin, invitación, primer ingreso, recuperación de contraseña, desactivación, grupos, representantes, profesores, importación CSV, permisos en servidor.
- **Catálogo y disponibilidad (RF43–RF52):** categorías administrables, ítems por cantidad/serial/espacio, unidades, calendario, consulta de disponibilidad por rango, bloqueos por mantenimiento, cupos.
- **Solicitudes y reservas (RF53–RF65):** borrador, edición, cancelación, duplicar, tipos de solicitante, validaciones, aprobación parcial, contrapropuesta, reserva transaccional, prioridades, QR, vencimiento por no reclamar, calendario `.ics`.
- **Préstamos y devoluciones (RF66–RF74):** entrega con checklist, entrega parcial, devolución parcial, retrasos, daños/pérdidas, reposición, sanción, comprobante PDF.
- **Notificaciones (RF75–RF80):** centro interno, plantillas de correo, recordatorios programados, reintentos, preferencias, reenvío.
- **Reportes y administración (RF81–RF88):** dashboards, reportes por periodo/grupo/ítem, inventario valorizado, ocupación de espacios, auditoría, periodos académicos, configuración, respaldo.
- **PWA, UX y legal (RF89–RF96):** offline de lectura, búsqueda/filtros, accesibilidad, identidad UT, términos y privacidad, ayuda, multi-CAT.

### 6.4 Requisitos no funcionales

Se proponen **RNF1 a RNF50** en [`REQUISITOS.md`](./REQUISITOS.md), cubriendo:

- **Seguridad:** HTTPS, contraseñas hasheadas, sesiones, RLS, permisos en servidor, rate limiting, MFA para admin, auditoría, backups.
- **Privacidad:** Ley 1581 de 2012, consentimiento, retención, derechos del titular.
- **Rendimiento:** p95 < 500 ms en API, carga < 3 s en 4G, paginación, índices.
- **Disponibilidad:** 99.5 % en horario académico, RPO/RTO, transacciones atómicas.
- **Usabilidad y accesibilidad:** WCAG 2.1 AA, responsive 320 px+, teclado, lectores de pantalla.
- **Compatibilidad:** últimos navegadores, Android/iOS, PWA.
- **Mantenibilidad:** módulos, TypeScript/JSDoc, tests, CI/CD, documentación.
- **Escalabilidad:** multi-CAT, 5.000 usuarios, 50.000 préstamos/año.
- **Observabilidad:** logs, Sentry, monitoreo, métricas.
- **Costo:** piloto en capa gratuita, costo documentado.

---

## 7. Arquitectura recomendada

```
┌──────────────────────────────────────────────┐
│  PWA (HTML/CSS/JS o Vite+TS)                 │
│  GitHub Pages · HTTPS · instalable           │
└───────────────┬──────────────────────────────┘
                │ Supabase JS (HTTPS)
┌───────────────▼──────────────────────────────┐
│  Supabase                                    │
│  ├─ Auth (correo/contraseña, invitaciones)   │
│  ├─ PostgreSQL + RLS                         │
│  ├─ Storage (fotos, avales, firmas)          │
│  ├─ Edge Functions (lógica sensible, correo) │
│  ├─ pg_cron (recordatorios, vencimientos)    │
│  └─ Realtime (opcional: tablero en vivo)     │
└───────────────┬──────────────────────────────┘
                │ SMTP/API
        ┌───────▼────────┐
        │ Resend / Brevo │  correos transaccionales
        └────────────────┘
```

**Por qué Supabase y no Firebase:** el problema central es relacional (ítems, reservas, disponibilidad por fechas, reportes). PostgreSQL lo resuelve con transacciones, restricciones e índices; Firebase obliga a duplicar datos y es más frágil para evitar dobles reservas.

**Por qué no un backend propio desde el inicio:** multiplica el trabajo (servidor, despliegue, seguridad, backups). Supabase da eso en un día. Si la Universidad exige servidores propios, el esquema SQL y la capa de datos se pueden migrar después; el frontend no cambia.

**Frontend:** se recomienda **migración incremental**:
- **Fase 1:** conservar la interfaz y el enfoque actual, pero dividir `app.js` en módulos (`domain/`, `services/`, `ui/`, `repositories/`) y usar JSDoc para tipos.
- **Fase 2 (opcional):** Vite + TypeScript si el proyecto crece o se vuelve entregable de grado.
- **No se recomienda** reescribir todo en React de una vez: retrasa la demo y no aporta al problema principal.

El detalle técnico, el modelo de datos y el diseño de clases están en [`ARQUITECTURA-Y-DATOS.md`](./ARQUITECTURA-Y-DATOS.md).

---

## 8. Identidad UT y experiencia de usuario

### 8.1 Elementos institucionales reales

Tomar de `www.ut.edu.co` (con autorización de la Oficina de Comunicaciones / OTIC):

- **Logo oficial** y **escudo** (no dibujar un “UT” genérico).
- **Colores institucionales:** el prototipo usa vino `#7a1230`; validar el tono exacto contra el manual de identidad o muestreando el logo oficial. Documentar los tokens en `css/styles.css`.
- **Tipografía:** si la Universidad tiene fuente oficial, usarla; si no, una sans legible (Inter/Source Sans) para texto y una serif para títulos, con respaldo del sistema.
- **Datos de pie de página:** razón social, NIT, dirección, teléfono, correo, enlace a `ut.edu.co`, “Institución de Educación Superior vigilada por MinEducación”.
  - Datos centrales tomados de ut.edu.co: NIT 890.700.640-7; Calle 42 No. 1-02, Barrio Santa Helena Parte Alta, Ibagué; (608) 2771212; `atencionalciudadano@ut.edu.co`.
  - **Datos del CAT Medellín** tomados del directorio oficial: I.E. INEM José Félix de Restrepo, Carrera 48 No. 1-125, Avenida Las Vegas, Bloque 7A, Medellín; PBX 2772020 - 2771515 Ext. 9513; Tel. 2669041; Cel. 316 695 0541; `cmedellin@ut.edu.co`. Verificar vigencia antes de una presentación institucional.
- **Contexto:** “Universidad del Tolima · CAT Medellín · Préstamo de Materiales y Espacios”.
- **Fotografías reales** del CAT, de los espacios y de los materiales (con permiso y sin personas identificables sin consentimiento).

### 8.2 Pantallas del MVP

| Pantalla | Contenido clave |
|---|---|
| **Ingreso** | Logo/escudo, correo institucional, contraseña, “¿Olvidaste tu contraseña?”, aviso de privacidad. |
| **Inicio (estudiante/profesor)** | Próximo préstamo, devoluciones pendientes, accesos rápidos, novedades del CAT. |
| **Catálogo** | Fotos, categorías, filtros, disponibilidad **por fecha**, ficha del ítem, botón “Solicitar”. |
| **Nueva solicitud (3 pasos)** | 1) materiales/fechas, 2) datos del grupo/curso y aval, 3) resumen y confirmación. |
| **Mis solicitudes** | Estado, línea de tiempo, mensaje de coordinación, cancelar, descargar comprobante. |
| **Panel de coordinación** | Pendientes, aprobadas, en préstamo, vencidas, daños; accesos a revisar. |
| **Detalle de solicitud** | Disponibilidad real, aprobar/rechazar/ajustar, historial, auditoría. |
| **Entrega** | Checklist, estado por ítem/unidad, accesorios, quién recibe, firma/foto. |
| **Devolución** | Checklist, cantidades, estado, novedad, fotos. |
| **Inventario** | Ítems, unidades, movimientos, mantenimiento, alertas de stock. |
| **Usuarios y grupos** | Alta, invitación, roles, grupo, semestre, representante, estado. |
| **Reportes** | Filtros por periodo, categoría, grupo, ítem; exportar CSV/PDF. |
| **Configuración** | Horarios, feriados, reglas, correos, periodos, respaldo. |
| **Ayuda y legal** | FAQ, contacto del CAT, términos, privacidad. |

### 8.3 Accesibilidad y usabilidad

- Contraste mínimo 4.5:1; foco visible; navegación completa con teclado.
- Etiquetas `label`, `aria-label` y `aria-live` en notificaciones.
- No usar emojis como único icono: acompañar con texto o SVG con título.
- Tablas con encabezados y scroll horizontal accesible.
- Mensajes de error claros y en español.
- Confirmación antes de acciones destructivas.
- Prueba de usabilidad con 5 personas (3 estudiantes, 1 profesor, 1 coordinador).

---

## 9. Roadmap

Supone **1 desarrollador a medio tiempo (15–20 h/semana)** y disponibilidad parcial de coordinación para validar.

### Fase 0 — Descubrimiento y acuerdos (1 semana)

- Validar reglas de negocio de la sección 5 con coordinación.
- Confirmar roles, permisos y datos del CAT Medellín.
- Concretar uso de logo/escudo y datos institucionales.
- Definir alcance del MVP y criterios de éxito.
- **Entregable:** acta de acuerdos + este plan ajustado.

### Fase 1 — Fundación técnica (2–3 semanas)

- Crear proyecto Supabase (dev/prod), esquema inicial y migraciones.
- Configurar Auth, invitaciones y recuperación de contraseña.
- Modelo de datos: usuarios, roles, grupos, periodos, categorías, ítems, unidades.
- RLS y políticas de seguridad.
- Refactor del frontend en módulos + capa de datos (`repositories`).
- CI/CD básico y despliegue en GitHub Pages.
- **Entregable:** login real + usuarios/grupos sembrados + despliegue automático.

### Fase 2 — Administración de usuarios y grupos (2 semanas)

- CRUD de usuarios con invitación por correo.
- CRUD de grupos, periodos y representantes.
- Perfil de profesor y de estudiante.
- Importación CSV de usuarios/grupos.
- **Entregable:** el administrador crea un representante y un profesor, y ambos ingresan.

### Fase 3 — Catálogo, inventario y disponibilidad (2–3 semanas)

- CRUD de categorías, ítems, unidades y espacios.
- Fotos, ubicación, stock mínimo, valor de reposición.
- Movimientos de inventario (kardex).
- Motor de disponibilidad por rango de fechas.
- Calendario y bloqueos por mantenimiento/feriados.
- **Entregable:** consulta “¿cuántos hay disponibles del 12 al 14 de noviembre?” correcta.

### Fase 4 — Solicitudes, aprobación y correos (2 semanas)

- Creación/edición/cancelación de solicitudes.
- Validaciones de negocio y reserva transaccional.
- Aprobación, rechazo, ajuste y contrapropuesta.
- Notificaciones internas + correos con plantillas.
- **Entregable:** flujo completo solicitud → correo → aprobación → reserva.

### Fase 5 — Entrega, devolución y novedades (2–3 semanas)

- Checklist de entrega y devolución.
- Devoluciones parciales.
- Daños, pérdidas, reposición y bloqueo de usuario.
- Comprobante PDF y evidencias.
- **Entregable:** préstamo real con acta y devolución con novedad.

### Fase 6 — Reportes y administración (1–2 semanas)

- Dashboards y reportes por periodo/grupo/ítem/categoría.
- Exportación CSV/XLSX/PDF.
- Auditoría, periodos académicos, configuración, respaldo.
- **Entregable:** informe mensual exportable para coordinación.

### Fase 7 — Calidad, seguridad y accesibilidad (2 semanas)

- Pruebas unitarias, de integración y E2E.
- Pruebas de concurrencia (dos aprobaciones simultáneas).
- Auditoría de RLS y revisión de seguridad.
- Accesibilidad WCAG AA y pruebas en dispositivos reales.
- **Entregable:** checklist de calidad aprobado.

### Fase 8 — Piloto y capacitación (1–2 semanas)

- Carga de inventario real y usuarios piloto.
- Capacitación a coordinación y representantes.
- Manual de usuario y video corto.
- Retroalimentación y ajustes.
- **Entregable:** piloto con un grupo y un profesor; métricas iniciales.

### Resumen de tiempos

| Escenario | Duración |
|---|---|
| Demo presentable (fases 0–5, alcance recortado) | **6–8 semanas** |
| Piloto completo (fases 0–8) | **14–18 semanas** |
| Producción institucional (incluye trámites) | **+4–6 semanas** |

### MVP vs. futuro

**MVP (lo que se muestra):**
- Login real y roles.
- Admin crea usuarios, grupos, representantes y profesores.
- Catálogo con fotos y disponibilidad por fecha.
- Solicitud, aprobación y correo.
- Entrega, devolución y novedad básica.
- Reportes básicos y exportación CSV.
- Identidad UT y PWA.

**Fase 2 (después del piloto):**
- QR de entrega/devolución.
- Lista de espera y sugerencias automáticas.
- Calendario `.ics` y notificaciones push.
- Firma digital y PDF con sello.
- Multi-CAT.
- Integración con correo institucional/SSO.
- Analítica avanzada y predicción de demanda.

---

## 10. Migración de los datos de demostración

1. Exportar `localStorage` (`prestamos-ut-db-v1`) a JSON desde la app actual.
2. Script de migración:
   - `inv[]` → `items` (+ `unidades` para serializados).
   - `reqs[]` → `solicitudes` + `solicitud_items` + `reservas` históricas.
   - `notifs[]` → `notificaciones`.
   - Usuarios demo → usuarios reales con invitación (no migrar contraseñas).
3. Mantener un modo **`?demo=1`** con datos de ejemplo para presentaciones, separado de producción.
4. Cargar el inventario real del CAT en CSV validado.
5. Verificar totales contra el inventario físico antes del piloto.

---

## 11. Calidad y pruebas

| Tipo | Qué cubrir |
|---|---|
| **Unitarias** | Reglas de disponibilidad, estados de solicitud, cálculo de novedades. |
| **Integración** | RLS (un estudiante no ve solicitudes ajenas), reserva transaccional, correos. |
| **E2E** | Login → solicitud → aprobación → entrega → devolución. |
| **Concurrencia** | Dos coordinadores aprueban el mismo ítem a la vez; solo uno debe lograrlo. |
| **Seguridad** | Intentos de acceso directo a la API con rol incorrecto. |
| **Accesibilidad** | Teclado, lector de pantalla, contraste, zoom 200 %. |
| **UAT** | Coordinación y representantes prueban casos reales. |

Criterios de aceptación críticos:

- **CA1:** no se puede reservar más cantidad de la disponible para un rango, ni siquiera con solicitudes simultáneas.
- **CA2:** el administrador crea un representante, le llega la invitación y puede ingresar.
- **CA3:** al aprobar, el stock queda reservado; al cancelar, se libera.
- **CA4:** una devolución parcial actualiza cantidades y genera novedad sin cerrar la solicitud.
- **CA5:** un estudiante no puede leer ni modificar solicitudes de otro grupo.
- **CA6:** cada aprobación, entrega, devolución y cambio de inventario queda en auditoría.

---

## 12. Despliegue y operación

- **Frontend:** GitHub Pages (gratis, HTTPS) o Netlify/Vercel si se necesita preview.
- **Backend:** Supabase (dev/prod separados).
- **Correo:** Resend o Brevo con dominio verificado.
- **Dominio:** subdominio institucional si la UT lo permite (ej. `prestamos.catmedellin.ut.edu.co`).
- **Variables de entorno:** en GitHub Actions/Supabase, nunca en el repositorio.
- **PWA:** actualizar `CACHE_VERSION` en cada despliegue; **no cachear respuestas de API**.
- **Respaldos:** diarios, retención mínima 30 días, restauración probada.
- **Monitoreo:** Sentry (errores), UptimeRobot (disponibilidad), alertas a correo.
- **Soporte:** canal definido con el CAT y tiempo de respuesta acordado.

---

## 13. Riesgos y mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| No se definen reglas de negocio a tiempo | Alta | Alto | Fase 0 obligatoria; reglas configurables con valores por defecto. |
| Doble reserva por concurrencia | Media | Alto | Transacción + bloqueo + pruebas de concurrencia. |
| Correos van a spam | Media | Medio | Dominio verificado, SPF/DKIM/DMARC, plantillas sencillas. |
| La UT no permite usar logo/dominio | Media | Medio | Solicitar autorización desde el inicio; plan B con identidad “proyecto académico”. |
| Datos personales sin consentimiento | Baja | Alto | Aviso de privacidad, consentimiento y retención. |
| Dependencia de Supabase | Baja | Medio | Esquema SQL portable y capa de repositorios. |
| Baja adopción de profesores | Media | Medio | Capacitación, interfaz simple, correo con enlace directo. |
| Inventario real desactualizado | Alta | Alto | Inventario físico antes del piloto y responsables definidos. |
| Un solo desarrollador | Alta | Medio | Alcance MVP cerrado; documentación y CI desde el inicio. |

---

## 14. Indicadores de éxito

- **Tiempo de solicitud:** < 3 minutos (medido en prueba de usabilidad).
- **Solicitudes aprobadas sin doble reserva:** 100 %.
- **Préstamos con acta de entrega:** 100 %.
- **Devoluciones registradas el mismo día:** ≥ 95 %.
- **Incidencias de daño/pérdida con novedad registrada:** 100 %.
- **Satisfacción de coordinación:** ≥ 4/5.
- **Reducción de tiempo de gestión:** ≥ 50 % frente al proceso manual.
- **Disponibilidad de la app en horario académico:** ≥ 99.5 %.

---

## 15. Costos estimados del piloto

| Servicio | Plan | Costo aproximado |
|---|---|---|
| GitHub Pages | Free | USD 0 |
| Supabase | Free → Pro | USD 0 → ~25/mes |
| Resend / Brevo | Free | USD 0 (hasta 3.000 correos/mes) |
| Dominio (si aplica) | Anual | ~USD 12–20/año |
| Sentry | Free | USD 0 |
| **Total piloto** | | **USD 0–25/mes** |

> Precios de referencia; verificar antes de contratar. Si la Universidad exige hosting propio, cambia el costo de infraestructura, no el diseño.

---

## 16. Decisiones pendientes

1. ¿Supabase es aceptable o la UT exige servidores/OTIC propios?
2. ¿Los profesores solicitan para cursos, para grupos o ambos? ¿Requieren aval?
3. ¿Solo CAT Medellín o se prevén varias sedes?
4. ¿Quién administra usuarios: OTIC, coordinación o ambos?
5. ¿Se usarán correos `@ut.edu.co`? ¿Hay Google Workspace/Microsoft 365?
6. ¿Se requiere firma física, digital o basta foto/checklist?
7. ¿Existe política de sanciones, reposición y tarifas?
8. ¿Qué reglas de anticipación, duración y cupos se aplican?
9. ¿Se autoriza el uso de logo/escudo y datos institucionales?
10. ¿Hay presupuesto para dominio y plan de Supabase?

---

## 17. Primeros pasos (próximas 2 semanas)

- [ ] Reunión con coordinación del CAT para validar reglas (sección 5).
- [ ] Confirmar roles y permisos (sección 4).
- [ ] Crear proyecto Supabase y esquema inicial.
- [ ] Descargar logo/escudo oficiales y definir tokens de color.
- [ ] Refactorizar `app.js` en módulos sin cambiar la interfaz.
- [ ] Implementar login real con un usuario administrador.
- [ ] Implementar CRUD de usuarios y grupos.
- [ ] Cargar 10 ítems reales de inventario y probar disponibilidad por fechas.
- [ ] Definir el guion de la demo para la Universidad.

---

### Anexos

- [`REQUISITOS.md`](./REQUISITOS.md): RF completos (1–95), RNF (1–50), criterios de aceptación y trazabilidad.
- [`ARQUITECTURA-Y-DATOS.md`](./ARQUITECTURA-Y-DATOS.md): stack, modelo de datos, SQL, RLS, algoritmo de disponibilidad y diagrama de clases.
