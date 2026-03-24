<script setup>
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

defineProps({
  resumen:    { type: Array,  required: true },
  filtroAnio: { default: null },
  filtroMes:  { default: null },
})

defineEmits(['seleccionar'])
</script>

<template>
  <div v-if="resumen.length" class="mb-6">
    <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
      <div
        v-for="r in resumen.slice(0, 8)"
        :key="`${r.anio}-${r.mes}`"
        class="border rounded-lg p-3 text-sm cursor-pointer transition-colors"
        :class="filtroAnio === r.anio && filtroMes === r.mes
          ? 'border-blue-400 bg-blue-50 dark:border-blue-500 dark:bg-blue-950'
          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50 dark:border-slate-600 dark:hover:border-blue-500 dark:hover:bg-slate-700'"
        @click="$emit('seleccionar', r)"
        :title="filtroAnio === r.anio && filtroMes === r.mes ? 'Clic para quitar filtro' : `Filtrar por ${MESES[r.mes - 1]} ${r.anio}`"
      >
        <p class="font-semibold text-gray-700 dark:text-gray-200 leading-tight">{{ MESES[r.mes - 1] }} {{ r.anio }}</p>
        <p class="text-gray-500 dark:text-gray-400 mt-1">{{ r.talleres }} taller{{ r.talleres !== 1 ? 'es' : '' }}</p>
        <p class="text-gray-400 dark:text-gray-500 text-xs">{{ r.total_inscritos }} inscritos · {{ r.total_asistentes }} asistentes</p>
      </div>
    </div>

    <!-- Botón quitar filtro -->
    <div v-if="filtroAnio && filtroMes" class="mt-3 flex items-center gap-2">
      <span class="text-sm text-gray-500 dark:text-slate-400">
        Mostrando: <strong class="text-gray-700 dark:text-slate-200">{{ MESES[filtroMes - 1] }} {{ filtroAnio }}</strong>
      </span>
      <button
        @click="$emit('seleccionar', null)"
        class="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border border-gray-300 dark:border-slate-500
               text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
      >
        <i class="pi pi-times text-[10px]"></i>
        Ver todo
      </button>
    </div>
  </div>
</template>
