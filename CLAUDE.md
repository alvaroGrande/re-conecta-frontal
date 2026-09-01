# CLAUDE.md — Instrucciones para IA

Contexto y convenciones del proyecto **reConecta** (frontal Vue 3).

---

## Stack tecnológico

- **Framework**: Vue 3 (Composition API con `<script setup>`)
- **Bundler**: Vite 8
- **Estilos**: Tailwind CSS 4 + PrimeVue 4 + `tailwindcss-primeui`
- **Router**: Vue Router 4
- **HTTP**: Axios (instancia centralizada en `src/services/api.js`)
- **i18n**: vue-i18n 9 (idiomas: `es`, `en`, `ca`, `gl`)
- **Iconos**: Heroicons + PrimeIcons
- **Gráficas**: Chart.js
- **Videollamadas**: Zoom Meeting SDK
- **WebSockets**: socket.io-client

---

## Estructura de carpetas

```
src/
  pages/          → Vistas principales (una por ruta)
  components/
    features/     → Componentes específicos de dominio
    layout/       → Estructura de la app (navbar, sidebar…)
    shared/       → Componentes reutilizables genéricos
  composables/    → Lógica reutilizable (useAuth, usePermissions…)
  services/       → Llamadas a la API y servicios externos
  router/         → Definición de rutas
  i18n/           → Configuración y ficheros de traducción
  config/         → Constantes, permisos, configuración global
  helpers/        → Funciones utilitarias puras
  directives/     → Directivas Vue personalizadas
```

---

## Convenciones de código

- Siempre usar **Composition API** con `<script setup>`.
- Los composables van en `src/composables/` con prefijo `use`.
- Las llamadas a la API van en `src/services/`, nunca directamente en componentes.
- Usar la instancia de axios de `src/services/api.js` — ya incluye el token JWT y manejo de 401.
- Los textos visibles siempre deben usar `$t('clave')` (nunca strings hardcodeados en español u otro idioma).
- Los estilos usan clases de Tailwind. Evitar `<style scoped>` salvo casos excepcionales.
- Darkmode: se activa con la clase `p-dark` en el elemento raíz (no `dark`).

---

## Autenticación y permisos

- El estado de auth vive en `src/composables/useAuth.js` (estado reactivo global, singleton).
- Token JWT en `localStorage` bajo la clave `token`. Usuario serializado en `usuario`.
- Para verificar permisos usar el composable `usePermissions`:

```js
const { puede, esAdmin } = usePermissions()
// En template:
// v-if="puede('talleres:crear')"
// v-if="puede(PERMISOS.TALLERES_CREAR)"
```

- Las constantes de permisos y roles están en `src/config/permissions.js`.

---

## Servicios disponibles

| Fichero | Propósito |
|---|---|
| `api.js` | Instancia base de axios |
| `auth.js` | Login, logout, refresh |
| `usuarios.js` | CRUD de usuarios |
| `talleres.js` | Gestión de talleres |
| `encuestas.js` | Encuestas y plantillas |
| `notificaciones.js` | Notificaciones |
| `chat.js` | Chat directo |
| `socketService.js` | Conexión Socket.IO |
| `videoCall.js` | Videollamadas Zoom |
| `toastService.js` | Notificaciones toast globales |
| `dashboard.js` | Analytics del dashboard |
| `rolesPermisos.js` | Gestión de roles |

---

## Changelog y versionado

- Las versiones siguen **SemVer** (`MAJOR.MINOR.PATCH`).
- El `CHANGELOG.md` se genera automáticamente via GitHub Actions al hacer merge a `main`.
- Convención de commits que impactan el changelog:
  - `Feature: ...` → bump **minor**, sección ✨ Features
  - `Fix: ...` → bump **patch**, sección 🐛 Fixes
  - `Hotfix: ...` → bump **patch**, sección 🚨 Hotfixes
- Commits que no siguen ninguno de estos prefijos no aparecen en el changelog.

---

## Variables de entorno

```env
VITE_API_URL=http://localhost:3000/api   # URL base de la API
```

---

## Comandos útiles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run lint         # Linting
npm run lint:fix     # Linting con autofix
```

---

## Lo que NO hacer

- No hardcodear textos visibles sin pasar por i18n.
- No hacer llamadas HTTP directamente con `fetch` o `axios` sin usar la instancia de `api.js`.
- No usar `Options API` en componentes nuevos.
- No usar la clase `dark` para darkmode (usar `p-dark`).
- No crear componentes en la raíz de `components/` — usar la subcarpeta correspondiente.
