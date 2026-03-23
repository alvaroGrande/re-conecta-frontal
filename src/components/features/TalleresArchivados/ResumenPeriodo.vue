<script setup>
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

defineProps({
  resumen:    { type: Array,  required: true },
  filtroAnio: { default: null },
  filtroMes:  { default: null },
})

defineEmits(['seleccionar'])

function formatMes(mes) {
  return MESES[mes - 1] ?? mes
}
</script>

<template>
  <div v-if="resumen.length" class="grid grid-cols-2 sm:grid-cols-8 gap-3 mb-6">
    <div
      v-for="r in resumen.slice(0, 8)"
      :key="`${r.anio}-${r.mes}`"
      class="border rounded-lg p-3 text-sm cursor-pointer transition-colors"
      :class="filtroAnio === r.anio && filtroMes === r.mes
        ? 'border-blue-400 bg-blue-50 dark:border-blue-500 dark:bg-blue-950'
        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:border-blue-500 dark:hover:bg-gray-700'"
      @click="$emit('seleccionar', r)"
    >
      <p class="font-semibold text-gray-700 dark:text-gray-200">{{ formatMes(r.mes) }} {{ r.anio }}</p>
      <p class="text-gray-500 dark:text-gray-400">{{ r.talleres }} taller{{ r.talleres !== 1 ? 'es' : '' }}</p>
      <p class="text-gray-500 dark:text-gray-400">{{ r.total_inscritos }} inscritos · {{ r.total_asistentes }} asistentes</p>
    </div>
  </div>
</template>
