import { createRouter, createWebHistory } from 'vue-router'
import { PERMISOS_POR_ROL } from '@/config/permissions.js'

// Lazy loading para mejor performance
const Home = () => import('@pages/Home.vue')
const About = () => import('@pages/About.vue')
const Services = () => import('@pages/Services.vue')
const Contact = () => import('@pages/Contact.vue')
const Perfil = () => import('@pages/Perfil.vue')
const Login = () => import('@pages/Login.vue')
const VideoCall = () => import('@pages/VideoCall.vue')
const Usuarios = () => import('@pages/Usuarios.vue')
const CrearUsuario = () => import('@pages/CrearUsuario.vue')
const Dashboard = () => import('@pages/Dashboard.vue')
const PerfilUsuario = () => import('@pages/PerfilUsuario.vue')
const Talleres = () => import('@pages/Talleres.vue')
const TalleresArchivados = () => import('@pages/TalleresArchivados.vue')
const Encuestas = () => import('@pages/Encuestas.vue')
const Calendario = () => import('@pages/Calendario.vue')
const NotFound = () => import('@pages/NotFound.vue')
const RolesPermisos = () => import('@pages/RolesPermisos.vue')
const Configuracion = () => import('@pages/Configuracion.vue')
const CentroNotificaciones = () => import('@pages/CentroNotificaciones.vue')
const NotificacionesRecibidas = () => import('@pages/NotificacionesRecibidas.vue')
const NotificacionesEnviadas = () => import('@pages/NotificacionesEnviadas.vue')
const Chat = () => import('@pages/Chat.vue')

/**
 * meta.permission: permiso requerido para acceder a la ruta (ej: 'dashboard:ver').
 * Reemplaza meta.requiresAdmin — compatible hacia atrás durante la migración.
 */
const routes = [
  { path: '/', component: Home, name: 'Home' },
  { path: '/login', component: Login, name: 'Login' },
  { path: '/dashboard', component: Dashboard, name: 'Dashboard', meta: { permission: 'dashboard:ver' } },
  { path: '/usuario/:id', component: PerfilUsuario, name: 'PerfilUsuario', meta: { permission: 'usuarios:ver_detalle' } },
  { path: '/about', component: About, name: 'About' },
  { path: '/services', component: Services, name: 'Services' },
  { path: '/contact', component: Contact, name: 'Contact' },
  { path: '/perfil', component: Perfil, name: 'Perfil', meta: { permission: 'perfil:ver' } },
  { path: '/talleres', component: Talleres, name: 'Talleres', meta: { permission: 'talleres:ver' } },
  { path: '/talleres/archivados', component: TalleresArchivados, name: 'TalleresArchivados', meta: { permission: 'talleres_archivados:ver' } },
  { path: '/encuestas/plantillas', component: () => import('@pages/Encuestas.vue'), name: 'EncuestasPlantillas', meta: { permission: 'encuestas:ver' } },
  { path: '/encuestas/:id?', component: Encuestas, name: 'Encuestas', meta: { permission: 'encuestas:ver' } },
  { path: '/calendario', component: Calendario, name: 'Calendario', meta: { permission: 'calendario:ver' } },
  { path: '/videollamada', component: VideoCall, name: 'Videollamadas', meta: { permission: 'videollamadas:ver' } },
  { path: '/usuarios', component: Usuarios, name: 'Usuarios', meta: { permission: 'usuarios:ver' } },
  { path: '/usuarios/nuevo', component: CrearUsuario, name: 'CrearUsuario', meta: { permission: 'usuarios:crear' } },
  { path: '/roles-permisos', component: RolesPermisos, name: 'RolesPermisos', meta: { permission: 'roles:gestionar' } },
  { path: '/configuracion', component: Configuracion, name: 'Configuracion', meta: { permission: 'configuracion:ver' } },
  { path: '/chat', component: Chat, name: 'Chat', meta: { permission: 'chat:ver' } },
  { path: '/chat/general', component: Chat, name: 'ChatGeneral', meta: { permission: 'chat:ver' } },
  { path: '/chat/g/:slug', component: Chat, name: 'ChatGrupo', meta: { permission: 'chat:ver' } },
  { path: '/chat/d/:chatId', component: Chat, name: 'ChatDirecto', meta: { permission: 'chat:ver' } },
  {
    path: '/notificaciones',
    component: CentroNotificaciones,
    name: 'CentroNotificaciones',
    meta: { permission: 'notificaciones:ver' },
    redirect: { name: 'NotificacionesRecibidas' },
    children: [
      { path: 'recibidas', component: NotificacionesRecibidas, name: 'NotificacionesRecibidas' },
      { path: 'enviadas', component: NotificacionesEnviadas, name: 'NotificacionesEnviadas' }
    ]
  },
  // Ruta catch-all para 404 - debe estar al final
  { path: '/:pathMatch(.*)*', component: NotFound, name: 'NotFound' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Rutas públicas que no requieren autenticación
const publicRoutes = new Set(['Login'])

function getUsuario() {
  try {
    return JSON.parse(localStorage.getItem('usuario') || '{}')
  } catch {
    return {}
  }
}

// Guard de autenticación y permisos
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const isPublicRoute = publicRoutes.has(to.name)

  // Si no hay token y la ruta no es pública, redirigir al login
  if (!token && !isPublicRoute) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }

  // Si hay token y va al login, redirigir al home o a la ruta guardada
  if (token && to.name === 'Login') {
    const redirect = to.query.redirect
    // Validar que el redirect sea una ruta interna (evitar open redirect)
    if (redirect && typeof redirect === 'string' && redirect.startsWith('/') && !redirect.startsWith('//')) {
      next(redirect)
    } else {
      next({ name: 'Home' })
    }
    return
  }

  // Verificar permiso requerido por la ruta
  if (to.meta.permission) {
    const usuario = getUsuario()
    const permisos = new Set(PERMISOS_POR_ROL[usuario.rol] ?? [])
    if (!permisos.has(to.meta.permission)) {
      next({ name: 'Home' })
      return
    }
  }

  next()
})

export default router