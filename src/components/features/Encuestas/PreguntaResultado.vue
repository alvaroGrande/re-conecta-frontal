<template>
  <div class="bg-gray-50 rounded-lg p-3">
    <h4 class="text-xs font-semibold text-gray-900 mb-2">{{ pregunta.texto }}</h4>

    <!-- Resultados de preguntas múltiples -->
    <div v-if="pregunta.tipo === 'multiple' && resultado">
      <div class="space-y-2">
        <div v-for="opcion in pregunta.opciones" :key="opcion.id">
          <div class="flex items-center justify-between mb-0.5">
            <span class="text-xs text-gray-700">{{ opcion.texto }}</span>
            <span class="text-xs font-semibold text-gray-900">
              {{ resultado.opciones[opcion.id] || 0 }} votos
              <span class="text-blue-600 ml-1">({{ calcularPorcentaje(resultado.opciones[opcion.id] || 0, resultado.total) }}%)</span>
            </span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-1.5">
            <div
              class="bg-blue-600 h-1.5 rounded-full transition-all"
              :style="{ width: calcularPorcentaje(resultado.opciones[opcion.id] || 0, resultado.total) + '%' }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Resultados de preguntas abiertas -->
    <div v-if="pregunta.tipo === 'abierta' && resultado">
      <div class="mb-2">
        <button
          @click="expandida = !expandida"
          class="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-xs font-medium"
        >
          <svg 
            class="w-4 h-4 transition-transform" 
            :class="{ 'rotate-90': expandida }"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
          {{ expandida ? 'Ocultar' : 'Ver' }} respuestas ({{ resultado.respuestas.length }})
        </button>
      </div>
      
      <div v-if="expandida" class="space-y-1.5 max-h-48 overflow-y-auto">
        <div
          v-for="(respuesta, index) in resultado.respuestas"
          :key="index"
          class="bg-white rounded p-2 text-xs text-gray-700 border border-gray-200"
        >
          {{ respuesta }}
        </div>
        <p v-if="resultado.respuestas.length === 0" class="text-xs text-gray-500 italic">
          No hay respuestas aún
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  pregunta: {
    type: Object,
    required: true
  },
  resultado: {
    type: Object,
    default: null
  }
});

const expandida = ref(false);

const calcularPorcentaje = (votos, total) => {
  if (total === 0) return 0;
  return Math.round((votos / total) * 100);
};
</script>
