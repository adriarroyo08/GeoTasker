# 📍 GeoTasker Web

**GeoTasker Web** es una Aplicación Web Progresiva (PWA) de gestión de tareas de próxima generación que combina la productividad tradicional con **inteligencia artificial** y **geolocalización en tiempo real**.

La aplicación permite a los usuarios crear tareas utilizando lenguaje natural (procesado por Google Gemini) y recibir notificaciones proactivas cuando se encuentran físicamente cerca de la ubicación de la tarea.

---

## 🚀 Características Principales

### 🧠 1. Creación de Tareas con IA (Smart Add)
Utiliza la API de **Google Gemini 3 Flash** para interpretar comandos de lenguaje natural.
- **Entrada:** "Comprar medicinas en la farmacia del centro"
- **Procesamiento:** La IA extrae el título ("Comprar medicinas"), la intención de ubicación ("farmacia del centro") y sugiere coordenadas.
- **Resultado:** Una tarea geolocalizada lista para confirmar.

### 🌍 2. Geofencing (Cercas Virtuales)
Sistema de monitoreo de ubicación en segundo plano (mientras la app está abierta) que utiliza la fórmula *Haversine* para calcular distancias.
- **Detección:** Compara continuamente la posición del usuario vs. la ubicación de las tareas.
- **Alertas:** Dispara notificaciones del sistema o del navegador cuando el usuario entra en el radio configurado (por defecto 200m).
- **Resiliencia:** Implementa estrategias de "fallback" (caída a baja precisión) si el GPS tarda en responder.

### 🗺️ 3. Visualización de Mapas
- **Modo Lista vs. Modo Mapa:** Alterna entre una vista de tareas pendientes y una vista espacial.
- **Gestión Visual:** Marcadores interactivos para tareas completadas y pendientes.
- **Radios Visibles:** Visualización de las zonas de activación (círculos azules) alrededor de las tareas.
- **Tema Adaptativo:** El mapa cambia sus "tiles" (teselas) automáticamente entre modo claro (OpenStreetMap) y oscuro (CartoDB Dark Matter).

### 🌗 4. Experiencia de Usuario (UX) Moderna
- **Modo Oscuro:** Soporte nativo y manual para temas oscuros persistentes.
- **Gestión Completa:** Crear, Editar (con modal), Eliminar y Marcar como completada.
- **Offline First:** Gracias al Service Worker, la aplicación carga recursos críticos incluso sin conexión.

---

## 🛠️ Stack Tecnológico

La arquitectura está construida sobre principios modernos de desarrollo web:

- **Core:** React 19 + TypeScript.
- **Estilos:** Tailwind CSS (con configuración de Dark Mode).
- **Mapas:** `react-leaflet` y `leaflet` (Librería ligera de mapas).
- **Inteligencia Artificial:** SDK oficial `@google/genai`.
- **Iconografía:** Lucide React.
- **Estado y Efectos:** Hooks personalizados (`useGeofencing`).
- **Persistencia:** LocalStorage y Service Workers para caché de assets.

---

## 📂 Estructura del Proyecto

```bash
/
├── components/
│   ├── MapView.tsx       # Lógica de mapas y marcadores
│   ├── TaskCard.tsx      # Componente de UI para items de lista
│   └── EditTaskModal.tsx # Formulario de edición con sliders
├── hooks/
│   └── useGeofencing.ts  # [CRÍTICO] Motor de geolocalización y notificaciones
├── services/
│   └── gemini.ts         # Capa de comunicación con Google AI
├── utils/
│   └── geo.ts            # Matemáticas para cálculo de distancias
├── types.ts              # Definiciones de TypeScript
├── App.tsx               # Orquestador principal y gestión de estado
└── sw.js                 # Service Worker para capacidades PWA
```

---

## ⚙️ Configuración y Ejecución

### Requisitos Previos
1. Node.js instalado.
2. Una **API Key de Google Gemini**.

### Variables de Entorno
El proyecto requiere que la API Key esté disponible en el proceso de construcción. Asegúrate de configurar `process.env.API_KEY` en tu entorno de desarrollo o despliegue.

### Instalación

Como este proyecto utiliza módulos ES6 directamente vía CDN/ESM en el navegador para este entorno de demostración, no requiere un `npm install` tradicional de dependencias pesadas, pero en un entorno local estándar:

1. Clona el repositorio.
2. Instala dependencias (si usas un bundler como Vite):
   ```bash
   npm install
   ```
3. Ejecuta el servidor de desarrollo:
   ```bash
   npm run dev
   ```

---

## 🔒 Permisos Requeridos

Para funcionar al 100%, la aplicación solicitará:
1. **Geolocalización:** Para rastrear tu posición y compararla con las tareas.
   - *Nota:* Requiere contexto seguro (HTTPS) o localhost.
2. **Notificaciones:** Para alertarte cuando entras en una zona de tarea.

---

## 🐛 Solución de Problemas Comunes

- **Error "Geolocation timeout":** Si estás en interiores, el GPS puede fallar. La app intentará cambiar automáticamente a geolocalización por Wifi/Red (baja precisión).
- **Mapa en gris:** Verifica tu conexión a internet, ya que las teselas del mapa se cargan bajo demanda.
- **IA no responde:** Verifica que tu API Key de Gemini sea válida y tenga cuota disponible.

---

Hecho con ❤️ y 🤖 usando React y Gemini.
