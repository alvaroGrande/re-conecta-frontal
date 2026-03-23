<template>
  <div 
    class="bg-white rounded-lg shadow-sm hover:shadow-md transition cursor-pointer overflow-hidden"
    @click="emit('seleccionar', encuesta)"
  >
    <div class="h-1" :class="esActiva ? 'bg-green-500' : 'bg-gray-400'"></div>
    <div class="p-4">
      <div class="flex items-start justify-between mb-1">
        <h3 class="text-sm font-semibold text-gray-800 flex-1 leading-snug">{{ encuesta.titulo }}</h3>
        <span 
          :class="[
            'px-1.5 py-0.5 rounded text-xs font-medium whitespace-nowrap ml-2',
            esActiva 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-600'
          ]"
        >
          {{ esActiva ? 'Activa' : 'Cerrada' }}
        </span>
      </div>
      <p class="text-gray-500 text-xs mb-3 line-clamp-2">{{ encuesta.descripcion }}</p>
      <div class="flex items-center justify-between text-xs text-gray-400">
        <span>{{ encuesta.respuestas || 0 }} respuestas</span>
        <span v-if="encuesta.fecha_fin">{{ formatearFecha(encuesta.fecha_fin) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  encuesta: {
    type: Object,
    required: true
  },
  esActiva: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['seleccionar'])

const formatearFecha = (fecha) => {
  return new Date(fecha).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}
</script>
