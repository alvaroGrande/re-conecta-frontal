<script setup>
/**
 * Tarjetas de resumen por mes/año para encuestas cerradas.
 * Recibe el array plano de encuestas y agrupa por mes en el frontend.
 * Al hacer clic en una card se emite 'filtrar' con { anio, mes } o null para quitar filtro.
 */
import { computed } from 'vue'

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

const props = defineProps({
  encuestas:  { type: Array, required: true },
  filtroAnio: { default: null },
  filtroMes:  { default: null },
})

const emit = defineEmits(['filtrar'])

/** Agrupa las encuestas cerradas por año/mes y calcula totales */
const resumenMeses = computed(() => {
  const mapa = new Map()
  for (const e of props.encuestas) {
    const fecha = new Date(e.fecha_fin)
    const anio  = fecha.getFullYear()
    const mes   = fecha.getMonth() + 1
    const key   = `${anio}-${String(mes).padStart(2, '0')}`
    if (!mapa.has(key)) {
      mapa.set(key, { anio, mes, total: 0, respuestas: 0 })
    }
    const g = mapa.get(key)
    g.total++
    g.respuestas += Number(e.respuestas) || 0
  }
  // Ordenar del más reciente al más antiguo
  return [...mapa.values()].sort((a, b) =>
    b.anio !== a.anio ? b.anio - a.anio : b.mes - a.mes
  )
})

function estaActivo(r) {
  return props.filtroAnio === r.anio && props.filtroMes === r.mes
}

function toggleFiltro(r) {
  if (estaActivo(r)) {
    emit('filtrar', null)
  } else {
    emit('filtrar', { anio: r.anio, mes: r.mes })
  }
}
</script>

<template>
  <div v-if="resumenMeses.length" class="mb-6">
    <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
      <div
        v-for="r in resumenMeses.slice(0, 8)"
        :key="`${r.anio}-${r.mes}`"
        class="border rounded-lg p-3 text-sm cursor-pointer transition-colors"
        :class="estaActivo(r)
          ? 'border-blue-400 bg-blue-50 dark:border-blue-500 dark:bg-blue-950'
          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50 dark:border-slate-600 dark:hover:border-blue-500 dark:hover:bg-slate-700'"
        @click="toggleFiltro(r)"
        :title="estaActivo(r) ? 'Clic para quitar filtro' : `Filtrar por ${MESES[r.mes - 1]} ${r.anio}`"
      >
        <p class="font-semibold text-gray-700 dark:text-gray-200 leading-tight">
          {{ MESES[r.mes - 1] }} {{ r.anio }}
        </p>
        <p class="text-gray-500 dark:text-gray-400 mt-1">
          {{ r.total }} encuesta{{ r.total !== 1 ? 's' : '' }}
        </p>
        <p class="text-gray-400 dark:text-gray-500 text-xs">
          {{ r.respuestas }} resp.
        </p>
      </div>
    </div>

    <!-- Sin botón Mostrando: se muestra en la barra de filtros de EncuestasLista -->
  </div>
</template>
