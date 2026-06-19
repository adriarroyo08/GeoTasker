# Resumen Ejecutivo

**¿Qué leíste en el README que motivó este cambio?**
El README especifica que la aplicación busca lograr una "Experiencia de Usuario (UX) Moderna" y que la "arquitectura está construida sobre principios modernos de desarrollo web". Además, se prioriza identificar y resolver patrones de diseño ineficientes (deuda técnica).

**¿Qué mejoraste exactamente?**
Se refactorizó el componente `TaskCard` ubicado en `components/TaskCard.tsx` para envolverlo utilizando `React.memo`. Adicionalmente, se le asignó el atributo explícito `TaskCard.displayName = 'TaskCard'` para evitar problemas de testing o depuración.

**¿Cuál es el beneficio para el negocio/rendimiento?**
Esta mejora de rendimiento evita los re-renders innecesarios de múltiples elementos individuales en la lista de tareas cuando el estado del componente padre (`TaskList`) cambia (por ejemplo, al escribir un nuevo texto para agregar una tarea o al alternar el estado de completado de otra tarea). Esto hace que la aplicación se sienta mucho más rápida, fluida y con un mejor consumo de recursos y batería en dispositivos móviles, consolidando la experiencia moderna que se promete.
