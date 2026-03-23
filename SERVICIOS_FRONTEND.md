# 📚 Servicios del Frontend - reConecta

Documentación de todos los servicios disponibles en el frontend.

## 🔐 Auth Service (`auth.js`)

```javascript
import { login, logout, obtenerUsuarioActual } from '@services/auth'
```

### `login(credentials)`
Inicia sesión de usuario y conecta Socket.IO

**Parámetros:**
- `credentials.email` - Email del usuario
- `credentials.password` - Contraseña

**Retorna:** `{ token, usuario }`

**Ejemplo:**
```javascript
const { token, usuario } = await login({
  email: 'user@example.com',
  password: '123456'
})
```

### `logout()`
Cierra sesión, limpia tokens y desconecta socket

**Ejemplo:**
```javascript
await logout()
router.push('/login')
```

### `obtenerUsuarioActual()`
Obtiene datos del usuario autenticado actual

**Retorna:** `Object` con datos del usuario o `null`

---

## 👥 Contactos Service (`contactos.js`)

```javascript
import {
  obtenerInstructorPrincipal,
  obtenerInstructores,
  obtenerContactos,
  agregarContacto,
  eliminarContacto,
  buscarUsuarios,
  obtenerInstructoresDisponibles,
  asignarInstructor,
  cambiarInstructorPrincipal,
  obtenerUsuariosCoordinados,
  obtenerUsuariosDeInstructor,
  obtenerUsuariosSinSupervisor,
  obtenerConteosSupervisores
} from '@services/contactos'
```

### `obtenerContactos(page, limit, search)`
Obtiene lista paginada de contactos

**Parámetros:**
- `page` (1) - Número de página
- `limit` (20) - Resultados por página
- `search` ('') - Término de búsqueda

**Retorna:** `{ contactos, total, pagina, totalPaginas }`

### `agregarContacto(contactoId)`
Agrega un nuevo contacto

### `eliminarContacto(contactoId)`
Elimina un contacto

### `buscarUsuarios(termino)`
Busca usuarios para agregar como contacto

---

## 📊 Dashboard Service (`dashboard.js`)

```javascript
import {
  obtenerEstadisticas,
  obtenerEstadisticasUsuarios,
  obtenerEstadisticasTalleres,
  obtenerEstadisticasEncuestas,
  obtenerDistribucionRoles,
  obtenerActividadPorDias,
  obtenerUsuariosConectados,
  obtenerActividadReciente,
  obtenerEstadisticasQueries,
  obtenerQueriesMasLentas
} from '@services/dashboard'
```

### `obtenerEstadisticas()`
Obtiene todas las estadísticas del dashboard

**Retorna:** Objeto con todas las estadísticas

### `obtenerEstadisticasUsuarios()`
Obtiene solo estadísticas de usuarios

### `obtenerEstadisticasTalleres()`
Obtiene solo estadísticas de talleres

### `obtenerEstadisticasEncuestas()`
Obtiene solo estadísticas de encuestas

---

## 📝 Encuestas Service (`encuestas.js`)

```javascript
import {
  obtenerEncuestas,
  obtenerEncuesta,
  crearEncuesta,
  crearRespuesta,
  obtenerResultados
} from '@services/encuestas'
```

### `obtenerEncuestas()`
Obtiene lista de todas las encuestas

### `obtenerEncuesta(id)`
Obtiene detalles de una encuesta específica

### `crearRespuesta(encuestaId, respuestas)`
Envía respuesta a una encuesta

**Parámetros:**
- `encuestaId` - ID de la encuesta
- `respuestas` - Array de respuestas

---

## 🔔 Notificaciones Service (`notificaciones.js`)

```javascript
import {
  obtenerNotificaciones,
  contarNoLeidas,
  obtenerNotificacionesEnviadas,
  crearNotificacion,
  enviarNotificacionMasiva,
  marcarComoLeida,
  marcarTodasLeidas,
  eliminarNotificacion
} from '@services/notificaciones'
```

### `obtenerNotificaciones(soloNoLeidas, limite)`
Obtiene notificaciones del usuario

**Parámetros:**
- `soloNoLeidas` (false) - Filtrar solo no leídas
- `limite` (50) - Máximo de notificaciones

### `contarNoLeidas()`
Retorna cantidad de notificaciones no leídas

### `marcarComoLeida(notificacionId)`
Marca una notificación como leída

### `marcarTodasLeidas()`
Marca todas las notificaciones como leídas

### `enviarNotificacionMasiva(data)`
Envía notificación a múltiples usuarios

**Parámetros:**
- `data.destinatarios_ids` - Array de IDs (opcional)
- `data.rol_destino` - Rol al que enviar (opcional)
- `data.tipo` - Tipo de notificación
- `data.titulo` - Título
- `data.mensaje` - Mensaje

---

## 🔌 Socket Service (`socketService.js`)

```javascript
import {
  conectarSocket,
  desconectarSocket,
  getSocket,
  onNuevaNotificacion,
  offNuevaNotificacion,
  onUsuarioOnline,
  onUsuarioEscribiendo,
  emitirEscribiendo,
  emitirDejarEscribir,
  emitirNotificacionLeida
} from '@services/socketService'
```

### `conectarSocket(token)`
Conecta al servidor Socket.IO con token JWT

### `desconectarSocket()`
Desconecta del servidor Socket.IO

### `getSocket()`
Obtiene la instancia actual del socket

### `onNuevaNotificacion(callback)`
Escucha nuevas notificaciones en tiempo real

**Ejemplo:**
```javascript
onNuevaNotificacion((notificacion) => {
  mostrarToast(notificacion.mensaje)
})
```

### `emitirEscribiendo(receptorId)`
Notifica que estás escribiendo

### `emitirNotificacionLeida(notificacionId)`
Notifica que marcaste una notificación como leída

---

## 🎓 Talleres Service (`talleres.js`)

```javascript
import {
  getTalleres,
  createTaller,
  activarTaller,
  desactivarTaller,
  inscribirTaller
} from '@services/talleres'
```

### `getTalleres()`
Obtiene lista de todos los talleres

### `createTaller(taller)`
Crea un nuevo taller

### `activarTaller(id)`
Activa un taller

### `desactivarTaller(id)`
Desactiva un taller

### `inscribirTaller(tallerId, usuarioId)`
Inscribe un usuario a un taller

---

## 👤 Usuarios Service (`usuarios.js`)

```javascript
import {
  getUsuarios,
  getUsuario,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  uploadFotoPerfil,
  impersonarUsuario,
  detenerImpersonacion
} from '@services/usuarios'
```

### `getUsuarios(filtros)`
Obtiene lista de usuarios con filtros

**Parámetros:**
- `filtros.rol` - Filtrar por rol
- `filtros.activo` - Filtrar por estado
- `filtros.busqueda` - Término de búsqueda

### `getUsuario(id)`
Obtiene detalles de un usuario específico

### `createUsuario(usuario)`
Crea un nuevo usuario

### `updateUsuario(id, datos)`
Actualiza datos de un usuario

### `deleteUsuario(id)`
Elimina un usuario

### `uploadFotoPerfil(usuarioId, file)`
Sube foto de perfil

**Parámetros:**
- `usuarioId` - ID del usuario
- `file` - Archivo de imagen

---

## 📞 Video Call Service (`videoCall.js`)

```javascript
import { createRoom } from '@services/videoCall'
```

### `createRoom(roomConfig)`
Crea una reunión de videollamada en Zoom

**Parámetros:**
- `roomConfig.nombre` - Nombre de la sala
- `roomConfig.duracion` - Duración en minutos
- `roomConfig.max_participantes` - Máximo de participantes

**Retorna:** `{ url, nombre, token }`

**Ejemplo:**
```javascript
const sala = await createRoom({
  nombre: 'Sesión con Juan',
  duracion: 60
})
window.open(sala.url, '_blank')
```

---

## 🎯 Toast Service (`toastService.js`)

```javascript
import { setToast, showError, showSuccess } from '@services/toastService'
```

### `setToast(toast)`
Configura la instancia de PrimeVue Toast

### `showError(message)`
Muestra toast de error

### `showSuccess(message)`
Muestra toast de éxito

---

## 📡 API Service (`api.js`)

Instancia configurada de Axios con:
- Base URL desde variable de entorno
- Interceptor para añadir token JWT
- Manejo de errores 401 (redirección a login)

**No se importa directamente**, se usa en otros servicios.
