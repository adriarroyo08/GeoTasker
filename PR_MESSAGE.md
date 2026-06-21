# Resumen Ejecutivo

**¿Qué se leyó en el README que motivó el cambio?**
Se revisaron las indicaciones del README sobre el uso de Tailwind CSS en la PWA y las especificaciones de estilos. También se detectó que la implementación directa de valores "arbitrarios" de CSS con variables de entorno (como `env(safe-area-inset-top)`) dentro de las clases en Tailwind v4 puede ser propensa a fallos y problemas de escape durante la minificación y compilación para producción (por ejemplo, con cssnano).

**¿Exactamente qué se mejoró?**
Se reemplazaron las clases utilitarias arbitrarias `pt-[calc(0.75rem_+_env(safe-area-inset-top))]` y `pb-[calc(0.5rem_+_env(safe-area-inset-bottom))]` en los componentes `Header.tsx` y `BottomNav.tsx` por nuevas directivas `@utility` (`pt-safe` y `pb-safe`) definidas formalmente en `index.css`.

**¿Cuál es el beneficio de negocio o rendimiento?**
Esta mejora garantiza que la aplicación no sufra regresiones de diseño (layout) ni fallos en producción a causa de un mal parseo de CSS. Mantiene una experiencia de usuario fluida y visualmente atractiva en dispositivos móviles modernos (con y sin notch), asegurando una interfaz más robusta para el usuario final.