import { createRouter, createWebHistory } from 'vue-router'

// Lazy loading para mejor performance
const Home = () => import('@pages/Home.vue')
const About = () => import('@pages/About.vue')
const Services = () => import('@pages/Services.vue')
const Contact = () => import('@pages/Contact.vue')
const Perfil = () => import('@pages/Perfil.vue')
const Login = () => import('@pages/Login.vue')
const videoCall = () => import('@pages/VideoCall.vue')
const usuarios = () => import('@pages/Usuarios.vue')
const Dashboard = () => import('@pages/Dashboard.vue')
const PerfilUsuario = () => import('@pages/PerfilUsuario.vue')

const Talleres = () => import('@pages/Talleres.vue')
const TalleresArchivados = () => import('@pages/TalleresArchivados.vue')
const Encuestas = () => import('@pages/Encuestas.vue')
const Calendario = () => import('@pages/Calendario.vue')
const NotFound = () => import('@pages/NotFound.vue')

const routes = [
  { path: '/', component: Home, name: 'Home' },
  { path: '/Login', component: Login, name: 'Login' },
  { path: '/dashboard', component: Dashboard, name: 'Dashboard', meta: { requiresAdmin: true } },
  { path: '/usuario/:id', component: PerfilUsuario, name: 'PerfilUsuario' },
  { path: '/about', component: About, name: 'About' },
  { path: '/services', component: Services, name: 'Services' },
  { path: '/contact', component: Contact, name: 'Contact' },
  { path: '/perfil', component: Perfil, name: 'Perfil' },
  { path: '/talleres', component: Talleres, name: 'Talleres' },
  { path: '/talleres/archivados', component: TalleresArchivados, name: 'TalleresArchivados', meta: { requiresAdmin: true } },
  { path: '/encuestas/:id?', component: Encuestas, name: 'Encuestas' },
  { path: '/calendario', component: Calendario, name: 'Calendario' },
  { path: '/videollamada', component: videoCall, name: 'Videollamadas' },
  { path: '/usuarios', component: usuarios, name: 'Usuarios' },
  // Ruta catch-all para 404 - debe estar al final
  { path: '/:pathMatch(.*)*', component: NotFound, name: 'NotFound' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Rutas públicas que no requieren autenticación
const publicRoutes = ['Login']

// Guard de autenticación
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')
  console.log('Navegando a:', to.name, 'Usuario:', usuario)
  const isPublicRoute = publicRoutes.includes(to.name)

  // Si no hay token y la ruta no es pública, redirigir al login
  if (!token && !isPublicRoute) {
    // Guardar la ruta solicitada para redirigir después del login
    next({ 
      name: 'Login', 
      query: { redirect: to.fullPath } 
    })
  } 
  // Si hay token y va al login, redirigir al home o a la ruta guardada
  else if (token && to.name === 'Login') {
    // Si hay un parámetro redirect, ir allí, si no, al home
    const redirect = to.query.redirect
    if (redirect && redirect !== '/Login') {
      next(redirect)
    } else {
      next({ name: 'Home' })
    }
  }
  // Verificar si la ruta requiere permisos de admin
  else if (to.meta.requiresAdmin && usuario.rol !== 1) {
    next({ name: 'Home' })
  }
  // En cualquier otro caso, permitir navegación
  else {
    next()
  }
})

export default router