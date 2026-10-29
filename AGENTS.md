# AGENTS.md

Instrucciones comunes para cualquier agente (Claude Code, Codex, Gemini/Antigravity).
Claude las lee desde `CLAUDE.md`; Gemini, con `context.fileName` en `~/.gemini/settings.json`.

## Proyecto

GeoTasker es una PWA de tareas geolocalizadas con recordatorios por proximidad y creación mediante Gemini.
Usa React, TypeScript y Vite; `App.tsx` coordina las vistas y el estado.
`components/` contiene la interfaz; `hooks/`, la gestión de tareas, ubicación y tema.
`services/` integra Gemini; `utils/` calcula distancias y gestiona notificaciones; `public/` contiene recursos estáticos.
Detalle en `README.md` y referencia técnica en `CLAUDE.md`.

## Verificar

### Raíz (`./`)

Comandos exactos del paso «Node - Install & Validate» de `.github/workflows/pr-validation.yml`, en este orden:

```bash
npm ci
npm run lint --if-present
npm test --if-present -- --run
npm run build --if-present
```

El CI usa Node.js 20 en Ubuntu. No hay validaciones independientes por subcarpeta:
`components/`, `hooks/`, `services/` y `utils/` se prueban desde la raíz.
`package.json` activa la ruta Node del flujo; las rutas Python y Gradle no se ejecutan en este proyecto.
El comando principal de pruebas es `npm test --if-present -- --run`.
No existe un script `lint`: el comando correspondiente termina correctamente sin analizar código.
Comprobación local de esta preparación (30 de octubre de 2026, Windows, Node.js 22.17.0 y npm 10.9.2): los cuatro comandos terminaron correctamente; 119 pruebas pasaron en 12 archivos y se generó la compilación PWA. No hubo comandos fallidos. `npm ci` notificó 30 vulnerabilidades de dependencias (6 bajas, 3 moderadas, 20 altas y 1 crítica); la compilación avisó de datos de Browserslist antiguos. El entorno local difiere de Node.js 20 en Ubuntu usado por CI; el resultado remoto debe consultarse en el PR.
Registra en la descripción de cada PR el resultado de cada comando y cualquier fallo con su causa.
El flujo `deploy.yml` despliega tras un cambio en `main`; no es una validación de PR y no se ejecuta manualmente para verificar.

## Reglas

- Una issue = una rama = un PR contra `main`. Rama `feat/<corto>` o `fix/<corto>`; el PR lleva `Closes #<n>`.
- Haz solo lo que pide la issue. Si falta información o la duda cambia el diseño, pregunta (orquestación: `orca orchestration ask`) en vez de inventar.
- Todo cambio de lógica lleva test junto al módulo, con las convenciones existentes de Vitest y Testing Library.
- Usa `.toBeTruthy()` / `.toBeNull()`: `@testing-library/jest-dom` no está configurado; evita `toBeInTheDocument()`.
- Las etiquetas actuales no usan `htmlFor`: consulta los campos con `container.querySelector('input')` o `getAllByRole`.
- Simula `localStorage` con un almacén en un cierre, siguiendo `hooks/useTaskManager.test.tsx`.
- Usa `vi.useFakeTimers()` para pruebas de esperas y limitación de frecuencia; restaura siempre `vi.useRealTimers()` en `afterEach`.
- Mantén el estado de tareas en `useTaskManager`, elevado a `App.tsx`, y la persistencia en `localStorage` con guardado diferido y guardado inmediato al desmontar u ocultar la página.
- La geolocalización y las notificaciones requieren contexto seguro (HTTPS o localhost), como indica `README.md`.
- `INFORME_REVISION.md` es un diagnóstico histórico: comprueba cada hallazgo contra el código antes de actuar y no amplíes la issue con sus propuestas.
- Commits en español, en imperativo.
- No toques `.github/workflows/`, migraciones ni claves sin que la issue lo pida.
- El despliegue está en el servidor Oracle. Nunca trabajes en la carpeta de producción `/home/ubuntu/GeoTasker`; usa un clon o un árbol de trabajo de desarrollo.
- Hasta la decisión de enero de 2027, solo mantenimiento y trabajo necesario para el informe de uso, coste y potencial; sigue `ROADMAP.md`.

## Trabajo con agentes

Las issues mandan. Etiquetas:

| Etiqueta | Significado |
| --- | --- |
| `agent:claude` | Arquitectura y diseño de módulos, interfaz y sistema de diseño, seguridad (claves de Gemini, permisos de ubicación y notificaciones), bugs difíciles o de concurrencia en geolocalización y persistencia, refactorizaciones que cruzan el proyecto. |
| `agent:codex` | Implementar con la especificación clara: lógica de tareas y distancias, pantallas ya diseñadas, tests, migraciones de dependencias, arreglos de CI y compilación, scripts. También revisa los PR de Claude. |
| `agent:gemini` | Investigar con fuentes web (competidores de tareas geolocalizadas y costes de IA), contenido y datos con citas para el informe de validación, documentación, resumir código, revisar capturas e imágenes, generar recursos gráficos. |
| `necesita:pc` | Para verificarla hay que ver la interfaz, sacar capturas o probar ubicación, notificaciones e instalación de la PWA en navegador o dispositivo: solo en el PC, no en el servidor. |
| `needs-spec` | Le faltan criterios de aceptación o cómo verificar: no se reparte. |
| `size:s` / `size:m` / `size:l` | Tamaño estimado. |

Si trabajas como worker de Orca, al acabar envía un único `worker_done` con el número del PR en el cuerpo.
