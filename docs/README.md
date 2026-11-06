# Documentación del proyecto

Esta carpeta contiene el diseño y la ruta para convertir el prototipo actual en una aplicación funcional para el CAT Medellín de la Universidad del Tolima.

El **demo funcional v5** ya está implementado en la raíz del proyecto: consulta el [`README.md`](../README.md) para credenciales, flujo de presentación y publicación en GitHub Pages.

| Documento | Contenido | Cuándo usarlo |
|---|---|---|
| [`PLAN-MAESTRO.md`](./PLAN-MAESTRO.md) | Diagnóstico, visión, roles, arquitectura, identidad UT, roadmap, costos, riesgos y primeros pasos. | Para entender el proyecto completo y presentarlo. |
| [`REQUISITOS.md`](./REQUISITOS.md) | RF1–RF31 revisados, RF32–RF96 nuevos, RNF1–RNF50, criterios de aceptación y glosario. | Para construir, priorizar y verificar el alcance. |
| [`ARQUITECTURA-Y-DATOS.md`](./ARQUITECTURA-Y-DATOS.md) | Stack, modelo de datos SQL, RLS, motor de disponibilidad, clases OOP, PWA, migración y pruebas. | Para implementar la base de datos y el código. |

## Orden de lectura recomendado

1. **PLAN-MAESTRO** → secciones 1 a 5 (contexto y reglas de negocio).
2. **REQUISITOS** → Parte I (funcionales) y Parte II (no funcionales).
3. **ARQUITECTURA-Y-DATOS** → secciones 4 a 6 (modelo, disponibilidad y seguridad).
4. **PLAN-MAESTRO** → sección 9 (roadmap) para ejecutar.

## Resumen en una frase

Convertir el demo local en una PWA con base de datos central, autenticación real, administración de usuarios/grupos/profesores, disponibilidad por fechas, correos automáticos, devoluciones verificadas, reportes e identidad institucional UT, usando **Supabase + GitHub Pages** como base del piloto.

## Decisiones que faltan por confirmar

Están listadas en [`PLAN-MAESTRO.md`](./PLAN-MAESTRO.md#16-decisiones-pendientes). Las más importantes:

- ¿Supabase es aceptable para la Universidad?
- ¿Los profesores solicitan para cursos, grupos o ambos?
- ¿Solo CAT Medellín o varias sedes?
- ¿Quién administra los usuarios?
- ¿Se autoriza el uso del logo/escudo y de los datos institucionales?
