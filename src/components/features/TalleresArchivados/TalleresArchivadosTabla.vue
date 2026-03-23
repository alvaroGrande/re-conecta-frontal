<script setup>
import { computed } from 'vue'
import Select from 'primevue/select'
import Button from 'primevue/button'
import Paginator from 'primevue/paginator'

const props = defineProps({
  archivados:   { type: Array,   default: () => [] },
  loading:      { type: Boolean, default: false },
  total:        { type: Number,  default: 0 },
  filtroAnio:   { default: null },
  filtroMes:    { default: null },
  opcionesAnio: { type: Array,   default: () => [] },
  opcionesMes:  { type: Array,   default: () => [] },
  paginaOffset: { type: Number,  default: 0 },
  porPagina:    { type: Number,  default: 20 },
})

const emit = defineEmits([
  'update:filtroAnio',
  'update:filtroMes',
  'aplicar-filtros',
  'quitar-filtros',
  'ver-detalle',
  'page',
])

const hayFiltros = computed(() => props.filtroAnio !== null || props.filtroMes !== null)

function pctAsistencia(t) {
  if (!t.total_inscritos) return 0
  return Math.round((t.total_asistentes / t.total_inscritos) * 100)
}

function formatFecha(f) {
  return f ? new Date(f).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
}
</script>

<template>
  <!-- Filtros -->
  <div class="flex flex-wrap items-center gap-3 mb-4">
    <Select
      :model-value="filtroAnio"
      :options="opcionesAnio"
      option-label="label"
      option-value="value"
      placeholder="Año"
      class="w-36"
      @update:model-value="emit('update:filtroAnio', $event); emit('aplicar-filtros')"
    />
    <Select
      :model-value="filtroMes"
      :options="opcionesMes"
      option-label="label"
      option-value="value"
      placeholder="Mes"
      class="w-44"
      @update:model-value="emit('update:filtroMes', $event); emit('aplicar-filtros')"
    />
    <button
      v-if="hayFiltros"
      class="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 flex items-center gap-1 transition-colors"
      @click="emit('quitar-filtros')"
    >
      <i class="pi pi-times-circle" />
      Quitar filtros
    </button>
  </div>

  <!-- Tabla -->
  <div v-if="loading" class="py-10 text-center text-gray-400">Cargando...</div>
  <div v-else-if="archivados.length === 0" class="py-10 text-center text-gray-400">
    No hay talleres archivados con los filtros seleccionados.
  </div>
  <table v-else class="w-full text-sm border border-gray-200 rounded-lg overflow-hidden mb-4">
    <thead class="bg-gray-100">
      <tr>
        <th class="text-left px-4 py-2">Taller</th>
        <th class="text-left px-4 py-2">Fecha</th>
        <th class="text-center px-4 py-2">Inscritos</th>
        <th class="text-center px-4 py-2">Asistentes</th>
        <th class="text-center px-4 py-2">% Asistencia</th>
        <th class="text-center px-4 py-2">Acciones</th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="t in archivados"
        :key="t.id"
        class="border-t border-gray-200 hover:bg-gray-50"
      >
        <td class="px-4 py-3">
          <div class="flex items-center gap-2">
            <p class="font-semibold text-gray-800">{{ t.titulo }}</p>
            <span v-if="t.cancelado" class="px-1.5 py-0.5 rounded text-xs font-semibold bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300">Cancelado</span>
          </div>
          <p class="text-gray-400 text-xs">{{ t.modalidad }} · {{ t.tipo_pago }}</p>
          <p v-if="t.cancelado && t.motivo?.nombre" class="text-red-600 dark:text-red-400 text-xs mt-0.5 font-medium">{{ t.motivo.nombre }}</p>
          <p v-if="t.cancelado && t.motivo_cancelacion" class="text-red-400 dark:text-red-500 text-xs italic">{{ t.motivo_cancelacion }}</p>
        </td>
        <td class="px-4 py-3 text-gray-600">{{ formatFecha(t.fecha) }}</td>
        <td class="px-4 py-3 text-center">{{ t.total_inscritos }}</td>
        <td class="px-4 py-3 text-center">{{ t.total_asistentes }}</td>
        <td class="px-4 py-3 text-center">
          <span
            class="px-2 py-0.5 rounded-full text-xs font-semibold"
            :class="pctAsistencia(t) >= 75 ? 'bg-green-100 text-green-700' : pctAsistencia(t) >= 40 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'"
          >{{ pctAsistencia(t) }}%</span>
        </td>
        <td class="px-4 py-3 text-center">
          <Button label="Ver detalle" size="small" severity="secondary" @click="emit('ver-detalle', t)" />
        </td>
      </tr>
    </tbody>
  </table>

  <Paginator
    v-if="total > porPagina"
    :rows="porPagina"
    :totalRecords="total"
    :first="paginaOffset"
    @page="emit('page', $event)"
  />
</template>
