# Resumen Ejecutivo

**¿Qué leíste en el README que motivó este cambio?**
En base a los principios descritos en la documentación del proyecto y la filosofía general de la arquitectura moderna con React 19 y TypeScript, así como las directrices para buscar y reducir la "deuda técnica" y evitar el "anidamiento excesivo y funciones de más de 20 líneas". El archivo `components/MapView.tsx` contenía múltiples subcomponentes incrustados que inflaban su tamaño y complicaban su mantenimiento.

**¿Qué mejoraste exactamente?**
He refactorizado el componente `MapView.tsx`, extrayendo sus tres subcomponentes en línea y anidados (`RecenterMap`, `MapEvents` y `LocateControl` junto con las opciones de geolocalización) a archivos modulares individuales (`components/RecenterMap.tsx`, `components/MapEvents.tsx` y `components/LocateControl.tsx`). Posteriormente, actualicé `MapView.tsx` para que importe estos componentes extraídos, garantizando la adhesión estricta al Principio de Responsabilidad Única (SRP).

**¿Cuál es el beneficio para el negocio/rendimiento?**
Esta modularización simplifica sustancialmente la legibilidad y el mantenimiento del código a futuro. Reduce la probabilidad de fusiones (merge conflicts) en archivos de cientos de líneas, mejora el aislamiento a la hora de crear pruebas unitarias para cada subcomponente y fortalece la estructura arquitectónica del proyecto web, resultando en un entorno de desarrollo mucho más ágil y libre de "code smells".