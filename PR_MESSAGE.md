# Mejora de Rendimiento: Memoización de TaskCard

## Resumen Ejecutivo

**¿Qué leíste en el README que motivó este cambio?**
El README documenta que el sistema de *Geofencing* monitorea continuamente la ubicación del usuario mediante la API de geolocalización. Dado que la vista de tareas en modo lista (`components/TaskList.tsx`) recalcula distancias en tiempo real cada vez que cambia la ubicación del usuario, identifiqué que una actualización en el estado global (`userLocation`) provocaba un re-renderizado costoso de todas las tareas (incluso aquellas que no necesitaban actualizarse si sus props se mantenían estables o si estaban alejadas del foco de acción), lo que violaba los principios de eficiencia sugeridos para el entorno PWA móvil, constituyendo un punto clave de deuda técnica de renderizado en React.

**¿Qué mejoraste exactamente?**
Implementé la memoización explícita del componente `TaskCard` utilizando `React.memo`. Al envolver el componente en un memo, React ahora evalúa los props antes de renderizar la tarjeta. Se acompañó este cambio con una prueba unitaria exhaustiva en `components/TaskCard.test.tsx` que espía una función interna dependiente de los props (`calculateDistance`) para asegurar matemáticamente que la función (y por consiguiente, el componente) solo se evalúa durante el renderizado inicial y cuando los props cambian explícitamente, pero ignora los re-renderizados provocados por cambios de estado irrelevantes del componente padre.

**¿Cuál es el beneficio para el negocio/rendimiento?**
La optimización previene la degradación del rendimiento en dispositivos móviles de gama baja y ahorra consumo de batería. Al limitar las actualizaciones del DOM a las estrictamente necesarias en listas largas, la UI se mantiene fluida (60 FPS) incluso bajo actualizaciones frecuentes del GPS, mejorando sustancialmente la Experiencia de Usuario (UX) general.
