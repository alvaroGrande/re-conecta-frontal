<template>
  <div class="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
    <div class="max-w-7xl mx-auto px-4 py-4">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-800">Encuestas</h1>
          <p class="text-gray-600 text-sm mt-1">Participa en nuestras encuestas y conoce los resultados</p>
        </div>
        <div class="flex gap-2 items-center">
          <Button 
            v-if="esAdmin"
            icon="pi pi-plus"
            label="Nueva encuesta"
            @click="emit('crear')"
            class="bg-green-600 hover:bg-green-700"
          />
          <div v-else-if="false" class="text-xs text-gray-500 px-2"></div>
          <button 
          v-if="esAdmin"
            @click="emit('cambiar-filtro', true)"
            :class="[
              'px-4 py-2 rounded-lg font-medium transition',
              mostrarActivas 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            ]"
          >
            Activas
          </button>
          <button 
          v-if="esAdmin"
            @click="emit('cambiar-filtro', false)"
            :class="[
              'px-4 py-2 rounded-lg font-medium transition',
              !mostrarActivas 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
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
  mostrarActivas: {
    type: Boolean,
    required: true
  },
  esAdmin: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['cambiar-filtro', 'crear'])
</script>
