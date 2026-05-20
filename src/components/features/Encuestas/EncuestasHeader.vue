<template>
  <div class="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm dark:bg-slate-900 dark:border-slate-700">
    <div class="max-w-7xl mx-auto px-4 py-4">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-800 dark:text-slate-100">Encuestas</h1>
          <p class="text-gray-600 dark:text-slate-400 text-sm mt-1">Participa en nuestras encuestas y conoce los resultados</p>
        </div>
        <div class="flex flex-wrap gap-2 items-center">
          <!-- Botón plantillas (solo admin/coordinador) -->
          <Button
            v-if="esAdmin"
            :icon="mostrarPlantillas ? 'pi pi-list' : 'pi pi-copy'"
            :label="mostrarPlantillas ? 'Ver encuestas' : 'Plantillas'"
            :severity="mostrarPlantillas ? 'secondary' : 'help'"
            size="small"
            @click="emit('plantillas')"
          />

          <Button
            v-if="esAdmin && !mostrarPlantillas"
            icon="pi pi-plus"
            label="Nueva encuesta"
            @click="emit('crear')"
            class="bg-green-600 hover:bg-green-700"
          />

          <button
            v-if="esAdmin && !mostrarPlantillas"
            @click="emit('cambiar-filtro', true)"
            :class="[
              'px-4 py-2 rounded-lg font-medium transition',
              mostrarActivas
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600'
            ]"
          >
            Activas
          </button>
          <button
            v-if="esAdmin && !mostrarPlantillas"
            @click="emit('cambiar-filtro', false)"
            :class="[
              'px-4 py-2 rounded-lg font-medium transition',
              !mostrarActivas
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600'
            ]"
          >
            Pasadas
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Button from 'primevue/button'

defineProps({
  mostrarActivas:   { type: Boolean, required: true },
  esAdmin:          { type: Boolean, default: false },
  mostrarPlantillas:{ type: Boolean, default: false },
})

const emit = defineEmits(['cambiar-filtro', 'crear', 'plantillas'])
</script>
