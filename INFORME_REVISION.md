# Informe de Revisión General — GeoTasker

**Fecha:** 2026-03-14
**Branch revisado:** `main` (commit `ca23d06`)
**Alcance:** Flujos principales, geolocalización, rendimiento, consistencia de UI

---

## Resumen Ejecutivo

GeoTasker es una PWA de gestión de tareas geolocalizadas con integración de IA (Gemini). La arquitectura base es sólida (hooks personalizados, componentes bien separados, PWA correctamente configurada), pero se han identificado **3 problemas críticos**, **6 medios** y **7 menores** que afectan desde la funcionalidad nuclear hasta la experiencia de usuario.

---

## 🔴 Problemas Críticos

### C1 — Modelo de Gemini incorrecto: la IA nunca funciona

**Archivo:** `services/gemini.ts`, línea 15
**Problema:** El nombre del modelo `"gemini-3-flash"` no existe en la API de Google. No hay ningún modelo con ese identificador. Cada llamada falla silenciosamente y cae al fallback, haciendo que la funcionalidad de IA **nunca opere**. La descripción de la tarea siempre será `"Generado automáticamente (Fallback)"` y `hasLocation` siempre será `false`.

```ts
// Código actual — modelo inexistente
model: "gemini-3-flash",

// Modelos válidos a marzo 2026:
// model: "gemini-2.0-flash"
// model: "gemini-1.5-flash"
// model: "gemini-2.5-flash-preview-04-17"
```

**Impacto:** Toda la propuesta de valor de la app (parseo inteligente de tareas, detección de ubicaciones en lenguaje natural) está inoperativa. Los usuarios no pueden aprovechar la IA para crear tareas con geofence automáticamente.

**Propuesta de mejora:** Corregir el nombre del modelo a `"gemini-2.0-flash"` o el modelo estable más reciente disponible. Añadir un test de integración que verifique que la API responde correctamente al iniciarse.

---

### C2 — Stale closure en `handleLocationError`: geolocalización reporta errores incorrectos

**Archivo:** `hooks/useGeofencing.ts`, líneas 59–72, 79–81
**Problema:** `handleLocationError` captura `userLocation` en el momento en que se registra el `watchPosition`. Si el watcher se inicializa sin ubicación (`userLocation = null`) y posteriormente el usuario obtiene su posición, el callback registrado en el navegador **sigue usando el valor antiguo** (`null`) para la comprobación `if (!userLocation)`. Un error de geolocalización posterior (p. ej., pérdida de señal GPS) mostrará siempre el mensaje de error, aunque el usuario ya tenía una posición válida.

```ts
// handleLocationError cierra sobre userLocation del momento del watchPosition
const handleLocationError = (error: GeolocationPositionError) => {
  // ...
  if (!userLocation) { // <-- stale: siempre null si no ha cambiado useHighAccuracy
    setLocationError(msg);
  }
};
```

**Impacto:** El usuario puede perder temporalmente señal GPS, y la app mostrará un error de ubicación aunque la última posición conocida sea válida. Puede llevar a geofences que dejan de dispararse.

**Propuesta de mejora:** Usar una `ref` para acceder al valor actual de `userLocation` dentro del callback, o eliminar la comprobación y gestionar el error de forma independiente del estado de ubicación previo.

```ts
const userLocationRef = useRef(userLocation);
useEffect(() => { userLocationRef.current = userLocation; }, [userLocation]);

// En handleLocationError:
if (!userLocationRef.current) { ... }
```

---

### C3 — `RecenterMap` fuerza recentrado automático en cada actualización GPS

**Archivo:** `components/MapView.tsx`, líneas 20–26
**Problema:** El componente `RecenterMap` llama a `map.setView(center, ...)` cada vez que cambia la posición del usuario. Como la geolocalización actualiza cada ~2 segundos, el mapa **salta constantemente** a la posición del usuario. Si el usuario intenta desplazarse por el mapa para ver una tarea distante o seleccionar una ubicación, el mapa lo devuelve a su posición en el siguiente ciclo de actualización.

```tsx
const RecenterMap: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom()); // Se ejecuta cada 2s aproximadamente
  }, [center, map]);
  return null;
};
```

**Impacto:** La vista de mapa es prácticamente inutilizable para explorar tareas o seleccionar ubicaciones si el GPS está activo. Es el bug de UX más disruptivo en el flujo diario de la app.

**Propuesta de mejora:** Centrar el mapa únicamente la primera vez que se obtiene la ubicación, no en cada actualización. Usar un ref `hasInitialCenter` para rastrear si el centrado inicial ya se realizó.

```ts
const hascentered = useRef(false);
useEffect(() => {
  if (!hascentered.current) {
    map.setView(center, map.getZoom());
    hascentered.current = true;
  }
}, [center, map]);
```

Alternativamente, añadir un botón "Seguir mi posición" que el usuario pueda activar voluntariamente.

---

## 🟡 Problemas Medios

### M1 — Uso de `alert()` nativo bloquea la UI en flujos críticos

**Archivos:** `hooks/useSmartTask.ts` (líneas 39, 45), `components/MapView.tsx` (líneas 73, 75)
**Problema:** Se usa `alert()` nativo del navegador en puntos clave del flujo:
- Tras parsear una tarea con IA, se abre la vista de mapa y **después** se lanza un `alert()` que bloquea la interacción. En móvil esto resulta muy intrusivo.
- Los errores del botón "Usar mi ubicación" en el mapa también usan `alert()`.

```ts
// useSmartTask.ts línea 39 — bloquea el mapa recién abierto
alert(`Gemini detectó una ubicación: "${...}".\nPor favor, selecciona el punto exacto en el mapa.`);
```

**Impacto:** Experiencia de usuario degradada. El flujo de creación de tareas con IA es torpe y anticuado visualmente en una PWA moderna.

**Propuesta de mejora:** Reemplazar `alert()` con un componente de toast/snackbar o un banner informativo inline. El hint de "Toca el mapa para seleccionar ubicación" ya existe en el mapa (línea 197 de MapView) y es suficiente guía visual.

---

### M2 — `window.confirm()` para borrado de tarea: UX inconsistente

**Archivo:** `components/TaskCard.tsx`, línea 23
**Problema:** El borrado de tareas usa `window.confirm()`, un diálogo nativo del navegador que rompe la consistencia visual de la app (especialmente en modo PWA standalone donde se ve muy desubicado).

**Propuesta de mejora:** Implementar un dialog de confirmación con componentes React, consistente con el estilo visual de `EditTaskModal`.

---

### M3 — Errores de geolocalización invisibles en móvil

**Archivo:** `components/Header.tsx`, línea 22
**Problema:** El mensaje de error de ubicación tiene la clase `hidden sm:block`, lo que significa que **en dispositivos móviles el usuario nunca ve el error**. Los móviles son el caso de uso principal de una app de geolocalización.

```tsx
<div className="text-xs text-red-500 max-w-[150px] ... hidden sm:block">
  {locationError}
</div>
```

**Impacto:** Si el GPS falla en móvil, el usuario no tiene ninguna indicación visual. No sabe por qué las notificaciones no llegan.

**Propuesta de mejora:** Mostrar el error en todos los tamaños de pantalla, quizás con un icono compacto en móvil que expanda el mensaje. O añadir un banner en la vista de lista cuando `locationError !== null`.

---

### M4 — `triggeredTasks` no persiste entre sesiones: notificaciones repetidas al reabrir

**Archivo:** `hooks/useGeofencing.ts`, línea 22
**Problema:** El `Set` de tareas ya notificadas (`triggeredTasks`) se inicializa vacío en cada apertura de la app. Si el usuario está dentro del radio de una tarea y cierra/abre la app, recibirá la notificación de geofence inmediatamente de nuevo.

**Propuesta de mejora:** Persistir `triggeredTasks` en `localStorage` con una expiración (p. ej., 1 hora). Al inicializar el hook, cargar los IDs previamente notificados. Esto evita spam de notificaciones para usuarios que recargan la app frecuentemente.

---

### M5 — Vista de mapa muestra marcador de usuario idéntico al de las tareas

**Archivos:** `components/MapView.tsx` (líneas 138, 151), `constants.ts`
**Problema:** La posición del usuario y las tareas pendientes usan el mismo icono (`DEFAULT_ICON` — marcador azul estándar). En el mapa es imposible distinguir cuál es la posición propia y cuáles son las tareas.

**Propuesta de mejora:** Usar un icono diferenciado para la posición del usuario (p. ej., un círculo pulsante azul o un icono de persona), diferente al marcador de las tareas. Solo hay que crear un `USER_ICON` distinto en `constants.ts`.

---

### M6 — No hay forma de establecer `dueDate` en la UI

**Archivos:** `types.ts` (línea 11), `components/EditTaskModal.tsx`
**Problema:** El tipo `Task` incluye un campo `dueDate?: string` y `TaskCard` lo muestra si existe, pero **no hay ningún campo en la UI para establecerlo**: ni en la creación (Gemini tampoco lo extrae), ni en el modal de edición. La funcionalidad está incompleta.

**Propuesta de mejora:** Añadir un campo `<input type="date">` en `EditTaskModal` para que el usuario pueda asignar una fecha de vencimiento manualmente. Opcionalmente, instruir a Gemini para que extraiga fechas del texto natural ("compra leche antes del viernes").

---

## 🟢 Problemas Menores

### m1 — `AppView.ADD` es código muerto

**Archivo:** `types.ts`, línea 22
**Problema:** `AppView.ADD` está definido en el enum pero nunca se usa en ningún archivo del proyecto.
**Propuesta:** Eliminar el valor para mantener el código limpio.

---

### m2 — `MapEvents` elimina todos los listeners al desmontar, no solo el propio

**Archivo:** `components/MapView.tsx`, línea 36
**Problema:** `map.off('click')` elimina **todos** los event listeners de `click` del mapa, no solo el registrado por este componente. Si en el futuro se añaden más listeners (plugins, otros componentes), se romperán silenciosamente.

```ts
return () => { map.off('click'); }; // Elimina todos los click listeners

// Correcto:
return () => { map.off('click', handler); };
```

**Propuesta:** Guardar la referencia al handler y usar `map.off('click', handler)` en el cleanup.

---

### m3 — No hay estado de carga inicial para geolocalización

**Problema:** Cuando la app carga por primera vez, el mapa se centra en Madrid (por defecto en `constants.ts`) y no hay ningún indicador de que la geolocalización está siendo adquirida. Los usuarios pueden confundirse y pensar que el mapa está mal centrado o que la app no funciona.

**Propuesta:** Mostrar un indicador de carga en el mapa o un mensaje "Obteniendo tu ubicación..." hasta recibir la primera posición GPS.

---

### m4 — Descripción de fallback en inglés mezclado con UI en español

**Archivo:** `services/gemini.ts`, línea 44
**Problema:** Cuando la API falla, la descripción es `"Generado automáticamente (Fallback)"`. El término "Fallback" en inglés rompe la consistencia con el resto de la interfaz en español.

**Propuesta:** Cambiar a `"Generado automáticamente"` o `"Procesado sin IA"`.

---

### m5 — Título de tarea sin límite de longitud

**Archivos:** `components/EditTaskModal.tsx`, `components/TaskList.tsx`
**Problema:** No hay `maxLength` en el campo de título. Títulos muy largos pueden desbordar el layout en `TaskCard`, especialmente en pantallas pequeñas.

**Propuesta:** Añadir `maxLength={100}` al input de título en creación y edición.

---

### m6 — Hint de IA con icono `Mic` (micrófono) sin funcionalidad de voz

**Archivo:** `components/TaskList.tsx`, línea 54
**Problema:** El hint "Intenta: Recordarme sacar dinero..." tiene un icono de micrófono (`Mic`), sugiriendo que hay entrada de voz. No existe tal funcionalidad en la app.

**Propuesta:** Reemplazar el icono `Mic` por `Sparkles` o similar que represente IA sin implicar reconocimiento de voz.

---

### m7 — Contador "Mis Tareas (0)" con tareas completadas es confuso

**Archivo:** `components/TaskList.tsx`, línea 61
**Problema:** El contador muestra solo tareas no completadas. Si el usuario tiene 3 tareas pero todas completadas, ve "Mis Tareas (0)" con 3 tarjetas visibles debajo. Esto es contradictorio.

**Propuesta:** Cambiar el texto a "Tareas pendientes (0)" para clarificar, o mostrar un conteo separado como "3 tareas (0 pendientes)".

---

## Resumen de Problemas

| # | Severidad | Problema | Archivo |
|---|-----------|----------|---------|
| C1 | 🔴 Crítico | Modelo Gemini incorrecto — IA nunca funciona | `services/gemini.ts` |
| C2 | 🔴 Crítico | Stale closure en error de geolocalización | `hooks/useGeofencing.ts` |
| C3 | 🔴 Crítico | Mapa salta continuamente a la posición del usuario | `components/MapView.tsx` |
| M1 | 🟡 Medio | `alert()` nativo bloquea UI en flujos críticos | `hooks/useSmartTask.ts`, `MapView.tsx` |
| M2 | 🟡 Medio | `window.confirm()` para borrado inconsistente con UI | `components/TaskCard.tsx` |
| M3 | 🟡 Medio | Errores de GPS invisibles en móvil | `components/Header.tsx` |
| M4 | 🟡 Medio | `triggeredTasks` no persiste: notificaciones repetidas | `hooks/useGeofencing.ts` |
| M5 | 🟡 Medio | Marcadores de usuario y tarea visualmente idénticos | `components/MapView.tsx` |
| M6 | 🟡 Medio | `dueDate` en el tipo pero sin UI para establecerla | `EditTaskModal.tsx`, `types.ts` |
| m1 | 🟢 Menor | `AppView.ADD` código muerto | `types.ts` |
| m2 | 🟢 Menor | `map.off('click')` elimina todos los listeners | `components/MapView.tsx` |
| m3 | 🟢 Menor | Sin indicador de carga inicial de GPS | `hooks/useGeofencing.ts` |
| m4 | 🟢 Menor | "Fallback" en inglés en UI española | `services/gemini.ts` |
| m5 | 🟢 Menor | Sin `maxLength` en campos de título | `EditTaskModal.tsx` |
| m6 | 🟢 Menor | Icono `Mic` sin funcionalidad de voz | `components/TaskList.tsx` |
| m7 | 🟢 Menor | Contador "Mis Tareas (0)" contradictorio con tareas visibles | `components/TaskList.tsx` |

---

## Prioridad de Acción Recomendada

1. **Inmediato:** Corregir nombre del modelo Gemini (C1) — bloquea la funcionalidad principal.
2. **Inmediato:** Corregir `RecenterMap` (C3) — la vista de mapa es inutilizable con GPS activo.
3. **Corto plazo:** Visibilidad de errores en móvil (M3) y `stale closure` geolocalización (C2).
4. **Medio plazo:** Reemplazar `alert()`/`confirm()` por componentes React (M1, M2), persistencia de notificaciones (M4), diferenciación de marcadores (M5).
5. **Backlog:** Resto de problemas menores.
