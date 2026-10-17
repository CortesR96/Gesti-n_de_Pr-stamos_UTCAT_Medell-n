# Gestión de Préstamos – UT CAT Medellín (PWA)

Aplicación web progresiva para gestionar el préstamo de materiales y espacios del
CAT Medellín de la Universidad del Tolima. Es un prototipo **funcional**: los datos se
guardan en el navegador (`localStorage`); más adelante se conectará a una base de datos.

## Ingreso (demo)

La app abre en una pantalla de ingreso con dos accesos. Los datos ya vienen cargados:

| Rol | Usuario | Contraseña |
|---|---|---|
| Estudiante | `valentina` | `ut2026` |
| Administrador | `laura` | `admin2026` |

Son credenciales de demostración guardadas en el código (cualquiera las puede ver). Para uso real, la autenticación debe hacerse en un servidor.

## Qué hace

1. **Estudiante** elige materiales en el catálogo, llena los datos y envía la solicitud.
2. **Coordinación** recibe una notificación 🔔, abre la solicitud y la aprueba, rechaza (con motivo) o ajusta a la disponibilidad.
3. El **estudiante** recibe la notificación de aprobada o rechazada (con el mensaje de coordinación).
4. Coordinación registra la **entrega** y la **devolución**; el inventario se descuenta y se repone solo.
5. En **Inventario** se puede agregar y editar elementos. En **Configuración** se restablecen los datos de demostración.

Las dos vistas (Estudiante / Administrador) se pueden abrir en dos pestañas del mismo navegador y se sincronizan en vivo.
**Limitación:** al ser `localStorage`, los datos NO se comparten entre dispositivos distintos; eso requiere un backend.

Tiene dos vistas, que se cambian con el selector de la barra superior:

- **Estudiante:** inicio, catálogo, armado de la solicitud e historial.
- **Coordinación:** panel principal, detalle de solicitud e inventario.

## Estructura

```
prestamos-ut-pwa/
├── index.html              # Estructura de la página
├── manifest.webmanifest    # Datos de instalación de la PWA
├── sw.js                   # Service Worker (modo offline)
├── .nojekyll               # Evita que GitHub Pages procese los archivos con Jekyll
├── css/
│   └── styles.css          # Estilos (tema claro/oscuro, responsive)
├── js/
│   ├── app.js              # Lógica y vistas de la aplicación
│   └── pwa.js              # Registro del Service Worker y botón "Instalar app"
└── icons/                  # Iconos de la app (192, 512, maskable, Apple, favicon)
```

## Publicar en GitHub Pages

1. Crea un repositorio en GitHub y sube **el contenido de esta carpeta** a la raíz del repositorio.
2. Ve a **Settings → Pages**.
3. En **Source** elige *Deploy from a branch*, selecciona la rama `main` y la carpeta `/ (root)`.
4. Guarda. En uno o dos minutos la app estará en `https://TU-USUARIO.github.io/NOMBRE-DEL-REPO/`.

Todas las rutas son relativas, por lo que funciona tanto en la raíz como dentro de un
subdirectorio de GitHub Pages. GitHub Pages usa HTTPS, requisito para las PWA.

## Probar en local

El Service Worker no funciona abriendo el archivo con doble clic (`file://`). Usa un servidor local:

```bash
python -m http.server 8080
```

y abre `http://localhost:8080`.

## Instalar la app

- **Chrome / Edge (PC y Android):** botón **⬇ Instalar app** en la barra superior, o el icono de instalación de la barra de direcciones.
- **iPhone / iPad (Safari):** Compartir → *Añadir a pantalla de inicio*.

## Actualizar la app

El Service Worker guarda los archivos en caché. Cuando cambies cualquier archivo, sube el
número de `CACHE_VERSION` en `sw.js` (por ejemplo, `v1` → `v2`) para que los usuarios reciban la nueva versión.
Si agregas archivos nuevos, inclúyelos en la lista `APP_SHELL` de `sw.js`.

## Próximos pasos

- Conectar `load()` / `save()` de `js/app.js` a una base de datos (Supabase, Firebase…) para compartir datos entre dispositivos.
- Notificaciones push reales (requiere backend).
- Sustituir los avatares y usuarios de ejemplo por inicio de sesión real.
- Completar la sección Reportes.
