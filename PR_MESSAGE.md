## Resumen Ejecutivo

**¿Qué leíste en el README que motivó este cambio?**
El README describe que la aplicación está diseñada como una Aplicación Web Progresiva (PWA) de próxima generación con soporte *offline first* mediante Service Workers. También señala que se han seguido principios modernos de desarrollo web, invitando implícitamente a evitar problemas de rendimiento (deuda técnica).

**¿Qué mejoraste exactamente?**
1. **Registro PWA Listo para Producción:** Se ajustó `vite.config.ts` para deshabilitar la autoinyección del Service Worker (`injectRegister: false`) y se añadió el registro explícito mediante `import { registerSW } from 'virtual:pwa-register';` en `index.tsx`.
2. **Optimización de Renderizado (Tech Debt):** Se identificó que `TaskCard` no estaba memoizado. Dado que `TaskList` maneja múltiples tarjetas e inputs dinámicos, la falta de memoización ocasionaba re-renders innecesarios. Se envolvió `TaskCard` en `React.memo()`.
3. **Tests Unitarios:** Se crearon pruebas con Vitest verificando explícitamente la eficacia del componente memoizado.

**¿Cuál es el beneficio para el negocio/rendimiento?**
El registro explícito del Service Worker garantiza un despliegue y actualización PWA seguro para entornos de producción, mitigando errores de caché. La memoización del componente `TaskCard` reduce la carga computacional en renderizados críticos, incrementando la fluidez y minimizando el uso de CPU y batería en los dispositivos de los usuarios.
