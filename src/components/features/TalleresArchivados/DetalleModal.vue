<script setup>
import { ref, computed, watch } from 'vue'
import { patchAsistencia } from '@services/talleres.js'
import { showError } from '@services/toastService'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import Paginator from 'primevue/paginator'

const props = defineProps({
  visible:        { type: Boolean, default: false },
  detalle:        { type: Object,  default: null },
  loadingDetalle: { type: Boolean, default: false },
})

const emit = defineEmits(['update:visible', 'abrir-copiar'])

const POR_PAGINA       = 10
const busqueda         = ref('')
const filtroAsistencia = ref('todos')
const paginaOffset     = ref(0)
const procesando       = ref(new Set())

const inscripcionesFiltradas = computed(() => {
  const q = busqueda.value.trim().toLowerCase()
  return (props.detalle?.inscripciones ?? []).filter(i => {
    const coincideBusqueda =
      !q ||
      (i.nombre_usuario ?? '').toLowerCase().includes(q) ||
      (i.email_usuario  ?? '').toLowerCase().includes(q)
    const coincideAsistencia =
      filtroAsistencia.value === 'todos' ||
      (filtroAsistencia.value === 'si' &&  i.asistio) ||
      (filtroAsistencia.value === 'no' && !i.asistio)
    return coincideBusqueda && coincideAsistencia
  })
})

const inscripcionesPagina = computed(() =>
  inscripcionesFiltradas.value.slice(paginaOffset.value, paginaOffset.value + POR_PAGINA)
)

function resetFiltros() {
  busqueda.value         = ''
  filtroAsistencia.value = 'todos'
  paginaOffset.value     = 0
}

watch(() => props.visible, val => {
  if (val) resetFiltros()
})

async function toggleAsistencia(inscripcion) {
  if (procesando.value.has(inscripcion.usuario_id)) return
  procesando.value = new Set([...procesando.value, inscripcion.usuario_id])
  try {
    const nuevoValor      = !inscripcion.asistio
    await patchAsistencia(props.detalle.id, inscripcion.usuario_id, nuevoValor)
    inscripcion.asistio   = nuevoValor
    // recalcular total_asistentes sobre el array mutable
    props.detalle.total_asistentes = props.detalle.inscripciones.filter(i => i.asistio).length
  } catch (e) {
    showError('Error', e?.response?.data?.message ?? e.message)
  } finally {
    const s = new Set(procesando.value)
    s.delete(inscripcion.usuario_id)
    procesando.value = s
  }
}

function formatFecha(f) {
  return f
    ? new Date(f).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—'
}
</script>

<template>
  <Dialog
    :visible="visible"
    :header="detalle?.titulo ?? 'Detalle del taller'"
    :modal="true"
    :draggable="false"
    class="w-full max-w-4xl"
    @update:visible="emit('update:visible', $event)"
  >
    <div v-if="loadingDetalle" class="py-10 text-center text-gray-400">Cargando...</div>
    <div v-else-if="detalle">
      <!-- Badge cancelado -->
      <div v-if="detalle.cancelado" class="mb-4 flex flex-col gap-1 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50">
        <div class="flex items-center gap-2">
          <span class="px-2 py-0.5 rounded text-xs font-semibold bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 shrink-0">Cancelado</span>
          <span v-if="detalle.motivo?.nombre" class="text-red-700 dark:text-red-300 text-sm font-medium">{{ detalle.motivo.nombre }}</span>
        </div>
        <p v-if="detalle.motivo_cancelacion" class="text-red-600 dark:text-red-400 text-sm italic pl-1">{{ detalle.motivo_cancelacion }}</p>
      </div>

      <!-- Info grid -->
      <div class="grid grid-cols-3 gap-4 mb-6 text-sm">
        <div class="p-3 bg-gray-50 rounded-lg">
          <p class="text-gray-400 text-xs">Fecha</p>
          <p class="font-semibold">{{ formatFecha(detalle.fecha) }}</p>
        </div>
        <div class="p-3 bg-gray-50 rounded-lg">
          <p class="text-gray-400 text-xs">Modalidad</p>
          <p class="font-semibold">{{ detalle.modalidad }} · {{ detalle.tipo_pago }}</p>
        </div>
        <div class="p-3 bg-gray-50 rounded-lg">
          <p class="text-gray-400 text-xs">Asistencia</p>
          <p class="font-semibold">{{ detalle.total_asistentes }} / {{ detalle.total_inscritos }}</p>
        </div>
      </div>

      <!-- Lista de inscritos -->
      <h3 class="font-semibold mb-3">Inscritos ({{ detalle.total_inscritos }})</h3>

      <!-- Buscador y filtros de asistencia -->
      <div class="flex flex-wrap items-center gap-2 mb-3">
        <input
          v-model="busqueda"
          autocomplete="off"
          type="text"
          placeholder="Buscar por nombre o email…"
          class="border border-gray-200 rounded-lg px-3 py-1.5 text-sm flex-1 min-w-48 focus:outline-none focus:ring-2 focus:ring-blue-300"
          @input="paginaOffset = 0"
        />
        <div class="flex gap-1">
          <button
            v-for="opt in [{ v: 'todos', label: 'Todos' }, { v: 'si', label: 'Asistió' }, { v: 'no', label: 'No asistió' }]"
            :key="opt.v"
            class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            :class="filtroAsistencia === opt.v
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
            @click="filtroAsistencia = opt.v; paginaOffset = 0"
          >{{ opt.label }}</button>
        </div>
      </div>

      <div v-if="inscripcionesFiltradas.length === 0" class="py-6 text-center text-gray-400 text-sm">
        No hay inscritos que coincidan con el filtro.
      </div>
      <div v-else>
        <table class="w-full text-sm border border-gray-200 rounded-lg overflow-hidden mb-2">
          <thead class="bg-gray-50">
            <tr>
              <th class="text-left px-3 py-2">Nombre</th>
              <th class="text-left px-3 py-2 hidden sm:table-cell">Email</th>
              <th class="text-center px-3 py-2">Asistió</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="i in inscripcionesPagina"
              :key="i.usuario_id"
              class="border-t border-gray-100"
            >
              <td class="px-3 py-2">
                {{ i.nombre_usuario }}
                <span v-if="!i.usuario_activo" class="ml-1.5 px-1.5 py-0.5 rounded text-xs bg-orange-100 text-orange-600">ya no disponible</span>
              </td>
              <td class="px-3 py-2 hidden sm:table-cell text-gray-500">{{ i.email_usuario }}</td>
              <td class="px-3 py-2 text-center">
                <button
                  class="px-2 py-0.5 rounded text-xs font-semibold transition-opacity"
                  :class="i.asistio ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'"
                  :disabled="procesando.has(i.usuario_id)"
                  @click="toggleAsistencia(i)"
                >
                  <i v-if="procesando.has(i.usuario_id)" class="pi pi-spin pi-spinner" />
                  <span v-else>{{ i.asistio ? 'Sí' : 'No' }}</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <Paginator
          v-if="inscripcionesFiltradas.length > POR_PAGINA"
          :rows="POR_PAGINA"
          :totalRecords="inscripcionesFiltradas.length"
          :first="paginaOffset"
          @page="paginaOffset = $event.first"
        />
      </div>
    </div>

    <template #footer>
      <div class="flex justify-between w-full">
        <Button
          v-if="detalle"
          label="Copiar taller"
          icon="pi pi-copy"
        severity="info"
          @click="emit('abrir-copiar')"
        />
        <Button label="Cerrar" severity="secondary" @click="emit('update:visible', false)" />
      </div>
    </template>
  </Dialog>
</template>
