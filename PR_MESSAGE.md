# Resumen Ejecutivo

**¿Qué leíste en el README que motivó este cambio?**
En el README y en la documentación del proyecto se detallaban dos puntos clave que motivaron estos cambios:
1. La configuración de la API Key: Se indicaba que los usuarios debían configurar `process.env.API_KEY` para compilar el proyecto y habilitar la inteligencia artificial. Sin embargo, en `vite.config.ts` el código intentaba leer exclusivamente `env.GEMINI_API_KEY`, provocando un fallo silencioso (el sistema caía al fallback de IA) a pesar de seguir las instrucciones oficiales.
2. Rendimiento y adaptabilidad PWA: Al tratarse de una PWA enfocada en la gestión de tareas móviles y con frecuentes actualizaciones de GPS, la optimización de los renderizados y el diseño adaptativo en dispositivos modernos (notch/safe-area) son fundamentales para una experiencia fluida.

**¿Qué mejoraste exactamente?**
1. **Corrección de Configuración:** Actualicé `vite.config.ts` para que soporte de manera resiliente las variables de entorno: `env.GEMINI_API_KEY || env.API_KEY || process.env.API_KEY`, alineando el comportamiento técnico con la documentación.
2. **Optimizaciones de Rendimiento (`React.memo`):** Envolví el componente `TaskCard` en `React.memo` y le asigné un `displayName`. Debido a que la lista de tareas (`TaskList`) se actualiza continuamente ante eventos de GPS o cambios de estado, la falta de memoización obligaba a re-renderizar todas las tareas.
3. **Robustez Visual en Móviles (Tailwind v4):** Extraje la lógica del "safe area inset top" (usada para evitar el notch en móviles) creando la utilidad personalizada `@utility pt-safe` en `index.css` e integrándola en `components/Header.tsx`. Esto evita errores de minificación y asegura compatibilidad nativa en Tailwind v4.

**¿Cuál es el beneficio para el negocio/rendimiento?**
- **Funcionalidad IA Restaurada:** Los nuevos desarrolladores o entornos de despliegue que sigan el README ya no encontrarán una IA "rota", mejorando el onboarding del proyecto.
- **Rendimiento Drásticamente Mejorado:** La memoización previene el re-renderizado en cascada de decenas/centenas de `TaskCard` cada vez que el GPS detecta un ligero movimiento, reduciendo el consumo de batería y CPU del dispositivo móvil, algo crítico en una app con rastreo en segundo plano.
- **Interfaz Confiable:** La encapsulación de utilidades CSS previene futuras regresiones de diseño en móviles de última generación, otorgando a la app un look & feel nativo.
