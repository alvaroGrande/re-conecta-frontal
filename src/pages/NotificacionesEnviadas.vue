<template>
  <div>
    <!-- Ancla al inicio -->
    <div ref="topAnchor"></div>
    <!-- Filtro por tipo -->
    <div class="flex flex-wrap items-center gap-3 mb-5 p-3 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
      <Dropdown
        v-model="filtroTipo"
        :options="opcionesTipo"
        option-label="label"
        option-value="value"
        placeholder="Tipo"
        show-clear
        class="text-sm"
      />
      <span class="ml-auto text-xs text-gray-400">
        {{ enviadas.length }} enviada{{ enviadas.length !== 1 ? 's' : '' }}
      </span>
    </div>

    <!-- Carga inicial -->
    <div v-if="cargando && enviadas.length === 0" class="flex justify-center py-16">
      <ProgressSpinner style="width: 48px; height: 48px" />
    </div>

    <!-- Vacío -->
    <div
      v-else-if="enviadasFiltradas.length === 0"
      class="flex flex-col items-center justify-center py-20 text-gray-400"
    >
      <i class="pi pi-send text-6xl mb-4 text-gray-200 dark:text-slate-600"></i>
      <p class="text-lg font-medium text-gray-500 dark:text-gray-400">
        {{ filtroTipo ? 'No hay notificaciones con este filtro' : 'No has enviado notificaciones' }}
      </p>
    </div>

    <!-- Lista agrupada por día -->
    <div v-else class="space-y-6">
      <div v-for="[dia, items] in enviadasPorDia" :key="dia">
        <div class="flex items-center gap-3 mb-3">
          <div class="h-px flex-1 bg-gray-200 dark:bg-slate-700"></div>
          <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2">{{ dia }}</span>
          <div class="h-px flex-1 bg-gray-200 dark:bg-slate-700"></div>
        </div>

        <div class="space-y-2">
          <div
            v-for="notif in items"
            :key="notif.id"
            class="group flex items-start gap-4 p-4 rounded-xl border bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 transition-all"
          >
            <div class="shrink-0 w-10 h-10 rounded-full flex items-center justify-center mt-1" :class="getColorTipo(notif.tipo)">
              <i :class="getIconoTipo(notif.tipo)" class="text-sm"></i>
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
                  Para: {{ notif.receptor?.nombre ? `${notif.receptor.nombre} ${notif.receptor.Apellidos || ''}`.trim() : 'Desconocido' }}
                </span>
                <span :class="['px-2 py-0.5 rounded-full font-medium', getBadgeTipo(notif.tipo)]">
                  {{ getLabelTipo(notif.tipo) }}
                </span>
                <span v-if="notif.leida" class="flex items-center gap-1 text-green-500">
                  <i class="pi pi-eye text-xs"></i>
                  Vista
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Trigger para scroll infinito -->
    <div ref="scrollAnchor" class="h-4 mt-2"></div>

    <!-- Cargando más -->
    <div v-if="cargandoMas" class="flex justify-center py-6">
      <ProgressSpinner style="width: 32px; height: 32px" />
    </div>

    <!-- Fin de resultados -->
    <div v-if="!hayMas && enviadas.length > 0" class="text-center py-6 text-xs text-gray-400">
      Has llegado al final
    </div>

    <!-- Botón volver arriba -->
    <Transition name="fade-up">
      <button
        v-if="mostrarVolverArriba"
        class="fixed bottom-8 right-8 z-40 flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-full shadow-lg transition-colors"
        @click="volverArriba"
      >
        <i class="pi pi-arrow-up text-xs"></i>
        Volver arriba
      </button>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import Dropdown from 'primevue/dropdown'
import ProgressSpinner from 'primevue/progressspinner'
import { obtenerNotificacionesEnviadas } from '@services/notificaciones'
import { showError } from '@services/toastService'

const LIMITE = 20

// ── Estado ────────────────────────────────────────────────────────────────────
const cargando = ref(false)
const cargandoMas = ref(false)
const enviadas = ref([])
const hayMas = ref(true)
const offset = ref(0)
const filtroTipo = ref(null)
const scrollAnchor = ref(null)
const topAnchor = ref(null)
const mostrarVolverArriba = ref(false)
let observer = null
let scrollListener = null

// ── Config ────────────────────────────────────────────────────────────────────
const opcionesTipo = [
  { label: '💬 Mensaje', value: 'mensaje' },
  { label: '📢 Anuncio', value: 'anuncio' },
  { label: '⏰ Recordatorio', value: 'recordatorio' },
  { label: '⚠️ Alerta', value: 'alerta' }
]

// ── Computed ──────────────────────────────────────────────────────────────────
const enviadasFiltradas = computed(() => {
  if (!filtroTipo.value) return enviadas.value
  return enviadas.value.filter(n => n.tipo === filtroTipo.value)
})

const enviadasPorDia = computed(() => {
  const grupos = new Map()
  for (const notif of enviadasFiltradas.value) {
    const dia = formatearDia(notif.created_at)
    if (!grupos.has(dia)) grupos.set(dia, [])
    grupos.get(dia).push(notif)
  }
  return grupos
})

// ── Carga y scroll infinito ───────────────────────────────────────────────────
const cargarPagina = async (reset = false) => {
  if (reset) {
    enviadas.value = []
    offset.value = 0
    hayMas.value = true
  }

  if (!hayMas.value) return

  if (reset) cargando.value = true
  else cargandoMas.value = true

  try {
    const res = await obtenerNotificacionesEnviadas(LIMITE, offset.value)
    const items = res.items ?? res  // compatibilidad por si el backend devuelve array directo
    enviadas.value.push(...items)
    hayMas.value = res.hasMore ?? (items.length === LIMITE)
    offset.value = res.offset ?? (offset.value + items.length)
  } catch {
    showError('Error al cargar notificaciones enviadas')
  } finally {
    cargando.value = false
    cargandoMas.value = false
  }
}

const volverArriba = () => {
  topAnchor.value?.scrollIntoView({ behavior: 'smooth' })
}

const iniciarObserver = () => {
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && !cargandoMas.value && hayMas.value) {
        cargarPagina()
      }
    },
    { threshold: 0.1 }
  )
  if (scrollAnchor.value) observer.observe(scrollAnchor.value)
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
const getBadgeTipo = (t) => ({ mensaje: 'bg-blue-100 text-blue-700', anuncio: 'bg-orange-100 text-orange-700', recordatorio: 'bg-yellow-100 text-yellow-700', alerta: 'bg-red-100 text-red-700' }[t] || 'bg-gray-100 text-gray-600')
const getLabelTipo = (t) => ({ mensaje: 'Mensaje', anuncio: 'Anuncio', recordatorio: 'Recordatorio', alerta: 'Alerta' }[t] || t)
const getIconoCanal = (c) => ({ push: 'pi pi-mobile', email: 'pi pi-envelope', whatsapp: 'pi pi-whatsapp' }[c] || 'pi pi-bell')
const getNombreCanal = (c) => ({ push: 'Push', email: 'Email', whatsapp: 'WhatsApp' }[c] || c)

onMounted(async () => {
  await cargarPagina(true)
  iniciarObserver()
  scrollListener = () => { mostrarVolverArriba.value = window.scrollY > 400 }
  window.addEventListener('scroll', scrollListener, { passive: true })
})

onUnmounted(() => {
  if (observer) observer.disconnect()
  if (scrollListener) window.removeEventListener('scroll', scrollListener)
})
</script>

<style scoped>
.fade-up-enter-active,
.fade-up-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-up-enter-from,
.fade-up-leave-to {
  opacity: 0;
  transform: translateY(12px);
}
</style>
