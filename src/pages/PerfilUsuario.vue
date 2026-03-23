<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
    <div class="max-w-6xl mx-auto px-4">
      <!-- Botón volver -->
      <button
        @click="$router.back()"
        class="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-700 transition"
      >
        <ChevronLeftIcon class="w-5 h-5" />
        <span>Volver</span>
      </button>

      <!-- Loading -->
      <div v-if="cargando" class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <!-- Contenido -->
      <div v-else-if="usuario" class="space-y-6">
        <!-- Transición suave al cambiar de usuario -->
        <Transition name="fade" mode="out-in">
          <div :key="userId" class="space-y-6">
            <!-- Cabecera del perfil -->
            <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-start gap-6">
            <!-- Avatar -->
            <div class="flex-shrink-0">
              <div v-if="usuario.foto_perfil" class="w-24 h-24 rounded-full overflow-hidden border-4 border-blue-100">
                <img :src="usuario.foto_perfil" alt="Foto de perfil" class="w-full h-full object-cover" />
              </div>
              <div v-else class="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center border-4 border-blue-100">
                <span class="text-3xl font-bold text-white">{{ iniciales }}</span>
              </div>
            </div>

            <!-- Información del usuario -->
            <div class="flex-1">
              <div class="flex items-start justify-between gap-4">
                <div class="flex-1 min-w-0">
                  <!-- Modo visualización -->
                  <div v-if="!modoEdicion">
                    <h1 class="text-3xl font-bold text-gray-900">{{ nombreCompleto }}</h1>
                    <p class="text-gray-600 mt-1">{{ usuario.email }}</p>
                    <p v-if="usuario.telefono" class="text-gray-500 text-sm mt-1">
                      📞 {{ usuario.telefono }}
                    </p>
                  </div>

                  <!-- Modo edición (solo admin) -->
                  <div v-else class="space-y-3">
                    <div class="flex gap-3">
                      <div class="flex-1">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                        <input
                          v-model="datosEdicion.nombre"
                          type="text"
                          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Nombre"
                        />
                      </div>
                      <div class="flex-1">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Apellidos</label>
                        <input
                          v-model="datosEdicion.Apellidos"
                          type="text"
                          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Apellidos"
                        />
                      </div>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        v-model="datosEdicion.email"
                        type="email"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Email"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                      <input
                        v-model="datosEdicion.telefono"
                        type="tel"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="+34 600 000 000"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                      <select
                        v-model.number="datosEdicion.rol"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option :value="1">Administrador</option>
                        <option :value="2">Profesional</option>
                        <option :value="3">Usuario</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <!-- Botones de acción -->
                <div class="flex flex-col gap-2 flex-shrink-0">
                  <!-- Modo visualización -->
                  <template v-if="!modoEdicion">
                    <button
                      v-if="esAdmin && currentUser.id !== usuario.id"
                      @click="activarModoEdicion"
                      class="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition whitespace-nowrap"
                    >
                      <PencilIcon class="w-5 h-5" />
                      <span>Editar</span>
                    </button>
                    <button
                      v-if="puedeEnviarNotificacion"
                      @click="abrirModalNotificacion"
                      class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition whitespace-nowrap"
                    >
                      <BellIcon class="w-5 h-5" />
                      <span>Notificación</span>
                    </button>
                  </template>

                  <!-- Modo edición -->
                  <template v-else>
                    <button
                      @click="guardarCambios"
                      :disabled="guardando"
                      class="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      <CheckIcon v-if="!guardando" class="w-5 h-5" />
                      <div v-else class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>{{ guardando ? 'Guardando...' : 'Guardar' }}</span>
                    </button>
                    <button
                      @click="cancelarEdicion"
                      :disabled="guardando"
                      class="flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      <XMarkIcon class="w-5 h-5" />
                      <span>Cancelar</span>
                    </button>
                  </template>
                </div>
              </div>
              
              <div class="flex items-center gap-4 mt-4">
                <span class="px-3 py-1 rounded-full text-sm font-medium" :class="rolClasses">
                  {{ rolNombre }}
                </span>
                <span class="text-sm text-gray-500">
                  Último acceso: {{ formatearFecha(usuario.ultimoInicio) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Estadísticas rápidas -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center gap-4">
              <div class="p-3 rounded-full bg-blue-100">
                <ClockIcon class="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p class="text-sm text-gray-600">Actividades (7 días)</p>
                <p class="text-2xl font-bold text-gray-900">{{ totalActividades }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center gap-4">
              <div class="p-3 rounded-full bg-green-100">
                <CalendarIcon class="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p class="text-sm text-gray-600">Miembro desde</p>
                <p class="text-lg font-semibold text-gray-900">{{ formatearFechaCorta(usuario.created_at) }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center gap-4">
              <div class="p-3 rounded-full bg-purple-100">
                <UserIcon class="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p class="text-sm text-gray-600">Estado</p>
                <p class="text-lg font-semibold" :class="estadoClasses">{{ estadoTexto }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Usuarios Coordinados (solo para coordinadores visto por admin) -->
        <UsuariosCoordinados 
          v-if="mostrarUsuariosCoordinados" 
          :coordinador-id="userId" 
        />

        <!-- Actividad reciente de los últimos 7 días -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-6">Actividad de los últimos 7 días</h2>
          
          <div v-if="actividades.length === 0" class="text-center py-12 text-gray-500">
            <ClockIcon class="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>No hay actividad registrada en los últimos 7 días</p>
          </div>

          <div v-else class="space-y-4">
            <div 
              v-for="(actividad, index) in actividades" 
              :key="index"
              class="flex items-start gap-4 pb-4 border-b border-gray-200 last:border-0"
            >
              <div class="flex-shrink-0">
                <div class="p-2 rounded-full" :class="actividad.colorBg">
                  <component :is="actividad.icono" class="w-5 h-5" :class="actividad.colorIcono" />
                </div>
              </div>
              <div class="flex-1">
                <div class="flex items-center justify-between">
                  <p class="text-sm font-medium text-gray-900">{{ actividad.titulo }}</p>
                  <p class="text-xs text-gray-400">{{ actividad.tiempo }}</p>
                </div>
                <p class="text-sm text-gray-600 mt-1">{{ actividad.descripcion }}</p>
              </div>
            </div>
          </div>
        </div>
          </div>
        </Transition>
      </div>

      <!-- Error -->
      <div v-else class="text-center py-12">
        <p class="text-gray-500 text-lg">No se pudo cargar la información del usuario</p>
      </div>
    </div>

    <!-- Modal para enviar notificación -->
    <EnviarNotificacionModal
      v-model:visible="mostrarModalNotificacion"
      :receptor-preseleccionado="usuario"
      @enviado="mostrarModalNotificacion = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  ChevronLeftIcon, 
  ClockIcon, 
  CalendarIcon, 
  UserIcon,
  ChatBubbleLeftIcon,
  UserPlusIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  BellIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'
import api from '@services/api'
import dashboardService from '@services/dashboard'
import { actualizarUsuario } from '@services/usuarios'
import { showError, showSuccess } from '@services/toastService'
import UsuariosCoordinados from '@/components/features/UsuariosCoordinados.vue'
import EnviarNotificacionModal from '@/components/features/Notificaciones/EnviarNotificacionModal.vue'

const route = useRoute()
const router = useRouter()
const modoEdicion = ref(false)
const guardando = ref(false)
const datosEdicion = ref({
  nombre: '',
  Apellidos: '',
  email: '',
  telefono: '',
  rol: 3
})
const cargando = ref(true)
const usuario = ref(null)
const actividades = ref([])
const mostrarModalNotificacion = ref(false)

const userId = computed(() => route.params.id)

// Obtener usuario actual
const currentUser = computed(() => {
  try {
    return JSON.parse(localStorage.getItem('usuario') || '{}')
  } catch {
    return {}
  }
})

const puedeVerPerfil = computed(() => {
  if (!userId.value) return false
  
  // Admin puede ver todos los perfiles
  if (currentUser.value.rol === 1) return true
  
  // Coordinador puede ver perfiles de sus usuarios coordinados (esto se verifica en el backend)
  if (currentUser.value.rol === 2) return true
  
  // Usuario puede ver su propio perfil
  if (currentUser.value.id === userId.value) return true
  
  return false
})

const iniciales = computed(() => {
  if (!usuario.value) return ''
  const nombre = usuario.value.nombre?.[0] || ''
  const apellido = usuario.value.Apellidos?.[0] || ''
  return `${nombre}${apellido}`.toUpperCase()
})

const nombreCompleto = computed(() => {
  if (!usuario.value) return ''
  return `${usuario.value.nombre || ''} ${usuario.value.Apellidos || ''}`.trim()
})

const rolNombre = computed(() => {
  if (!usuario.value) return ''
  const roles = { 1: 'Administrador', 2: 'Profesional', 3: 'Usuario' }
  return roles[usuario.value.rol] || 'Desconocido'
})

const rolClasses = computed(() => {
  if (!usuario.value) return ''
  const classes = {
    1: 'bg-red-100 text-red-700',
    2: 'bg-blue-100 text-blue-700',
    3: 'bg-green-100 text-green-700'
  }
  return classes[usuario.value.rol] || 'bg-gray-100 text-gray-700'
})

const estadoTexto = computed(() => {
  if (!usuario.value) return ''
  const ultimaActividad = new Date(usuario.value.ultima_actividad || usuario.value.ultimoInicio)
  const hace5min = new Date(Date.now() - 5 * 60 * 1000)
  return ultimaActividad > hace5min ? 'Conectado' : 'Desconectado'
})

const estadoClasses = computed(() => {
  return estadoTexto.value === 'Conectado' ? 'text-green-600' : 'text-gray-500'
})

const totalActividades = computed(() => actividades.value.length)

const mostrarUsuariosCoordinados = computed(() => 
  currentUser.value.rol === 1 && usuario.value?.rol === 2
)

const puedeEnviarNotificacion = computed(() => 
  usuario.value && 
  (currentUser.value.rol === 1 || currentUser.value.rol === 2) &&
  currentUser.value.id !== usuario.value.id
)

const esAdmin = computed(() => currentUser.value.rol === 1)

const tiposActividad = {
  'login': {
    titulo: 'Inicio de sesión',
    icono: UserIcon,
    colorBg: 'bg-blue-100',
    colorIcono: 'text-blue-600'
  },
  'registro': {
    titulo: 'Registro',
    icono: UserPlusIcon,
    colorBg: 'bg-green-100',
    colorIcono: 'text-green-600'
  },
  'taller': {
    titulo: 'Taller',
    icono: AcademicCapIcon,
    colorBg: 'bg-purple-100',
    colorIcono: 'text-purple-600'
  },
  'encuesta': {
    titulo: 'Encuesta',
    icono: DocumentTextIcon,
    colorBg: 'bg-yellow-100',
    colorIcono: 'text-yellow-600'
  },
  'mensaje': {
    titulo: 'Mensaje',
    icono: ChatBubbleLeftIcon,
    colorBg: 'bg-pink-100',
    colorIcono: 'text-pink-600'
  },
  'notificacion': {
    titulo: 'Notificación',
    icono: BellIcon,
    colorBg: 'bg-indigo-100',
    colorIcono: 'text-indigo-600'
  },
  'default': {
    titulo: 'Actividad',
    icono: ClockIcon,
    colorBg: 'bg-gray-100',
    colorIcono: 'text-gray-600'
  }
}

const formatearFecha = (fecha) => {
  if (!fecha) return 'Nunca'
  const date = new Date(fecha)
  const ahora = new Date()
  const diffMs = ahora - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHoras = Math.floor(diffMs / 3600000)
  const diffDias = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Justo ahora'
  if (diffMins < 60) return `Hace ${diffMins} min`
  if (diffHoras < 24) return `Hace ${diffHoras}h`
  if (diffDias < 7) return `Hace ${diffDias} días`
  
  return date.toLocaleDateString('es-ES', { 
    day: '2-digit', 
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatearFechaCorta = (fecha) => {
  if (!fecha) return '-'
  const date = new Date(fecha)
  return date.toLocaleDateString('es-ES', { 
    year: 'numeric', 
    month: 'long'
  })
}

const cargarUsuario = async () => {
  try {
    const { data } = await api.get(`/usuarios/${userId.value}`)
    usuario.value = data
  } catch (error) {
    console.error('Error al cargar usuario:', error)
    showError('No se pudo cargar la información del usuario')
    // Redirigir si no tiene permisos
    if (error.response?.status === 403 || error.response?.status === 404) {
      setTimeout(() => router.back(), 2000)
    }
  }
}

const cargarActividades = async () => {
  // Solo admins pueden ver actividades de otros usuarios
  if (currentUser.value.rol !== 1 && String(currentUser.value.id) !== String(userId.value)) {
    return
  }
  
  try {
    // Obtener actividades de los últimos 7 días del usuario específico
    const data = await dashboardService.obtenerActividadReciente(10, userId.value, 7)
    
    actividades.value = (data || []).map(act => {
      const tipo = tiposActividad[act.tipo] || tiposActividad.default
      
      return {
        titulo: act.titulo || tipo.titulo,
        descripcion: act.descripcion || 'Sin descripción',
        tiempo: formatearFecha(act.created_at),
        icono: tipo.icono,
        colorBg: tipo.colorBg,
        colorIcono: tipo.colorIcono
      }
    })
  } catch (error) {
    console.error('Error al cargar actividades:', error)
    actividades.value = []
  }
}

const abrirModalNotificacion = () => {
  mostrarModalNotificacion.value = true
}

const activarModoEdicion = () => {
  if (!usuario.value) return
  
  datosEdicion.value = {
    nombre: usuario.value.nombre || '',
    Apellidos: usuario.value.Apellidos || '',
    email: usuario.value.email || '',
    telefono: usuario.value.telefono || '',
    rol: usuario.value.rol || 3
  }
  
  modoEdicion.value = true
}

const cancelarEdicion = () => {
  modoEdicion.value = false
  datosEdicion.value = {
    nombre: '',
    Apellidos: '',
    email: '',
    telefono: '',
    rol: 3
  }
}

const guardarCambios = async () => {
  if (!usuario.value) return
  
  // Validaciones básicas
  if (!datosEdicion.value.nombre || !datosEdicion.value.email) {
    showError('El nombre y email son obligatorios')
    return
  }
  
  guardando.value = true
  try {
    const datosActualizar = {
      nombre: datosEdicion.value.nombre,
      Apellidos: datosEdicion.value.Apellidos,
      email: datosEdicion.value.email,
      telefono: datosEdicion.value.telefono,
      rol: datosEdicion.value.rol
    }
    
    await actualizarUsuario(userId.value, datosActualizar)
    
    // Actualizar usuario local
    usuario.value = {
      ...usuario.value,
      ...datosActualizar
    }
    
    modoEdicion.value = false
    showSuccess('Usuario actualizado correctamente')
  } catch (error) {
    console.error('Error al actualizar usuario:', error)
    showError(error.response?.data?.message || 'Error al actualizar el usuario')
  } finally {
    guardando.value = false
  }
}

const cargarDatos = async (mostrarCargando = true) => {
  if (!userId.value) {
    showError('ID de usuario inválido')
    router.push({ name: 'Home' })
    return
  }
  
  if (!puedeVerPerfil.value) {
    showError('No tienes permisos para ver este perfil')
    router.back()
    return
  }
  
  if (mostrarCargando) {
    cargando.value = true
  }
  
  await Promise.all([
    cargarUsuario(),
    cargarActividades()
  ])
  
  cargando.value = false
}

// Watch para detectar cambios en el ID del usuario
watch(() => route.params.id, (newId, oldId) => {
  if (newId && newId !== oldId) {
    // Resetear modo edición al cambiar de usuario
    modoEdicion.value = false
    // Cargar sin mostrar spinner para evitar saltos
    cargarDatos(false)
  }
})

onMounted(async () => {
  // Asegurar que empieza en modo visualización
  modoEdicion.value = false
  await cargarDatos()
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style> 