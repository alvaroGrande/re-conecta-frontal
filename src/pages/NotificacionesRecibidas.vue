<template>
  <div>
    <!-- Barra de filtros -->
    <div class="flex flex-wrap items-center gap-3 mb-5 p-3 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
      <!-- Estado -->
      <div class="flex items-center gap-1 bg-white dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-600 p-1">
        <button
          v-for="f in filtrosEstado"
          :key="f.value"
          :class="[
            'px-3 py-1 text-xs font-medium rounded-md transition-colors',
            filtroEstado === f.value
              ? 'bg-blue-500 text-white'
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-600'
          ]"
          @click="filtroEstado = f.value"
        >
          {{ f.label }}
        </button>
      </div>

      <!-- Tipo -->
      <Dropdown
        v-model="filtroTipo"
        :options="opcionesTipo"
        option-label="label"
        option-value="value"
        placeholder="Tipo"
        show-clear
        class="text-sm"
      />

      <!-- Canal -->
      <Dropdown
        v-model="filtroCanal"
        :options="opcionesCanal"
        option-label="label"
        option-value="value"
        placeholder="Canal"
        show-clear
        class="text-sm"
      />

      <!-- Marcar todas -->
      <Button
        v-if="noLeidas > 0"
        label="Marcar todas como leídas"
        icon="pi pi-check-circle"
        severity="secondary"
        size="small"
        :loading="marcandoTodas"
        class="ml-auto"
        @click="marcarTodasComoLeidas"
      />

      <!-- Contador -->
      <span v-else class="ml-auto text-xs text-gray-400">
        {{ notificacionesFiltradas.length }} resultado{{ notificacionesFiltradas.length !== 1 ? 's' : '' }}
      </span>
    </div>

    <!-- Cargando inicial -->
    <div v-if="cargando && notificaciones.length === 0" class="flex justify-center py-16">
      <ProgressSpinner style="width: 48px; height: 48px" />
    </div>

    <!-- Vacío -->
    <div
      v-else-if="notificacionesFiltradas.length === 0"
      class="flex flex-col items-center justify-center py-20 text-gray-400"
    >
      <i class="pi pi-inbox text-6xl mb-4 text-gray-200 dark:text-slate-600"></i>
      <p class="text-lg font-medium text-gray-500 dark:text-gray-400">
        {{ filtroTipo || filtroCanal || filtroEstado === 'no_leidas' ? 'No hay notificaciones con estos filtros' : 'No tienes notificaciones' }}
      </p>
    </div>

    <!-- Lista agrupada por día -->
    <div v-else class="space-y-6">
      <div v-for="[dia, items] in notificacionesPorDia" :key="dia">
        <div class="flex items-center gap-3 mb-3">
          <div class="h-px flex-1 bg-gray-200 dark:bg-slate-700"></div>
          <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2">
            {{ dia }}
          </span>
          <div class="h-px flex-1 bg-gray-200 dark:bg-slate-700"></div>
        </div>

        <div class="space-y-2">
          <div
            v-for="notif in items"
            :key="notif.id"
            :class="[
              'group flex items-start gap-4 p-4 rounded-xl border transition-all',
              !notif.leida
                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
            ]"
          >
            <div class="shrink-0 mt-1 flex flex-col items-center gap-1">
              <div :class="['w-10 h-10 rounded-full flex items-center justify-center', getColorTipo(notif.tipo)]">
                <i :class="getIconoTipo(notif.tipo)" class="text-sm"></i>
              </div>
              <div v-if="!notif.leida" class="w-2 h-2 bg-blue-500 rounded-full"></div>
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-2 mb-1">
                <h4 class="font-semibold text-sm text-gray-900 dark:text-white leading-tight">{{ notif.titulo }}</h4>
                <div class="flex items-center gap-2 shrink-0 text-xs text-gray-400">
                  <span class="flex items-center gap-1">
                    <i :class="getIconoCanal(notif.canal)" class="text-xs"></i>
                    {{ getNombreCanal(notif.canal) }}
                  </span>
                  <span>{{ formatearHora(notif.created_at) }}</span>
                </div>
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">{{ notif.contenido }}</p>
              <div class="flex items-center gap-3 text-xs text-gray-400">
                <span class="flex items-center gap-1">
                  <i class="pi pi-user text-xs"></i>
                  {{ notif.emisor?.nombre ? `${notif.emisor.nombre} ${notif.emisor.Apellidos || ''}`.trim() : 'Sistema' }}
                </span>
                <span :class="['px-2 py-0.5 rounded-full font-medium', getBadgeTipo(notif.tipo)]">
                  {{ getLabelTipo(notif.tipo) }}
                </span>
                <span v-if="notif.leida && notif.fecha_lectura" class="flex items-center gap-1 text-green-500">
                  <i class="pi pi-check text-xs"></i>
                  Leída {{ formatearHora(notif.fecha_lectura) }}
                </span>
              </div>
            </div>

            <div class="shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                v-if="notif.url"
                icon="pi pi-external-link" size="small" text rounded severity="info"
                v-tooltip.top="'Ir a la entidad relacionada'"
                @click="navegarAEntidad(notif)"
              />
              <Button
                v-if="!notif.leida"
                icon="pi pi-check" size="small" text rounded severity="success"
                v-tooltip.top="'Marcar como leída'"
                @click="marcarLeida(notif)"
              />
              <Button
                icon="pi pi-trash" size="small" text rounded severity="danger"
                v-tooltip.top="'Eliminar'"
                @click="confirmarEliminar(notif)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Dialog confirmar eliminación -->
    <Dialog v-model:visible="dialogEliminar" modal header="Eliminar notificación" :style="{ width: '380px' }">
      <p class="text-gray-600 dark:text-gray-300 mb-4">
        ¿Estás seguro de que deseas eliminar esta notificación? Esta acción no se puede deshacer.
      </p>
      <template #footer>
        <Button label="Cancelar" severity="secondary" @click="dialogEliminar = false" />
        <Button label="Eliminar" severity="danger" :loading="eliminando" @click="ejecutarEliminar" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Dropdown from 'primevue/dropdown'
import Dialog from 'primevue/dialog'
import ProgressSpinner from 'primevue/progressspinner'
import { obtenerNotificaciones, marcarComoLeida, marcarTodasLeidas, eliminarNotificacion } from '@services/notificaciones'
import { emitirNotificacionLeida } from '@services/socketService'
import { showSuccess, showError } from '@services/toastService'

const emit = defineEmits(['actualizar-contador'])
const router = useRouter()

// ── Estado ────────────────────────────────────────────────────────────────────
const cargando = ref(false)
const notificaciones = ref([])
const noLeidas = computed(() => notificaciones.value.filter(n => !n.leida).length)
const filtroEstado = ref('todas')
const filtroTipo = ref(null)
const filtroCanal = ref(null)
const marcandoTodas = ref(false)
const dialogEliminar = ref(false)
const notificacionAEliminar = ref(null)
const eliminando = ref(false)

// ── Config ────────────────────────────────────────────────────────────────────
const filtrosEstado = [
  { label: 'Todas', value: 'todas' },
  { label: 'No leídas', value: 'no_leidas' }
]
const opcionesTipo = [
  { label: '💬 Mensaje', value: 'mensaje' },
  { label: '📢 Anuncio', value: 'anuncio' },
  { label: '⏰ Recordatorio', value: 'recordatorio' },
  { label: '⚠️ Alerta', value: 'alerta' }
]
const opcionesCanal = [
  { label: '📱 Push', value: 'push' },
  { label: '📧 Email', value: 'email' },
  { label: '💬 WhatsApp', value: 'whatsapp' }
]

// ── Computed ──────────────────────────────────────────────────────────────────
const notificacionesFiltradas = computed(() => {
  let lista = notificaciones.value
  if (filtroEstado.value === 'no_leidas') lista = lista.filter(n => !n.leida)
  if (filtroTipo.value) lista = lista.filter(n => n.tipo === filtroTipo.value)
  if (filtroCanal.value) lista = lista.filter(n => n.canal === filtroCanal.value)
  return lista
})

const notificacionesPorDia = computed(() => {
  const grupos = new Map()
  for (const notif of notificacionesFiltradas.value) {
    const dia = formatearDia(notif.created_at)
    if (!grupos.has(dia)) grupos.set(dia, [])
    grupos.get(dia).push(notif)
  }
  return grupos
})

// ── Métodos ───────────────────────────────────────────────────────────────────
const cargar = async () => {
  cargando.value = true
  try {
    notificaciones.value = await obtenerNotificaciones(false, 100)
  } catch {
    showError('Error al cargar notificaciones')
  } finally {
    cargando.value = false
  }
}

const marcarLeida = async (notif) => {
  try {
    await marcarComoLeida(notif.id)
    notif.leida = true
    notif.fecha_lectura = new Date().toISOString()
    emitirNotificacionLeida(notif.id)
    emit('actualizar-contador')
  } catch {
    showError('Error al marcar como leída')
  }
}

const marcarTodasComoLeidas = async () => {
  marcandoTodas.value = true
  try {
    await marcarTodasLeidas()
    notificaciones.value.forEach(n => {
      n.leida = true
      n.fecha_lectura = new Date().toISOString()
    })
    emit('actualizar-contador')
    showSuccess('Todas las notificaciones marcadas como leídas')
  } catch {
    showError('Error al marcar todas como leídas')
  } finally {
    marcandoTodas.value = false
  }
}

const confirmarEliminar = (notif) => {
  notificacionAEliminar.value = notif
  dialogEliminar.value = true
}

const ejecutarEliminar = async () => {
  eliminando.value = true
  try {
    await eliminarNotificacion(notificacionAEliminar.value.id)
    const idx = notificaciones.value.findIndex(n => n.id === notificacionAEliminar.value.id)
    if (idx !== -1) notificaciones.value.splice(idx, 1)
    emit('actualizar-contador')
    showSuccess('Notificación eliminada')
    dialogEliminar.value = false
    notificacionAEliminar.value = null
  } catch {
    showError('Error al eliminar la notificación')
  } finally {
    eliminando.value = false
  }
}

const navegarAEntidad = (notif) => {
  if (!notif.url) return
  if (notif.url.startsWith('/') && !notif.url.startsWith('//')) {
    router.push(notif.url)
  } else {
    window.open(notif.url, '_blank', 'noopener,noreferrer')
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatearDia = (fecha) => {
  const d = new Date(fecha)
  const hoy = new Date()
  const ayer = new Date(hoy)
  ayer.setDate(hoy.getDate() - 1)
  if (d.toDateString() === hoy.toDateString()) return 'Hoy'
  if (d.toDateString() === ayer.toDateString()) return 'Ayer'
  return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: d.getFullYear() !== hoy.getFullYear() ? 'numeric' : undefined })
}
const formatearHora = (f) => f ? new Date(f).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : ''
const getIconoTipo = (t) => ({ mensaje: 'pi pi-comment text-blue-600', anuncio: 'pi pi-megaphone text-orange-600', recordatorio: 'pi pi-clock text-yellow-600', alerta: 'pi pi-exclamation-triangle text-red-600' }[t] || 'pi pi-bell text-gray-600')
const getColorTipo = (t) => ({ mensaje: 'bg-blue-100 dark:bg-blue-900', anuncio: 'bg-orange-100 dark:bg-orange-900', recordatorio: 'bg-yellow-100 dark:bg-yellow-900', alerta: 'bg-red-100 dark:bg-red-900' }[t] || 'bg-gray-100 dark:bg-gray-700')
const getBadgeTipo = (t) => ({ mensaje: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300', anuncio: 'bg-orange-100 text-orange-700', recordatorio: 'bg-yellow-100 text-yellow-700', alerta: 'bg-red-100 text-red-700' }[t] || 'bg-gray-100 text-gray-600')
const getLabelTipo = (t) => ({ mensaje: 'Mensaje', anuncio: 'Anuncio', recordatorio: 'Recordatorio', alerta: 'Alerta' }[t] || t)
const getIconoCanal = (c) => ({ push: 'pi pi-mobile', email: 'pi pi-envelope', whatsapp: 'pi pi-whatsapp' }[c] || 'pi pi-bell')
const getNombreCanal = (c) => ({ push: 'Push', email: 'Email', whatsapp: 'WhatsApp' }[c] || c)

onMounted(cargar)
</script>
