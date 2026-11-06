# Préstamos UT · CAT Medellín

Demo funcional de una **PWA para gestionar el préstamo de materiales, equipos y espacios** del CAT Medellín de la Universidad del Tolima.

> **Estado:** prototipo académico para una presentación de dos días. No es un sistema de producción. Los datos se guardan en el navegador (`localStorage`) y los correos se simulan en una bandeja interna, salvo que se configure EmailJS.

La aplicación conserva la identidad institucional de la Universidad del Tolima, usa el logosímbolo oficial como recurso local y está preparada para publicarse en GitHub Pages.

---

## 1. Demo en dos minutos

Abre la aplicación y usa el **acceso rápido** del inicio de sesión, o escribe estas credenciales:

| Rol | Correo | Contraseña | Para mostrar |
|---|---|---|---|
| Administrador | `admin@ut.edu.co` | `admin2026` | Crear usuarios, grupos, reportes y configuración |
| Coordinación | `coordinacion.cat@ut.edu.co` | `cat2026` | Aprobar, rechazar, ajustar, entregar y recibir devoluciones |

La demo inicia **solo con estas dos cuentas**. La cuenta administradora se muestra como **Administrador**, sin nombre personal. No hay estudiantes ni docentes precargados: el administrador crea los demás usuarios durante la presentación. El sistema genera una contraseña temporal, valida que el correo termine en `@ut.edu.co` y produce una invitación con las credenciales.

> Las credenciales y contraseñas están en el código porque son datos de demostración. En producción la autenticación debe vivir en un servidor.

---

## 2. Flujo recomendado para la presentación

1. **Administrador:** entra con `admin@ut.edu.co / admin2026`.
2. Abre **Usuarios → + Crear usuario**, escribe un correo `@ut.edu.co`, asigna rol, grupo y programa. Se genera una invitación con la contraseña temporal.
3. Abre **Correos** y muestra la invitación en estado `Simulado` (o `Enviado` si configuraste EmailJS).
4. Cierra sesión e ingresa con el correo y la contraseña temporal del usuario que acabas de crear. Agrega materiales al catálogo, elige fechas y envía la solicitud.
5. **Coordinación:** entra con `coordinacion.cat@ut.edu.co / cat2026`, revisa la solicitud, apruébala y registra la entrega.
6. Vuelve a coordinación y registra la **devolución**, incluso con una novedad de daño. Revisa la campana, los correos y el historial.
7. **Administrador:** abre **Reportes** y descarga el CSV o imprime/exporta a PDF.

El botón **Configuración → Abrir guion** contiene este mismo recorrido dentro de la aplicación.

---

## 3. Qué incluye esta versión

- **Acceso por correo institucional** con validación de dominio `@ut.edu.co`.
- **Roles diferenciados:** administrador, coordinación, estudiante representante y docente.
- **Gestión de usuarios:** crear, editar, activar/desactivar, cambiar contraseña y enviar invitación/reset por correo.
- **Grupos y representantes:** crear, editar y eliminar grupos; programa, facultad, semestre, jornada, periodo y representante asignado. Se permite repetir el nombre del grupo en semestres, jornadas o periodos distintos; al eliminar un grupo, los usuarios quedan sin grupo y las solicitudes históricas conservan su nombre.
- **Catálogo de inventario:** materiales, equipos y espacios con código, ubicación, existencias, unidades fuera de servicio y aval requerido.
- **Disponibilidad por rangos de fechas:** dos solicitudes que no se cruzan pueden usar el mismo material; las que se cruzan compiten por las existencias.
- **Solicitudes:** creación, validación de fechas y cantidades, cancelación por el solicitante, aprobación, rechazo con motivo, ajuste automático a la disponibilidad, entrega y devolución.
- **Devoluciones con novedades:** registrar unidades dañadas o no devueltas y descontarlas del inventario disponible.
- **Notificaciones:** campana interna para cada usuario.
- **Correos:** bandeja simulada con plantillas HTML/texto para invitación, solicitud recibida, nueva solicitud, aprobación, rechazo, ajuste, entrega, devolución, cancelación, reset y prueba.
- **EmailJS opcional:** envío real sin backend si se configuran las credenciales desde **Configuración → Correo**.
- **Reportes:** indicadores, uso por grupo, elementos más solicitados, exportación CSV e impresión/PDF.
- **PWA:** manifiesto, service worker, caché del app shell y botón de instalación cuando el navegador lo permite.
- **Respaldo local:** descarga de un JSON con los datos del demo y opción de restablecer todo.

---

## 4. Correos: modo simulado y envío real

Por defecto **no se envía nada a internet**: crear un usuario, aprobar una solicitud o registrar una entrega solo crea un mensaje visible en:

- la campana de notificaciones;
- **Correos** (para administrador/coordinación);
- **Mis correos** (para estudiantes y docentes);
- el historial de la solicitud.

### Envío real con EmailJS

1. Crea una cuenta en [EmailJS](https://www.emailjs.com/).
2. Conecta un servicio de correo y crea una plantilla.
3. La plantilla debe aceptar estas variables:
   - `{{to_email}}`
   - `{{to_name}}`
   - `{{subject}}`
   - `{{message}}`
   - `{{from_name}}`
   - `{{reply_to}}`
4. En la aplicación entra como administrador o coordinación y abre **Correo → Configurar envío real**.
5. Activa el envío y completa **Service ID**, **Template ID** y **Public Key**.
6. Usa **Enviar prueba** para verificar.

Si EmailJS falla, el correo queda en la bandeja con estado **Error** y el mensaje de error. El demo sigue funcionando.

> **Importante al publicar en GitHub Pages:** GitHub Pages solo sirve archivos estáticos; no ejecuta un backend ni envía correos. Por tanto, las cuentas que crees y los correos que se generen **no llegan a buzones reales**. Quedan guardados en el `localStorage` del navegador donde usas la demo. Solo si configuras EmailJS, el navegador intentará un envío real a la dirección escrita en el formulario; aun así, la clave pública queda expuesta y la entrega no está garantizada.

También puedes abrir un correo y usar **Abrir en cliente de correo** para generar un enlace `mailto:`.

---

## 5. Ejecutar localmente

No requiere instalación ni compilación. Desde la carpeta del proyecto:

```bash
python3 -m http.server 8080
```

Abre `http://localhost:8080/`.

También funciona con cualquier servidor estático, por ejemplo:

```bash
npx serve .
```

No abras `index.html` con `file://`: el service worker, el manifiesto y las rutas relativas están pensados para servirse por HTTP/HTTPS.

---

## 6. Publicar en GitHub Pages

1. Crea un repositorio en GitHub y sube el contenido de esta carpeta a la rama `main`.
2. En GitHub abre **Settings → Pages**.
3. En **Build and deployment** elige **Deploy from a branch**.
4. Selecciona la rama `main` y la carpeta `/ (root)`.
5. Guarda y espera a que GitHub publique la URL (`https://usuario.github.io/repositorio/`).

Todas las rutas del proyecto son relativas (`./`, `icons/`, `css/`, `js/`), por lo que funcionan bajo el subdirectorio de GitHub Pages. Si actualizas archivos, sube el número de `CACHE_VERSION` en `sw.js` para invalidar la caché anterior.

---

## 7. Datos de demostración y reinicio

- Base de datos local: `prestamos-ut-db-v5`
- Sesión: `prestamos-ut-session-v5`
- Para volver al estado inicial: **Configuración → Restablecer demo** (solo administrador).
- Para borrar manualmente: abre las herramientas del navegador y elimina las claves anteriores de `localStorage`.
- La demo precarga **solo las cuentas de administrador y coordinación**, el inventario y los grupos sin representante. No precarga solicitudes, notificaciones ni correos.

Cada navegador tiene su propia copia. Los cambios no se sincronizan entre dispositivos ni entre personas.

---

## 8. Estructura del proyecto

```text
index.html                  Shell de la PWA y pie institucional
manifest.webmanifest        Metadatos de instalación
sw.js                       Service worker y caché del app shell
css/styles.css              Estilos base
css/demo.css                Rediseño v5: login, correos, reportes, perfil…
js/store.js                 Datos, persistencia, disponibilidad y reglas
js/email.js                 Plantillas, bandeja simulada y EmailJS
js/app.js                   Login, navegación, notificaciones y modales
js/views-requests.js        Panel, solicitudes, inventario y devoluciones
js/views-admin.js           Usuarios, grupos, reportes y configuración
js/views-student.js         Catálogo, solicitud, historial y perfil
js/init.js                  Arranque y sincronización entre pestañas
js/pwa.js                   Registro del service worker e instalación
icons/                      Iconos PWA y logosímbolo oficial local
docs/                       Plan, requisitos y arquitectura para producción
```

### Modelo de datos local

- `users`: cuentas, rol, programa, grupo, curso, estado y credenciales demo.
- `groups`: semilleros/clubes, programa, facultad, semestre, representante y periodo.
- `inv`: inventario con total, unidades fuera de servicio, código, ubicación y aval.
- `reqs`: solicitudes con ítems, fechas, estado, historial y novedades.
- `notifs`: notificaciones por usuario.
- `emails`: bandeja de correos y estado de envío.
- `settings`: periodo, nombre del CAT y configuración de EmailJS.

La disponibilidad se calcula con `outQ()` y `avail()` en `js/store.js`, usando intersección de rangos de fechas y estados activos (`Aprobada` y `En préstamo`).

---

## 9. Limitaciones conocidas

Este demo **no reemplaza** un sistema institucional:

- No hay backend ni base de datos central.
- No hay autenticación real: las contraseñas están en el código y en `localStorage`.
- No hay recuperación de contraseña por correo real; el reset se simula desde administración.
- Los datos viven en un solo navegador y no se sincronizan entre usuarios/dispositivos.
- EmailJS es una integración opcional de demostración; su clave pública queda visible en el cliente.
- No hay control de concurrencia real ni auditoría fuera del navegador.
- No se deben cargar datos personales reales de estudiantes o docentes.
- Los datos de contacto del CAT Medellín se tomaron del directorio oficial de la Universidad del Tolima; conviene verificarlos antes de una presentación institucional.

La ruta para una versión de producción (Supabase/PostgreSQL, autenticación, RLS, correos con backend y despliegue) está documentada en:

- [`docs/PLAN-MAESTRO.md`](docs/PLAN-MAESTRO.md)
- [`docs/REQUISITOS.md`](docs/REQUISITOS.md)
- [`docs/ARQUITECTURA-Y-DATOS.md`](docs/ARQUITECTURA-Y-DATOS.md)

---

## 10. Identidad institucional

Universidad del Tolima · IDEAD · CAT Medellín  
NIT 890.700.640-7  
I.E. INEM José Félix de Restrepo · Carrera 48 No. 1-125, Avenida Las Vegas, Bloque 7A, Medellín  
PBX 2772020 - 2771515 Ext. 9513 · Tel. 2669041 · Cel. 316 695 0541  
[cmedellin@ut.edu.co](mailto:cmedellin@ut.edu.co) · [www.ut.edu.co](https://www.ut.edu.co)

Horario de atención: martes a viernes de 8:00 a. m. a 12:00 m. y de 2:00 p. m. a 6:00 p. m.; sábado de 7:00 a. m. a 3:00 p. m.

Datos tomados del [directorio oficial de la Universidad del Tolima](https://administrativos.ut.edu.co/atencion-al-ciudadano/directorio.html?cck=contactos&du_id_oficina=1175&boxchecked=0&search=contactos&task=search&start=10).

El logosímbolo oficial se incluye localmente en `icons/logo-ut.png` para que la PWA funcione sin depender de la red. Es un recurso institucional utilizado únicamente con fines académicos y de demostración.
