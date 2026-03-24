/**
 * Catálogo de permisos para la UI.
 * Define los grupos, iconos y etiquetas legibles de cada permiso.
 * El origen autoritario de ACTIVOS/INACTIVOS por rol sigue siendo la BD (tabla roles_permisos).
 */

export const CATALOGO_GRUPOS = [
  {
    label: 'Dashboard',
    icon: 'pi pi-chart-bar',
    permisos: [
      { permiso: 'dashboard:ver', descripcion: 'Ver dashboard analitico' },
    ],
  },
  {
    label: 'Talleres',
    icon: 'pi pi-calendar',
    permisos: [
      { permiso: 'talleres:ver',            descripcion: 'Ver lista de talleres' },
      { permiso: 'talleres:crear',           descripcion: 'Crear talleres' },
      { permiso: 'talleres:editar',          descripcion: 'Editar talleres' },
      { permiso: 'talleres:eliminar',        descripcion: 'Eliminar talleres' },
      { permiso: 'talleres:archivar',        descripcion: 'Archivar talleres' },
      { permiso: 'talleres:inscribir',       descripcion: 'Inscribirse en talleres' },
      { permiso: 'talleres:ver_inscritos',   descripcion: 'Ver inscritos de un taller' },
      { permiso: 'talleres_archivados:ver',  descripcion: 'Ver talleres archivados' },
    ],
  },
  {
    label: 'Usuarios',
    icon: 'pi pi-users',
    permisos: [
      { permiso: 'usuarios:ver',         descripcion: 'Ver lista de usuarios' },
      { permiso: 'usuarios:ver_detalle', descripcion: 'Ver detalle de un usuario' },
      { permiso: 'usuarios:crear',       descripcion: 'Crear usuarios' },
      { permiso: 'usuarios:editar',      descripcion: 'Editar usuarios' },
      { permiso: 'usuarios:eliminar',    descripcion: 'Eliminar usuarios' },
    ],
  },
  {
    label: 'Encuestas',
    icon: 'pi pi-chart-line',
    permisos: [
      { permiso: 'encuestas:ver',       descripcion: 'Ver encuestas' },
      { permiso: 'encuestas:crear',     descripcion: 'Crear encuestas' },
      { permiso: 'encuestas:editar',    descripcion: 'Editar encuestas' },
      { permiso: 'encuestas:eliminar',  descripcion: 'Eliminar encuestas' },
      { permiso: 'encuestas:responder', descripcion: 'Responder encuestas' },
    ],
  },
  {
    label: 'Calendario',
    icon: 'pi pi-calendar-times',
    permisos: [
      { permiso: 'calendario:ver', descripcion: 'Ver calendario' },
    ],
  },
  {
    label: 'Videollamadas',
    icon: 'pi pi-video',
    permisos: [
      { permiso: 'videollamadas:ver',       descripcion: 'Ver videollamadas' },
      { permiso: 'videollamadas:crear',     descripcion: 'Crear videollamadas' },
      { permiso: 'videollamadas:gestionar', descripcion: 'Gestionar videollamadas' },
    ],
  },
  {
    label: 'Perfil',
    icon: 'pi pi-id-card',
    permisos: [
      { permiso: 'perfil:ver',    descripcion: 'Ver propio perfil' },
      { permiso: 'perfil:editar', descripcion: 'Editar propio perfil' },
    ],
  },
  {
    label: 'Notificaciones',
    icon: 'pi pi-bell',
    permisos: [
      { permiso: 'notificaciones:ver',       descripcion: 'Recibir notificaciones' },
      { permiso: 'notificaciones:crear',     descripcion: 'Crear notificaciones' },
      { permiso: 'notificaciones:gestionar', descripcion: 'Gestionar todas las notificaciones' },
    ],
  },
  {
    label: 'Reportes',
    icon: 'pi pi-file-pdf',
    permisos: [
      { permiso: 'reportes:ver', descripcion: 'Ver reportes y analiticas' },
    ],
  },
  {
    label: 'Contactos',
    icon: 'pi pi-address-book',
    permisos: [
      { permiso: 'contactos:ver',       descripcion: 'Ver contactos' },
      { permiso: 'contactos:gestionar', descripcion: 'Gestionar contactos' },
    ],
  },
  {
    label: 'Administracion',
    icon: 'pi pi-cog',
    permisos: [
      { permiso: 'roles:gestionar', descripcion: 'Gestionar roles y permisos' },
    ],
  },
]
