# GeoTasker — Claude Code Reference

## Project Overview

GeoTasker is a **Progressive Web App (PWA)** for managing geo-tagged tasks with location-based reminders and AI-powered task creation. When a user enters the proximity radius of a task location, a push notification fires.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Language | TypeScript ~5.8 |
| UI Framework | React 19 |
| Build Tool | Vite 6 |
| Styling | Tailwind CSS 4 |
| Maps | Leaflet 1.9 + react-leaflet 5 |
| AI | Google Gemini API (`@google/genai`) |
| PWA | vite-plugin-pwa |
| Testing | Vitest 4 + @testing-library/react 16 |

## Project Structure

```
GeoTasker/
├── App.tsx                  # Root component — orchestrates views & state
├── index.tsx                # React entry point
├── types.ts                 # Shared TypeScript interfaces & enums
├── constants.ts             # Leaflet icon config, tile layer URLs
│
├── components/
│   ├── Header.tsx           # Top bar: title, theme toggle, location error
│   ├── BottomNav.tsx        # LIST / MAP view switcher
│   ├── TaskList.tsx         # AI input + task list
│   ├── TaskCard.tsx         # Individual task row with distance badge
│   ├── MapView.tsx          # Leaflet map with geofence circles
│   ├── EditTaskModal.tsx    # Inline edit modal (title, desc, radius)
│   └── ErrorBoundary.tsx   # React error boundary
│
├── hooks/
│   ├── useTaskManager.ts    # Task CRUD + debounced localStorage
│   ├── useGeofencing.ts     # watchPosition + geofence notifications
│   ├── useSmartTask.ts      # AI parse → location select flow
│   └── useTheme.ts          # Dark/light mode + localStorage + meta tag
│
├── services/
│   └── gemini.ts            # parseTaskWithGemini() — Gemini AI integration
│
└── utils/
    ├── geo.ts               # calculateDistance() (Haversine), formatDistance()
    └── notifications.ts     # requestNotificationPermission(), triggerGeofenceNotification()
```

## Key Data Models (`types.ts`)

```ts
interface GeoLocation { lat: number; lng: number; address?: string }

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate?: string;       // ISO string
  location?: GeoLocation;
  radius: number;         // metres
  isCompleted: boolean;
  createdAt: number;      // Unix ms
}

enum AppView { LIST = 'LIST', MAP = 'MAP', ADD = 'ADD' }

interface GeofenceEvent { taskId: string; distance: number; timestamp: number }
```

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `GEMINI_API_KEY` | Google Gemini API key (injected as `import.meta.env.VITE_GEMINI_API_KEY`) |

Set in `.env` at project root. Not required — the app gracefully falls back when missing.

## Common Commands

```bash
npm run dev      # Start dev server on http://localhost:3000
npm run build    # Production build
npm run preview  # Preview production build
npm test         # Run all unit tests (Vitest, watch mode)
npm test -- --run  # Run tests once (CI mode)
```

## Testing

**Framework:** Vitest 4 + @testing-library/react
**Environment:** jsdom (configured in `vite.config.ts`)
**Globals enabled:** `describe`, `it`, `expect`, `vi` available without imports (though tests import them explicitly for clarity)

### Test Files

| File | Coverage |
|------|---------|
| `hooks/useTaskManager.test.tsx` | Task CRUD, localStorage debounce, visibility save, invalid JSON fallback |
| `hooks/useGeofencing.test.ts` | Geolocation watch, geofence triggers, accuracy fallback, throttle, completed/no-location skip, updateLocation, dedup |
| `hooks/useSmartTask.test.tsx` | AI parse flow, location confirmation, cancelLocation, empty/whitespace input guard, no tempLocation guard |
| `hooks/useTheme.test.tsx` | Dark mode init, toggle, localStorage, meta tag |
| `services/gemini.test.ts` | Gemini API calls, input sanitisation, error fallback, empty/undefined response fallback |
| `components/TaskCard.test.tsx` | Render, distance badge, edit/delete interactions, completed styling, due date badge, empty description |
| `components/Header.test.tsx` | Title, theme icon, error message |
| `components/BottomNav.test.tsx` | View switching, cancelLocation integration |
| `components/EditTaskModal.test.tsx` | Form render, input changes, onSave/onClose callbacks |
| `components/TaskList.test.tsx` | Input area, empty state, task count (pending only), rendering, keyboard/click handlers, disabled states |
| `utils/geo.test.ts` | Haversine formula, formatDistance |
| `utils/notifications.test.ts` | Permission request, SW fallback, Notification API, SW error fallback, triggerGeofenceNotification |

**Total: 119 tests across 12 suites.**

### Testing Conventions

- Use `.toBeTruthy()` / `.toBeNull()` — `@testing-library/jest-dom` is **not** configured; avoid `toBeInTheDocument()`.
- Labels in components do not use `htmlFor` — query inputs with `container.querySelector('input')` or `getAllByRole`.
- Mock `localStorage` with a closure store (see `useTaskManager.test.tsx` for the pattern).
- Use `vi.useFakeTimers()` for debounce/throttle tests; always `vi.useRealTimers()` in `afterEach`.

## Architecture Notes

- **State:** All task state lives in `useTaskManager` (lifted to `App.tsx`). No external state manager.
- **Persistence:** Tasks are saved to `localStorage` with a 1-second debounce. Immediate save happens on unmount and `visibilitychange → hidden`.
- **Geofencing:** `useGeofencing` uses `navigator.geolocation.watchPosition` with a high-accuracy strategy that falls back to low-accuracy on timeout.
- **AI flow:** `useSmartTask` orchestrates: user types → Gemini parses → if `hasLocation` the map enters selection mode → user pins location → task created.
- **PWA:** Service Worker auto-updates; caches all static assets for offline use.
