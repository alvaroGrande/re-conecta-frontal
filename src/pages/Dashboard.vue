<template>
  <div class="min-h-screen bg-gray-50 dark:bg-slate-900 py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-slate-100">Panel de Administración</h1>
        <p class="mt-2 text-gray-600 dark:text-slate-400">Vista general del sistema reConecta</p>
      </div>

      <!-- Tarjetas de estadísticas principales -->
      <EstadisticasCards 
        :estadisticas="estadisticas"
        :cargando-usuarios="cargandoUsuarios"
        :cargando-talleres="cargandoTalleres"
        :cargando-encuestas="cargandoEncuestas"
        @ver-conectados="verUsuariosConectados"
        class="mb-8"
      />

      <!-- Gráficas -->
      <!-- <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <GraficaRoles :distribucion="distribucionRoles" />
        <GraficaActividad :datos-actividad="datosActividad" />
      </div> -->

      <!-- Usuarios Conectados -->
      <UsuariosConectadosTabla 
        :usuarios="usuariosConectados"
        :cargando="cargando"
        @actualizar="cargarEstadisticas"
        class="mb-8"
      />

      <!-- Actividad Reciente -->
      <ActividadReciente 
        :actividades="actividadReciente" 
        @ver-detalles="abrirModalActividades"
        @ver-perfil="irAPerfilUsuario"
        class="mb-8"
      />

      <!-- Tareas Programadas -->
      <TareasProgramadas class="mb-8" />

      <!-- Estadísticas de Queries -->
      <QueryStats class="mb-8" />
      
      <!-- Administración de Caché -->
      <CacheAdmin />
      
      <!-- Modal de Actividades -->
      <ModalActividadesUsuario
        :mostrar="modalActividadesVisible"
        :usuario="usuarioSeleccionado"
        :actividades="actividadesUsuarioSeleccionado"
        @cerrar="cerrarModalActividades"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { 
  UserPlusIcon,
  DocumentTextIcon,
  BellIcon,
  AcademicCapIcon
} from '@heroicons/vue/24/outline'
import EstadisticasCards from '@features/Dashboard/EstadisticasCards.vue'
import UsuariosConectadosTabla from '@features/Dashboard/UsuariosConectadosTabla.vue'
import ActividadReciente from '@features/Dashboard/ActividadReciente.vue'
import ModalActividadesUsuario from '@features/Dashboard/ModalActividadesUsuario.vue'
import TareasProgramadas from '@features/Dashboard/TareasProgramadas.vue'
import QueryStats from '@features/Dashboard/QueryStats.vue'
import CacheAdmin from '@/components/CacheAdmin.vue'
import dashboardService from '@services/dashboard'
import { showError } from '@services/toastService'

const estadisticas = ref({
  totalUsuarios: 0,
  usuariosActivos: 0,
  usuariosConectados: 0,
  talleresActivos: 0,
  talleresMes: 0,
  encuestasActivas: 0,
  respuestasEncuestas: 0
})

const usuariosConectados = ref([])
const distribucionRoles = ref([])
const datosActividad = ref([])
const actividadReciente = ref([])
const cargando = ref(false)
const cargandoUsuarios = ref(false)
const cargandoTalleres = ref(false)
const cargandoEncuestas = ref(false)
const modalActividadesVisible = ref(false)
const usuarioSeleccionado = ref({})
const actividadesUsuarioSeleccionado = ref([])
const router = useRouter()
let intervaloActualizacion = null
let cargaEnProgreso = false

// Mapeo de tipos de actividad a iconos y colores
const tiposActividad = {
  login: {
    icono: UserPlusIcon,
    colorBg: 'bg-blue-100',
    colorIcono: 'text-blue-600',
    titulo: 'Inicio de sesión'
  },
  logout: {
    icono: UserPlusIcon,
    colorBg: 'bg-gray-100',
    colorIcono: 'text-gray-600',
    titulo: 'Cierre de sesión'
  },
  registro: {
    icono: UserPlusIcon,
    colorBg: 'bg-green-100',
    colorIcono: 'text-green-600',
    titulo: 'Registro'
  },
  encuesta: {
    icono: DocumentTextIcon,
    colorBg: 'bg-yellow-100',
    colorIcono: 'text-yellow-600',
    titulo: 'Encuesta'
  },
  taller: {
    icono: AcademicCapIcon,
    colorBg: 'bg-purple-100',
    colorIcono: 'text-purple-600',
    titulo: 'Taller'
  },
  notificacion: {
    icono: BellIcon,
    colorBg: 'bg-orange-100',
    colorIcono: 'text-orange-600',
    titulo: 'Notificación'
  },
  default: {
    icono: DocumentTextIcon,
    colorBg: 'bg-gray-100',
    colorIcono: 'text-gray-600',
    titulo: 'Actividad'
  }
}

const formatearFecha = (fecha) => {
  if (!fecha) return 'Nunca'
  const date = new Date(fecha)
  const ahora = new Date()
  const diffMs = ahora - date
  const diffMins = Math.floor(diffMs / 60000)
  
  if (diffMins < 1) return 'Ahora mismo'
  if (diffMins < 60) return `Hace ${diffMins} minutos`
  
  const diffHoras = Math.floor(diffMins / 60)
  if (diffHoras < 24) return `Hace ${diffHoras} horas`
  
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

const cargarActividadReciente = async () => {
  try {
    const actividades = await dashboardService.obtenerActividadReciente(10)
    
    actividadReciente.value = actividades.map(act => {
      const tipo = tiposActividad[act.tipo] || tiposActividad.default
      const nombreCompleto = `${act.nombre || ''} ${act.apellidos || ''}`.trim() || 'Usuario desconocido'
      
      return {
        usuario_id: act.usuario_id,
        titulo: nombreCompleto,
        descripcion: `${tipo.titulo}: ${act.descripcion || 'Sin descripción'}`,
        tiempo: formatearFecha(act.fecha),
        correoUsuario: act.correoUsuario,
        icono: tipo.icono,
        colorBg: tipo.colorBg,
        colorIcono: tipo.colorIcono,
        totalActividades: act.total_actividades,
        actividades: act.actividades || [], // Todas las actividades del usuario
        nombre: act.nombre,
        apellidos: act.apellidos
      }
    })
  } catch (error) {
    console.error('Error al cargar actividad reciente:', error)
  }
}

const abrirModalActividades = (actividad) => {
  usuarioSeleccionado.value = {
    id: actividad.usuario_id,
    nombre: `${actividad.nombre || ''} ${actividad.apellidos || ''}`.trim()
  }
  actividadesUsuarioSeleccionado.value = actividad.actividades || []
  modalActividadesVisible.value = true
}

const cerrarModalActividades = () => {
  modalActividadesVisible.value = false
  usuarioSeleccionado.value = {}
  actividadesUsuarioSeleccionado.value = []
}

const irAPerfilUsuario = (usuarioId) => {
  router.push({ name: 'PerfilUsuario', params: { id: usuarioId } })
}

const cargarEstadisticas = async () => {
  // Evitar múltiples cargas simultáneas
  if (cargaEnProgreso) {
    console.log('Carga ya en progreso, ignorando petición duplicada')
    return
  }

  try {
    cargaEnProgreso = true
    
    // Lanzar queries en 3 grupos para evitar saturar el servidor
    // Grupo 1: Estadísticas de cards (prioritarias)
    cargandoUsuarios.value = true
    cargandoTalleres.value = true
    cargandoEncuestas.value = true
    
    await Promise.all([
      // Query 1: Estadísticas de usuarios
      dashboardService.obtenerEstadisticasUsuarios()
        .then(stats => {
          estadisticas.value.totalUsuarios = stats.totalUsuarios || 0
          estadisticas.value.usuariosActivos = stats.usuariosActivos || 0
          estadisticas.value.usuariosConectados = stats.usuariosConectados || 0
        })
        .catch(error => {
          console.error('Error al cargar estadísticas de usuarios:', error)
        })
        .finally(() => {
          cargandoUsuarios.value = false
        }),
      
      // Query 2: Estadísticas de talleres
      dashboardService.obtenerEstadisticasTalleres()
        .then(stats => {
          estadisticas.value.talleresActivos = stats.talleresActivos || 0
          estadisticas.value.talleresMes = stats.talleresMes || 0
        })
        .catch(error => {
          console.error('Error al cargar estadísticas de talleres:', error)
        })
        .finally(() => {
          cargandoTalleres.value = false
        }),
      
      // Query 3: Estadísticas de encuestas
      dashboardService.obtenerEstadisticasEncuestas()
        .then(stats => {
          estadisticas.value.encuestasActivas = stats.encuestasActivas || 0
          estadisticas.value.respuestasEncuestas = stats.respuestasEncuestas || 0
        })
        .catch(error => {
          console.error('Error al cargar estadísticas de encuestas:', error)
        })
        .finally(() => {
          cargandoEncuestas.value = false
        })
    ])
    
    // Grupo 2: Datos para gráficas (después de un pequeño delay)
    await new Promise(resolve => setTimeout(resolve, 100))
    
    await Promise.all([
      // Query 4: Distribución de roles
      dashboardService.obtenerDistribucionRoles()
        .then(distribucion => {
          distribucionRoles.value = distribucion
        })
        .catch(error => {
          console.error('Error al cargar distribución de roles:', error)
        }),
      
      // Query 5: Actividad por días
      dashboardService.obtenerActividadPorDias(7)
        .then(actividad => {
          datosActividad.value = actividad
        })
        .catch(error => {
          console.error('Error al cargar actividad por días:', error)
        })
    ])
    
    // Grupo 3: Datos de tablas (después de otro delay)
    await new Promise(resolve => setTimeout(resolve, 100))
    
    await Promise.all([
      // Query 6: Usuarios conectados
      dashboardService.obtenerUsuariosConectados()
        .then(usuarios => {
          usuariosConectados.value = usuarios
        })
        .catch(error => {
          console.error('Error al cargar usuarios conectados:', error)
        }),
      
      // Query 7: Actividad reciente
      cargarActividadReciente()
    ])
    
  } catch (error) {
    console.error('Error al cargar estadísticas:', error)
    showError('Error al cargar las estadísticas')
  } finally {
    cargando.value = false
    cargaEnProgreso = false
  }
}

const verUsuariosConectados = () => {
  const elemento = document.querySelector('.overflow-x-auto')
  if (elemento) {
    elemento.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

onMounted(() => {
  cargarEstadisticas()
  
  // Actualizar cada 60 segundos (reducido la frecuencia para evitar rate limiting)
  intervaloActualizacion = setInterval(() => {
    cargarEstadisticas()
  }, 60000)
})

onBeforeUnmount(() => {
  if (intervaloActualizacion) {
    clearInterval(intervaloActualizacion)
  }
})
</script>
