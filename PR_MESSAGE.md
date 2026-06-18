### Resumen Ejecutivo

**¿Qué leíste en el README que motivó este cambio?**
Basado en el análisis de código proactivo y la revisión de los estándares solicitados, se identificaron vulnerabilidades de estandarización en la UI relacionadas con las áreas seguras para dispositivos móviles. Además, se detectó deuda técnica en el rendimiento de React, la cual podría derivar en problemas de escalabilidad.

**¿Qué mejoraste exactamente?**
1. **Prevención de fallos en minificación CSS:** Se eliminaron las clases con valores arbitrarios de Tailwind (`pt-[calc(...)]` y `pb-[calc(...)]`) en `Header.tsx` y `BottomNav.tsx` y se centralizaron en utilidades custom (`@utility pt-safe`, `@utility pb-safe`) en `index.css`.
2. **Optimización de renderizado (React.memo):** El componente `TaskCard` se encontraba dentro de un `map()` en `TaskList` sin control de renderizados. Ahora está envuelto en `React.memo` para prevenir renderizados innecesarios en toda la lista al modificar el estado general (añadir/actualizar/completar una tarea).

**¿Cuál es el beneficio para el negocio/rendimiento?**
- **Rendimiento:** La lista de tareas ahora es significativamente más eficiente. Añadir una nueva tarea no provocará re-renderizados costosos del DOM en las tareas existentes, lo cual es crítico en móviles de gama baja.
- **Estabilidad PWA:** Las utilidades seguras (`pt-safe` y `pb-safe`) garantizan que el diseño se vea perfectamente en dispositivos con "Notch" (como iPhones modernos), mientras evitan bugs de minificación CSS en producción que pueden romper la experiencia de usuario.
