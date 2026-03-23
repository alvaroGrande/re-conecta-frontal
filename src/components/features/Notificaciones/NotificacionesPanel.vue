<template>
  <div class="notificaciones-panel">
    <!-- Badge de notificaciones en el header -->
    <div class="relative">
      <Button
        icon="pi pi-bell"
        severity="secondary"
        text
        rounded
        @click="togglePanel"
        :badge="noLeidas > 0 ? String(noLeidas) : undefined"
        badge-severity="danger"
        class="text-white hover:text-accent"
      />
    </div>

    <!-- Panel lateral de notificaciones -->
    <Drawer
      v-model:visible="panelVisible"
      position="right"
      :style="{ width: '450px' }"
      :show-close-icon="true"
    >
      <template #header>
        <div class="flex items-center justify-between w-full pr-4">
          <h2 class="text-xl font-bold">Notificaciones</h2>
          <div class="flex gap-2">
            <Button
              v-if="noLeidas > 0"
              label="Marcar todas"
              size="small"
              text
              @click="marcarTodasComoLeidas"
              :loading="marcandoTodas"
            />
            <Button
              icon="pi pi-filter"
              :severity="mostrarSoloNoLeidas ? 'primary' : 'secondary'"
              text
              rounded
              @click="toggleFiltro"
              v-tooltip.left="mostrarSoloNoLeidas ? 'Mostrar todas' : 'Solo no leídas'"
            />
          </div>
        </div>
      </template>

      <!-- Pestañas -->
      <div class="mb-4">
        <div class="flex border-b border-gray-200">
          <button
            :class="[
              'px-4 py-2 font-medium transition-colors',
              pestanaActiva === 'recibidas' 
                ? 'border-b-2 border-blue-500 text-blue-600' 
                : 'text-gray-600 hover:text-gray-900'
            ]"
            @click="pestanaActiva = 'recibidas'"
          >
            Recibidas
          </button>
          <button
            :class="[
              'px-4 py-2 font-medium transition-colors',
              pestanaActiva === 'enviadas' 
                ? 'border-b-2 border-blue-500 text-blue-600' 
                : 'text-gray-600 hover:text-gray-900'
            ]"
            @click="pestanaActiva = 'enviadas'"
          >
            Enviadas
          </button>
        </div>
      </div>

      <!-- Lista de notificaciones -->
      <div v-if="cargando" class="flex justify-center py-8">
        <ProgressSpinner style="width: 50px; height: 50px" />
      </div>

      <div v-else-if="notificacionesFiltradas.length === 0" class="text-center py-8">
        <i class="pi pi-bell-slash text-5xl text-gray-300 mb-4"></i>
        <p class="text-gray-600">
          {{ pestanaActiva === 'recibidas' 
            ? (mostrarSoloNoLeidas ? 'No tienes notificaciones sin leer' : 'No tienes notificaciones') 
            : 'No has enviado notificaciones' 
          }}
        </p>
      </div>

      <div v-else class="space-y-2">
        <div
          v-for="notif in notificacionesFiltradas"
          :key="notif.id"
          :class="[
            'p-3 rounded-lg border transition-all cursor-pointer',
            !notif.leida && pestanaActiva === 'recibidas' 
              ? 'bg-blue-50 border-blue-200 hover:bg-blue-100' 
              : 'bg-white border-gray-200 hover:bg-gray-50'
          ]"
          @click="handleClickNotificacion(notif)"
        >
          <div class="flex items-start gap-3">
            <!-- Icono según tipo -->
            <div
              :class="[
                'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
                getColorTipo(notif.tipo)
              ]"
            >
              <i :class="getIconoTipo(notif.tipo)"></i>
            </div>

            <!-- Contenido -->
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-2 mb-1">
                <h4 class="font-semibold text-sm text-gray-900 line-clamp-1">
                  {{ notif.titulo }}
                </h4>
                <span
                  v-if="!notif.leida && pestanaActiva === 'recibidas'"
                  class="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full"
                ></span>
              </div>
              
              <p class="text-sm text-gray-600 line-clamp-2 mb-2">
                {{ notif.contenido }}
              </p>

              <div class="flex items-center justify-between text-xs text-gray-500">
                <span>
                  <i class="pi pi-user text-xs mr-1"></i>
                  {{ getNombreUsuario(notif) }}
                </span>
                <span>{{ formatearFecha(notif.created_at) }}</span>
              </div>
            </div>

            <!-- Acciones -->
            <div class="flex-shrink-0 flex gap-1">
              <Button
                v-if="!notif.leida && pestanaActiva === 'recibidas'"
                icon="pi pi-check"
                size="small"
                text
                rounded
                severity="success"
                @click.stop="marcarLeida(notif.id)"
                v-tooltip.left="'Marcar como leída'"
              />
              <Button
                icon="pi pi-trash"
                size="small"
                text
                rounded
                severity="danger"
                @click.stop="confirmarEliminar(notif)"
                v-tooltip.left="'Eliminar'"
              />
            </div>
          </div>
        </div>
      </div>
    </Drawer>

    <!-- Dialog: Confirmar eliminación -->
    <Dialog
      v-model:visible="dialogEliminar"
      modal
      header="Eliminar notificación"
      :style="{ width: '400px' }"
    >
      <p class="mb-4">¿Estás seguro de que deseas eliminar esta notificación?</p>
      <template #footer>
        <Button label="Cancelar" severity="secondary" @click="dialogEliminar = false" />
        <Button label="Eliminar" severity="danger" @click="eliminar" :loading="eliminando" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import Button from 'primevue/button'
import Drawer from 'primevue/drawer'
import Dialog from 'primevue/dialog'
import ProgressSpinner from 'primevue/progressspinner'
import {
  obtenerNotificaciones,
  obtenerNotificacionesEnviadas,
  contarNoLeidas,
  marcarComoLeida,
  marcarTodasLeidas,
  eliminarNotificacion
} from '@services/notificaciones'
import { 
  onNuevaNotificacion, 
  offNuevaNotificacion, 
  emitirNotificacionLeida 
} from '@services/socketService'
import { showSuccess, showError } from '@services/toastService'
import { useRouter } from 'vue-router'

const router = useRouter()

const panelVisible = ref(false)
const notificacionesRecibidas = ref([])
const notificacionesEnviadas = ref([])
const noLeidas = ref(0)
const cargando = ref(false)
const mostrarSoloNoLeidas = ref(false)
const marcandoTodas = ref(false)
const dialogEliminar = ref(false)
const notificacionAEliminar = ref(null)
const eliminando = ref(false)
const pestanaActiva = ref('recibidas')

const notificacionesFiltradas = computed(() => {
  if (pestanaActiva.value === 'enviadas') {
    return notificacionesEnviadas.value
  }
  
  if (mostrarSoloNoLeidas.value) {
    return notificacionesRecibidas.value.filter(n => !n.leida)
  }
  
  return notificacionesRecibidas.value
})

const togglePanel = () => {
  panelVisible.value = !panelVisible.value
  if (panelVisible.value) {
    cargarNotificaciones()
  }
}

const toggleFiltro = () => {
  mostrarSoloNoLeidas.value = !mostrarSoloNoLeidas.value
}

const cargarNotificaciones = async () => {
  cargando.value = true
  try {
    if (pestanaActiva.value === 'recibidas') {
      notificacionesRecibidas.value = await obtenerNotificaciones(false, 50)
    } else {
      notificacionesEnviadas.value = await obtenerNotificacionesEnviadas(50)
    }
  } catch (error) {
    console.error('Error al cargar notificaciones:', error)
    showError('Error al cargar notificaciones')
  } finally {
    cargando.value = false
  }
}

const actualizarContador = async () => {
  try {
    noLeidas.value = await contarNoLeidas()
  } catch (error) {
    console.error('Error al actualizar contador:', error)
  }
}

const marcarLeida = async (notificacionId) => {
  try {
    await marcarComoLeida(notificacionId)
    
    // Actualizar localmente
    const notif = notificacionesRecibidas.value.find(n => n.id === notificacionId)
    if (notif) {
      notif.leida = true
      notif.fecha_lectura = new Date().toISOString()
    }
    
    // Emitir evento Socket.IO
    emitirNotificacionLeida(notificacionId)
    
    await actualizarContador()
  } catch (error) {
    showError('Error al marcar como leída')
  }
}

const marcarTodasComoLeidas = async () => {
  marcandoTodas.value = true
  try {
    const resultado = await marcarTodasLeidas()
    
    // Actualizar localmente
    notificacionesRecibidas.value.forEach(n => {
      n.leida = true
      n.fecha_lectura = new Date().toISOString()
    })
    
    await actualizarContador()
    showSuccess(resultado.message)
  } catch (error) {
    showError('Error al marcar todas como leídas')
  } finally {
    marcandoTodas.value = false
  }
}

const confirmarEliminar = (notif) => {
  notificacionAEliminar.value = notif
  dialogEliminar.value = true
}

const eliminar = async () => {
  eliminando.value = true
  try {
    await eliminarNotificacion(notificacionAEliminar.value.id)
    
    // Eliminar localmente
    if (pestanaActiva.value === 'recibidas') {
      notificacionesRecibidas.value = notificacionesRecibidas.value.filter(
        n => n.id !== notificacionAEliminar.value.id
      )
    } else {
      notificacionesEnviadas.value = notificacionesEnviadas.value.filter(
        n => n.id !== notificacionAEliminar.value.id
      )
    }
    
    await actualizarContador()
    showSuccess('Notificación eliminada')
    dialogEliminar.value = false
  } catch (error) {
    showError('Error al eliminar notificación')
  } finally {
    eliminando.value = false
  }
}

const handleClickNotificacion = async (notif) => {
  // Marcar como leída si no lo está
  if (!notif.leida && pestanaActiva.value === 'recibidas') {
    await marcarLeida(notif.id)
  }
  
  // Redirigir si tiene URL
  if (notif.url) {
    router.push(notif.url)
    panelVisible.value = false
  }
}

const getNombreUsuario = (notif) => {
  const usuario = pestanaActiva.value === 'recibidas' ? notif.emisor : notif.receptor
  return usuario ? `${usuario.nombre} ${usuario.Apellidos || ''}`.trim() : 'Usuario'
}

const formatearFecha = (fecha) => {
  const date = new Date(fecha)
  const ahora = new Date()
  const diffMs = ahora - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHoras = Math.floor(diffMs / 3600000)
  const diffDias = Math.floor(diffMs / 86400000)
  
  if (diffMins < 1) return 'Ahora'
  if (diffMins < 60) return `Hace ${diffMins}m`
  if (diffHoras < 24) return `Hace ${diffHoras}h`
  if (diffDias < 7) return `Hace ${diffDias}d`
  
  return date.toLocaleDateString('es-ES', { 
    day: 'numeric', 
    month: 'short' 
  })
}

const getIconoTipo = (tipo) => {
  const iconos = {
    mensaje: 'pi pi-envelope',
    anuncio: 'pi pi-megaphone',
    recordatorio: 'pi pi-clock',
    alerta: 'pi pi-exclamation-triangle'
  }
  return iconos[tipo] || 'pi pi-info-circle'
}

const getColorTipo = (tipo) => {
  const colores = {
    mensaje: 'bg-blue-100 text-blue-600',
    anuncio: 'bg-purple-100 text-purple-600',
    recordatorio: 'bg-orange-100 text-orange-600',
    alerta: 'bg-red-100 text-red-600'
  }
  return colores[tipo] || 'bg-gray-100 text-gray-600'
}

// Manejar nuevas notificaciones desde Socket.IO
const handleNuevaNotificacion = (notificacion) => {
  // Agregar al principio de la lista
  notificacionesRecibidas.value.unshift(notificacion)
  
  // Actualizar contador
  actualizarContador()
  
  // Mostrar toast si el panel no está visible
  if (!panelVisible.value) {
    showSuccess(`Nueva notificación: ${notificacion.titulo}`)
  }
}

// Watch para recargar cuando cambie de pestaña
watch(pestanaActiva, () => {
  cargarNotificaciones()
})

onMounted(() => {
  actualizarContador()
  onNuevaNotificacion(handleNuevaNotificacion)
  
  // Actualizar contador periódicamente
  const interval = setInterval(actualizarContador, 30000) // Cada 30 segundos
  
  onUnmounted(() => {
    clearInterval(interval)
    offNuevaNotificacion()
  })
})

// Exponer función para uso externo
defineExpose({
  actualizarContador
})
</script>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
